"""v44: 암송 = 필수 300구절 중 201~300 (100구절, 카드 순서) · 하루 5구절 · 20일 한 바퀴 · 간격 1·3·7·14·30·60일 · 2바퀴부터 하루 한 묶음 점검 (patch_v43 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:200]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 43;', 'var GAME_V = 44;')
rep('/* ===================== 암송 (20일 200구절, 간격 반복) ===================== */',
    '/* ===================== 암송 (간격 반복) — v44부터 part_v44.js가 필수 300 중 201~300 · 하루 5구절 · 20일 한 바퀴로 바꿈 ===================== */')

# ---- 글 ----
rep('toast(`${S.mem.sets}일차 새 10구절이 열렸어요`);', 'toast(`${S.mem.sets}일차 새 5구절이 열렸어요`);')
rep('mem: ["200구절을 간격 반복으로 마음에 새기기",', 'mem: ["필수 300 중 201~300 · 하루 5구절 · 20일 한 바퀴",')
rep('  mem: "200구절을 간격 반복으로 외워요. 통과할수록 다음 복습이 1·2·4·7·15·30·60일 뒤로 미뤄져요.",',
    '  mem: "필수 300구절 중 201~300, 100구절을 하루 5구절씩 외워요(20일 한 바퀴). 통과할수록 다음 복습이 1·3·7·14·30·60일 뒤로 미뤄지고, 2바퀴부터는 하루 한 묶음씩 다시 점검해서 100구절이 모두 계속 돌아요.",')
rep('''    if (S.mem.sets < MEM_DAYS) rows.push({ k: "시즌", t: "200구절 암송 과정", v: `${S.mem.sets}/${MEM_DAYS}일차`, p: S.mem.sets / MEM_DAYS, s: `새 구절이 날마다 열리면 ${daysTxt(MEM_DAYS - S.mem.sets)} · 외운 구절 ${memMastered()}개`, go: "mem" });
    else rows.push({ k: "시즌", t: "외운 구절", v: `${memMastered()}/${VERSES.length}`, p: memMastered() / VERSES.length, s: "다섯 번 통과한 구절이 외운 구절이 돼요", go: "mem" });''',
    '''    if (memRoundOf() < 2) rows.push({ k: "시즌", t: "암송 100구절 1바퀴", v: `${S.mem.sets}/${MEM_DAYS}일차`, p: S.mem.sets / MEM_DAYS, s: `하루 5구절 · 새 구절이 날마다 열리면 ${daysTxt(MEM_DAYS - S.mem.sets)} · 외운 구절 ${memMastered()}개`, go: "mem" });
    else rows.push({ k: "시즌", t: `암송 ${memRoundOf()}바퀴`, v: `${S.mem.rg || 1}/${MEM_DAYS}묶음`, p: ((S.mem.rg || 1) - 1) / MEM_DAYS, s: `하루 한 묶음씩 다시 점검 · 외운 구절 ${memMastered()}/${VERSES.length}`, go: "mem" });''')

# ---- 업적: 100구절에 맞춘 단계 + 바퀴 완주 ----
rep('{ id: "memm", n: "암송 완료 구절", unit: "구절", tiers: [5, 20, 50, 100, 150, 200], rw: i => ({ stamp: 10 * (i + 1), manna: 50 * (i + 1) }) },',
    '{ id: "memm", n: "암송 완료 구절", unit: "구절", tiers: [5, 20, 40, 60, 80, 100], rw: i => ({ stamp: 10 * (i + 1), manna: 50 * (i + 1) }) },\n'
    '  { id: "memr", n: "암송 바퀴 완주", unit: "바퀴", tiers: [1, 2, 3, 5, 10], rw: i => ({ stamp: 20 * (i + 1), ame: 3 * (i + 1) }) },')
rep('a.id === "memm" ? memMastered() : S.retires;', 'a.id === "memm" ? memMastered() : a.id === "memr" ? memRoundsDone() : S.retires;')

# ---- 암송 탭: 바퀴 줄 · 한 판(복습 20 + 점검 + 새 구절) · 안내 ----
rep('''    <div class="hk-note" id="mmRec" hidden></div>
    <button class="btn manna" id="mGo" style="width:100%"></button>
    <p class="muted" id="mInfo"></p>`;''',
    '''    <div class="hk-note" id="mmRec" hidden></div>
    <div class="mem-rd" id="mRd"></div>
    <button class="btn manna" id="mGo" style="width:100%"></button>
    <p class="muted" id="mInfo"></p>`;''')
rep('''    const q = memQueue(), nw = q.filter(v => !memRec(v.no)).length;
    $("mQ").textContent = `${q.length}구절`;''',
    '''    const P = memParts(), q = P.q;
    $("mRd").innerHTML = memRoundLine();
    $("mQ").textContent = `${q.length}구절`;''')
rep('''    $("mGo").disabled = !q.length || !!memSess;
    $("mGo").textContent = memSess ? "아래에서 시험 진행 중" : q.length ? `암송 시작 · 복습 ${q.length - nw} + 새 구절 ${nw}` : "오늘 암송 끝! 내일 또 만나요";''',
    '''    $("mGo").disabled = !P.batch.length || !!memSess;
    $("mGo").textContent = memSess ? "아래에서 시험 진행 중" : P.batch.length ? `암송 시작 · ${[P.rev.length ? `복습 ${Math.min(MEM_CAP, P.rev.length)}` : "", P.rot.length ? `바퀴 점검 ${P.rot.length}` : "", P.nw.length ? `새 구절 ${P.nw.length}` : ""].filter(Boolean).join(" + ")}${P.more ? ` · 남은 복습 ${P.more}은 다음 판` : ""}` : "오늘 암송 끝! 내일 또 만나요";''')
rep('''    $("mInfo").innerHTML = `하루 10구절씩 ${MEM_DAYS}일 과정, 지금 ${S.mem.sets}일차까지 열렸어요. 통과할 때마다 단계가 올라 다음 복습이 1 → 2 → 4 → 7 → 15 → 30 → 60일 뒤로 미뤄지고, <b>반복해서 통과할수록 보상이 커져요</b>''',
    '''    $("mInfo").innerHTML = `<b>하루 새 5구절 · 20일이면 100구절 한 바퀴</b> — 앞 묶음 5구절을 한 번씩 통과하면 다음 날 새 묶음이 열려요.<br>복습: 통과할 때마다 <b>1 → 3 → 7 → 14 → 30 → 60일</b> 뒤 다시 나와요(틀리면 한 단계 앞으로) · 5단계면 암송 완료.<br>2바퀴부터: 하루 한 묶음씩 다시 점검해서 바퀴마다 100구절이 모두 한 번 이상 돌아요(복습에서 이미 통과한 구절은 건너뜀) · 20일째 외운 마지막 묶음도 다음 바퀴 1·4·11일째 복습이 이어져요.<br>복습이 많은 날은 새로 외운 것부터 ${MEM_CAP}구절씩. <b>반복해서 통과할수록 보상이 커져요</b>''')
rep('$("mGo").addEventListener("click", () => { memStart(memQueue()); updateUI(true); });',
    '$("mGo").addEventListener("click", () => { memStart(memBatch()); updateUI(true); });')

rep('$("mM").textContent = `${memMastered()}/${VERSES.length}`;', '$("mM").innerHTML = `${VERSES.filter(memLearned).length}/${VERSES.length}<small>암송 완료 ${memMastered()}</small>`;')

# ---- 20일 계획: 범위 · 오늘 묶음 · 이번 바퀴 ✓ · 다음 복습 날 ----
rep('secTitle("mem", `${MEM_DAYS}일 암송 계획`, "날짜를 누르면 구절 목록");',
    'secTitle("mem", `${MEM_DAYS}일 한 바퀴`, "날짜를 누르면 구절 · ✓ 이번 바퀴");')
rep('const k = S.mem.sets + JSON.stringify(S.mem.v) + openDay + dayKey();',
    'const k = S.mem.sets + "|" + S.mem.round + "|" + S.mem.rg + JSON.stringify(S.mem.v) + openDay + dayKey();')
rep('<span class="ttl">${sets.map(s => escapeHtml(s.title)).join(" · ")}</span>',
    '<span class="ttl">${sets.map(s => `<small class="num">${s.range}</small> ${escapeHtml(s.title)}`).join(" · ")}${memRowMark(d)}</span>')
rep('"앞 날짜 구절을 모두 1단계 이상 통과하면 다음 날 열려요."', '"앞 묶음 5구절을 모두 한 번씩 통과하면 다음 날 열려요."')
rep('<small>${!r ? "새 구절" : r.s >= MEM_MASTER ? `암송 완료 · ${r.s}단계` : `${r.s}단계 · ${r.due <= dayKey() ? "오늘 복습" : r.due.slice(5).replace("-", "/") + " 복습"}`}</small>',
    '<small>${!r || !r.n ? "새 구절" : `${r.s >= MEM_MASTER ? "암송 완료 · " : ""}${r.s}단계 · ${r.due <= dayKey() ? "오늘 복습" : r.due.slice(5).replace("-", "/") + " 복습"}`} · ${escapeHtml(v.title)}</small>')

# ---- 모양 ----
rep('.memday-h .dots { grid-column: 1 / -1; display: flex; gap: 4px; }',
    '.memday-h .dots { grid-column: 1 / -1; display: flex; gap: 4px; }\n'
    '.memday-h .ttl small { color: var(--fg); opacity: .8; margin-right: 2px; }\n'
    '.memday-h .ttl em { font-style: normal; font-size: 11px; border-radius: 6px; padding: 0 5px; margin-left: 4px; }\n'
    '.memday-h .ttl em.mem-now { background: var(--manna, #9b7cff); color: #fff; }\n'
    '.memday-h .ttl em.mem-ok { color: #7fe3a0; padding: 0; }\n'
    '.mem-rd { font-size: 13px; color: var(--muted); margin: 6px 2px 8px; line-height: 1.5; }\n'
    '#mM small { display: block; font-size: 12px; color: var(--muted); margin-top: 3px; font-family: var(--body, inherit); }')

# ---- 업데이트 안내: v43을 아직 못 봤으면 v43 → v44 차례로 ----
rep('''    if (localStorage.getItem(SAVE_KEY + "-feel43")) return;
    localStorage.setItem(SAVE_KEY + "-feel43", "1");
    if (!isFreshSave(S)) celebrateLater({ ic: "weapon", title: "무기 66개 · 옷장도 7등급", ''',
    '''    const fresh = isFreshSave(S);
    if (!localStorage.getItem(SAVE_KEY + "-feel43")) { localStorage.setItem(SAVE_KEY + "-feel43", "1"); if (!fresh) celebrateLater({ ic: "weapon", title: "무기 66개 · 옷장도 7등급", ''')
rep('''보스는 체력이 여러 줄이에요 (x5)", tone: "rare", ms: 6800, keep: 1 });
  } catch (e) {}''',
    '''보스는 체력이 여러 줄이에요 (x5)", tone: "rare", ms: 6800, keep: 1 }); }
    if (localStorage.getItem(SAVE_KEY + "-feel44")) return;
    localStorage.setItem(SAVE_KEY + "-feel44", "1");
    if (!fresh) celebrateLater({ ic: "scroll", title: "하루 5구절 암송", sub: "필수 300구절 중 201~300, 100구절<br>카드 순서대로 하루 5구절 · 20일 한 바퀴<br>외운 구절은 1·3·7·14·30·60일 뒤 다시<br>2바퀴부터 하루 한 묶음씩 다시 점검", tone: "rare", ms: 6800, keep: 1 });
  } catch (e) {}''')

# ---- 넣기 (스킬 이름 띠 앞) ----
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
data = open('part_v44data.js', encoding='utf-8').read()
part = open('part_v44.js', encoding='utf-8').read()
s = s.replace(mk, data + '\n' + part + '\n' + mk)

open(P, 'w', encoding='utf-8').write(s)
print('patch_v44 ok', len(s))
