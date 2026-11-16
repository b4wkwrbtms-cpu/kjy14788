/* ================= v51: 내 자료 자동 받기 + 새 버전 자동 적용 =================
   1) 켈러 읽기 팩·영웅서기5 자료를 한 번 불러오면 게임 계정 서버의 '내 계정 전용' 칸(kjy_private.packs)에 올려 둠.
      로그인한 앱이 자료가 없으면 저절로 받아 와서 폰에 저장함. 다른 계정·공개 사이트에서는 볼 수 없음.
   2) 새 버전이 배포되면 앱을 열거나 다시 볼 때 바로 확인해 바꿈(서비스워커 갱신 + 한 번 새로고침). */
var APP_VER = "51a";
var psync = { msg: { keller: "", hl5: "" }, busy: {} };
function psB64(u8) { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function psUnB64(b) { const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
async function psUp(key, str, ver) {
  const a = acctGet(); if (!a || !cloudOn() || psync.busy[key]) return false;
  psync.busy[key] = true; psync.msg[key] = "서버에 올리는 중…";
  const CH = 800000, n = Math.max(1, Math.ceil(str.length / CH)); let ok = true;
  try {
    for (let i = 0; i < n; i++) {
      const r = await cloudRpc("kjy_pack_put", { p_id: a.id, p_token: a.token, p_key: key, p_part: i, p_total: n, p_ver: ver || "", p_data: str.slice(i * CH, (i + 1) * CH) });
      if (!r || !r.ok) { ok = false; break; }
      psync.msg[key] = `서버에 올리는 중… ${Math.round((i + 1) / n * 100)}%`;
    }
  } catch (e) { ok = false; }
  psync.busy[key] = false; psync.msg[key] = ok ? "서버에 올려 뒀어요 · 다른 폰에서도 로그인하면 저절로 받아요" : "서버에 올리지 못했어요(인터넷 확인) · 이 폰에는 저장됐어요";
  try { updateUI(true); } catch (e) {} return ok;
}
async function psDown(key) {
  const a = acctGet(); if (!a || !cloudOn() || psync.busy[key]) return null;
  psync.busy[key] = true; let out = null;
  try {
    const r0 = await cloudRpc("kjy_pack_get", { p_id: a.id, p_token: a.token, p_key: key, p_part: 0 });
    if (r0 && r0.ok && !r0.none && r0.have === r0.total) {
      psync.msg[key] = "서버에서 받는 중…"; try { updateUI(true); } catch (e) {}
      const parts = [r0.data];
      for (let i = 1; i < r0.total; i++) { const r = await cloudRpc("kjy_pack_get", { p_id: a.id, p_token: a.token, p_key: key, p_part: i }); if (!r || !r.ok) throw new Error("part"); parts.push(r.data); }
      out = parts.join("");
    }
  } catch (e) { out = null; }
  psync.busy[key] = false; psync.msg[key] = out ? "서버에서 받아 왔어요" : ""; return out;
}
/* 켈러 */
async function psKelUp() { try { const p = await kelDbDo("readonly", st => st.get("main")); if (p) await psUp("keller", JSON.stringify(p), p.made || ""); } catch (e) {} }
async function psKelDown() {
  if (kel.ready) return; const s = await psDown("keller"); if (!s) return;
  try { const p = JSON.parse(s); if (kelLoad(p)) { try { await kelDbDo("readwrite", st => st.put(p, "main")); } catch (e) {} toast(`켈러 설교 ${kel.list.length}편을 서버에서 받아 왔어요`); updateUI(true); } } catch (e) {}
}
/* 영웅서기5 */
async function psHl5Up() { try { const p = await hl5DbDo("readonly", st => st.get("main")); if (p && p.buf) await psUp("hl5", JSON.stringify({ v: p.v, idx: p.idx, b64: psB64(p.buf) }), "v" + p.v); } catch (e) {} }
async function psHl5Down() {
  if (hl5.ready) return; const s = await psDown("hl5"); if (!s) return;
  try { const j = JSON.parse(s), p = { v: j.v, idx: j.idx, buf: psUnB64(j.b64) }; if (hl5Load(p)) { try { await hl5DbDo("readwrite", st => st.put(p, "main")); } catch (e) {} if (fxSet().hl5 === 0) { fxSet().hl5 = 1; save(); } hl5Refresh(); toast("영웅서기5 자료를 서버에서 받아 왔어요"); updateUI(true); } } catch (e) {}
}
async function psAuto() { if (!acctGet() || !cloudOn()) return; await psKelDown(); await psHl5Down(); }
(function () {
  const ki0 = kelImport;
  kelImport = async function () { const r = await ki0.apply(this, arguments); if (kel.ready && acctGet()) psKelUp(); return r; };
  const hi0 = hl5Import;
  hl5Import = async function () { const r = await hi0.apply(this, arguments); if (hl5.ready && acctGet()) psHl5Up(); return r; };
  /* 상태 글에 서버 상태를 덧붙임 */
  const ks0 = kelListHtml;
  kelListHtml = function () { const h = ks0.apply(this, arguments); return psync.msg.keller ? h + `<p class="nt-cap">${escapeHtml(psync.msg.keller)}</p>` : (!kel.ready && !acctGet() ? h + `<p class="nt-cap">설정에서 로그인해 두면, 한 번 불러온 원고를 다른 폰에서도 저절로 받아요.</p>` : h); };
  const hs0 = hl5StatText;
  hl5StatText = function () { const t = hs0.apply(this, arguments); return psync.msg.hl5 ? t.replace(" (이 폰에만 저장)", "") + " · " + psync.msg.hl5 : t; };
  /* 로그인 직후·앱 시작 뒤 자료가 없으면 서버에서 받기 */
  setTimeout(psAuto, 3500);
  let lastAcct = !!acctGet();
  setInterval(() => { const now = !!acctGet(); if (now && !lastAcct) psAuto(); lastAcct = now; }, 2000);
  /* 이미 이 폰에 있는데 서버에 없으면 올려 둠 (처음 한 번) */
  setTimeout(async () => {
    const a = acctGet(); if (!a || !cloudOn()) return;
    for (const [key, ready, up] of [["keller", () => kel.ready, psKelUp], ["hl5", () => hl5.ready, psHl5Up]]) {
      if (!ready()) continue;
      try { const r = await cloudRpc("kjy_pack_get", { p_id: a.id, p_token: a.token, p_key: key, p_part: 0 }); if (r && r.ok && r.none) await up(); } catch (e) {}
    }
  }, 9000);
  /* 새 버전 자동 적용: 열 때·다시 볼 때 확인, 새 서비스워커가 자리 잡으면 한 번 새로고침 */
  if ("serviceWorker" in navigator) {
    const chk = () => { try { navigator.serviceWorker.getRegistration().then(r => { if (r) r.update().catch(() => {}); }); } catch (e) {} };
    window.addEventListener("load", () => setTimeout(chk, 1500));
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") chk(); });
    let had = !!navigator.serviceWorker.controller, done = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!had) { had = true; return; }   // 처음 설치는 새로고침할 필요 없음
      if (done) return; done = true;
      try { save(); } catch (e) {}
      try { sessionStorage.setItem("kjy-upd", APP_VER); } catch (e) {}
      location.reload();
    });
  }
  try { const u = sessionStorage.getItem("kjy-upd"); if (u) { sessionStorage.removeItem("kjy-upd"); setTimeout(() => toast("새 버전으로 바꿨어요 · " + APP_VER), 1200); } } catch (e) {}
  /* 설정 화면 맨 아래에 앱 버전 */
  const sc0 = buildScrCard;
  buildScrCard = function () { const r = sc0.apply(this, arguments); try { const c = el("div", "card stg"); c.innerHTML = `<p class="muted" style="margin:0">앱 버전 <b>${APP_VER}</b> · 새 버전은 앱을 열 때 저절로 받아요</p>`; addCustom("set", c, () => {}); } catch (e) {} return r; };
})();
