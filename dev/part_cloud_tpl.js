/* ===================== 아이디 로그인 · 기록 저장 =====================
   아이디와 비밀번호로 로그인하면 기록이 서버(수파베이스)에 저장되어 어느 기기·어느 주소에서 열어도 이어진다.
   켤 때·돌아올 때 서버 기록을 확인해 더 최근이면 불러오고, 하는 동안 1분마다·닫을 때 올린다 (마지막에 한 기기가 이김).
   비밀번호는 서버에서 bcrypt 로 바꿔 저장, 이 기기에는 로그인 토큰만 남는다. */
var CLOUD = { url: "__CLOUD_URL__", key: "__CLOUD_KEY__" };
var cloud = { busy: false, err: "", ask: null, out: 0, base: 0 };
var CLOUD_ERR = { bad_id: "아이디는 2~20자, 한글·영문 소문자·숫자·밑줄(_)만 돼요", bad_pw: "비밀번호는 4자 이상으로 해 주세요", taken: "이미 있는 아이디예요. 다른 아이디로 해 주세요", wrong: "아이디나 비밀번호가 맞지 않아요", locked: "여러 번 틀려서 10분 동안 잠겼어요. 잠시 뒤 다시 해 주세요", auth: "로그인이 풀렸어요. 다시 로그인해 주세요", size: "기록이 너무 커서 올리지 못했어요" };
function cloudCfg() { return !!(CLOUD.url && CLOUD.key && CLOUD.url.indexOf("__") < 0 && typeof fetch === "function"); }
/* 다른 페이지 안에 끼워 보이는 미리보기 창(아티팩트 등)은 바깥 서버 연결이 막혀 있음 → 로그인은 설치한 앱에서 */
function cloudFramed() { try { return typeof window !== "undefined" && !!window.top && window.self !== window.top; } catch (e) { return true; } }
function cloudOn() { return cloudCfg() && !cloud.csp && !cloudFramed(); }
function acctKey() { return SAVE_KEY + "-acct"; }
function acctGet() { try { const a = JSON.parse(localStorage.getItem(acctKey()) || "null"); return a && a.id && a.token ? a : null; } catch (e) { return null; } }
function acctSet(a) { try { if (a) localStorage.setItem(acctKey(), JSON.stringify(a)); else localStorage.removeItem(acctKey()); } catch (e) {} }
async function cloudRpc(fn, args, keep) {
  const h = { "Content-Type": "application/json", apikey: CLOUD.key };
  if (!/^sb_/.test(CLOUD.key)) h.Authorization = "Bearer " + CLOUD.key;
  const body = JSON.stringify(args);
  // 닫힐 때 보내는 요청(keepalive)은 64KB 까지만 됨 → 큰 기록은 보통 요청으로
  const small = typeof TextEncoder === "function" ? new TextEncoder().encode(body).length < 60000 : body.length < 20000;
  const r = await fetch(`${CLOUD.url}/rest/v1/rpc/${fn}`, { method: "POST", headers: h, body, keepalive: !!keep && small });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
function saveBrief(st) { const att = Object.values((st && st.att && st.att.log) || {}).filter(r => r && r.a).length; return `최고 ${(st && st.bestFloor) || 1}층 · 퇴사 ${(st && st.retires) || 0}회 · 말씀 ${(st && st.bible && st.bible.total) || 0}장 · 출근 ${att}일`; }
function isFreshSave(st) { return !st || ((st.totalKills || 0) < 40 && !((st.bible && st.bible.total) || 0) && !(st.retires || 0)); }
function clockText(t) { const d = new Date(t); return (dayKey(d) === dayKey() ? "" : `${d.getMonth() + 1}월 ${d.getDate()}일 `) + `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
/* 서버 기록으로 바꾸기: 백업 불러오기와 같은 정리 + 그 기록이 저장된 뒤 흐른 시간만큼 정산 */
function cloudApply(data) {
  S = merge(data);
  if (TIME_LIMIT[bossKind(S.floor, S.k)]) S.k = 1;
  awaySettle(data.t || Date.now(), true);
  mode = "tower"; floats = []; spawnWait = 0; lift = null; intro = null; memSess = null; spawn();
  planCache.k = ""; updateUI(true); save();
}
async function cloudPush(force, keep) {
  const a = acctGet(); if (!a || !cloudOn()) return false;
  if (cloud.busy && !keep) return false;
  save(); const t = S.t;
  if (!force && a.syncT && t <= a.syncT) return true;
  cloud.busy = true; let ok = false;
  try {
    const r = await cloudRpc("kjy_push", { p_id: a.id, p_token: a.token, p_save: S, p_t: t, p_force: !!force }, keep);
    if (r && r.ok) { const b = acctGet() || a; b.syncT = t; b.at = Date.now(); acctSet(b); cloud.err = ""; ok = true; }
    else if (r && r.err === "stale") { cloud.busy = false; await cloudSync("stale", 0); return false; }
    else if (r && r.err === "auth") { acctSet(null); cloud.err = CLOUD_ERR.auth; }
    else cloud.err = CLOUD_ERR[r && r.err] || "저장하지 못했어요";
  } catch (e) { cloud.err = "인터넷이 끊겨서 저장을 미뤄 뒀어요"; }
  cloud.busy = false; renderAcct(); return ok;
}
/* 서버 기록 확인: base = 이 기기에서 마지막으로 하던 때 */
async function cloudSync(why, base) {
  const a = acctGet(); if (!a || !cloudOn() || cloud.busy) return;
  cloud.busy = true; renderAcct();
  try {
    const r = await cloudRpc("kjy_pull", { p_id: a.id, p_token: a.token });
    if (r && r.ok) {
      cloud.err = ""; cloud.busy = false;
      const st = +r.save_t || 0;
      if (r.save && ((st > (a.syncT || 0) && st > (base || 0)) || (isFreshSave(S) && !isFreshSave(r.save)))) {
        cloudApply(r.save); const b = acctGet() || a; b.syncT = st; b.at = Date.now(); acctSet(b);
        toast(why === "stale" ? "다른 기기에서 한 더 최근 기록을 불러왔어요" : `${a.id} 계정의 최근 기록을 불러왔어요`);
        backMaybeOpen(); renderAcct(); return;
      }
      await cloudPush(false); return;
    }
    if (r && r.err === "auth") { acctSet(null); cloud.err = CLOUD_ERR.auth; }
  } catch (e) { cloud.err = "인터넷이 끊겨 있어요 · 연결되면 저장해요"; }
  cloud.busy = false; renderAcct();
}
async function cloudLogin(create) {
  const idEl = $("acId"), pwEl = $("acPw"), id = String((idEl && idEl.value) || "").trim().toLowerCase(), pw = String((pwEl && pwEl.value) || "");
  if (!id || !pw) { cloud.err = "아이디와 비밀번호를 넣어 주세요"; renderAcct(); return; }
  if (!cloudOn()) { cloud.err = "서버 준비 중이에요"; renderAcct(); return; }
  if (cloud.busy) return;
  cloud.busy = true; cloud.err = ""; renderAcct();
  try {
    const r = await cloudRpc(create ? "kjy_signup" : "kjy_login", { p_id: id, p_pw: pw });
    cloud.busy = false;
    if (!r || !r.ok) { cloud.err = CLOUD_ERR[r && r.err] || "잠시 뒤 다시 해 주세요"; renderAcct(); return; }
    acctSet({ id: r.id || id, token: r.token, syncT: 0, at: 0 }); if (pwEl) pwEl.value = "";
    if (create || !r.save) { await cloudPush(true); toast(create ? `${r.id || id} 계정을 만들고 지금 기록을 올렸어요` : `${r.id || id} 계정에 이 기기 기록을 올렸어요`); }
    else if (isFreshSave(S)) { cloudApply(r.save); const b = acctGet(); b.syncT = +r.save_t || 0; b.at = Date.now(); acctSet(b); toast(`${b.id} 기록을 불러왔어요`); backMaybeOpen(); }
    else cloud.ask = { save: r.save, t: +r.save_t || 0 };
  } catch (e) { cloud.busy = false; cloud.err = "서버에 연결하지 못했어요. 인터넷을 확인해 주세요"; }
  renderAcct();
}
async function cloudLogout() {
  const a = acctGet(); if (!a) return;
  await cloudPush(false);
  try { await cloudRpc("kjy_logout", { p_id: a.id, p_token: a.token }); } catch (e) {}
  acctSet(null); cloud.ask = null; cloud.err = ""; toast("로그아웃했어요 · 이 기기 기록은 그대로 있어요"); renderAcct();
}
function renderAcct() {
  const card = $("acCard"); if (!card) return;
  const a = acctGet(), cfg = cloudCfg(), on = cloudOn();
  if (card.hidden !== !cfg) card.hidden = !cfg;
  if (!cfg) return;
  const ic = $("acIc"); if (ic && !ic.firstChild) ic.appendChild(pixIcon("lock", 28));
  const set = (id, v) => { const e = $(id); if (e && e.textContent !== v) e.textContent = v; };
  const hid = (id, v) => { const e = $(id); if (e && e.hidden !== v) e.hidden = v; };
  hid("acNote", on);
  if (!on) {
    ["acOut", "acIn", "acAsk", "acErr"].forEach(id => hid(id, true));
    set("acTitle", "아이디 로그인"); set("acSub", "홈 화면에 설치한 앱에서 쓸 수 있어요");
    return;
  }
  hid("acOut", !!a || !!cloud.ask); hid("acIn", !a || !!cloud.ask); hid("acAsk", !cloud.ask);
  const ask = $("acAsk");
  if (cloud.ask && ask && ask._k !== cloud.ask.t) {
    ask._k = cloud.ask.t;
    ask.innerHTML = `<p class="muted">이 계정에 저장된 기록과 이 기기 기록이 달라요. 어느 기록으로 이어갈까요?</p>`
      + `<button type="button" class="ac-pick" data-pick="srv"><b>계정 기록으로</b><small>${saveBrief(cloud.ask.save)}${cloud.ask.t ? ` · ${clockText(cloud.ask.t)} 저장` : ""}</small></button>`
      + `<button type="button" class="ac-pick" data-pick="loc"><b>이 기기 기록으로</b><small>${saveBrief(S)} · 계정 기록은 이걸로 바뀌어요</small></button>`;
  }
  set("acTitle", a ? `${a.id}님 로그인 중` : "아이디 로그인");
  set("acSub", cloud.busy ? "서버와 주고받는 중…" : a ? (a.at ? `자동 저장 · 마지막 저장 ${clockText(a.at)}` : "자동 저장 켜짐") : "로그인하면 어느 기기·어느 주소에서든 같은 기록으로 이어져요");
  const er = $("acErr"); if (er) { if (er.hidden !== !cloud.err) er.hidden = !cloud.err; if (cloud.err && er.textContent !== cloud.err) er.textContent = cloud.err; }
  const lb = $("acLogin"), nb = $("acNew"); if (lb && lb.disabled !== cloud.busy) { lb.disabled = cloud.busy; nb.disabled = cloud.busy; }
  set("acOutBtn", cloud.out > Date.now() ? "한 번 더 누르면 로그아웃" : "로그아웃");
}
function buildAcctCard() {
  const card = el("div", "card acct"); card.id = "acCard"; card.hidden = true;
  card.innerHTML = `<div class="ac-hd"><span class="ac-ic" id="acIc"></span><div><b id="acTitle">아이디 로그인</b><small id="acSub"></small></div></div>
    <div class="ac-form" id="acOut"><input type="text" id="acId" placeholder="아이디 (한글·영문·숫자 2~20자)" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="20">
      <input type="password" id="acPw" placeholder="비밀번호 (4자 이상)" autocomplete="current-password" maxlength="72">
      <div class="row-btns"><button type="button" class="btn primary" id="acLogin" style="flex:1">로그인</button><button type="button" class="btn" id="acNew">새 계정 만들기</button></div></div>
    <div id="acIn" hidden><div class="row-btns"><button type="button" class="btn primary" id="acSave" style="flex:1">지금 저장</button><button type="button" class="btn" id="acOutBtn">로그아웃</button></div></div>
    <div id="acAsk" hidden></div>
    <p class="muted ac-note" id="acNote" hidden>이 미리보기 창에서는 바깥 서버 연결이 막혀 있어 로그인할 수 없어요. 홈 화면에 설치한 앱(깃허브 주소)에서 로그인해 주세요.</p>
    <p class="ac-err" id="acErr" hidden></p>`;
  addCustom("info", card, renderAcct);
  card.addEventListener("click", e => {
    const t = e.target, b = t && t.closest ? (t.closest("button") || (t.tagName === "BUTTON" ? t : null)) : (t && t.tagName === "BUTTON" ? t : null);
    if (!b || b.disabled) return;
    const ds = b.dataset || {};
    if (b.id === "acLogin") cloudLogin(false);
    else if (b.id === "acNew") cloudLogin(true);
    else if (b.id === "acSave") cloudPush(true).then(ok => { if (ok) toast("지금 기록을 계정에 저장했어요"); });
    else if (b.id === "acOutBtn") { if (cloud.out > Date.now()) { cloud.out = 0; cloudLogout(); } else { cloud.out = Date.now() + 3000; renderAcct(); setTimeout(() => { if (cloud.out && Date.now() >= cloud.out) { cloud.out = 0; renderAcct(); } }, 3100); } }
    else if (ds.pick === "srv" && cloud.ask) { const k = cloud.ask; cloud.ask = null; cloudApply(k.save); const a2 = acctGet(); if (a2) { a2.syncT = k.t; a2.at = Date.now(); acctSet(a2); } toast("계정 기록으로 이어 가요"); backMaybeOpen(); renderAcct(); }
    else if (ds.pick === "loc" && cloud.ask) { cloud.ask = null; cloudPush(true).then(ok => { if (ok) toast("이 기기 기록을 계정에 올렸어요"); }); renderAcct(); }
  });
  const pw = $("acPw"); if (pw && pw.addEventListener) pw.addEventListener("keydown", e => { if (e.key === "Enter") cloudLogin(false); });
}
/* 처음 켠 기기의 출근 카드에서 "예전 기록이 있다면" → 정보 탭 로그인으로 */
function goLogin() { backHide(); selectTab("info", true); setTimeout(() => { const c = $("acCard"); try { if (c && c.scrollIntoView) c.scrollIntoView({ block: "center" }); const i = $("acId"); if (i && i.focus) i.focus(); } catch (e) {} }, 250); }
(() => {
  const l = $("backLogin"); if (l && l.addEventListener) l.addEventListener("click", goLogin);
  // 보안 정책이 서버 연결을 막으면 (미리보기 창 등) 알려 주고 로그인 칸을 닫음
  if (typeof document !== "undefined" && document.addEventListener) document.addEventListener("securitypolicyviolation", e => {
    const host = String(CLOUD.url || "").replace(/^https?:\/\//, "");
    if (host && host.indexOf("__") < 0 && String((e && e.blockedURI) || "").indexOf(host) >= 0) { cloud.csp = true; cloud.busy = false; cloud.err = ""; renderAcct(); }
  });
  setInterval(() => { if (typeof document !== "undefined" && !document.hidden) cloudPush(false); }, 60000);
  if (typeof window !== "undefined" && window.addEventListener) window.addEventListener("pagehide", () => { cloudPush(false, true); });
})();
