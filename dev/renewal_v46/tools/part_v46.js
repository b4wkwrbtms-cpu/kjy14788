/* ===================== v46 말씀 읽기 창: 장 안내 · 대화 이름표 · 눌러 보는 해설 · 절 원어 메모 · 이야기 흐름 접기 · 읽던 자리 =====================
   사용자(10-17): 다른 팀 '말씀 리뉴얼' 독서판의 좋은 기능은 다 넣되 앱에 맞게. 본문은 우리 v45 20대 말투 유지 + 원어·의미 교정만 반영.
   ① bible/x/NN.json (창세기~열왕기하): 장마다 { t 제목, g 안내, sp {절: [[줄, 말하는 이, 듣는 이, 종류, 표시]]}, ln {절: [[해설id, 낱말, 종류]]},
      un [[해설id, 종류]] (본문 낱말에 안 걸린 해설), vn {절: [{he, rd, m, t}]} 원어 메모, fold [[시작, 끝, 분야, 제목, 안내3줄, 이름표3, 범위, 이어짐]] }
   ② bible/nt/NN.json: 그 권의 해설 카드 { id: { k 종류, b 배지, l 위치, t 제목, s 요약, tm [[히브리어, 발음, 뜻]], bl [{s, it:[{h,p,tm,f,src}]}], src } }
   ③ bible/he/NN.json: 히브리어 본문 (절 번호를 눌렀을 때만 불러옴)
   ④ 보기 설정 S.rdo { sp 이름표, ln 해설 밑줄, col 색 구분, flow 이야기 흐름(족보·율법 접기), wide 줄 간격, nonum 절 번호 숨김 }
   ⑤ 이야기 흐름에서 접힌 본문은 펼쳐 읽어야 '읽음'으로 체크됨(그쪽 원칙: 접은 곳을 읽은 것으로 치지 않음). */
var X_VER = "46e";
const XB = new Set(/*XB*/[]);   // 1~12권 밖에서 x 파일(신약 사본 차이 메모)이 있는 권 (0부터)
var bibleX = new Map(), bibleNt = new Map(), bibleHe = new Map();
const NK = { person: ["인물", "k-person"], place: ["지명", "k-place"], hebrew: ["원어", "k-hebrew"], culture: ["생활·단위", "k-culture"] };
function rdOpt() { const o = S.rdo || {}; return { sp: o.sp !== false, ln: o.ln !== false, col: !!o.col, flow: !!o.flow, wide: !!o.wide, nonum: !!o.nonum }; }
function setOpt(k, v) { S.rdo = S.rdo || {}; S.rdo[k] = v; save(); }
function xFetch(dir, b, map) {
  if (b > 11 && !(dir === "x" && XB.has(b))) return Promise.resolve(null);
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
    const hasM = !!(x && x.vn && x.vn[n]), canTap = b <= 11 || hasM;
    const num = o.nonum ? "" : `<sup class="${canTap ? "vn-t" : ""}${hasM ? " has" : ""}"${canTap ? ` data-vn="${n}" role="button" tabindex="0"` : ""}>${n}</sup>`;
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
  $("rdShBody").innerHTML = html; $("rdShBody").scrollTop = 0; sh.hidden = false;
  sh.querySelector(".rd-sh-back").innerHTML = `← 읽던 본문으로${label ? `<small>${escapeHtml(label)}</small>` : ""}`;
}
function rdSheetClose() { const sh = $("rdSheet"); if (sh) sh.hidden = true; }
const heTerm = tm => `<span class="tm"><bdi dir="rtl" lang="he">${escapeHtml(tm[0] || "")}</bdi><small><b>${escapeHtml(tm[1] || "")}</b>${escapeHtml(tm[2] || "")}</small></span>`;
const srcList = s => (s || []).map(([t, u]) => u ? `<li><a href="${escapeHtml(u)}" target="_blank" rel="noopener">${escapeHtml(t || u)}</a></li>` : `<li>${escapeHtml(t)}</li>`).join("");
function noteHtml(n, from) {
  const k = NK[n.k] || ["해설", ""];
  let h = `<div class="nt-head"><span class="nt-badge ${k[1]}">${escapeHtml(n.b || k[0])}</span><small>${escapeHtml(from || n.l || "")}</small></div><h3>${escapeHtml(n.t)}</h3>`;
  if (n.s) h += `<p class="nt-brief">${escapeHtml(n.s)}</p>`;
  if (n.tm && n.tm.length) h += `<div class="tms">${n.tm.map(heTerm).join("")}</div>`;
  (n.bl || []).forEach((bl, i) => {
    h += `<details class="nt-bl"${i === 0 ? " open" : ""}><summary>${escapeHtml(bl.s || "더 읽기")}</summary>` + bl.it.map(it =>
      (it.h ? `<h4>${escapeHtml(it.h)}</h4>` : "") + (it.tm ? `<div class="tms">${it.tm.map(heTerm).join("")}</div>` : "") + (it.f ? `<p class="nt-form">${escapeHtml(it.f)}</p>` : "") +
      (it.p || []).map(p => `<p>${escapeHtml(p)}</p>`).join("") + (it.src && it.src.length ? `<p class="nt-src">${it.src.map(([t, u]) => `<a href="${escapeHtml(u)}" target="_blank" rel="noopener">${escapeHtml(t || "자료")}</a>`).join(" · ")}</p>` : "")).join("") + `</details>`;
  });
  if (n.src && n.src.length) h += `<details class="nt-bl"><summary>본문과 확인 자료</summary><ul class="nt-srcs">${srcList(n.src)}</ul><p class="nt-cap">원어는 사전 표제어나 본문 형태예요. 한글은 읽기를 돕는 근사 발음이에요.</p></details>`;
  return h;
}
function openNote(id, from) {
  if (!rd) return;
  const b = rd.b, show = () => { const n = ntOf(b, id); if (n) rdSheet(noteHtml(n, from), from); else rdSheet(`<p class="muted">해설을 불러오지 못했어요. 인터넷에 연결된 상태로 한 번 열면 그다음부터는 없어도 볼 수 있어요.</p>`, from); };
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
    if (ms.length) h += `<h4>${ot ? "원어 메모" : "사본 메모"}</h4>` + ms.map(m => `<div class="vm">${m.he || m.rd ? `<div class="tms">${heTerm([m.he, m.rd, m.m])}</div>` : (m.m ? `<p class="nt-form">${escapeHtml(m.m)}</p>` : "")}<p>${escapeHtml(m.t)}</p></div>`).join("") + (ot ? "" : `<p class="nt-cap">사본마다 조금씩 다른 곳을 적어 둔 메모예요. 본문의 [ ] 안 말은 가장 오래된 사본 몇몇에 없는 말인데, 지우지 않고 그대로 두었어요.</p>`);
    else h += `<p class="muted">이 절에는 따로 단 원어 메모가 없어요.</p>`;
    const ln = x && x.ln && x.ln[n] || [];
    if (ln.length) { const nt = bibleNt.get(b); h += `<h4>이 절의 해설</h4><div class="nt-chips">${ln.map(l => `<button type="button" class="nt-chip ${NK[l[2]] ? NK[l[2]][1] : ""}" data-nt="${escapeHtml(l[0])}">${escapeHtml(nt && nt[l[0]] ? nt[l[0]].t : l[1])}</button>`).join("")}</div>`; }
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
    Promise.all([loadMz(b), loadLin(), loadX(b), loadNt(b)]).then(() => {
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
      const a = d.r;
      if (a === "sh-x") { rdSheetClose(); e.stopPropagation(); return true; }
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
