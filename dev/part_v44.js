/* ===================== v44 암송: 필수 300구절 중 201~300 (100구절) · 하루 5구절 · 20일 한 바퀴 · 간격 복습 + 바퀴 점검 =====================
   사용자(10-11 16:50, 카드 10장): "말씀 암송 구절 내용은 이거로 바꿔줘 · 하루에 5개씩 · 100개니까 20일이면 한 바퀴 · 복습까지 합치면 여러 번 돌리는 거로 ·
   20일 돌리는 거니까 복습을 골고루 계속 · 20일째 됐을 때 뒤쪽 거 잊어버리지 않도록"
   ① 데이터: MEM44(카드 순서 5구절 × 20묶음)로 VERSE_SETS·VERSES를 바꿈. 구절마다 예전 주제 이름(위로와 평안 등)을 남겨 시험 힌트로 씀.
   ② 간격: 1 → 3 → 7 → 14 → 30 → 60일 (예전 1·2·4·7·15·30·60에서 이틀 복습을 뺌 — 하루 5구절이면 첫 20일 시험이 하루 23번 → 21번).
      외운 날로부터 1·4·11·25·55일째에 다시 나오고, 5단계(25일째 통과)가 '암송 완료'.
   ③ 바퀴: 1바퀴 = 하루 새 묶음 하나(앞 묶음 5구절을 한 번씩 통과해야 다음 날 열림). 100구절을 다 외운 다음 날부터 2바퀴 —
      하루 한 묶음씩 '이번 바퀴 점검'(이번 바퀴에 복습으로 이미 통과한 구절은 건너뜀). 20묶음이 끝나면 다음 바퀴.
      → 모든 구절이 바퀴마다(20일 남짓) 한 번 이상 돌고, 20일째 외운 마지막 묶음도 다음 바퀴 처음 1·4·11일째 복습이 이어짐.
   ④ 오늘 목록: 복습(단계 낮은 것 → 오래 밀린 것) 최대 MEM_CAP개 + 바퀴 점검 + 새 구절. 남으면 끝낸 뒤 '남은 복습 더 하기'.
   시뮬(sim_mem44.py, 단순 기억 모형·가정): 첫 20일 하루 평균 시험 21번(최대 31), 21~40일 12번, 41일부터 6~7번. 20일째 앞 묶음 기억 92% · 뒤 묶음 96%,
   120일째 93%, 한 구절을 가장 오래 안 본 날 30일. 회전 없이 간격만 두면 120일째 86% · 60일. 지금(하루 10구절 200구절)은 첫 20일 하루 46번. */
var MEM_CAP = 20;
(function () {
  if (typeof MEM44 === "undefined" || !MEM44.length) return;
  VERSE_SETS.length = 0; VERSES.length = 0;
  MEM44.forEach(g => {
    VERSE_SETS.push({ day: g.day, title: g.title, range: g.range, tags: g.tags, v: g.v.map(x => x.slice(0, 4)) });
    g.v.forEach(([no, ref, text, keys, theme]) => VERSES.push({ no, ref, text, keys, day: g.day, title: theme }));
  });
  MEM_INT.splice(0, MEM_INT.length, 0, 1, 3, 7, 14, 30, 60, 60);
})();
const memLearned = v => { const r = memRec(v.no); return !!(r && r.n > 0); };
const memGroup = d => VERSES.filter(v => v.day === d);
function memRoundOf() { return Math.max(1, Math.floor(+(S.mem && S.mem.round) || 1)); }
function memRoundsDone() { return memRoundOf() - 1; }
const memRdOf = v => +((memRec(v.no) || {}).rd || 0);
/* 오늘 볼 구절 전체 (순서 = 복습 급한 것 → 바퀴 점검 → 새 구절) */
memQueue = function () {
  const t = dayKey(), R = memRoundOf();
  const due = VERSES.filter(v => { const r = memRec(v.no); return r && r.n > 0 && r.due <= t; })
    .sort((a, b) => { const x = memRec(a.no), y = memRec(b.no); return (x.s - y.s) || (x.due < y.due ? -1 : x.due > y.due ? 1 : 0) || (a.no < b.no ? -1 : 1); });
  const seen = new Set(due.map(v => v.no));
  const rot = R >= 2 ? memGroup(S.mem.rg || 1).filter(v => !seen.has(v.no) && memLearned(v) && memRdOf(v) < R) : [];
  rot.forEach(v => seen.add(v.no));
  const nw = VERSES.filter(v => v.day <= S.mem.sets && !memLearned(v) && !seen.has(v.no));
  return due.concat(rot, nw);
};
/* 한 판: 복습은 MEM_CAP개까지, 바퀴 점검·새 구절은 다 */
function memParts() {
  const q = memQueue(), t = dayKey(), R = memRoundOf();
  const isRev = v => memLearned(v) && memRec(v.no).due <= t;
  const rev = q.filter(isRev), rot = q.filter(v => !isRev(v) && memLearned(v)), nw = q.filter(v => !memLearned(v));
  return { q, rev, rot, nw, batch: rev.slice(0, MEM_CAP).concat(rot, nw), more: Math.max(0, rev.length - MEM_CAP), R };
}
function memBatch() { return memParts().batch; }
/* 새 묶음 열기(하루 하나) + 바퀴 넘기기 */
function memRoundTick() {
  const t = dayKey(), M = S.mem;
  if (memRoundOf() === 1) {          // 100구절을 다 외운 날에는 그대로, 다음 날부터 2바퀴
    if (!VERSES.length || !VERSES.every(memLearned)) return "";
    if (!M.fullDay) { M.fullDay = t; return ""; }
    if (M.fullDay !== t) { M.round = 2; M.rg = 1; M.rgDay = t; return "start"; }
    return "";
  }
  M.rg = Math.max(1, Math.min(MEM_DAYS, Math.floor(+M.rg || 1)));
  if (M.rgDay !== t && memGroup(M.rg).every(v => memRdOf(v) >= M.round)) {
    M.rgDay = t;
    if (M.rg >= MEM_DAYS) { M.round++; M.rg = 1; return "round"; }
    M.rg++; return "next";
  }
  return "";
}
memTryUnlock = function () {
  if (!S.mem.setDay) S.mem.setDay = dayKey();
  let did = false;
  if (S.mem.sets < MEM_DAYS && S.mem.setDay !== dayKey() && memGroup(S.mem.sets).every(memLearned)) {
    S.mem.sets++; S.mem.setDay = dayKey(); did = true;
    const st = VERSE_SETS[S.mem.sets - 1];
    toast(`${S.mem.sets}일차 새 5구절이 열렸어요 · ${st ? st.range : ""}`);
  }
  const mv = memRoundTick();
  if (mv === "start") celebrateLater({ ic: "scroll", title: "암송 100구절 첫 바퀴 완주!", sub: "오늘부터 2바퀴 · 하루 한 묶음(5구절)씩 다시 점검해요<br>외운 구절 복습(1·3·7·14·30·60일)은 그대로 이어져요", tone: "rare", keep: 1 });
  if (mv === "round") celebrateLater({ ic: "scroll", title: `암송 ${memRoundOf() - 1}바퀴 완주!`, sub: `오늘부터 ${memRoundOf()}바퀴 · 1일차 묶음부터 다시 점검해요`, tone: "rare", keep: 1 });
  return did;
};
/* 통과하면 '이번 바퀴에 확인함' 표시 (memPass 안에서 오늘 남은 구절을 셀 때도 반영되게 먼저) */
(function () {
  const mp0 = memPass;
  memPass = function (v) {
    const r = S.mem.v[v.no] || (S.mem.v[v.no] = { s: 0, n: 0, f: 0, due: dayKey() });
    r.rd = memRoundOf();
    return mp0(v);
  };
})();
/* 바퀴 글 (암송 탭 · 정보) */
function memRoundLine() {
  const R = memRoundOf();
  if (R === 1) {
    const st = VERSE_SETS[Math.max(0, Math.min(MEM_DAYS, S.mem.sets) - 1)];
    return `1바퀴 · ${S.mem.sets}/${MEM_DAYS}일차${st ? ` · ${st.range} (${escapeHtml(st.title)})` : ""}`;
  }
  const st = VERSE_SETS[Math.max(0, (S.mem.rg || 1) - 1)], left = st ? memGroup(st.day).filter(v => memRdOf(v) < R).length : 0;
  return `${R}바퀴 · ${S.mem.rg}/${MEM_DAYS}묶음 점검${st ? ` · ${st.range} (${escapeHtml(st.title)})` : ""}${left ? ` · 오늘 ${left}구절` : " · 이 묶음은 확인 끝"}`;
}
/* 20일 계획 줄 표시: 오늘 묶음 · 이번 바퀴에 다 확인한 묶음 ✓ */
function memRowMark(d) {
  const R = memRoundOf(), cur = R === 1 ? S.mem.sets : (S.mem.rg || 1), vs = memGroup(d);
  const done = vs.length > 0 && vs.every(v => memLearned(v) && memRdOf(v) >= R);
  return (d === cur ? ' <em class="mem-now">오늘</em>' : "") + (done ? ' <em class="mem-ok">✓</em>' : "");
}
/* 예전 기록 옮기기: 201~300을 예전 주제별 묶음에서 외웠으면 그 기록은 그대로 두고, 아직 다 못 외운 첫 묶음에서 시작 */
function memMigrate44(s) {
  const M = s.mem || (s.mem = {});
  M.v = M.v || {};
  if (M.vset !== 44) {
    let g = 1;
    while (g < MEM_DAYS && VERSES.filter(v => v.day === g).every(v => { const r = M.v[v.no]; return r && r.n > 0; })) g++;
    M.sets = g; M.setDay = ""; M.round = 1; M.rg = 0; M.rgDay = ""; M.fullDay = ""; M.vset = 44;
  }
  M.round = Math.max(1, Math.floor(+M.round || 1));
  M.sets = Math.max(1, Math.min(MEM_DAYS, Math.floor(+M.sets || 1)));
  return s;
}
(function () {          // freshState에는 vset을 넣지 않음 (merge가 freshState().mem 위에 예전 기록을 덮어서 옮기기를 건너뛰게 됨)
  const mg0 = merge;
  merge = function (d) { return memMigrate44(mg0(d)); };
})();
/* 옷장·업적: 100구절이라 '암송 완료 150·200'은 못 닿음 → 바퀴 완주로 */
(function () {
  WCOND.memr = ["암송 바퀴 완주", v => `${v}바퀴`];
  const cv0 = wardCondVal;
  wardCondVal = function (k) { if (k === "memr") return memRoundsDone(); return cv0(k); };
  if (WIT.vc_tie) WIT.vc_tie.cond = ["memr", 4];
  if (WIT.t_heart) { WIT.t_heart.cond = ["memr", 2]; WIT.t_heart.d = "그것을 네 목에 매며 네 마음판에 새기라 (잠 3:3) · 암송 100구절 2바퀴 완주"; }
})();
/* 처음 시작하는 기록(저장 전)은 바로 새 방식으로 */
if (S && S.mem && S.mem.vset !== 44 && !Object.keys(S.mem.v || {}).length && !(+S.mem.total)) { S.mem.vset = 44; S.mem.round = 1; S.mem.rg = 0; S.mem.rgDay = ""; }
