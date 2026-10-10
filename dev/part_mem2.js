const STAGE_TEST = ["장절 보고 쓰기 (초성 힌트)", "장절 보고 쓰기", "첫 소절 보고 장절·본문 쓰기", "핵심어 보고 장절·본문 쓰기", "장절 보고 쓰기", "핵심어 보고 장절·본문 쓰기", "장절 보고 쓰기", "핵심어 보고 장절·본문 쓰기"];
const testOf = s => s <= 0 ? "refHint" : s === 1 ? "ref" : s === 2 ? "first" : s % 2 === 1 ? "keys" : "ref";
function parseRef(ref) { const m = ref.match(/^(\S+) (\d+):(\d+)/); return m ? { book: m[1], ch: +m[2], vs: +m[3] } : { book: ref, ch: 0, vs: 0 }; }
function firstPart(v) { const ch = v.text.split(" / "); if (ch.length > 1) return ch[0]; const w = v.text.split(" "); return w.slice(0, Math.max(2, Math.ceil(w.length / 3))).join(" "); }
function maskText(v, level) {
  if (level <= 0) return keyHtml(v);
  const words = v.text.split(" ");
  if (level === 1) { let h = escapeHtml(v.text); v.keys.forEach(k => { h = h.split(escapeHtml(k)).join(`<span class="blank">${"＿".repeat(Math.min(8, k.length))}</span>`); }); return h.replace(/ \/ /g, ' <span class="sl">/</span> '); }
  return words.map(w => w === "/" ? '<span class="sl">/</span>' : level === 2 ? escapeHtml(w[0]) + '<span class="blank">' + "＿".repeat(Math.max(1, Math.min(4, w.length - 1))) + "</span>" : '<span class="blank">' + "＿".repeat(Math.min(5, w.length)) + "</span>").join(" ");
}
function missHtml(v, input) {
  const ni = normV(input);
  return v.text.split(" ").map(w => w === "/" ? '<span class="sl">/</span>' : ni.includes(normV(w)) || !normV(w) ? escapeHtml(w) : `<span class="miss">${escapeHtml(w)}</span>`).join(" ");
}
function memSetupTest() {
  memSess.kind = testOf(memSess.stage);
  memSess.needRef = memSess.kind === "first" || memSess.kind === "keys";
  memSess.keyOrder = shuffle(memSess.v.keys);
}
function memRender() {
  const box = $("memBox"); if (!box) return;
  if (!memSess) { box.hidden = true; return; }
  box.hidden = false;
  const v = memSess.v, s = memSess.stage;
  const head = `<div class="mem-head"><span class="num">${memSess.phase === "test" && memSess.needRef ? "장절을 맞혀 보세요" : `${v.no} · ${escapeHtml(v.ref)}`}</span><span>${memSess.learnOnly ? "구절 보기" : `${memSess.i + 1} / ${memSess.list.length}`}</span></div>
    <div class="mem-stage"><span>${escapeHtml(v.title)} · ${v.day}일차 · ${STAGE_TEST[Math.min(s, MEM_MAX)]}</span><span class="stars">${Array.from({ length: MEM_MAX }, (_, i) => `<i class="${i < s ? "on" : ""}"></i>`).join("")}</span></div>`;
  let body = "";
  if (memSess.phase === "learn") {
    const lv = memSess.hide || 0;
    body = `<div class="ref-big num">${escapeHtml(v.ref)}</div><div class="verse">${maskText(v, lv)}</div>
      <p class="muted">장절 → 본문 → 장절 순서로 소리 내어 읽고, 한 단계씩 가려 가며 외워 보세요. ${["", "핵심어를 가렸어요.", "첫 글자만 남겼어요.", "다 가렸어요. 장절부터 끝까지 말해 보세요."][lv]}</p>
      <div class="row-btns"><button class="btn" data-act="hide">${lv >= 3 ? "다시 보기" : "한 단계 가리기"}</button>${memSess.learnOnly && !memSess.practice ? `<button class="btn" data-act="close">닫기</button>` : memSess.learnOnly ? `<button class="btn" data-act="close">닫기</button>` : `<button class="btn" data-act="skip">나중에</button>`}</div>
      <button class="btn manna" data-act="start" style="width:100%">${memSess.practice ? `연습 시험 (보상 없음 · 복습일 ${memRec(v.no).due.slice(5).replace("-", "/")})` : `외웠어요, 시험 보기 (${STAGE_TEST[s]})`}</button>`;
  } else if (memSess.phase === "test") {
    const k = memSess.kind;
    let prompt = "";
    if (k === "refHint" || k === "ref") prompt = `<div class="ref-big num">${escapeHtml(v.ref)}</div>` + (k === "refHint" ? `<div class="hint-cho">${escapeHtml(choseong(v.text.replace(/ \/ /g, " ")))}</div>` : `<p class="muted">${escapeHtml(v.title)} · 힌트 없이 본문을 쓰세요</p>`);
    if (k === "first") prompt = `<p class="q">${escapeHtml(v.title)}</p><div class="verse">${escapeHtml(firstPart(v))} <span class="blank">＿＿＿＿</span></div><p class="muted">이 말씀의 장절과 본문 전체(처음부터)를 쓰세요</p>`;
    if (k === "keys") prompt = `<p class="q">${escapeHtml(v.title)}</p><div class="keychips">${memSess.keyOrder.map(x => `<span>${escapeHtml(x)}</span>`).join("")}</div><p class="muted">이 핵심어가 들어간 말씀의 장절과 본문 전체를 쓰세요</p>`;
    const refIn = memSess.needRef ? `<div class="refin"><select id="memBook"><option value="">성경</option>${BOOKS.map(b => `<option>${b[0]}</option>`).join("")}</select><input id="memCh" type="text" inputmode="numeric" placeholder="장"><span>:</span><input id="memVs" type="text" inputmode="numeric" placeholder="절"></div>` : "";
    body = `${prompt}${refIn}<textarea id="memType" rows="4" placeholder="외운 말씀을 쓰세요. 띄어쓰기와 문장부호는 틀려도 괜찮아요"></textarea>
      <p class="muted">키보드의 마이크 버튼을 누르고 소리 내어 암송해도 돼요. 본문이 85% 이상 맞으면 통과${memSess.needRef ? ", 성경·장·절은 정확히 맞아야 해요" : ""}.</p>
      <div class="row-btns"><button class="btn" data-act="giveup">모르겠어요</button><button class="btn manna" data-act="check" style="flex:1">채점하기</button></div>`;
  } else {
    const res = memSess.result;
    if (res.practice) body = `<div class="mem-result ${res.pass ? "pass" : "fail"}"><b>${res.pass ? "연습 통과" : "연습 실패"}</b><span>${res.note || ""}</span></div>`;
    else body = res.pass
      ? `<div class="mem-result pass"><b>통과!</b> ${res.to}단계${res.to >= MEM_MASTER ? " · 암송 완료" : ""}<span>만나 +${res.rw.manna}${res.rw.stamp ? ` · 도장 +${res.rw.stamp}` : ""} · 월급 +${fmt(res.rw.gold)}원${res.bonus}</span><span>다음 복습: ${MEM_INT[res.to]}일 뒤</span></div>`
      : `<div class="mem-result fail"><b>아쉬워요</b> 한 단계 내려가고 오늘 다시 볼 수 있어요<span>${res.note || ""}</span></div>`;
    body += `<div class="ref-big num">${escapeHtml(v.ref)}</div><div class="verse">${memSess.answer != null ? missHtml(v, memSess.answer) : keyHtml(v)}</div>${memSess.answer != null && !res.pass ? '<p class="muted">빨간 글씨가 빠졌거나 틀린 부분이에요.</p>' : ""}
      <div class="row-btns">${res.pass ? "" : `<button class="btn" data-act="retry">다시 도전</button>`}<button class="btn manna" data-act="next" style="flex:1">${memSess.i + 1 < memSess.list.length ? "다음 구절" : "끝내기"}</button></div>`;
  }
  box.innerHTML = head + body;
}
