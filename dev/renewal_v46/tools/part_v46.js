/* ===================== v46 말씀 읽기 창: 장 안내 · 대화 이름표 · 눌러 보는 해설 · 절 원어 메모 · 이야기 흐름 접기 · 읽던 자리 =====================
   사용자(10-17): 다른 팀 '말씀 리뉴얼' 독서판의 좋은 기능은 다 넣되 앱에 맞게. 본문은 우리 v45 20대 말투 유지 + 원어·의미 교정만 반영.
   ① bible/x/NN.json (창세기~열왕기하): 장마다 { t 제목, g 안내, sp {절: [[줄, 말하는 이, 듣는 이, 종류, 표시]]}, ln {절: [[해설id, 낱말, 종류]]},
      un [[해설id, 종류]] (본문 낱말에 안 걸린 해설), vn {절: [{he, rd, m, t}]} 원어 메모, fold [[시작, 끝, 분야, 제목, 안내3줄, 이름표3, 범위, 이어짐]] }
   ② bible/nt/NN.json: 그 권의 해설 카드 { id: { k 종류, b 배지, l 위치, t 제목, s 요약, tm [[히브리어, 발음, 뜻]], bl [{s, it:[{h,p,tm,f,src}]}], src } }
   ③ bible/he/NN.json: 히브리어 본문 (절 번호를 눌렀을 때만 불러옴)
   ④ 보기 설정 S.rdo { sp 이름표, ln 해설 밑줄, col 색 구분, flow 이야기 흐름(족보·율법 접기), wide 줄 간격, nonum 절 번호 숨김 }
   ⑤ 이야기 흐름에서 접힌 본문은 펼쳐 읽어야 '읽음'으로 체크됨(그쪽 원칙: 접은 곳을 읽은 것으로 치지 않음). */
var X_VER = "46t";
const XB = new Set(/*XB*/[]);   // 1~12권 밖에서 x 파일(신약 사본 차이 메모)이 있는 권 (0부터)
var bibleX = new Map(), bibleNt = new Map(), bibleHe = new Map();
const NK = { person: ["인물", "k-person"], place: ["지명", "k-place"], hebrew: ["원어", "k-hebrew"], culture: ["생활·단위", "k-culture"] };
function rdOpt() { const o = S.rdo || {}; return { sp: o.sp !== false, ln: o.ln !== false, col: !!o.col, flow: !!o.flow, wide: !!o.wide, nonum: !!o.nonum }; }
function setOpt(k, v) { S.rdo = S.rdo || {}; S.rdo[k] = v; save(); }
function xFetch(dir, b, map) {
  if (b > 11 && !((dir === "x" || dir === "nt") && XB.has(b))) return Promise.resolve(null);
  if (map.has(b)) return Promise.resolve(map.get(b));
  return fetch(`bible/${dir}/${String(b + 1).padStart(2, "0")}.json?v=${X_VER}`).then(r => r.ok ? r.json() : null).catch(() => null).then(d => { if (d) map.set(b, d); return d; });
}
const loadX = b => xFetch("x", b, bibleX), loadNt = b => xFetch("nt", b, bibleNt), loadHe = b => xFetch("he", b, bibleHe);
function xChap(b, c) { const d = bibleX.get(b); return (d && d[String(c + 1)]) || null; }
function ntOf(b, id) { const d = bibleNt.get(b); return d && d[id] || null; }

/* 낱말 찾기: 앞은 한글이 아니고, 뒤는 한글이 아니거나 조사일 때만 */
function findWord(text, w, from) {
  let i = text.indexOf(w, from || 0);
  while (i >= 0) {
    const j = i + w.length, rest = text.slice(j, j + 3);
    if (!isHan(text[i - 1]) && (!isHan(text[j]) || LIN_PART.some(p => rest.indexOf(p) === 0))) return i;
    i = text.indexOf(w, j);
  }
  return -1;
}
/* 한 줄 꾸미기: 계보 빨간 밑줄 + 해설 밑줄 */
function markLine(text, linNames, links, done) {
  const sp = [];
  (linNames || []).slice().sort((a, b) => b.length - a.length).forEach(nm => {
    if (!nm) return; let i = findWord(text, nm);
    while (i >= 0) { sp.push({ a: i, z: i + nm.length, lin: true }); i = findWord(text, nm, i + nm.length); }
  });
  (links || []).forEach(([id, w, k]) => {
    if (done.has(id)) return;
    const i = findWord(text, w); if (i < 0) return;
    sp.push({ a: i, z: i + w.length, id, k }); done.add(id);
  });
  if (!sp.length) return escapeHtml(text);
  sp.sort((x, y) => x.a - y.a || (x.id ? -1 : 1));
  const out = []; let last = -1;
  sp.forEach(s => {
    const prev = out[out.length - 1];
    if (prev && s.a < prev.z) { if (s.lin && prev.id) prev.lin = true; else if (s.id && prev.lin && !prev.id && s.a === prev.a) { s.lin = true; out[out.length - 1] = s; } return; }
    out.push(s);
  });
  let html = "", p = 0;
  out.forEach(s => {
    html += escapeHtml(text.slice(p, s.a));
    const t = escapeHtml(text.slice(s.a, s.z));
    html += s.id ? `<a class="nl ${NK[s.k] ? NK[s.k][1] : ""}${s.lin ? " lin" : ""}" data-nt="${escapeHtml(s.id)}" role="button" tabindex="0">${t}</a>` : `<u class="lin">${t}</u>`;
    p = s.z;
  });
  return html + escapeHtml(text.slice(p));
}
function spLabel(l) {
  const [, who, to, kind, kt] = l;
  let h = `<span class="sp-lab"><b>${escapeHtml(who)}</b>`;
  if (kind === "thought") h += ` <i>속마음</i>`;
  else {
    if (to) h += `<span class="sp-ar">→</span>${escapeHtml(to)}`;
    if (kind === "prayer") h += ` <i>기도</i>`;
    else if (kind === "reported") h += ` <i>전달</i>`;
  }
  const extra = String(kt || "").replace(/^(속마음|기도)( · )?/, "").replace(/^전달 · /, "");
  if (extra && extra !== "속마음") h += ` <i>${escapeHtml(extra)}</i>`;
  return h + `</span>`;
}
function foldState() { rd.opened = rd.opened || {}; return rd.opened; }
function foldsClosed() {
  if (!rd || !rd.verses || !rd.verses.length || !rdOpt().flow) return 0;
  const x = xChap(rd.b, rd.c); if (!x || !x.fold) return 0;
  const op = foldState(); let n = 0;
  x.fold.forEach((f, i) => { if (!op[i]) n += f[1] - f[0] + 1; });
  return n;
}
function foldCard(f, i, again) {
  const [s, e, cat, title, lines, labs, ref, c0] = f, n = e - s + 1, cont = c0 || again;
  const ls = cont ? "" : (lines || []).map((t, k) => `<p><b>${escapeHtml((labs && labs[k]) || "")}</b>${escapeHtml(t)}</p>`).join("");
  return `<div class="rd-fold"><div class="rd-fold-top"><span class="rd-fold-cat">${escapeHtml(cat)}</span><span>${s}~${e}절</span></div>
    <b class="rd-fold-t">${escapeHtml(title)}${cont ? " (이어서)" : ""}</b>${ls ? `<div class="rd-fold-l">${ls}</div>` : ""}
    <small class="rd-fold-note">읽기를 돕는 안내예요 · 성경 본문이 아니에요</small>
    <button type="button" class="btn rd-fold-btn" data-r="fold-open" data-i="${i}">본문 펼치기 · ${n}절</button></div>`;
}
/* 본문 그리기 */
function rdChapterHtml(b, c, mz, krvVerses, lin) {
  const o = rdOpt(), x = xChap(b, c), heads = {}, done = new Set(), op = foldState();
  if (mz) (mz.h || []).forEach(h => { if (Array.isArray(h) && h[0] >= 1) heads[h[0]] = (heads[h[0]] ? heads[h[0]] + " · " : "") + h[1]; });
  const folds = (o.flow && x && x.fold) ? x.fold : [];
  const nv = mz ? mz.v.length : krvVerses.length;
  let html = "";
  for (let n = 1; n <= nv; n++) {
    const fi = folds.findIndex(f => n >= f[0] && n <= f[1]);
    if (fi >= 0) {
      if (!op[fi]) { if (n === folds[fi][0]) html += foldCard(folds[fi], fi, fi > 0 && folds[fi - 1][3] === folds[fi][3]); continue; }
      if (n === folds[fi][0]) html += `<button type="button" class="rd-fold-close" data-r="fold-close" data-i="${fi}">▲ ${escapeHtml(folds[fi][3])} · 다시 접기</button>`;
    }
    const sv = smvOf(b, c), hasS = !!(sv && sv.v && sv.v[n]), hasM = !!(x && x.vn && x.vn[n]), canTap = b <= 11 || hasM || hasS;
    const num = o.nonum ? "" : `<sup class="${canTap ? "vn-t" : ""}${hasM ? " has" : ""}${hasS ? " sm" : ""}"${canTap ? ` data-vn="${n}" role="button" tabindex="0"` : ""}>${n}</sup>`;
    if (mz) {
      const labs = {}; if (o.sp && x && x.sp && x.sp[n]) x.sp[n].forEach(l => { if (!labs[l[0]]) labs[l[0]] = l; });
      const links = o.ln && x && x.ln ? x.ln[n] : null;
      const ls = mzLines(mz.v[n - 1]).map((t, k) => {
        const sup = /^\s*〔.*〕\s*$/.test(t);
        return `${labs[k] ? spLabel(labs[k]) : ""}<span class="ln${sup ? " sup-t" : ""}${labs[k] ? " sq" : ""}">${k === 0 ? num : ""}${markLine(t, lin[n], links, done)}</span>`;
      }).join("");
      html += (heads[n] ? `<h4 class="rd-h">${escapeHtml(heads[n])}</h4>` : "") + `<p class="mz">${ls}</p>`;
    } else {
      html += `<p>${num}${linMark(escapeHtml(krvVerses[n - 1]), lin[n])}</p>`;
    }
  }
  return html;
}
function rdChapterNotes(b, c) {
  const x = xChap(b, c); if (!x) return "";
  const ids = [], seen = new Set();
  Object.keys(x.ln || {}).sort((a, z) => a - z).forEach(n => x.ln[n].forEach(l => { if (!seen.has(l[0])) { seen.add(l[0]); ids.push([l[0], l[2]]); } }));
  (x.un || []).forEach(u => { if (!seen.has(u[0])) { seen.add(u[0]); ids.push(u); } });
  if (!ids.length) return "";
  const nt = bibleNt.get(b);
  const chips = ids.map(([id, k]) => { const n = nt && nt[id]; return `<button type="button" class="nt-chip ${NK[k] ? NK[k][1] : ""}" data-nt="${escapeHtml(id)}">${escapeHtml(n ? n.t : "…")}</button>`; }).join("");
  return `<details class="rd-allnt"><summary>이 장의 해설 ${ids.length}개 · 인물·지명·원어·생활</summary><div class="nt-chips">${chips}</div></details>`;
}
function rdOptPanel() {
  const o = rdOpt(), t = (k, on, label, sub) => `<button type="button" class="rd-op${on ? " on" : ""}" data-r="op" data-k="${k}" aria-pressed="${on}"><b>${label}</b><small>${sub}</small></button>`;
  return `<div class="rd-ops">${t("sp", o.sp, "대화 이름표", "누가 누구에게 말하는지")}${t("ln", o.ln, "해설 밑줄", "인물·지명·원어·생활")}${t("col", o.col, "색으로 구분", "인물·지명·원어·생활 색")}
    ${t("flow", o.flow, "이야기 흐름", "족보·율법 접기")}${t("wide", o.wide, "줄 간격 넓게", "")}${t("nonum", o.nonum, "절 번호 숨기기", "원어 메모는 절 번호로")}
    <p class="rd-legend"><span class="k-person">인물</span><span class="k-place">지명</span><span class="k-hebrew">원어</span><span class="k-culture">생활·단위</span><span class="lg-lin">계보(빨간 밑줄)</span></p></div>`;
}
renderReader = function () {
  if (!rd) return;
  const b = rd.b, c = rd.c, done = isToday(b, c), before = bits(b)[c] === "1", body = $("rdBody"), st = body.scrollTop, o = rdOpt();
  const want = rdVer(), mz = rd.verses && rd.verses.length ? mzChapter(b, c) : null, showMz = want === "mz" && !!mz;
  if (rd.verses && rd.verses.length) rd.min = minReadSec(showMz ? mzPlain(mz) : rd.verses);
  $("rdTitle").textContent = `${BOOKS[b][0]} ${c + 1}장`;
  $("rdSub").textContent = (showMz ? "20대 말투" : "개역한글") + (rd.plan ? planReaderTag(b, c) : "") + (done ? (rdPf(b, c) ? " · 오늘 읽음 ✓" : " · 기록됨") : before ? " · 이번 통독에서 읽은 장" : "");
  const links = OTHER_VERSIONS.map(([n, u]) => `<a href="${u.replace("{U}", USFM[b]).replace("{C}", c + 1)}" target="_blank" rel="noopener">${n}</a>`).join("");
  const lin = linOf(b, c, showMz ? "mz" : "krv"), anyLin = Object.keys(lin).length > 0, x = xChap(b, c);
  body.classList.toggle("rd-col", o.col); body.classList.toggle("rd-wide", o.wide);
  let html = `<div class="rd-ver" role="group" aria-label="번역 고르기"><button type="button" data-r="v-mz" class="${want === "mz" ? "on" : ""}">20대 말투</button><button type="button" data-r="v-krv" class="${want === "krv" ? "on" : ""}">개역한글</button><button type="button" class="rd-opbtn${rd.ops ? " on" : ""}" data-r="ops" aria-expanded="${!!rd.ops}">보기</button></div>`;
  if (rd.ops) html += rdOptPanel();
  if (!rd.verses) html += `<p class="muted">말씀을 불러오는 중…</p>`;
  else if (rd.err || !rd.verses.length) html += `<p class="muted">본문을 불러오지 못했어요. 인터넷에 연결된 상태로 한 번 열면 그다음부터는 없어도 읽을 수 있어요. 아래 링크로도 읽을 수 있어요.</p>`;
  else {
    if (x && (x.t || x.g)) html += `<div class="rd-cx"><small>이 장은</small>${x.t ? `<b>${escapeHtml(x.t)}</b>` : ""}${(x.g || []).map(g => `<p>${escapeHtml(g)}</p>`).join("")}</div>`;
    { const sms = smOf(b, c), sv = smvOf(b, c), chm = sv && sv.ch || [], nv = sv && sv.v ? Object.keys(sv.v).length : 0;
      if (sms.length || chm.length || nv) html += `<div class="rd-sm">${sms.length ? `<small>이 본문으로 한 설교</small><div class="nt-chips">${smChips(sms)}</div>` : ""}${chm.length ? `<details class="nt-bl"><summary>이 장을 함께 다룬 설교 ${chm.length}곳</summary>${chm.map(m => smMentionHtml(m, true)).join("")}</details>` : ""}${nv ? `<p class="rd-note"><b class="sm-dot">●</b> 금색 절 번호 = 설교에서 다룬 말씀 (${nv}절) · 눌러 보세요</p>` : ""}</div>`; }
    if (want === "mz" && !mz) html += `<p class="rd-note">이 장은 20대 말투로 다듬는 중이에요 · 지금은 개역한글로 보여 드려요</p>`;
    if (anyLin) html += `<p class="rd-note lin-key"><u class="lin">빨간 밑줄</u> = 아담부터 예수님까지 이어지는 족보 이름</p>`;
    html += rdChapterHtml(b, c, showMz ? mz : null, rd.verses, lin);
    html += rdChapterNotes(b, c);
  }
  const closed = foldsClosed();
  html += `<div class="rd-end">
    ${closed && !done ? `<button class="btn manna" data-r="fold-all">접힌 본문 ${closed}절 펼치기 · 펼쳐 읽어야 체크돼요</button>` :
      `<button class="btn manna${done && !rdPf(b, c) ? " pend" : ""}" data-r="done" ${done ? "disabled" : ""}>${done ? (rdPf(b, c) ? "오늘 읽음으로 체크됨 ✓" : "기록됨 · 읽은 시간이 쌓이면 ✓") : "이 장 다 읽음 ✓"}</button>`}
    ${done ? `<button class="btn" data-r="undo">체크 취소</button>` : ""}
    <div class="muted">같은 장을 다른 번역으로 보기 (새 창)</div><div class="rd-vers">${links}</div></div>`;
  body.innerHTML = html; body.scrollTop = st;
  updateReaderState();
};
/* 아래에서 올라오는 창 (해설 · 원어 메모) — 닫으면 읽던 자리 그대로 */
function rdSheet(html, label) {
  let sh = $("rdSheet");
  if (!sh) {
    sh = el("div", "rd-sheet"); sh.id = "rdSheet"; sh.hidden = true;
    sh.innerHTML = `<div class="rd-sh-bg" data-r="sh-x"></div><div class="rd-sh-card" role="dialog" aria-modal="true"><div class="rd-sh-body" id="rdShBody"></div><button type="button" class="btn rd-sh-back" data-r="sh-x">← 읽던 본문으로</button></div>`;
    $("reader").appendChild(sh);
  }
  $("rdShBody").innerHTML = html; $("rdShBody").scrollTop = 0; sh.hidden = false; sh.dataset.label = label || "";
  sh.querySelector(".rd-sh-back").innerHTML = `← 읽던 본문으로${label ? `<small>${escapeHtml(label)}</small>` : ""}`;
}
function rdSheetClose() { const sh = $("rdSheet"); if (sh) sh.hidden = true; if (rd) rd.shStack = []; }
function shPush() { const sh = $("rdSheet"), bd = $("rdShBody"); if (!rd || !sh || sh.hidden || !bd) return; (rd.shStack = rd.shStack || []).push({ html: bd.innerHTML, y: bd.scrollTop, label: sh.dataset.label || "" }); }
const BACK_BTN = `<button type="button" class="btn ghost rd-sh-prev" data-r="sh-prev">← 돌아가기</button>`;
const heTerm = tm => `<span class="tm"><bdi dir="rtl" lang="he">${escapeHtml(tm[0] || "")}</bdi><small><b>${escapeHtml(tm[1] || "")}</b>${escapeHtml(tm[2] || "")}</small></span>`;
const srcList = s => (s || []).map(([t, u]) => u ? `<li><a href="${escapeHtml(u)}" target="_blank" rel="noopener">${escapeHtml(t || u)}</a></li>` : `<li>${escapeHtml(t)}</li>`).join("");
/* 해설 속 성경 주소 → 관련 구절 보기 (10-24, 스킬 원칙: 본문 → 해설 → 관련 구절 → 읽던 자리)
   - 책 이름(전체·약칭) + 장:절(-절)만 링크. 책 이름 없는 '1:20'·시간 표시는 링크로 만들지 않음. 장 수가 그 책 범위를 넘으면 링크 안 함.
   - 관련 구절은 같은 아래 창 안에서 보여 주고(읽던 본문은 그대로), '← 해설로'로 되돌아가고, 아래 버튼은 언제나 '← 읽던 본문으로'. */
const REF_AB = ["창","출","레","민","신","수","삿","룻","삼상","삼하","왕상","왕하","대상","대하","스","느","에","욥","시","잠","전","아","사","렘","애","겔","단","호","욜","암","옵","욘","미","나","합","습","학","슥","말",
  "마","막","눅","요","행","롬","고전","고후","갈","엡","빌","골","살전","살후","딤전","딤후","딛","몬","히","약","벧전","벧후","요일","요이","요삼","유","계"];
const REF_MAP = (() => { const m = {}; BOOKS.forEach((x, i) => { m[x[0]] = i; }); REF_AB.forEach((a, i) => { m[a] = i; }); m["애가"] = 24; m["시"] = 18; return m; })();
const REF_RE = new RegExp(`(^|[^가-힣A-Za-z0-9])(${Object.keys(REF_MAP).sort((a, b) => b.length - a.length).join("|")})\\s?(\\d{1,3}):(\\d{1,3})(?:\\s?[-–~]\\s?(\\d{1,3})(?!:))?`, "g");
const REF_KO = new RegExp(`(^|[^가-힣A-Za-z0-9])(${BOOKS.map(x => x[0]).concat(["애가"]).sort((a, b) => b.length - a.length).join("|")})\\s?(\\d{1,3})\\s?(?:장|편)(?:\\s?(\\d{1,3})(?:\\s?[-–~]\\s?(\\d{1,3}))?\\s?절(?:\\s?(?:부터|에서|~|-|–)\\s?(\\d{1,3})\\s?절)?)?(?![0-9])`, "g");
function refKo(s) {
  return s.replace(REF_KO, (all, pre, bk, c, v, v2a, v2b) => {
    const v2 = v2a || v2b;
    const b = REF_MAP[bk], cn = +c; if (b == null || !cn || cn > BOOKS[b][1]) return all;
    const vn = v ? +v : 1, ve = v ? (v2 ? +v2 : vn) : 999;
    if (v && (ve < vn || ve - vn > 60)) return all;
    return `${pre}<button type="button" class="vref" data-go="${b}|${cn}|${vn}|${ve}">${all.slice(pre.length)}</button>`;
  });
}
function refHtml(t) {
  return refKo(escapeHtml(t)).replace(REF_RE, (all, pre, bk, c, v, v2) => {
    const b = REF_MAP[bk], cn = +c, vn = +v, ve = v2 ? +v2 : vn;
    if (b == null || !cn || cn > BOOKS[b][1] || !vn || ve < vn || ve - vn > 40) return all;
    return `${pre}<button type="button" class="vref" data-go="${b}|${cn}|${vn}|${ve}">${all.slice(pre.length)}</button>`;
  });
}
function openRef(go) {
  const sh = $("rdSheet"), bd = $("rdShBody"); if (!sh || !bd) return;
  const [b, c, v1, v2] = go.split("|").map(Number), ref = v2 >= 999 ? `${BOOKS[b][0]} ${c}장` : `${BOOKS[b][0]} ${c}:${v1}${v2 > v1 ? "–" + v2 : ""}`;
  shPush();
  const show = ch => {
    const vs = ch && ch[c - 1] && ch[c - 1].v;
    let h = BACK_BTN + `<div class="nt-head"><span class="nt-badge">관련 구절</span><small>${escapeHtml(ref)}</small></div>`;
    if (vs && v1 <= vs.length) {
      for (let n = v1; n <= Math.min(v2, vs.length); n++) h += `<p class="rf-v"><sup>${n}</sup> ${mzLines(vs[n - 1]).map(escapeHtml).join("<br>")}</p>`;
      h += `<p class="nt-cap">우리 앱 20대 말투 본문이에요. 읽던 자리는 그대로 있어요.</p>`;
      const sv = (bibleSmv || {})[`${b + 1}:${c}`], seen = new Set(), ms = [];
      if (sv) { for (let n = v1; n <= Math.min(v2, vs.length); n++) (sv.v && sv.v[n] || []).forEach(m => { const k = m.join("#"); if (!seen.has(k)) { seen.add(k); ms.push(m); } }); (sv.ch || []).forEach(m => { const k = m.join("#"); if (!seen.has(k)) { seen.add(k); ms.push(m); } }); }
      if (ms.length) h += `<h4>설교에서 이 말씀</h4>` + ms.map(m => smMentionHtml(m, true)).join("");
    } else h += `<p class="muted">이 주소의 본문을 찾지 못했어요. 주소가 맞는지 편집자 확인이 필요해요.</p>`;
    rdSheet(h, sh.dataset.label || "");
  };
  rdSheet(`<p class="muted">관련 구절을 불러오는 중…</p>`, sh.dataset.label || "");
  Promise.all([loadMz(b), loadSm()]).then(([ch]) => show(ch), () => show(null));
}
/* 설교 카드 (10-25): 사용자가 준 설교 원고집을 요약한 카드. 그 설교가 다룬 장에 '이 본문으로 한 설교'로 보이고, 해설 카드에서도 이어 볼 수 있음. 원고 전문은 싣지 않음. */
var bibleSm = null, bibleSmv = {};
function loadSm() {
  if (bibleSm) return Promise.resolve(bibleSm);
  const j = u => fetch(`${u}?v=${X_VER}`).then(r => r.ok ? r.json() : null).catch(() => null);
  return Promise.all([j("bible/sm.json"), j("bible/smv.json")]).then(([a, v]) => { bibleSmv = v || {}; return (bibleSm = a || []); });
}
function smById(sid) { return (bibleSm || []).find(x => x.sid === sid); }
function smvOf(b, c) { return bibleSmv[`${b + 1}:${c + 1}`] || null; }
function smMentionHtml([sid, i], showTitle) {
  const s = smById(sid), m = s && s.m && s.m[i]; if (!m) return "";
  return `<div class="vm sm-m">${showTitle ? `<button type="button" class="nt-chip k-sm" data-sm="${escapeHtml(sid)}">${escapeHtml(s.title)} · ${escapeHtml(s.preacher)} 목사</button>` : ""}<p class="nt-form">${refHtml(m.ref || "")}${m.sure === false ? ` <small class="muted">· 설교에 주소 없이 나온 말씀이라, 연결은 편집자가 정했어요</small>` : ""}</p><p>${refHtml(m.how || "")}</p>${m.quote ? `<p class="sm-q">“${escapeHtml(m.quote)}”</p>` : ""}</div>`;
}
function smOf(b, c, v) { return (bibleSm || []).filter(s => (s.spans || []).some(([B, C, V1, V2]) => B === b + 1 && C === c + 1 && (v == null || (v >= V1 && v <= V2)))); }
function smChips(list) { return list.map(s => `<button type="button" class="nt-chip k-sm" data-sm="${escapeHtml(s.sid)}">${escapeHtml(s.title)} · ${escapeHtml(s.preacher)} 목사</button>`).join(""); }
function smHtml(s) {
  let h = `<div class="nt-head"><span class="nt-badge k-sm">설교</span><small>${escapeHtml(s.preacher)} 목사 · ${escapeHtml(s.place || "")}</small></div><h3>${escapeHtml(s.title)}</h3>`;
  h += `<p class="nt-cap">${(s.refs || []).map(refHtml).join(" · ")}${s.series ? ` · ${escapeHtml(s.series)}` : ""}</p>` + smtBtn(s.sid);
  if (s.core) h += `<p class="nt-brief">${refHtml(s.core)}</p>`;
  if (s.summary && s.summary.length) h += `<details class="nt-bl" open><summary>설교 흐름</summary>${s.summary.map(p => `<p>${refHtml(p)}</p>`).join("")}</details>`;
  if (s.outline && s.outline.length) h += `<details class="nt-bl"><summary>설교의 뼈대</summary><ol class="sm-ol">${s.outline.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ol></details>`;
  if (s.reading && s.reading.length) h += `<details class="nt-bl" open><summary>본문을 이렇게 읽었어요</summary>${s.reading.map(r => `<div class="vm"><p class="nt-form">${refHtml(r.ref || "")}</p><p>${refHtml(r.point || "")}</p>${r.quote ? `<p class="sm-q">“${escapeHtml(r.quote)}”</p>` : ""}</div>`).join("")}</details>`;
  if (s.apply && s.apply.length) h += `<details class="nt-bl"><summary>설교가 건네는 적용</summary>${s.apply.map(p => `<p>${refHtml(p)}</p>`).join("")}</details>`;
  if (s.m && s.m.length) h += `<details class="nt-bl"><summary>이 설교가 언급한 말씀 ${s.m.length}곳</summary>${s.m.map((_, i) => smMentionHtml([s.sid, i], false)).join("")}</details>`;
  h += smtBtn(s.sid) + `<p class="nt-cap">설교 원고집을 요약한 카드예요. 전문은 위 '설교 전문 읽기'로 볼 수 있어요.${s.pages ? ` 원고집 ${escapeHtml(String(s.pages))}쪽.` : ""}</p>`;
  return h;
}
function openSm(sid) {
  const sh = $("rdSheet"), open = sh && !sh.hidden, bd = $("rdShBody");
  const go = () => {
    const s = (bibleSm || []).find(x => x.sid === sid); if (!s) return;
    if (open && bd) shPush();
    rdSheet((open ? BACK_BTN : "") + smHtml(s), rd ? `${BOOKS[rd.b][0]} ${rd.c + 1}장` : "");
  };
  loadSm().then(go);
}
function smtBtn(sid) { return `<button type="button" class="btn manna sm-full" data-smt="${escapeHtml(sid)}">설교 전문 읽기</button>`; }
const smtCache = new Map();
function loadSmt(id) { if (smtCache.has(id)) return Promise.resolve(smtCache.get(id)); return fetch(`bible/smt/${id}.json?v=${X_VER}`).then(r => r.ok ? r.json() : null).catch(() => null).then(d => { if (d) smtCache.set(id, d); return d; }); }
function smtHtml(s, d) {
  let h = `<div class="nt-head"><span class="nt-badge k-sm">설교 전문</span><small>${escapeHtml(s.preacher)} 목사 · ${escapeHtml(s.place || "")}</small></div><h3>${escapeHtml(s.title)}</h3>`;
  const chips = ix => (ix || []).map(i => { const m = s.m && s.m[i], sp = m && m.spans && m.spans[0]; return sp ? `<button type="button" class="vref sm-mc" data-go="${sp[0] - 1}|${sp[1]}|${sp[2]}|${sp[3]}">↳ ${escapeHtml(m.ref)}</button>` : ""; }).join("");
  (d.paras || []).forEach(p => {
    const t = refHtml(p.t);
    if (p.k === "title") return;
    if (p.k === "label") h += `<p class="nt-cap">${t}</p>`;
    else if (p.k === "ref") h += `<p class="nt-form">${t}</p>`;
    else if (p.k === "h") h += `<h4>${t}</h4>`;
    else if (p.k === "q") h += `<blockquote class="sm-qb">${t}</blockquote>`;
    else if (p.k === "pre") h += `<pre class="sm-pre">${escapeHtml(p.t)}</pre>`;
    else h += `<p class="sm-p">${t}</p>`;
    if (p.m && p.m.length) h += `<div class="sm-ml">${chips(p.m)}</div>`;
  });
  if (d.rest && d.rest.length) h += `<details class="nt-bl" open><summary>이 설교가 함께 가리킨 말씀</summary>${d.rest.map(i => smMentionHtml([s.sid, i], false)).join("")}</details>`;
  h += `<p class="nt-cap">${escapeHtml(d.book || "")} — 원고 그대로 싣되, 흐름을 점검해 뽑는 과정의 오류와 뜻이 분명한 음성 인식 오타만 바로잡았어요. 두 목사님의 허락을 받아 공개해요.</p>`;
  if (d.notes) h += `<button type="button" class="btn ghost" data-smn="${escapeHtml(d.notes)}">원고집 편집 주·교정 확인사항 보기</button>`;
  return h;
}
function openSmt(sid) {
  const label = rd ? `${BOOKS[rd.b][0]} ${rd.c + 1}장` : "";
  Promise.all([loadSm(), loadSmt(sid)]).then(([, d]) => {
    const s = smById(sid);
    if (!s || !d) { rdSheet(`<p class="muted">설교 전문을 불러오지 못했어요. 인터넷에 연결된 상태로 다시 열어 주세요.</p>`, label); return; }
    shPush(); rdSheet(BACK_BTN + smtHtml(s, d), label);
  });
}
function openSmn(id) {
  const label = rd ? `${BOOKS[rd.b][0]} ${rd.c + 1}장` : "";
  loadSmt(id).then(d => { if (!d) return; shPush(); rdSheet(BACK_BTN + `<div class="nt-head"><span class="nt-badge k-sm">원고집</span><small>${escapeHtml(d.book || "")}</small></div><h3>편집 주·교정 확인사항</h3>` + d.paras.map(p => p.k === "pre" ? `<pre class="sm-pre">${escapeHtml(p.t)}</pre>` : `<p>${refHtml(p.t)}</p>`).join(""), label); });
}
function ntVerse(b, c, id) { const x = xChap(b, c); if (!x || !x.ln) return null; for (const v in x.ln) if (x.ln[v].some(l => l[0] === id)) return +v; return null; }
function noteHtml(n, from) {
  const k = NK[n.k] || ["해설", ""];
  let h = `<div class="nt-head"><span class="nt-badge ${k[1]}">${escapeHtml(n.b || k[0])}</span><small>${escapeHtml(from || n.l || "")}</small></div><h3>${escapeHtml(n.t)}</h3>`;
  if (n.s) h += `<p class="nt-brief">${refHtml(n.s)}</p>`;
  if (n.tm && n.tm.length) h += `<div class="tms">${n.tm.map(heTerm).join("")}</div>`;
  (n.bl || []).forEach((bl, i) => {
    h += `<details class="nt-bl"${i === 0 ? " open" : ""}><summary>${escapeHtml(bl.s || "더 읽기")}</summary>` + bl.it.map(it =>
      (it.h ? `<h4>${escapeHtml(it.h)}</h4>` : "") + (it.tm ? `<div class="tms">${it.tm.map(heTerm).join("")}</div>` : "") + (it.f ? `<p class="nt-form">${escapeHtml(it.f)}</p>` : "") +
      (it.p || []).map(p => `<p>${refHtml(p)}</p>`).join("") + (it.src && it.src.length ? `<p class="nt-src">${it.src.map(([t, u]) => `<a href="${escapeHtml(u)}" target="_blank" rel="noopener">${escapeHtml(t || "자료")}</a>`).join(" · ")}</p>` : "")).join("") + `</details>`;
  });
  if (rd && n.id) { const v = ntVerse(rd.b, rd.c, n.id), sms = v ? smOf(rd.b, rd.c, v) : []; if (sms.length) h += `<details class="nt-bl" open><summary>이 본문을 다룬 설교</summary><div class="nt-chips">${smChips(sms)}</div></details>`; }
  if (n.src && n.src.length) h += `<details class="nt-bl"><summary>본문과 확인 자료</summary><ul class="nt-srcs">${srcList(n.src)}</ul><p class="nt-cap">원어는 사전 표제어나 본문 형태예요. 한글은 읽기를 돕는 근사 발음이에요.</p></details>`;
  return h;
}
function openNote(id, from) {
  if (!rd) return;
  const b = rd.b, show = () => { const n = ntOf(b, id); if (n) rdSheet(noteHtml(Object.assign({ id }, n), from), from); else rdSheet(`<p class="muted">해설을 불러오지 못했어요. 인터넷에 연결된 상태로 한 번 열면 그다음부터는 없어도 볼 수 있어요.</p>`, from); };
  if (bibleNt.has(b)) show(); else { rdSheet(`<p class="muted">해설을 불러오는 중…</p>`, from); loadNt(b).then(show); }
}
function openVerse(n) {
  if (!rd) return;
  const b = rd.b, c = rd.c, ref = `${BOOKS[b][0]} ${c + 1}:${n}`;
  const show = () => {
    const x = xChap(b, c), he = bibleHe.get(b), heV = he && he[c] && he[c][n - 1];
    const ot = b <= 11;
    let h = `<div class="nt-head"><span class="nt-badge k-hebrew">${ot ? "원어로 보기" : "본문 메모"}</span><small>${escapeHtml(ref)}</small></div>`;
    if (heV) h += `<p class="he-verse" dir="rtl" lang="he">${escapeHtml(heV)}</p><p class="nt-cap">히브리어 본문: 레닌그라드 사본(WLC). 오른쪽에서 왼쪽으로 읽어요.</p>`;
    const ms = x && x.vn && x.vn[n] || [];
    if (ms.length) h += `<h4>${ot ? "원어 메모" : "사본 메모"}</h4>` + ms.map(m => `<div class="vm">${m.he || m.rd ? `<div class="tms">${heTerm([m.he, m.rd, m.m])}</div>` : (m.m ? `<p class="nt-form">${escapeHtml(m.m)}</p>` : "")}<p>${refHtml(m.t)}</p></div>`).join("") + (ot ? "" : `<p class="nt-cap">사본마다 조금씩 다른 곳을 적어 둔 메모예요. 본문의 [ ] 안 말은 가장 오래된 사본 몇몇에 없는 말인데, 지우지 않고 그대로 두었어요.</p>`);
    else if (ot) h += `<p class="muted">이 절에는 따로 단 원어 메모가 없어요.</p>`;
    const ln = x && x.ln && x.ln[n] || [];
    if (ln.length) { const nt = bibleNt.get(b); h += `<h4>이 절의 해설</h4><div class="nt-chips">${ln.map(l => `<button type="button" class="nt-chip ${NK[l[2]] ? NK[l[2]][1] : ""}" data-nt="${escapeHtml(l[0])}">${escapeHtml(nt && nt[l[0]] ? nt[l[0]].t : l[1])}</button>`).join("")}</div>`; }
    const svv = (smvOf(b, c) || {}).v, sml = svv && svv[n] || [];
    if (sml.length) h += `<h4>설교에서 이 말씀</h4>` + sml.map(m => smMentionHtml(m, true)).join("");
    rdSheet(h, ref);
  };
  if (bibleHe.has(b) && bibleNt.has(b)) show(); else { rdSheet(`<p class="muted">원어를 불러오는 중…</p>`, ref); Promise.all([loadHe(b), loadNt(b)]).then(show); }
}
/* 읽던 자리: 같은 장을 다시 열면 그 위치로 */
function rdKeepPos() { if (!rd) return; const bd = $("rdBody"); if (!bd) return; S.rdy = { b: rd.b, c: rd.c, y: Math.round(bd.scrollTop) }; }
(function () {
  const or0 = openReader;
  openReader = function (b, c, plan) {
    const r = or0(b, c, plan);
    if (rd) rd.opened = {};
    Promise.all([loadMz(b), loadLin(), loadX(b), loadNt(b), loadSm()]).then(() => {
      if (!rd || rd.b !== b || rd.c !== c) return;
      renderReader();
      const y = S.rdy && S.rdy.b === b && S.rdy.c === c ? S.rdy.y : 0, bd = $("rdBody");
      if (y && bd && rd.verses && rd.verses.length) requestAnimationFrame(() => { bd.scrollTop = y; });
    });
    return r;
  };
  const cc0 = checkCurrent;
  checkCurrent = function (manual) { if (rd && !isToday(rd.b, rd.c) && foldsClosed()) return false; return cc0(manual); };
  const sr0 = stepReader;
  stepReader = function (dir) {
    if (dir > 0 && rd && !isToday(rd.b, rd.c) && foldsClosed() && !rd.foldWarned) {
      rd.foldWarned = true; rd.warned = true;
      toast(`접힌 본문 ${foldsClosed()}절을 펼쳐 읽어야 체크돼요 · 한 번 더 누르면 체크 없이 넘어가요`); return;
    }
    return sr0(dir);
  };
  const cl0 = closeReader;
  closeReader = function () { rdKeepPos(); rdSheetClose(); return cl0(); };
  const box = $("reader");
  let ky = 0;
  $("rdBody").addEventListener("scroll", () => { clearTimeout(ky); ky = setTimeout(rdKeepPos, 300); }, { passive: true });
  const act = (t, e) => {
    while (t && t !== box) {
      const d = t.dataset || {};
      if (d.nt) { openNote(d.nt, rd ? `${BOOKS[rd.b][0]} ${rd.c + 1}장` : ""); e.stopPropagation(); return true; }
      if (d.vn) { openVerse(+d.vn); e.stopPropagation(); return true; }
      if (d.go) { openRef(d.go); e.stopPropagation(); return true; }
      if (d.sm) { openSm(d.sm); e.stopPropagation(); return true; }
      if (d.smt) { openSmt(d.smt); e.stopPropagation(); return true; }
      if (d.smn) { openSmn(d.smn); e.stopPropagation(); return true; }
      const a = d.r;
      if (a === "sh-x") { rdSheetClose(); e.stopPropagation(); return true; }
      if (a === "sh-prev") { const st = rd.shStack || [], p = st.pop(); if (p) { rdSheet(p.html, p.label); $("rdShBody").scrollTop = p.y; } e.stopPropagation(); return true; }
      if (a === "ops") { rd.ops = !rd.ops; renderReader(); return true; }
      if (a === "op") { const k = d.k, o = rdOpt(); setOpt(k, !o[k]); renderReader(); return true; }
      if (a === "fold-open") { foldState()[+d.i] = true; renderReader(); return true; }
      if (a === "fold-close") { foldState()[+d.i] = false; renderReader(); return true; }
      if (a === "fold-all") { const x = xChap(rd.b, rd.c); (x && x.fold || []).forEach((f, i) => { foldState()[i] = true; }); rd.bottom = false; renderReader(); return true; }
      if (a) return false;
      t = t.parentElement || t.parent;
    }
    return false;
  };
  box.addEventListener("click", e => { act(e.target, e); }, true);
  box.addEventListener("keydown", e => { if (e.key === "Enter" && e.target && e.target.dataset && (e.target.dataset.nt || e.target.dataset.vn)) act(e.target, e); if (e.key === "Escape") rdSheetClose(); });
})();
