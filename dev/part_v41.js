/* ===================== v41 말씀 읽기 한 번에 · 공부와 말씀 시간 겹침 막기 =====================
   사용자(2026-10-11 12:44): "말씀 읽기 시작하면 바로 시간초 카운트 들어가게, 왜 두 번 내가 일해야 해"
     → '읽기 시작'을 누르면 타이머만 켜지고 본문은 따로 열어야 했음(두 번). 이제 한 번 누르면 본문이 바로 열리고 시간이 셈.
       본문에서는 연 순간부터 '확인까지 남은 시간'을 보여 주고, 끝까지 내려 읽고 시간이 차면 버튼 없이 자동 체크.
   "공부시간도 해놓고 성경읽기 카운트도 되는 버그"
     → 공부 타이머와 말씀 타이머가 동시에 돌아 같은 시간이 양쪽에 쌓였음. 말씀을 읽는 동안 공부는 잠깐 멈추고, 다 읽으면 다시 켬. */

/* ---------- 공부 ↔ 말씀: 한 번에 하나만 ---------- */
function readPausesStudy() {
  const St = S.study;
  if (St && St.running && S.bible.timer) { studyPauseV40(); St.pausedByRead = true; toast("말씀 읽는 동안 공부 시간은 잠깐 멈춰요 · 다 읽으면 다시 켜져요"); }
}
function readResumesStudy() {
  const St = S.study;
  if (St && St.pausedByRead && !St.running && !S.bible.timer) { St.pausedByRead = false; studyStartV40(); toast("공부 타이머를 다시 켰어요"); }
}
var studyStartV40 = studyStart, studyPauseV40 = studyPause, studyStopV40 = studyStop, readTimerToggleV40 = readTimerToggle,
  openReaderV40 = openReader, closeReaderV40 = closeReader, updateReaderStateV40 = updateReaderState;
studyStart = function () {
  if (S.bible.timer && !rd) readTimerToggleV40();                           // 종이 성경 타이머가 돌고 있으면 그 시간을 말씀으로 기록하고 멈춤
  S.study.pausedByRead = false;
  return studyStartV40();
};
studyPause = function () { S.study.pausedByRead = false; return studyPauseV40(); };
studyStop = function () { S.study.pausedByRead = false; return studyStopV40(); };
readTimerToggle = function () {
  const was = !!S.bible.timer, r = readTimerToggleV40();
  if (!was && S.bible.timer) readPausesStudy(); else if (was && !S.bible.timer) readResumesStudy();
  return r;
};
openReader = function (b, c, plan) {
  const r = openReaderV40(b, c, plan);
  readPausesStudy();
  return r;
};
closeReader = function () { const r = closeReaderV40(); readResumesStudy(); return r; };

/* ---------- '읽기 시작' 한 번이면 본문이 열리고 시간이 셈 ---------- */
function readStartTarget() {
  try { const g = $("plGo"); if (g && g.dataset && g.dataset.g != null && g.dataset.g !== "") { const bc = gBC(+g.dataset.g); return [bc[0], bc[1], true]; } } catch (e) {}
  const n = nextUnread(); return [n.b, n.c, undefined];
}
function readStartNow() {
  const [b, c, plan] = readStartTarget(); openReader(b, c, plan);           // 본문이 열린 순간부터 시간이 셈 · 본문을 닫으면 읽은 시간이 기록되고 멈춤
}

/* ---------- 본문: 연 순간부터 남은 시간 · 다 되면 자동 체크 ---------- */
function rdCountTxt(sec) { sec = Math.max(0, Math.ceil(sec)); return sec >= 60 ? `${Math.floor(sec / 60)}분 ${String(sec % 60).padStart(2, "0")}초` : `${sec}초`; }
updateReaderState = function () {
  const r = updateReaderStateV40();
  if (!rd || !rd.verses || !rd.verses.length || isToday(rd.b, rd.c)) return r;
  const left = rdLeft();
  if (rd.bottom && left <= 0) {                                            // 끝까지 읽었고 시간도 찼으면 바로 체크 (다음 장을 누를 필요 없음)
    if (checkCurrent(false)) { renderReader(); return r; }
  }
  const s = $("rdState");
  if (s) {
    const txt = left > 0 ? (rd.bottom ? `${rdCountTxt(left)} 뒤 자동 체크` : `확인까지 ${rdCountTxt(left)} · 끝까지 읽으면 자동 체크`) : (rd.bottom ? "체크하는 중…" : "끝까지 내려 읽으면 자동 체크");
    if (s.textContent !== txt) s.textContent = txt;
  }
  return r;
};

/* ---------- 오프라인 정산: 잠깐 효과(분노·쾌속·더블월급·응원·스킬)는 빼고 계산 — 켜 둔 채 닫으면 12시간 내내 적용되던 것 ---------- */
function withoutTempBuffs(fn) {
  const keepA = Object.assign({}, S.active), keepI = idolBuff.t, keepS = S.sneakerUntil, keepK = Object.assign({}, skillUntil);
  try { S.active.haste = 0; S.active.gold2 = 0; S.active.rage = 0; idolBuff.t = 0; S.sneakerUntil = 0; for (const k in skillUntil) skillUntil[k] = 0; return fn(); }
  finally { Object.assign(S.active, keepA); idolBuff.t = keepI; S.sneakerUntil = keepS; Object.assign(skillUntil, keepK); }
}
var simulateOfflineV40 = simulateOffline;
simulateOffline = function (sec) { return withoutTempBuffs(() => simulateOfflineV40(sec)); };
