/* ================= v50: 팀 켈러 설교 원고 몰입 읽기 =================
   사용자의 개인 학습용 교정번역본 36편(1묶음 19편 · ver2 17편). 공개 허락이 없어 저장소·사이트에는 원고가 없고,
   사용자가 폰에서 '켈러 읽기 팩'(keller_pack.json)을 한 번 고르면 이 폰(IndexedDB)에만 저장해 읽음.
   사용자 결정(11-14): 켈러의 낱말·문장은 한 글자도 바꾸지 않음(모양만) + 편집자 덧붙임은 다 넣되 끌 수 있게.
   읽기 기술(지금까지 만든 것 전부): 설교 전문 창(Aa·글꼴·바탕·줄 간격·읽던 자리·남은 분·광산 보상·효과음 끄기·읽기 음악) +
   웹소설체 기준서(모바일 문단 2~3문장 · 강조 한 줄 · 끌리는 소제목) + 몰입 연구 카드(질문으로 열고 닫기 · 장 끝 한 줄 여운 ·
   다음 장 미리보기) + 설교 스킬 팀켈러 ver2(설교 지도: 받아들임→요구→은혜, 해부 카드) + 성경 주소 링크(← 돌아가기) + 주석 바로 보기 */
var kel = { ready: false, list: [], by: {}, busy: false, msg: "", openId: "" };
function kelDb() { return new Promise((res, rej) => { const r = indexedDB.open("kjy_keller", 1); r.onupgradeneeded = () => r.result.createObjectStore("pack"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function kelDbDo(mode, fn) { const db = await kelDb(); return new Promise((res, rej) => { const q = fn(db.transaction("pack", mode).objectStore("pack")); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
const KEL_COL = { 1: "팀 켈러 설교 원고 1 · 19편", 2: "팀 켈러 설교 원고 2 · ver2 17편" };
function kelOvOn() { return S.kelOv !== false; }
function kelLoad(pack) {
  if (!pack || pack.kind !== "keller-pack" || !Array.isArray(pack.sermons)) return false;
  kel.list = pack.sermons; kel.by = {};
  kel.list.forEach(s => {
    kel.by[s.id] = s;
    if (s.ref && (!/\d/.test(s.ref) || s.ref === s.sub)) s.ref = "";
    s.sid = s.id; s.preacher = "팀 켈러"; s.place = KEL_COL[s.col] || ""; s.refs = s.ref ? [s.ref] : [];
    const go = [...refHtml(s.ref || "").matchAll(/data-go="(\d+)\|(\d+)\|(\d+)\|(\d+)"/g)].map(m => [+m[1] + 1, +m[2], +m[3], +m[4]]);
    s.spans = go; s.len = (s.secs || []).reduce((n, x) => n + (x.b || []).reduce((k, b) => k + (b.t || "").length, 0), 0);
  });
  kel.ready = kel.list.length > 0; return kel.ready;
}
function kelIs(sid) { return typeof sid === "string" && /^k[12]-\d\d$/.test(sid) && !!kel.by[sid]; }

/* ---------- 모양만 바꾸기: 긴 문단을 2~3문장 덩어리로 (따옴표 안에서는 자르지 않음) ---------- */
function kelSentences(t) {
  const out = []; let depth = 0, st = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "“" || c === "‘" || c === "「" || c === "『" || c === "(") depth++;
    else if ((c === "”" || c === "’" || c === "」" || c === "』" || c === ")") && depth > 0) depth--;
    if (depth === 0 && (c === "." || c === "?" || c === "!" || c === "…")) {
      if (c === "." && i > 0 && /[A-Za-z0-9]/.test(t[i - 1]) && (i < 2 || !/[A-Za-z0-9]/.test(t[i - 2]))) continue;   // J. I. 패커 · 1. 같은 머리글자
      let j = i + 1; while (j < t.length && /[”’」』)\].?!…]/.test(t[j])) j++;
      const mk = /^\[(주\s?\d+|자료[^\]]{0,20})\]/.exec(t.slice(j)); if (mk) j += mk[0].length;
      if (j >= t.length || t[j] === " ") { out.push(t.slice(st, j)); st = j + 1; i = j; }
    }
  }
  if (st < t.length) out.push(t.slice(st));
  return out.map(x => x.trim()).filter(Boolean);
}
function kelDep(prev, s) {   // s가 앞 문장에 기대면 true → 같은 덩어리
  if (s.length < 28) return true;
  if (/^(그렇지요|그렇죠|맞습니다|아닙니다|네[,.]|예[,.]|왜냐하면|그러니까요|즉|곧|다시 말해|바로|그것은|그것이|이것은|이것이|그래서요)/.test(s)) return true;
  if (/(때문입니다|때문이지요|때문이에요|때문이다)[.”’」』)]*$/.test(s)) return true;
  if (/^[“‘「『]/.test(s) && /(말합니다|말했습니다|물었습니다|묻습니다|이렇습니다|이렇게|같습니다|합니다)[.:]?\s*$/.test(prev)) return true;
  if (/[:：]$/.test(prev) || /(이렇습니다|다음과 같습니다|이렇게 말합니다|이렇게 물었습니다|이렇게 말했습니다)\.$/.test(prev)) return true;
  if (/^(둘째|셋째|넷째|다섯째|그다음|마지막으로)/.test(s) && /^(첫째|둘째|셋째|넷째)/.test(prev)) return false;
  return false;
}
function kelChunks(t, join) {
  return [t];   // 11-14 검사 결과: 원고 문단(최대 437자)은 번역 때 이미 읽기 좋게 나뉘어 있고, 더 자르면 켈러의 말 흐름이 끊김 → 원고 문단 그대로
  if (t.length < 300) return [t];
  const ss = kelSentences(t), out = []; let cur = [], len = 0;
  ss.forEach(s => {
    const prev = cur.length ? cur[cur.length - 1] : "";
    if (cur.length && !kelDep(prev, s) && (len >= 140 && (len + s.length > 260 || cur.length >= 3))) { out.push(cur.join(" ")); cur = []; len = 0; }
    cur.push(s); len += s.length;
  });
  if (cur.length) { if (out.length && len < 90) out[out.length - 1] += " " + cur.join(" "); else out.push(cur.join(" ")); }
  if (join && join.length) for (let i = out.length - 1; i > 0; i--) if (join.some(j => j && out[i].startsWith(j))) { out[i - 1] += " " + out[i]; out.splice(i, 1); }
  return out;
}
/* 글자 → 화면: 성경 주소 링크 + 주석 표시(누르면 그 자리에서 펼침) + 자료 표시는 작게 */
function kelInline(t, sid) {
  return refHtml(t).replace(/\[주\s?(\d+)\]/g, (a, n) => `<button type="button" class="kl-fn" data-kn="${sid}|${n}" aria-label="주석 ${n}">주${n}</button>`)
    .replace(/\[자료[^\]]{0,20}\]/g, m => `<span class="kl-src">${m}</span>`);
}
function kelParaHtml(t, sid, em, k, join) {
  const cls = k === "q" ? "kl-q" : "sm-p";
  const pieces = [];
  (k === "q" ? [t] : kelChunks(t, join)).forEach(ch => {   // 봉독·인용 상자는 나누지 않음
    let rest = ch; const hits = (em || []).filter(e => e && rest.includes(e));
    if (!hits.length) { pieces.push([cls, rest]); return; }
    hits.sort((a, b) => rest.indexOf(a) - rest.indexOf(b));
    const BIT = /^[\s“”‘’"'「」『』()\[\].,!?…·]*(\[(주\s?\d+|자료[^\]]{0,20})\][\s”’」』).,!?]*)?$/;   // 따옴표·문장부호·주석 표시만 남는 조각
    hits.forEach(e => {
      const i = rest.indexOf(e); if (i < 0) return;
      let pre = rest.slice(0, i).trim(), em = e; rest = rest.slice(i + e.length).trim();
      if (pre && BIT.test(pre)) { em = pre + em; pre = ""; } else if (pre && /[“‘「『]$/.test(pre)) { em = pre.slice(-1) + em; pre = pre.slice(0, -1).trim(); }
      const tail = /^[”’」』)\].,!?…]*(\[(주\s?\d+|자료[^\]]{0,20})\])?[”’」』).,!?]*/.exec(rest); if (tail && tail[0]) { em += tail[0]; rest = rest.slice(tail[0].length).trim(); }
      if (rest && BIT.test(rest)) { em += rest; rest = ""; }
      if (pre) pieces.push([cls, pre]); pieces.push(["kl-em", em]);
    });
    if (rest) pieces.push([cls, rest]);
  });
  if (k === "q") return `<blockquote class="sm-qb">${pieces.map(([c, x]) => `<p>${kelInline(x, sid)}</p>`).join("")}</blockquote>`;
  return pieces.map(([c, x]) => `<p class="${c}">${kelInline(x, sid)}</p>`).join("");
}
function kelH(h, i) { return /^\s*(\d+|Q\d+)[.)]/.test(h || "") ? h : `${i + 1}. ${h || ""}`; }
function kelHtml(s) {
  const ov = kelOvOn() ? (s.ov || null) : null, secs = s.secs || [], N = secs.length, min = Math.max(1, Math.round(s.len / 500));
  const stages = ov && ov.stages && ov.stages.length ? ov.stages : null, D = (S.smDone || {})[s.id];
  let h = `<div class="nt-head"><span class="nt-badge k-sm">팀 켈러</span><small>${escapeHtml(KEL_COL[s.col] || "")} · ${s.no}편</small></div>`;
  h += `<h3 class="sm-t">${escapeHtml(s.title)}</h3>${s.sub ? `<p class="kl-sub">${escapeHtml(s.sub)}</p>` : ""}${s.en ? `<p class="kl-en">${escapeHtml(s.en)}</p>` : ""}`;
  h += `<p class="sm-meta">${s.ref ? refHtml(s.ref) + " · " : ""}약 ${min}분 · 소제목 ${N}개 · 끝까지 읽으면 광석을 받아요${D ? ` · ✓ ${D.n}번 읽음` : ""}</p>`;
  h += `<div class="kl-tools"><button type="button" class="kl-tb" data-ktoc="1">차례</button><button type="button" class="kl-tb${ov ? " on" : ""}" data-kov="1">편집자 길잡이 ${ov ? "켜짐" : "꺼짐"}</button>${s.ov && s.ov.anatomy ? `<button type="button" class="kl-tb" data-kjump="anat">설교 해부</button>` : ""}</div>`;
  h += `<ol class="kl-toc" hidden>${secs.map((x, i) => `<li><button type="button" data-kjump="${i}"><b>${escapeHtml(x.h || "시작")}</b>${ov && ov.secs && ov.secs[i] && ov.secs[i].hook ? `<small>${escapeHtml(ov.secs[i].hook)}</small>` : ""}</button></li>`).join("")}</ol>`;
  if (stages) h += `<div class="kl-map" role="navigation" aria-label="설교 지도">${stages.map((st, i) => `<button type="button" data-kstage="${i}"><i></i>${escapeHtml(st)}</button>`).join("")}</div>`;
  if (ov && ov.open) h += `<div class="kl-open"><span class="kl-ed">편집자</span><p>${escapeHtml(ov.open)}</p></div>`;
  secs.forEach((x, i) => {
    const o = ov && ov.secs && ov.secs[i] || null;
    h += `<section class="kl-sec" id="kls-${i}" data-ki="${i}" data-kst="${o && o.stage != null ? o.stage : ""}">`;
    if (x.h) h += `<div class="kl-sh"><span class="kl-n">${i + 1}/${N}${stages && o && stages[o.stage] ? ` · ${escapeHtml(stages[o.stage])}` : ""}</span><h4>${escapeHtml(x.h)}</h4></div>`;
    if (o && o.hook && !o.rest) h += `<p class="kl-hook">${escapeHtml(o.hook)}</p>`;
    (x.b || []).forEach(b => {
      const t = b.t || "";
      if (b.k === "h2") h += `<h5 class="kl-h2">${escapeHtml(t)}</h5>`;
      else if (b.k === "sp") h += `<p class="kl-sp">${escapeHtml(t)}</p>`;
      else if (b.k === "qq") h += `<p class="kl-qq">${kelInline(t, s.id)}</p>`;
      else if (b.k === "em") h += `<p class="kl-em kl-em0">${kelInline(t, s.id)}</p>`;
      else if (b.k === "note") h += `<p class="kl-note">${kelInline(t, s.id)}</p>`;
      else if (b.k === "li") h += `<p class="sm-p kl-li">${kelInline(t, s.id)}</p>`;
      else { if (b.sp) h += `<p class="kl-sp">${escapeHtml(b.sp)}</p>`; h += kelParaHtml(t, s.id, o && o.em, b.k, s.ov && s.ov.join); }
    });
    if (o && o.key && !o.rest) h += `<p class="kl-key"><span>이 장의 한 줄</span>${kelInline(o.key, s.id)}</p>`;
    if (i < N - 1 && secs[i + 1].h) h += `<button type="button" class="kl-next" data-kjump="${i + 1}"><small>다음</small>${escapeHtml(secs[i + 1].h)}</button>`;
    h += `</section>`;
  });
  if (ov && ov.one) h += `<div class="kl-one"><span class="kl-ed">다 읽었다면, 한 문장으로</span><p>${escapeHtml(ov.one)}</p></div>`;
  const A = s.ov && s.ov.anatomy;
  if (A) {
    const q = (o, lab) => o && (o.quote || o.how) ? `<div class="vm"><p class="nt-form">${lab}${o.sec != null && secs[o.sec] ? ` · <button type="button" class="kl-lnk" data-kjump="${o.sec}">${escapeHtml(kelH(secs[o.sec].h, o.sec))}</button>` : ""}</p>${o.quote ? `<p class="sm-q">“${escapeHtml(o.quote)}”</p>` : ""}${o.how ? `<p>${escapeHtml(o.how)}</p>` : ""}</div>` : "";
    h += `<details class="nt-bl kl-anat" id="kl-anat" open><summary>설교 해부 · 켈러는 이 설교를 이렇게 만들었어요</summary>`;
    if (A.flow) h += `<p class="nt-brief">${escapeHtml(A.flow).replace(/\n/g, "<br>")}</p>`;
    h += q(A.christ, "그리스도에 도착하는 곳") + q(A.mirror, "나를 보게 하는 거울");
    if (A.image && (A.image.plant || A.image.harvest)) h += q(A.image.plant, "심은 이미지") + q(A.image.harvest, "거둔 곳") + (A.image.how ? `<p class="nt-cap">${escapeHtml(A.image.how)}</p>` : "");
    if (A.ending) h += `<div class="vm"><p class="nt-form">결말</p><p>${escapeHtml(A.ending)}</p></div>`;
    if (A.moves && A.moves.length) h += `<h4>켈러가 쓴 기법 ${A.moves.length}가지</h4>` + A.moves.map(m => q({ sec: m.sec, quote: m.quote, how: m.why }, escapeHtml(m.name || ""))).join("");
    if (A.watch && A.watch.length) h += `<h4>읽을 때 조심할 점</h4>` + A.watch.map(w => `<p>· ${escapeHtml(w)}</p>`).join("");
    h += `<p class="nt-cap">해부는 사용자의 설교 스킬(팀켈러 ver2)과 몰입 연구를 기준으로 편집자가 정리했어요. 인용은 원고 그대로예요.</p></details>`;
  }
  const notes = Object.keys(s.notes || {}).sort((a, b) => a - b);
  if (notes.length) h += `<details class="nt-bl"><summary>주석 ${notes.length}개</summary>${notes.map(n => `<div class="vm" id="kln-${n}"><p class="nt-form">주${n}${s.notes[n].h ? ` · ${escapeHtml(s.notes[n].h)}` : ""}</p><p>${kelInline(s.notes[n].t || "", s.id)}</p></div>`).join("")}</details>`;
  if (s.guide && s.guide.length) h += `<details class="nt-bl"><summary>원고 읽기 안내</summary>${s.guide.map(p => `<p>${kelInline(p, s.id)}</p>`).join("")}</details>`;
  if (s.appx && s.appx.length) h += `<details class="nt-bl"><summary>교정 기록·확인한 자료</summary>${s.appx.map(a => `<h4>${escapeHtml(a.h || "")}</h4>` + (a.b || []).map(b => b.k === "h2" ? `<h5 class="kl-h2">${escapeHtml(b.t)}</h5>` : `<p>${kelInline(b.t, s.id)}</p>`).join("")).join("")}</details>`;
  h += `<p class="nt-cap">개인 학습용 비공식 교정번역본이에요. 켈러의 낱말·문장은 원고 그대로이고, 문단 나눔과 편집자 길잡이(색 글씨)만 더했어요. 이 원고는 이 폰에만 저장돼 있어요.</p>`;
  return h;
}
function kelOpen(sid, keepPos) {
  const s = kel.by[sid]; if (!s) return;
  const go = () => {
    const was = $("rdSheet") && !$("rdSheet").hidden;
    const keep = typeof keepPos === "number";
    if (was && !keep) shPush();
    const label = rd ? `${BOOKS[rd.b][0]} ${rd.c + 1}장` : "";
    rdSheet((was && !keep ? BACK_BTN : "") + `<div data-smread="${escapeHtml(sid)}" data-title="${escapeHtml(s.title)}" data-len="${s.len}" class="kl-root">` + kelHtml(s) + `</div>`, label);
    kel.openId = sid; smReadStart(s);
    const pos = S.smPos && S.smPos[sid], bd = $("rdShBody");
    if (keep) bd.scrollTop = keepPos;
    else if (pos > 400 && bd.scrollHeight - pos > bd.clientHeight) { bd.scrollTop = pos; toast("읽던 자리로 이어서 읽어요"); }
    kelOnScroll();
  };
  if (!rd || $("reader").hidden) { const sp = s.spans && s.spans[0], p = S.bible && S.bible.pos; if (sp) openReader(sp[0] - 1, sp[1] - 1); else openReader(p ? p.b : 0, p ? p.c : 0); setTimeout(go, 60); }
  else go();
}
/* 설교 지도: 지금 읽는 소제목의 단계를 밝힘 */
var kelScT = 0;
function kelOnScroll() {
  const bd = $("rdShBody"); if (!bd) return; const root = bd.querySelector(".kl-root"); if (!root) return;
  const now = Date.now(); if (now - kelScT < 120) return; kelScT = now;
  const top = bd.getBoundingClientRect().top + 90; let cur = null;
  root.querySelectorAll(".kl-sec").forEach(sec => { if (sec.getBoundingClientRect().top <= top) cur = sec; });
  const st = cur ? cur.dataset.kst : "", i = cur ? +cur.dataset.ki : -1;
  root.querySelectorAll(".kl-map button").forEach(b => { const k = +b.dataset.kstage; b.classList.toggle("on", st !== "" && k === +st); b.classList.toggle("past", st !== "" && k < +st); });
  const tt = $("rdShTt"); if (tt && cur) { const h = cur.querySelector("h4"); if (h) tt.textContent = kelH(h.textContent, i); }
}
function kelJump(to) {
  const bd = $("rdShBody"); if (!bd) return;
  const t = to === "anat" ? $("kl-anat") : $("kls-" + to); if (!t) return;
  bd.scrollTo({ top: Math.max(0, bd.scrollTop + t.getBoundingClientRect().top - bd.getBoundingClientRect().top - 54), behavior: (typeof reduceMotion !== "undefined" && reduceMotion) ? "auto" : "smooth" });
}
function kelNote(btn) {
  const [sid, n] = btn.dataset.kn.split("|"), s = kel.by[sid], nt = s && s.notes && s.notes[n];
  const p = btn.closest("p, blockquote"); if (!p) return;
  const nx = p.nextElementSibling;
  if (nx && nx.classList.contains("kl-fnt") && nx.dataset.n === n) { nx.remove(); return; }
  const box = document.createElement("div"); box.className = "kl-fnt"; box.dataset.n = n;
  box.innerHTML = nt ? `<b>주${escapeHtml(n)}${nt.h ? ` · ${escapeHtml(nt.h)}` : ""}</b><p>${kelInline(nt.t || "", sid)}</p>` : `<p class="muted">주${escapeHtml(n)}의 설명은 원고 뒤 교정 기록에 있어요.</p>`;
  p.after(box);
}
/* ---------- 불러오기 ---------- */
async function kelImport(file) {
  if (kel.busy || !file) return; kel.busy = true; kel.msg = "읽는 중…"; try { updateUI(true); } catch (e) {}
  try {
    let txt;
    if (/\.gz$/i.test(file.name) && typeof DecompressionStream === "function") txt = await new Response(file.stream().pipeThrough(new DecompressionStream("gzip"))).text();
    else txt = await file.text();
    const pack = JSON.parse(txt);
    if (!kelLoad(pack)) throw new Error("켈러 읽기 팩이 아니에요 (keller_pack.json을 골라 주세요)");
    let kept = true; try { await kelDbDo("readwrite", st => st.put(pack, "main")); } catch (e) { kept = false; }
    kel.msg = ""; toast(kept ? `켈러 설교 ${kel.list.length}편을 불러왔어요` : "불러왔지만 폰에 저장하지 못했어요 (다시 열면 한 번 더 골라야 해요)");
  } catch (e) { kel.msg = "불러오지 못했어요: " + ((e && e.message) || e); }
  kel.busy = false; try { updateUI(true); } catch (e) {}
}
function kelListHtml() {
  const D = S.smDone || {};
  if (!kel.ready) return `<div class="kl-imp"><div class="sec-title" style="margin:14px 0 6px">팀 켈러 설교 원고 <small>36편 · 이 폰에서만</small></div><p class="muted">${escapeHtml(kel.msg || "받은 '켈러 읽기 팩'(keller_pack.json)을 한 번 고르면 이 폰에만 저장돼서 바로 읽을 수 있어요. 원고는 어디에도 올라가지 않아요.")}</p><label class="btn primary kl-pick">켈러 읽기 팩 고르기<input type="file" id="kelFile" accept=".json,.gz,application/json" hidden></label></div>`;
  let h = "";
  [1, 2].forEach(c => {
    const L = kel.list.filter(s => s.col === c); if (!L.length) return;
    h += `<div class="sec-title" style="margin:14px 0 6px">${escapeHtml(KEL_COL[c])} <small>읽음 ${L.filter(s => D[s.id]).length}</small></div>`;
    h += L.map(s => `<button type="button" class="sm-li${D[s.id] ? " done" : ""}" data-smopen="${s.id}"><b>${s.no}. ${escapeHtml(s.title)}</b><small>${s.ov && s.ov.open && kelOvOn() ? escapeHtml(s.ov.open) : escapeHtml(s.ref || s.en || "")}${D[s.id] ? ` · ✓ ${D[s.id].n}번 읽음` : ""}</small></button>`).join("");
  });
  h += `<p class="nt-cap" style="margin-top:8px">켈러 원고는 이 폰에만 저장돼 있어요. <button type="button" class="kl-lnk" data-kdel="1">이 폰에서 지우기</button></p>`;
  return h;
}

/* ---------- 이어 붙이기 ---------- */
(function () {
  const list0 = smListHtml;
  smListHtml = function () { return list0.apply(this, arguments) + kelListHtml(); };
  /* 설교 탭 카드가 이미 만들어졌을 수 있어 문서 전체에서 받음 */
  document.addEventListener("change", e => { const t = e.target; if (t && t.id === "kelFile" && t.files && t.files[0]) { kelImport(t.files[0]); try { t.value = ""; } catch (er) {} } });
  document.addEventListener("click", async e => { const b = e.target && e.target.closest && e.target.closest("[data-kdel]"); if (!b) return; try { await kelDbDo("readwrite", st => st.delete("main")); } catch (er) {} kel.ready = false; kel.list = []; kel.by = {}; toast("켈러 원고를 이 폰에서 지웠어요"); try { updateUI(true); } catch (er) {} });
  const tab0 = smOpenFromTab;
  smOpenFromTab = function (sid) { if (kelIs(sid)) return kelOpen(sid); return tab0.apply(this, arguments); };
  const osm0 = openSm;
  openSm = function (sid) { if (kelIs(sid)) return kelOpen(sid); return osm0.apply(this, arguments); };
  const of0 = smOf;
  smOf = function (b, c, v) { const r = of0.apply(this, arguments); if (!kel.ready) return r; return r.concat(kel.list.filter(s => (s.spans || []).some(([B, C, V1, V2]) => B === b + 1 && C === c + 1 && (v == null || (v >= V1 && v <= V2))))); };
  const sc0 = shOnScroll;
  shOnScroll = function () { const r = sc0.apply(this, arguments); try { kelOnScroll(); } catch (e) {} return r; };
  document.addEventListener("click", e => {
    const t = e.target; if (!t || !t.closest) return;
    const fn = t.closest("[data-kn]"); if (fn) { e.preventDefault(); kelNote(fn); return; }
    const j = t.closest("[data-kjump]"); if (j) { e.preventDefault(); const toc = document.querySelector(".kl-toc"); if (toc && !toc.hidden && j.closest(".kl-toc")) toc.hidden = true; kelJump(j.dataset.kjump); return; }
    const sg = t.closest("[data-kstage]"); if (sg) { const sec = document.querySelector(`.kl-sec[data-kst="${sg.dataset.kstage}"]`); if (sec) kelJump(sec.dataset.ki); return; }
    if (t.closest("[data-ktoc]")) { const toc = document.querySelector(".kl-toc"); if (toc) toc.hidden = !toc.hidden; return; }
    if (t.closest("[data-kov]")) { S.kelOv = !kelOvOn(); save(); const bd = $("rdShBody"); if (kel.openId) kelOpen(kel.openId, bd ? bd.scrollTop : 0); return; }
  }, true);
  /* 목록 갱신: 켈러 상태가 바뀌면 설교 탭 목록을 다시 그림 */
  setInterval(() => { const L = $("smList"); if (!L || !L.isConnected) return; const k = (kel.ready ? kel.list.length : 0) + "|" + kel.msg + "|" + kel.busy; if (L.dataset.kk !== k) { L.dataset.kk = k; if (bibleSm) L.innerHTML = smListHtml(); } }, 700);
  (async () => { try { const p = await kelDbDo("readonly", st => st.get("main")); if (p) kelLoad(p); } catch (e) {} })();
})();
