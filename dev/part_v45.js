/* ===================== v45 성경: 20대 말투(말씀 웹소설체) + 아담~예수님 계보 이름 빨간 밑줄 =====================
   사용자(10-11 17:33·22:00): "개역한글을 원어(히브리어·헬라어)에서 벗어나지 않는 뜻으로, 우리 20대 언어로 전부 · 재미있게 쭉쭉 · 내용은 그대로
   말투·흐름·가독성만 · 라노벨·웹소설 탑급 20개 이상 참고 · 아담부터 예수 그리스도 계보 이름은 전부 빨간색 표시"
   ① 본문: bible/mz/NN.json = 장마다 { h: [[절, 소제목]...], v: ["절(줄은 \n)", ...] } 또는 아직이면 null. 절 수는 개역한글과 같음.
   ② 계보(구약만 — 사용자 22:31 '신약은 제외, 어차피 완성된 지점'): bible/lin.json = { k: 개역한글, m: 20대 말투 } 각각 { 권: { "장:절": "이름,이름" } } — 규칙(lineage.py)으로 뽑은 '그 사람'이 나오는 절만. 두 번역 다 표시.
   ③ 읽기 창 위에 [20대 말투 | 개역한글] 바꾸기 (S.rdv, 기본 20대 말투). 아직 안 된 장은 개역한글로 보여 줌.
   ④ 서비스워커가 bible/을 한 번 받으면 계속 쓰므로 주소에 MZ_VER를 붙여 새 판을 받게 함. */
var MZ_VER = "45a";
var bibleMz = new Map(), bibleLin = null, bibleLinP = null;
function rdVer() { return S.rdv === "krv" ? "krv" : "mz"; }
async function loadMz(b) {
  if (bibleMz.has(b)) return bibleMz.get(b);
  try {
    const r = await fetch(`bible/mz/${String(b + 1).padStart(2, "0")}.json?v=${MZ_VER}`);
    if (!r.ok) { if (r.status === 404) bibleMz.set(b, null); return null; }
    const d = await r.json(); bibleMz.set(b, d); return d;
  } catch (e) { return null; }
}
function loadLin() {
  if (bibleLin) return Promise.resolve(bibleLin);
  if (!bibleLinP) bibleLinP = fetch(`bible/lin.json?v=${MZ_VER}`).then(r => r.ok ? r.json() : null).catch(() => null).then(d => { bibleLinP = null; if (d) bibleLin = d; return d; });
  return bibleLinP;
}
function mzChapter(b, c) { const d = bibleMz.get(b); const ch = d && d[c]; return ch && Array.isArray(ch.v) && ch.v.length ? ch : null; }
function linOf(b, c, ver) {
  const m = bibleLin && bibleLin[ver === "mz" ? "m" : "k"] && bibleLin[ver === "mz" ? "m" : "k"][String(b + 1)], out = {};
  if (!m) return out;
  const pre = (c + 1) + ":";
  for (const k in m) if (k.indexOf(pre) === 0) out[+k.slice(pre.length)] = String(m[k]).split(",");
  return out;
}
/* 이름 뒤에 한글이 붙으면 조사일 때만 (사람 ≠ 람, 셋째 ≠ 셋, 르우벤 ≠ 르우 · 다윗왕·다윗성은 표시) */
const LIN_PART = ["이라고", "이라", "이었", "이고", "이며", "이요", "이니", "이에", "이지", "이시", "이신", "이셨", "이야", "이랑", "이네", "이여", "이다", "에게", "에서", "한테", "처럼", "보다", "부터", "까지", "으로", "하고", "조차", "마저",
  "이", "가", "은", "는", "을", "를", "의", "에", "께", "과", "와", "도", "만", "아", "야", "여", "님", "라", "랑", "로", "였", "뿐", "씨", "네", "다", "요", "왕", "성"];
const isHan = ch => !!ch && ch >= "가" && ch <= "힣";
function linMark(html, names) {
  if (!names || !names.length) return html;
  const marks = [];
  names.slice().sort((a, b) => b.length - a.length).forEach(nm => {
    if (!nm) return;
    let i = html.indexOf(nm);
    while (i >= 0) {
      const j = i + nm.length, before = html[i - 1], rest = html.slice(j, j + 3);
      const okB = !isHan(before), okA = !isHan(html[j]) || LIN_PART.some(p => rest.indexOf(p) === 0);
      if (okB && okA && !marks.some(m => i < m[1] && j > m[0])) marks.push([i, j]);
      i = html.indexOf(nm, j);
    }
  });
  if (!marks.length) return html;
  marks.sort((a, b) => a[0] - b[0]);
  let out = "", p = 0;
  marks.forEach(([a, z]) => { out += html.slice(p, a) + `<u class="lin">${html.slice(a, z)}</u>`; p = z; });
  return out + html.slice(p);
}
function mzLines(t) { return String(t || "").split("\n"); }
function mzPlain(ch) { return ch.v.map(t => mzLines(t).join(" ").replace(/\([^)]*\)/g, "")); }
function rdMzHtml(ch, lin) {
  const heads = {}; (ch.h || []).forEach(x => { if (Array.isArray(x) && x[0] >= 1) heads[x[0]] = (heads[x[0]] ? heads[x[0]] + " · " : "") + x[1]; });
  return ch.v.map((t, i) => {
    const n = i + 1;
    const ls = mzLines(t).map((x, k) => {
      const sup = /^\s*〔.*〕\s*$/.test(x), e = linMark(escapeHtml(x), lin[n]);
      return `<span class="ln${sup ? " sup-t" : ""}">${k === 0 ? `<sup>${n}</sup>` : ""}${e}</span>`;
    }).join("");
    return (heads[n] ? `<h4 class="rd-h">${escapeHtml(heads[n])}</h4>` : "") + `<p class="mz">${ls}</p>`;
  }).join("");
}
renderReader = function () {
  if (!rd) return;
  const b = rd.b, c = rd.c, done = isToday(b, c), before = bits(b)[c] === "1", body = $("rdBody"), st = body.scrollTop;
  const want = rdVer(), mz = rd.verses && rd.verses.length ? mzChapter(b, c) : null, showMz = want === "mz" && !!mz;
  if (rd.verses && rd.verses.length) rd.min = minReadSec(showMz ? mzPlain(mz) : rd.verses);
  $("rdTitle").textContent = `${BOOKS[b][0]} ${c + 1}장`;
  $("rdSub").textContent = (showMz ? "20대 말투" : "개역한글") + (rd.plan ? planReaderTag(b, c) : "") + (done ? (rdPf(b, c) ? " · 오늘 읽음 ✓" : " · 기록됨") : before ? " · 이번 통독에서 읽은 장" : "");
  const links = OTHER_VERSIONS.map(([n, u]) => `<a href="${u.replace("{U}", USFM[b]).replace("{C}", c + 1)}" target="_blank" rel="noopener">${n}</a>`).join("");
  const lin = linOf(b, c, showMz ? "mz" : "krv"), anyLin = Object.keys(lin).length > 0;
  let html = `<div class="rd-ver" role="group" aria-label="번역 고르기"><button type="button" data-r="v-mz" class="${want === "mz" ? "on" : ""}">20대 말투</button><button type="button" data-r="v-krv" class="${want === "krv" ? "on" : ""}">개역한글</button></div>`;
  if (!rd.verses) html += `<p class="muted">말씀을 불러오는 중…</p>`;
  else if (rd.err || !rd.verses.length) html += `<p class="muted">본문을 불러오지 못했어요. 인터넷에 연결된 상태로 한 번 열면 그다음부터는 없어도 읽을 수 있어요. 아래 링크로도 읽을 수 있어요.</p>`;
  else {
    if (want === "mz" && !mz) html += `<p class="rd-note">이 장은 20대 말투로 다듬는 중이에요 · 지금은 개역한글로 보여 드려요</p>`;
    if (anyLin) html += `<p class="rd-note lin-key"><u class="lin">빨간 밑줄</u> = 아담부터 예수님까지 이어지는 족보 이름</p>`;
    html += showMz ? rdMzHtml(mz, lin) : rd.verses.map((v, i) => `<p><sup>${i + 1}</sup>${linMark(escapeHtml(v), lin[i + 1])}</p>`).join("");
  }
  html += `<div class="rd-end">
    <button class="btn manna${done && !rdPf(b, c) ? " pend" : ""}" data-r="done" ${done ? "disabled" : ""}>${done ? (rdPf(b, c) ? "오늘 읽음으로 체크됨 ✓" : "기록됨 · 읽은 시간이 쌓이면 ✓") : "이 장 다 읽음 ✓"}</button>
    ${done ? `<button class="btn" data-r="undo">체크 취소</button>` : ""}
    <div class="muted">같은 장을 다른 번역으로 보기 (새 창)</div><div class="rd-vers">${links}</div></div>`;
  body.innerHTML = html; body.scrollTop = st;
  updateReaderState();
};
(function () {
  const or0 = openReader;
  openReader = function (b, c, plan) {
    const r = or0(b, c, plan);
    Promise.all([loadMz(b), loadLin()]).then(() => { if (rd && rd.b === b && rd.c === c) renderReader(); });
    return r;
  };
  const box = $("reader");
  if (box && box.addEventListener) box.addEventListener("click", e => {
    let t = e.target;
    while (t && t !== box) {
      const a = t.dataset && t.dataset.r;
      if (a === "v-mz" || a === "v-krv") {
        const v = a === "v-mz" ? "mz" : "krv";
        if (rdVer() !== v) { S.rdv = v; save(); const bd = $("rdBody"); renderReader(); if (bd) bd.scrollTop = 0; }
        return;
      }
      if (a) return;
      t = t.parentElement || t.parent;
    }
  });
})();
