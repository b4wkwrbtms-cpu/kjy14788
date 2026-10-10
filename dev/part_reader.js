/* ===================== 성경 읽기 (개역한글, 앱 안에서) =====================
   장을 누르면 본문이 열리고, 끝까지 읽은 뒤 '다음 장'으로 넘기면 앞 장이 자동으로 체크된다.
   너무 빨리 넘기면(끝까지 안 내렸거나 최소 시간 전) 한 번 알려 주고, 한 번 더 누르면 체크 없이 넘어간다. */
const USFM = ["GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL",
  "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"];
const OTHER_VERSIONS = [
  ["개역개정", "https://bible.bskorea.or.kr/bible/NKRV/{U}.{C}"],
  ["새번역", "https://bible.bskorea.or.kr/bible/RNKSV/{U}.{C}"],
  ["읽기 쉬운 성경", "https://www.bible.com/ko/bible/3803/{U}.{C}.KOERV"],
  ["현대인의 성경", "https://www.bible.com/ko/bible/86/{U}.{C}.KLB"],
];
var bibleText;   // 권 번호 → [[절, 절...], ...]
let rd = null;   // 지금 열린 장 { b, c, t0, bottom, min, verses, err, warned, autoTimer }
async function loadBook(b) {
  bibleText = bibleText || new Map();
  if (bibleText.has(b)) return bibleText.get(b);
  const r = await fetch(`bible/krv/${String(b + 1).padStart(2, "0")}.json`);
  if (!r.ok) throw new Error("HTTP " + r.status);
  const d = await r.json(); bibleText.set(b, d); return d;
}
// 최소로 머물러야 하는 시간: 글자 수 / 45 (초), 12~75초
const minReadSec = vs => Math.max(12, Math.min(75, Math.round(vs.reduce((a, v) => a + v.length, 0) / 45)));
function nextUnread() {
  const p = S.bible.pos;
  if (p && BOOKS[p.b] && p.c < BOOKS[p.b][1]) {
    if (!isToday(p.b, p.c)) return p;
    return p.c + 1 < BOOKS[p.b][1] ? { b: p.b, c: p.c + 1 } : { b: (p.b + 1) % 66, c: 0 };
  }
  for (let b = 0; b < 66; b++) { const i = bits(b).indexOf("0"); if (i >= 0) return { b, c: i }; }
  return { b: 0, c: 0 };
}
function openReader(b, c) {
  rollDay();
  if (!rd) { rd = { autoTimer: false }; if (!S.bible.timer) { S.bible.timer = Date.now(); rd.autoTimer = true; } }
  Object.assign(rd, { b, c, t0: Date.now(), bottom: false, min: 20, verses: null, err: false, warned: false });
  S.bible.pos = { b, c };
  bibleBook = b; bibleTest = b < 39 ? "old" : "new";
  const box = $("reader"); box.hidden = false; if (document.body && document.body.style) document.body.style.overflow = "hidden";
  const body = $("rdBody"); body.style.fontSize = (S.rdfs || 18) + "px"; body.scrollTop = 0;
  renderReader();
  loadBook(b).then(d => {
    if (!rd || rd.b !== b || rd.c !== c) return;
    rd.verses = d[c] || []; rd.min = minReadSec(rd.verses); renderReader();
    requestAnimationFrame(() => readerScrolled());
  }).catch(() => { if (rd && rd.b === b && rd.c === c) { rd.verses = []; rd.err = true; renderReader(); } });
}
function closeReader() {
  if (!rd) return;
  const auto = rd.autoTimer; rd = null;
  $("reader").hidden = true; if (document.body && document.body.style) document.body.style.overflow = "";
  if (auto && S.bible.timer) readTimerToggle();
  updateUI(true); save();
}
const readEnough = () => !!(rd && rd.verses && rd.verses.length && rd.bottom && (Date.now() - rd.t0) / 1000 >= rd.min);
function checkCurrent(manual) {
  if (!rd) return false;
  if (isToday(rd.b, rd.c)) return true;
  if (!manual && !readEnough()) return false;
  toggleChapter(rd.b, rd.c); save(); return true;
}
function stepReader(dir) {
  if (!rd) return;
  if (dir > 0 && rd.verses && rd.verses.length && !checkCurrent(false)) {
    if (!rd.warned) {
      rd.warned = true;
      const left = Math.max(0, Math.ceil(rd.min - (Date.now() - rd.t0) / 1000));
      toast(!rd.bottom ? "끝까지 읽고 넘기면 자동으로 체크돼요 · 한 번 더 누르면 체크 없이 넘어가요" : `${left}초만 더 읽으면 체크돼요 · 한 번 더 누르면 체크 없이 넘어가요`);
      return;
    }
  }
  let b = rd.b, c = rd.c + dir;
  if (c >= BOOKS[b][1]) { b = (b + 1) % 66; c = 0; }
  if (c < 0) { b = (b + 65) % 66; c = BOOKS[b][1] - 1; }
  openReader(b, c);
}
function readerScrolled() {
  if (!rd || !rd.verses || !rd.verses.length) return;
  const el2 = $("rdBody");
  if (el2.scrollTop + el2.clientHeight >= el2.scrollHeight - 80) rd.bottom = true;
  updateReaderState();
}
function renderReader() {
  if (!rd) return;
  const b = rd.b, c = rd.c, done = isToday(b, c), before = bits(b)[c] === "1", body = $("rdBody"), st = body.scrollTop;
  $("rdTitle").textContent = `${BOOKS[b][0]} ${c + 1}장`;
  $("rdSub").textContent = "개역한글" + (done ? " · 오늘 읽음 ✓" : before ? " · 이번 통독에서 읽은 장" : "");
  const links = OTHER_VERSIONS.map(([n, u]) => `<a href="${u.replace("{U}", USFM[b]).replace("{C}", c + 1)}" target="_blank" rel="noopener">${n}</a>`).join("");
  let html;
  if (!rd.verses) html = `<p class="muted">말씀을 불러오는 중…</p>`;
  else if (rd.err || !rd.verses.length) html = `<p class="muted">본문을 불러오지 못했어요. 인터넷에 연결된 상태로 한 번 열면 그다음부터는 없어도 읽을 수 있어요. 아래 링크로도 읽을 수 있어요.</p>`;
  else html = rd.verses.map((v, i) => `<p><sup>${i + 1}</sup>${escapeHtml(v)}</p>`).join("");
  html += `<div class="rd-end">
    <button class="btn manna" data-r="done" ${done ? "disabled" : ""}>${done ? "오늘 읽음으로 체크됨 ✓" : "이 장 다 읽음 ✓"}</button>
    ${done ? `<button class="btn" data-r="undo">체크 취소</button>` : ""}
    <div class="muted">같은 장을 다른 번역으로 보기 (새 창)</div><div class="rd-vers">${links}</div></div>`;
  body.innerHTML = html; body.scrollTop = st;
  updateReaderState();
}
function updateReaderState() {
  if (!rd) return;
  const s = $("rdState"); if (!s) return;
  let txt = "";
  if (isToday(rd.b, rd.c)) txt = "오늘 읽음 ✓";
  else if (rd.verses && rd.verses.length) {
    const left = Math.max(0, Math.ceil(rd.min - (Date.now() - rd.t0) / 1000));
    txt = !rd.bottom ? "끝까지 읽어 주세요" : left ? `${left}초 뒤 넘기면 체크` : "다음 장으로 넘기면 체크 ✓";
  }
  if (s.textContent !== txt) s.textContent = txt;
  const t = $("rdTimer"); if (t) { const v = S.bible.timer ? "읽는 중 " + mm(Date.now() - S.bible.timer) : ""; if (t.textContent !== v) t.textContent = v; }
}
(() => {
  const box = $("reader");
  box.addEventListener("click", e => {
    let t = e.target;
    while (t && t !== box) {
      const a = t.dataset && t.dataset.r;
      if (a) {
        if (a === "close") closeReader();
        else if (a === "prev") stepReader(-1);
        else if (a === "next") stepReader(1);
        else if (a === "done") { checkCurrent(true); renderReader(); }
        else if (a === "undo") { if (rd && isToday(rd.b, rd.c)) { toggleChapter(rd.b, rd.c); save(); } renderReader(); }
        else if (a === "fs-" || a === "fs+") { S.rdfs = Math.max(14, Math.min(28, (S.rdfs || 18) + (a === "fs+" ? 2 : -2))); $("rdBody").style.fontSize = S.rdfs + "px"; save(); }
        return;
      }
      t = t.parentElement || t.parent;
    }
  });
  $("rdBody").addEventListener("scroll", readerScrolled, { passive: true });
})();
