-- 곽준영 키우기: 아이디 로그인 + 기록 저장 (수파베이스 프로젝트 kjy-game 에 적용된 내용)
-- 표는 Data API 에 안 보이는 kjy_private 스키마에 두고, 게임은 아래 public 함수 5개만 부른다.
-- 비밀번호는 bcrypt, 로그인 토큰은 sha256 으로 바꿔서 저장.

-- 1/2: 표
create schema if not exists kjy_private;

create table if not exists kjy_private.players (
  id text primary key,
  pw text not null,
  save jsonb,
  save_t bigint not null default 0,
  fails int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kjy_private.sessions (
  token_hash text primary key,
  player_id text not null references kjy_private.players(id),
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  last_used timestamptz not null default now()
);

create index if not exists sessions_player_idx on kjy_private.sessions (player_id, last_used desc);

-- 2/2: 함수
create function kjy_private.new_session(p_id text) returns text
language plpgsql security definer set search_path = '' as $$
declare tok text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  insert into kjy_private.sessions(token_hash, player_id) values (encode(extensions.digest(tok, 'sha256'), 'hex'), p_id);
  -- 한 아이디에 살아 있는 로그인은 최근 10개까지
  update kjy_private.sessions set revoked = true
   where player_id = p_id and not revoked and token_hash not in
     (select token_hash from kjy_private.sessions where player_id = p_id and not revoked order by last_used desc limit 10);
  return tok;
end $$;

create function kjy_private.check_session(p_id text, p_token text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update kjy_private.sessions set last_used = now()
   where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
     and player_id = lower(trim(coalesce(p_id, ''))) and not revoked;
  return found;
end $$;

create function public.kjy_signup(p_id text, p_pw text) returns json
language plpgsql security definer set search_path = '' as $$
declare v_id text := lower(trim(coalesce(p_id, '')));
begin
  if v_id !~ '^[a-z0-9_가-힣]{2,20}$' then return json_build_object('ok', false, 'err', 'bad_id'); end if;
  if length(coalesce(p_pw, '')) < 4 or length(p_pw) > 72 then return json_build_object('ok', false, 'err', 'bad_pw'); end if;
  insert into kjy_private.players(id, pw) values (v_id, extensions.crypt(p_pw, extensions.gen_salt('bf', 8)))
    on conflict (id) do nothing;
  if not found then return json_build_object('ok', false, 'err', 'taken'); end if;
  return json_build_object('ok', true, 'id', v_id, 'token', kjy_private.new_session(v_id));
end $$;

-- 10번 틀리면 10분 잠금
create function public.kjy_login(p_id text, p_pw text) returns json
language plpgsql security definer set search_path = '' as $$
declare v_id text := lower(trim(coalesce(p_id, ''))); p kjy_private.players%rowtype;
begin
  select * into p from kjy_private.players where id = v_id;
  if not found then return json_build_object('ok', false, 'err', 'wrong'); end if;
  if p.locked_until is not null and p.locked_until > now() then return json_build_object('ok', false, 'err', 'locked'); end if;
  if extensions.crypt(coalesce(p_pw, ''), p.pw) <> p.pw then
    update kjy_private.players
       set fails = case when fails + 1 >= 10 then 0 else fails + 1 end,
           locked_until = case when fails + 1 >= 10 then now() + interval '10 minutes' else locked_until end
     where id = v_id;
    return json_build_object('ok', false, 'err', 'wrong');
  end if;
  update kjy_private.players set fails = 0, locked_until = null where id = v_id;
  return json_build_object('ok', true, 'id', v_id, 'token', kjy_private.new_session(v_id), 'save', p.save, 'save_t', p.save_t);
end $$;

create function public.kjy_pull(p_id text, p_token text) returns json
language plpgsql security definer set search_path = '' as $$
declare p kjy_private.players%rowtype;
begin
  if not kjy_private.check_session(p_id, p_token) then return json_build_object('ok', false, 'err', 'auth'); end if;
  select * into p from kjy_private.players where id = lower(trim(p_id));
  return json_build_object('ok', true, 'save', p.save, 'save_t', p.save_t);
end $$;

-- 더 예전 기록이 최근 기록을 덮지 않게: p_force 가 아니면 stale
create function public.kjy_push(p_id text, p_token text, p_save jsonb, p_t bigint, p_force boolean default false) returns json
language plpgsql security definer set search_path = '' as $$
declare cur bigint;
begin
  if not kjy_private.check_session(p_id, p_token) then return json_build_object('ok', false, 'err', 'auth'); end if;
  if p_save is null or p_t is null or octet_length(p_save::text) > 300000 then return json_build_object('ok', false, 'err', 'size'); end if;
  select save_t into cur from kjy_private.players where id = lower(trim(p_id)) for update;
  if not coalesce(p_force, false) and p_t < cur then return json_build_object('ok', false, 'err', 'stale', 'save_t', cur); end if;
  update kjy_private.players set save = p_save, save_t = p_t, updated_at = now() where id = lower(trim(p_id));
  return json_build_object('ok', true, 'save_t', p_t);
end $$;

create function public.kjy_logout(p_id text, p_token text) returns json
language plpgsql security definer set search_path = '' as $$
begin
  update kjy_private.sessions set revoked = true
   where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
     and player_id = lower(trim(coalesce(p_id, '')));
  return json_build_object('ok', true);
end $$;

grant usage on schema public to anon, authenticated;
grant execute on function public.kjy_signup(text, text), public.kjy_login(text, text), public.kjy_pull(text, text),
  public.kjy_push(text, text, jsonb, bigint, boolean), public.kjy_logout(text, text) to anon, authenticated;
notify pgrst, 'reload schema';
