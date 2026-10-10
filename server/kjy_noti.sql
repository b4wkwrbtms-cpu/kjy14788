-- 곽준영 키우기 v32: '읽을 때와 곳' 웹 푸시 알림 (수파베이스 프로젝트 kjy-game 에 적용된 내용)
-- 표는 kjy_private 에 두고(Data API 에 안 보임), 게임은 public 함수 4개(kjy_noti_*)만 부른다.
-- 알림은 엣지 함수 kjy-noti(server/kjy-noti/index.ts)가 보내고, pg_cron 이 5분마다 부른다.
-- 비밀값(VAPID 개인키, 5분 호출 머리글)은 Vault 에만 있다. 이 파일에는 없다.
-- 알림 규칙: 정한 요일·시각(±20분 창)에, 그날 말씀을 아직 안 읽었을 때만, 하루 2번까지,
--            안식 모드면 쉼, 알림 보낸 날을 3번 이어서 그냥 넘기면(그 사이 읽은 날 없이) 쉼, 문구 24개를 돌려 씀.

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 1) 표
create table if not exists kjy_private.noti_subs (
  endpoint text primary key,
  player_id text not null references kjy_private.players(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  ua text,
  created_at timestamptz not null default now(),
  last_ok timestamptz,
  fails int not null default 0,
  off boolean not null default false          -- 끈 구독·없어진 구독(404/410)·10번 실패
);
create index if not exists noti_subs_player_idx on kjy_private.noti_subs(player_id);

create table if not exists kjy_private.noti_state (
  player_id text primary key references kjy_private.players(id) on delete cascade,
  day text,                                   -- 그 사람 시간대의 오늘
  s1 boolean not null default false,          -- 첫 알림 보냄
  s2 boolean not null default false,          -- 두 번째 알림 보냄
  nd text[] not null default '{}',            -- 최근 알림 보낸 날 (최대 7)
  msg_i int not null default 0,               -- 문구 차례
  last_sent timestamptz,
  test_at timestamptz                         -- 시험 알림 (30초에 한 번)
);
alter table kjy_private.noti_subs enable row level security;   -- 정책 없음: SECURITY DEFINER 함수로만
alter table kjy_private.noti_state enable row level security;

-- 2) 도우미
create function kjy_private.noti_host_ok(p_ep text) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(substring(p_ep from '^https://([a-z0-9.-]+)/') ~ '^(web\.push\.apple\.com|fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9-]+\.notify\.windows\.com)$', false)
$$;

-- 그날 말씀을 읽었는지 (기기에서 올린 저장 기록으로)
create function kjy_private.noti_read(p_save jsonb, p_day text) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(
    ((p_save->'habit'->'td'->>p_day) ~ '^\d{1,6}$' and ((p_save->'habit'->'td'->>p_day)::int & 1) = 1)
    or ((p_save->'day'->>'key') = p_day and (p_save->'day'->>'chap') ~ '^\d{1,6}$' and (p_save->'day'->>'chap')::int > 0)
    or ((p_save->'att'->'log'->p_day->>'c') ~ '^-?\d{1,6}$' and (p_save->'att'->'log'->p_day->>'c')::int <> 0)
    or (p_save->'bible'->>'last') = p_day, false)
$$;

create function kjy_private.noti_min(p_hm text) returns int
language sql immutable set search_path = '' as $$
  select case when p_hm ~ '^([01]\d|2[0-3]):[0-5]\d$' then substr(p_hm, 1, 2)::int * 60 + substr(p_hm, 4, 2)::int else null end
$$;

-- 그냥 넘긴 날: 어제부터 거꾸로, 말씀을 읽은 날을 만나기 전까지 알림을 보냈던 날 수
create or replace function kjy_private.noti_ignored(p_save jsonb, p_nd text[], p_today text) returns int
language plpgsql immutable set search_path = '' as $$
declare d date; k text; n int := 0; i int := 0;
begin
  if p_nd is null or array_length(p_nd, 1) is null or p_today !~ '^\d{4}-\d\d-\d\d$' then return 0; end if;
  d := to_date(p_today, 'YYYY-MM-DD') - 1;
  while i < 21 loop
    k := to_char(d, 'YYYY-MM-DD');
    if kjy_private.noti_read(p_save, k) then exit; end if;
    if k = any(p_nd) then n := n + 1; end if;
    d := d - 1; i := i + 1;
  end loop;
  return n;
end $$;

create function kjy_private.noti_test(p_id text, p_token text)
returns json language plpgsql security definer set search_path = '' as $$
declare pid text := lower(trim(coalesce(p_id, ''))); t timestamptz; subs json;
begin
  if not kjy_private.check_session(p_id, p_token) then return json_build_object('ok', false, 'err', 'auth'); end if;
  insert into kjy_private.noti_state(player_id) values (pid) on conflict (player_id) do nothing;
  select test_at into t from kjy_private.noti_state where player_id = pid for update;
  if t is not null and t > now() - interval '30 seconds' then return json_build_object('ok', false, 'err', 'wait'); end if;
  select json_agg(json_build_object('endpoint', endpoint, 'p256dh', p256dh, 'auth', auth)) into subs from kjy_private.noti_subs where player_id = pid and not off;
  if subs is null then return json_build_object('ok', false, 'err', 'nosub'); end if;
  update kjy_private.noti_state set test_at = now() where player_id = pid;
  return json_build_object('ok', true, 'subs', subs);
end $$;

create function kjy_private.noti_result(p_endpoint text, p_status int)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_status in (404, 410) then update kjy_private.noti_subs set off = true where endpoint = p_endpoint;
  elsif p_status between 200 and 299 then update kjy_private.noti_subs set last_ok = now(), fails = 0 where endpoint = p_endpoint;
  else update kjy_private.noti_subs set fails = fails + 1, off = (fails + 1 >= 10) where endpoint = p_endpoint;
  end if;
end $$;

-- 3) 게임이 부르는 함수 (로그인 토큰 확인)
create function public.kjy_noti_sub(p_id text, p_token text, p_sub jsonb, p_ua text default null)
returns json language plpgsql security definer set search_path = '' as $$
declare pid text := lower(trim(coalesce(p_id, ''))); ep text; k1 text; k2 text;
begin
  if not kjy_private.check_session(p_id, p_token) then return json_build_object('ok', false, 'err', 'auth'); end if;
  ep := p_sub->>'endpoint'; k1 := p_sub->'keys'->>'p256dh'; k2 := p_sub->'keys'->>'auth';
  if ep is null or length(ep) > 1000 or not kjy_private.noti_host_ok(ep) then return json_build_object('ok', false, 'err', 'endpoint'); end if;
  if k1 is null or k2 is null or k1 !~ '^[A-Za-z0-9_=-]{80,100}$' or k2 !~ '^[A-Za-z0-9_=-]{16,32}$' then return json_build_object('ok', false, 'err', 'keys'); end if;
  insert into kjy_private.noti_subs(endpoint, player_id, p256dh, auth, ua) values (ep, pid, k1, k2, left(p_ua, 150))
  on conflict (endpoint) do update set player_id = excluded.player_id, p256dh = excluded.p256dh, auth = excluded.auth, ua = excluded.ua, fails = 0, off = false, created_at = now();
  update kjy_private.noti_subs set off = true where player_id = pid and not off and endpoint not in
    (select s.endpoint from kjy_private.noti_subs s where s.player_id = pid and not s.off order by s.created_at desc limit 5);
  insert into kjy_private.noti_state(player_id) values (pid) on conflict (player_id) do update set nd = '{}';
  return json_build_object('ok', true);
end $$;

create function public.kjy_noti_unsub(p_id text, p_token text, p_endpoint text default null)
returns json language plpgsql security definer set search_path = '' as $$
declare pid text := lower(trim(coalesce(p_id, '')));
begin
  if not kjy_private.check_session(p_id, p_token) then return json_build_object('ok', false, 'err', 'auth'); end if;
  update kjy_private.noti_subs set off = true where player_id = pid and (p_endpoint is null or endpoint = p_endpoint);
  return json_build_object('ok', true);
end $$;

create function public.kjy_noti_status(p_id text, p_token text)
returns json language plpgsql security definer set search_path = '' as $$
declare pid text := lower(trim(coalesce(p_id, ''))); st kjy_private.noti_state%rowtype; sv jsonb; tz int; today text; ign int; n int;
begin
  if not kjy_private.check_session(p_id, p_token) then return json_build_object('ok', false, 'err', 'auth'); end if;
  select count(*) into n from kjy_private.noti_subs where player_id = pid and not off;
  select * into st from kjy_private.noti_state where player_id = pid;
  select save into sv from kjy_private.players where id = pid;
  tz := case when (sv->'ii'->>'tz') ~ '^-?\d{1,4}$' then greatest(-840, least(840, (sv->'ii'->>'tz')::int)) else 540 end;
  today := to_char((now() at time zone 'UTC') + make_interval(mins => tz), 'YYYY-MM-DD');
  ign := kjy_private.noti_ignored(sv, st.nd, today);
  return json_build_object('ok', true, 'subs', n, 'paused', ign >= 3, 'ignored', ign, 'last_sent', st.last_sent);
end $$;

create function public.kjy_noti_resume(p_id text, p_token text)
returns json language plpgsql security definer set search_path = '' as $$
declare pid text := lower(trim(coalesce(p_id, '')));
begin
  if not kjy_private.check_session(p_id, p_token) then return json_build_object('ok', false, 'err', 'auth'); end if;
  update kjy_private.noti_state set nd = '{}' where player_id = pid;
  return json_build_object('ok', true);
end $$;

-- 4) 지금 보낼 알림 (kjy-noti tick 이 부름 · 보낸 것으로 표시까지 한 번에)
create or replace function kjy_private.noti_due(p_now timestamptz default now())
returns table(player_id text, endpoint text, p256dh text, auth text, title text, body text)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  r record; st kjy_private.noti_state%rowtype; ii jsonb; tz int; loc timestamp; today text; mins int; dw int; days int;
  t1 int; t2 int; slot int; cue text; wh text; msg text; ttl text; rest_from text; rest_to text;
  m text[] := array[
    '주의 말씀은 내 발에 등이요 내 길에 빛이니이다 (시 119:105)',
    '한 장이면 충분해요. 지금 펼쳐 볼까요?',
    '오직 여호와의 율법을 즐거워하여 그 율법을 주야로 묵상하는 자로다 (시 1:2)',
    '곽준영이 출근 전에 말씀 한 장을 기다리고 있어요',
    '주의 말씀의 맛이 내게 어찌 그리 단지요 내 입에 꿀보다 더하니이다 (시 119:103)',
    '커피 한 잔 식는 동안 한 장을 읽을 수 있어요',
    '풀은 마르고 꽃은 시드나 우리 하나님의 말씀은 영영히 서리라 하라 (사 40:8)',
    '오늘 읽을 한 장이 펼쳐지기를 기다려요',
    '이것이 아침마다 새로우니 주의 성실이 크도소이다 (애 3:23)',
    '짧게 읽어도 괜찮아요. 오늘의 한 구절을 만나 보세요',
    '내 눈을 열어서 주의 법의 기이한 것을 보게 하소서 (시 119:18)',
    '말씀 한 장 읽고 묵상 한 줄 남겨 볼까요?',
    '수고하고 무거운 짐진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라 (마 11:28)',
    '정해 둔 시간이에요. 숨 한 번 고르고 말씀을 펼쳐요',
    '주의 말씀을 열므로 우둔한 자에게 비취어 깨닫게 하나이다 (시 119:130)',
    '어제보다 한 걸음. 오늘의 한 장으로 시작해요',
    '금 곧 많은 정금보다 더 사모할 것이며 꿀과 송이꿀보다 더 달도다 (시 19:10)',
    '읽기 플랜의 오늘 분량, 한 장만 먼저 읽어도 좋아요',
    '내가 주의 법을 어찌 그리 사랑하는지요 내가 그것을 종일 묵상하나이다 (시 119:97)',
    '바쁜 하루 사이 잠깐, 말씀 앞에 머물러 봐요',
    '여호와는 나의 목자시니 내가 부족함이 없으리로다 (시 23:1)',
    '오늘 마음에 남을 한 구절을 찾아봐요',
    '내가 주께 범죄치 아니하려 하여 주의 말씀을 내 마음에 두었나이다 (시 119:11)',
    '천천히 소리 내어 한 장 읽어 보는 건 어때요?'
  ];
begin
  for r in select p.id, p.save from kjy_private.players p where exists (select 1 from kjy_private.noti_subs s where s.player_id = p.id and not s.off) loop
    ii := r.save->'ii';
    if ii is null or (ii->>'on') is distinct from '1' or (ii->>'push') is distinct from '1' then continue; end if;
    tz := case when (ii->>'tz') ~ '^-?\d{1,4}$' then greatest(-840, least(840, (ii->>'tz')::int)) else 540 end;
    loc := (p_now at time zone 'UTC') + make_interval(mins => tz);
    today := to_char(loc, 'YYYY-MM-DD');
    mins := extract(hour from loc)::int * 60 + extract(minute from loc)::int;
    dw := extract(isodow from loc)::int;
    days := case when (ii->>'days') ~ '^\d{1,3}$' then (ii->>'days')::int else 127 end;
    if (days & (1 << (dw - 1))) = 0 then continue; end if;
    rest_from := r.save->'habit'->'rest'->>'from'; rest_to := r.save->'habit'->'rest'->>'to';
    if rest_from is not null and rest_to is not null and rest_from <= today and today <= rest_to then continue; end if;
    if kjy_private.noti_read(r.save, today) then continue; end if;
    insert into kjy_private.noti_state as ns (player_id) values (r.id) on conflict (player_id) do nothing;
    select * into st from kjy_private.noti_state s where s.player_id = r.id for update;
    if st.day is distinct from today then st.day := today; st.s1 := false; st.s2 := false; end if;
    if kjy_private.noti_ignored(r.save, st.nd, today) >= 3 then
      update kjy_private.noti_state s set day = st.day, s1 = st.s1, s2 = st.s2 where s.player_id = r.id;
      continue;
    end if;
    t1 := kjy_private.noti_min(ii->>'t'); t2 := kjy_private.noti_min(ii->>'t2'); slot := 0;
    if not st.s1 and t1 is not null and mins >= t1 and mins < t1 + 20 then slot := 1;
    elsif not st.s2 and t2 is not null and t2 > coalesce(t1, -1) and mins >= t2 and mins < t2 + 20 then slot := 2;
    end if;
    if slot = 0 then
      update kjy_private.noti_state s set day = st.day, s1 = st.s1, s2 = st.s2 where s.player_id = r.id;
      continue;
    end if;
    if slot = 1 then st.s1 := true; else st.s2 := true; end if;
    if slot = 1 and t2 is not null and t2 < t1 + 20 then st.s2 := true; end if;
    cue := nullif(trim(coalesce(ii->>'cue', '')), ''); wh := nullif(regexp_replace(trim(coalesce(ii->>'where', '')), '에서$', ''), '');
    if slot = 1 and (cue is not null or wh is not null) and st.msg_i % 3 = 0 then
      msg := concat_ws(' ', cue, case when wh is not null then wh || '에서' end) || ' 말씀 한 장 펼치기로 했어요';
    else
      msg := m[1 + (st.msg_i % array_length(m, 1))];
    end if;
    ttl := case when slot = 1 then '말씀 읽을 시간이에요' else '오늘 말씀 한 장, 아직 괜찮아요' end;
    update kjy_private.noti_state s set day = st.day, s1 = st.s1, s2 = st.s2, msg_i = st.msg_i + 1, last_sent = p_now,
      nd = (select coalesce(array_agg(x order by x), '{}') from (select distinct x from unnest(array_append(st.nd, today)) x order by x desc limit 7) q)
     where s.player_id = r.id;
    return query select r.id, s.endpoint, s.p256dh, s.auth, ttl, msg from kjy_private.noti_subs s where s.player_id = r.id and not s.off;
  end loop;
end $$;

-- 5) 5분 호출 머리글 비밀값(금고) · 예약
select vault.create_secret(encode(extensions.gen_random_bytes(24), 'hex'), 'kjy_cron_secret', 'kjy-noti 5분 호출 확인용')
where not exists (select 1 from vault.secrets where name = 'kjy_cron_secret');

select cron.schedule('kjy-noti-tick', '*/5 * * * *', $cron$
  select net.http_post(
    url := 'https://ownarhjgryafrgoouirs.supabase.co/functions/v1/kjy-noti',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-kjy-cron', (select decrypted_secret from vault.decrypted_secrets where name = 'kjy_cron_secret')),
    body := '{"mode":"tick"}'::jsonb,
    timeout_milliseconds := 20000
  );
$cron$);
-- VAPID 키(kjy_vapid)는 kjy-noti 가 처음 'key' 요청을 받을 때 금고에 만든다.
