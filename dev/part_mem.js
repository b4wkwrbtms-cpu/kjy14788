/* ===================== 암송 (20일 200구절, 간격 반복) ===================== */
const VERSE_SETS = /*VERSE_DATA*/[];
const VERSES = [];
VERSE_SETS.forEach(s => s.v.forEach(([no, ref, text, keys]) => VERSES.push({ no, ref, text, keys, day: s.day, title: s.title })));
const MEM_INT = [0, 1, 2, 4, 7, 15, 30, 60], MEM_MAX = 7, MEM_MASTER = 5, MEM_DAYS = 20;
const STAGE_TEST = ["순서 맞추기", "빈칸 채우기", "장절 + 빈칸", "초성 보고 쓰기", "장절만 보고 쓰기", "장절만 보고 쓰기", "장절만 보고 쓰기", "장절만 보고 쓰기"];
const testOf = s => s <= 0 ? "order" : s === 1 ? "blank" : s === 2 ? "refblank" : s === 3 ? "hint" : "type";
function addDays(key, n) { const [y, m, d] = key.split("-").map(Number); return dayKey(new Date(y, m - 1, d + n)); }
const memRec = no => S.mem.v[no] || null;
const memStreak = () => (S.mem.last === dayKey() || S.mem.last === yesterdayKey()) ? S.mem.streak : 0;
const memMult = () => (1 + 0.05 * Math.min(20, memStreak())) * rewardBoost();
const memMastered = () => VERSES.filter(v => (memRec(v.no) || {}).s >= MEM_MASTER).length;
function memQueue() { const t = dayKey(); return VERSES.filter(v => v.day <= S.mem.sets && (!memRec(v.no) || memRec(v.no).due <= t)); }
function memReward(s) { return { manna: Math.round(10 * (s + 1) * memMult()), stamp: s >= 2 ? s : 0, gold: goldBase(Math.max(1, S.floor)) * 2 * (s + 1) * goldMult() }; }
function memTryUnlock() {
  if (!S.mem.setDay) S.mem.setDay = dayKey();
  if (S.mem.sets >= MEM_DAYS || S.mem.setDay === dayKey()) return false;
  const cur = VERSES.filter(v => v.day === S.mem.sets);
  if (!cur.every(v => (memRec(v.no) || {}).s >= 1)) return false;
  S.mem.sets++; S.mem.setDay = dayKey();
  toast(`${S.mem.sets}일차 새 10구절이 열렸어요`);
  return true;
}
function memPass(v) {
  rollDay();
  const r = S.mem.v[v.no] || (S.mem.v[v.no] = { s: 0, n: 0, f: 0, due: dayKey() });
  const s = r.s, rw = memReward(s);
  S.manna += rw.manna; S.stamp += rw.stamp; S.gold += rw.gold;
  r.s = Math.min(MEM_MAX, s + 1); r.n++; r.due = addDays(dayKey(), MEM_INT[r.s]); r.last = dayKey();
  S.mem.total++; S.day.mem = (S.day.mem || 0) + 1;
  if (S.mem.last !== dayKey()) { S.mem.streak = (S.mem.last === yesterdayKey() ? S.mem.streak : 0) + 1; S.mem.last = dayKey(); S.mem.best = Math.max(S.mem.best, S.mem.streak); }
  let bonus = "";
  if (r.s === MEM_MASTER) { S.stamp += 10; bonus = " · 암송 완료 보너스 도장 10"; }
  return { rw, bonus, from: s, to: r.s };
}
function memFail(v) {
  const r = S.mem.v[v.no] || (S.mem.v[v.no] = { s: 0, n: 0, f: 0, due: dayKey() });
  r.s = Math.max(0, r.s - 1); r.f++; r.due = dayKey();
}
/* 채점 도구 */
const normV = s => s.replace(/[\s\/.,…!?·"'“”‘’:;()\-~]/g, "");
function similarity(a, b) {
  a = normV(a); b = normV(b); if (!a.length && !b.length) return 1;
  const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return 1 - prev[n] / Math.max(m, n);
}
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const choseong = s => s.replace(/[가-힣]/g, ch => CHO[Math.floor((ch.charCodeAt(0) - 0xAC00) / 588)]);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function chunksOf(v) {
  let ch = v.text.split(" / ").map(s => s.trim()).filter(Boolean);
  if (ch.length < 3) {
    const words = v.text.replace(/ \/ /g, " ").split(" ").filter(Boolean), n = Math.min(5, Math.max(3, Math.ceil(words.length / 3)));
    ch = []; const per = Math.ceil(words.length / n); for (let i = 0; i < words.length; i += per) ch.push(words.slice(i, i + per).join(" "));
  }
  return ch;
}
function keyHtml(v) {
  let h = escapeHtml(v.text);
  v.keys.slice().sort((a, b) => b.length - a.length).forEach(k => { const ek = escapeHtml(k); h = h.split(ek).join(`\u0001${ek}\u0002`); });
  return h.replace(/\u0001/g, '<mark class="key">').replace(/\u0002/g, "</mark>").replace(/ \/ /g, ' <span class="sl">/</span> ');
}
function distractKeys(v, n) { return shuffle(VERSES.filter(o => o.no !== v.no).flatMap(o => o.keys)).filter(k => !v.keys.includes(k)).slice(0, n); }
function distractRefs(v, n) { return shuffle(VERSES.filter(o => o.no !== v.no && o.ref !== v.ref)).slice(0, n).map(o => o.ref); }

/* 시험 화면 */
let memSess = null;
function memStart(list) {
  if (!list.length) { toast("지금 볼 구절이 없어요"); return; }
  memSess = { list: list.map(v => v.no), i: 0, passed: 0 };
  memOpen(false);
}
const curVerse = () => VERSES.find(v => v.no === memSess.list[memSess.i]);
function memOpen(learnOnly) {
  const v = curVerse(), r = memRec(v.no), s = r ? r.s : 0;
  memSess.v = v; memSess.stage = s; memSess.mistakes = 0;
  memSess.phase = (!r || r.n === 0) || learnOnly ? "learn" : "test";
  memSess.learnOnly = !!learnOnly;
  memSetupTest();
  memRender();
  const box = $("memBox"); if (box && box.scrollIntoView) box.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}
function memSetupTest() {
  const v = memSess.v, kind = testOf(memSess.stage);
  memSess.kind = kind;
  if (kind === "order") { const ch = chunksOf(v); memSess.chunks = ch; memSess.pool = shuffle(ch.map((c, i) => ({ c, i }))); memSess.done = []; }
  if (kind === "blank" || kind === "refblank") {
    const plain = v.text;
    memSess.blanks = v.keys.map(k => ({ k, pos: plain.indexOf(k) })).filter(b => b.pos >= 0).sort((a, b) => a.pos - b.pos);
    memSess.bi = 0; memSess.opts = memSess.blanks.length ? shuffle([memSess.blanks[0].k, ...distractKeys(v, 3)]) : [];
    memSess.refDone = kind !== "refblank";
    memSess.refOpts = shuffle([v.ref, ...distractRefs(v, 3)]);
  }
}
function memRender() {
  const box = $("memBox"); if (!box) return;
  if (!memSess) { box.hidden = true; return; }
  box.hidden = false;
  const v = memSess.v, s = memSess.stage, head = `<div class="mem-head"><span class="num">${v.no} · ${escapeHtml(v.ref)}</span><span>${memSess.learnOnly ? "구절 보기" : `${memSess.i + 1} / ${memSess.list.length}`}</span></div>
    <div class="mem-stage"><span>${escapeHtml(v.title)} · ${v.day}일차</span><span class="stars">${Array.from({ length: MEM_MAX }, (_, i) => `<i class="${i < s ? "on" : ""}"></i>`).join("")}</span></div>`;
  let body = "";
  if (memSess.phase === "learn") {
    body = `<div class="verse">${keyHtml(v)}</div><p class="muted">소리 내어 세 번 읽어 보세요. 장절 → 본문 → 장절 순서로, / 에서 끊어 외우고 노란 글씨를 기억의 열쇠로 삼으세요.</p>
      <div class="row-btns">${memSess.learnOnly ? `<button class="btn" data-act="close">닫기</button>` : `<button class="btn" data-act="skip">나중에</button>`}<button class="btn manna" data-act="start" style="flex:1">외웠어요, 시험 보기 (${STAGE_TEST[s]})</button></div>`;
  } else if (memSess.phase === "test") {
    const kind = memSess.kind;
    if (kind === "order") {
      body = `<p class="q">구절을 순서대로 눌러 맞추세요</p><div class="answer">${memSess.done.map(i => `<span class="chunk ok">${escapeHtml(memSess.chunks[i])}</span>`).join("") || '<span class="muted">여기에 순서대로 쌓여요</span>'}</div>
        <div class="pool">${memSess.pool.map((p, j) => `<button class="chunk" data-act="pick" data-j="${j}">${escapeHtml(p.c)}</button>`).join("")}</div>`;
    } else if ((kind === "blank" || kind === "refblank") && !memSess.refDone) {
      body = `<p class="q">이 말씀은 어디에 있나요?</p><div class="verse">${keyHtml(v)}</div><div class="opts">${memSess.refOpts.map((o, j) => `<button class="btn" data-act="ref" data-j="${j}">${escapeHtml(o)}</button>`).join("")}</div>`;
    } else if (kind === "blank" || kind === "refblank") {
      let txt = escapeHtml(v.text).replace(/ \/ /g, ' <span class="sl">/</span> ');
      memSess.blanks.forEach((b, i) => { const ek = escapeHtml(b.k); txt = txt.replace(ek, i < memSess.bi ? `<mark class="key">${ek}</mark>` : i === memSess.bi ? `<span class="blank cur">${"＿".repeat(Math.min(8, b.k.length))}</span>` : `<span class="blank">${"＿".repeat(Math.min(8, b.k.length))}</span>`); });
      body = `<p class="q">빈칸에 들어갈 말씀을 고르세요 (${memSess.bi + 1}/${memSess.blanks.length})</p><div class="verse">${txt}</div>
        <div class="opts">${memSess.opts.map((o, j) => `<button class="btn" data-act="blank" data-j="${j}">${escapeHtml(o)}</button>`).join("")}</div>`;
    } else {
      const hint = kind === "hint" ? `<div class="hint-cho">${escapeHtml(choseong(v.text.replace(/ \/ /g, " ")))}</div>` : `<p class="muted">${escapeHtml(v.title)} · 힌트 없이 써 보세요</p>`;
      body = `<p class="q">${escapeHtml(v.ref)} 말씀을 쓰세요</p>${hint}<textarea id="memType" rows="4" placeholder="띄어쓰기와 문장부호는 틀려도 괜찮아요"></textarea>
        <div class="row-btns"><button class="btn" data-act="giveup">모르겠어요</button><button class="btn manna" data-act="check" style="flex:1">채점하기</button></div>`;
    }
    if (kind !== "hint" && kind !== "type") body += `<div class="row-btns"><button class="btn" data-act="giveup">모르겠어요 (정답 보기)</button></div>`;
  } else {
    const res = memSess.result;
    body = res.pass
      ? `<div class="mem-result pass"><b>통과!</b> ${STAGE_TEST[res.from]} → ${res.to}단계${res.to >= MEM_MASTER ? " · 암송 완료" : ""}<span>만나 +${res.rw.manna}${res.rw.stamp ? ` · 도장 +${res.rw.stamp}` : ""} · 월급 +${fmt(res.rw.gold)}원${res.bonus}</span><span>다음 복습: ${MEM_INT[res.to]}일 뒤</span></div>`
      : `<div class="mem-result fail"><b>아쉬워요</b> 한 단계 내려가고 오늘 다시 볼 수 있어요<span>${res.note || ""}</span></div>`;
    body += `<div class="verse">${keyHtml(v)}</div><div class="row-btns">${res.pass ? "" : `<button class="btn" data-act="retry">다시 도전</button>`}<button class="btn manna" data-act="next" style="flex:1">${memSess.i + 1 < memSess.list.length ? "다음 구절" : "끝내기"}</button></div>`;
  }
  box.innerHTML = head + body;
}
function memFinish(pass, note) {
  const v = memSess.v;
  if (pass) { const r = memPass(v); memSess.result = Object.assign({ pass: true }, r); memSess.passed++; hitSound(0.6); say(`${v.ref} 통과! 월급 보너스 들어왔다!`, 3); }
  else { memFail(v); memSess.result = { pass: false, note }; }
  memSess.phase = "result"; memRender(); updateUI(true); save();
}
function memAct(act, j) {
  if (!memSess) return;
  const v = memSess.v;
  if (act === "close") { memSess = null; memRender(); return; }
  if (act === "skip" || act === "next") {
    memSess.i++;
    if (memSess.i >= memSess.list.length || memSess.learnOnly) { const n = memSess.passed; memSess = null; memRender(); if (n) toast(`암송 ${n}구절 통과!`); memTryUnlock(); updateUI(true); save(); return; }
    memOpen(false); return;
  }
  if (act === "start") { memSess.phase = "test"; memSess.learnOnly = false; memSetupTest(); memRender(); return; }
  if (act === "retry") { memSess.stage = (memRec(v.no) || { s: 0 }).s; memSess.mistakes = 0; memSess.phase = "test"; memSetupTest(); memRender(); return; }
  if (act === "giveup") { memFinish(false, "정답을 확인하고 다시 도전해 보세요"); return; }
  if (act === "pick") {
    const p = memSess.pool[j]; if (!p) return;
    if (p.i === memSess.done.length) { memSess.done.push(p.i); memSess.pool.splice(j, 1); if (!memSess.pool.length) return memFinish(true); }
    else if (++memSess.mistakes > 1) return memFinish(false, "순서를 두 번 틀렸어요");
    else toast("순서가 달라요. 한 번 더 틀리면 실패예요");
    memRender(); return;
  }
  if (act === "ref") { if (memSess.refOpts[j] === v.ref) { memSess.refDone = true; memRender(); } else memFinish(false, `정답은 ${v.ref}`); return; }
  if (act === "blank") {
    const b = memSess.blanks[memSess.bi];
    if (memSess.opts[j] === b.k) {
      memSess.bi++;
      if (memSess.bi >= memSess.blanks.length) return memFinish(true);
      memSess.opts = shuffle([memSess.blanks[memSess.bi].k, ...distractKeys(v, 3)]);
    } else if (++memSess.mistakes > 1) return memFinish(false, "빈칸을 두 번 틀렸어요");
    else toast("다시 골라 보세요. 한 번 더 틀리면 실패예요");
    memRender(); return;
  }
  if (act === "check") {
    const t = ($("memType") || {}).value || "", sim = similarity(t, v.text);
    if (sim >= 0.85) memFinish(true); else memFinish(false, `일치도 ${Math.round(sim * 100)}% (85% 이상이면 통과)`);
  }
}
