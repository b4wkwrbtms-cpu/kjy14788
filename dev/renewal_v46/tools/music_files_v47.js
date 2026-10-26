/* ===================== 내 배경음악 파일 (10-27) =====================
   사용자가 준 mp3(20곡)를 기기 안(IndexedDB)에 넣고 장면마다 틂. 파일은 저장소·서버에 올리지 않음(저작권 — 사용자 기기 안에서만).
   파일이 있으면 즉석 합성 음악(v47) 대신 이걸 씀. 없으면 전처럼 합성 음악.
   장면: 읽기 창(성경·해설·설교) = 잔잔한 곡 · 옷장/보물 탭 = 상점 곡 · 그 밖엔 구역(50층)마다 한 곡 · 짧은 'Title_2002'는 앱을 연 뒤 첫 소리로 한 번. */
const FB_DB = "yageun-bgm";
const fbKey = n => String(n || "").replace(/^[0-9a-f]{8}-/, "").replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
/* 곡 이름 → 장면. 이름이 목록에 없으면 구역 순환에 자동으로 들어감 */
const FB_MAP = {
  read: ["aquarium", "restnpeace", "restingplaceofgod", "raindropflower", "whenthemorningcomes", "abovethetreetops"],
  shop: ["shopbgm"],
  jingle: ["title2002"],
  zones: ["title", "coketown", "florallife", "brokendream", "clocktowerofnightmare", "elfwood", "goldbeach", "knightoflight", "comewithme", "nothingleft", "bluesky", "abovethetreetops", "whenthemorningcomes", "raindropflower", "restnpeace", "clocktowerofnightmare", "knightoflight", "gopicnic", "nothingleft", "brokendream", "coketown"],
};
const FB_SCENE_KO = { read: "읽을 때", shop: "옷장·보물", jingle: "시작 소리" };
function fbOpen() { return new Promise((res, rej) => { try { const r = indexedDB.open(FB_DB, 1); r.onupgradeneeded = () => { r.result.createObjectStore("t", { keyPath: "name" }); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); }
async function fbAll() { const db = await fbOpen(); return new Promise((res, rej) => { const q = db.transaction("t").objectStore("t").getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => rej(q.error); }); }
async function fbPut(files) { const db = await fbOpen(); const tx = db.transaction("t", "readwrite"), st = tx.objectStore("t"); for (const f of files) st.put({ name: fbKey(f.name), orig: f.name, blob: f, type: f.type || "audio/mpeg", size: f.size }); return new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
async function fbDel(name) { const db = await fbOpen(); const tx = db.transaction("t", "readwrite"); tx.objectStore("t").delete(name); return new Promise(res => { tx.oncomplete = res; tx.onerror = res; }); }
async function fbClear() { const db = await fbOpen(); const tx = db.transaction("t", "readwrite"); tx.objectStore("t").clear(); return new Promise(res => { tx.oncomplete = res; tx.onerror = res; }); }
let fb = { list: null, by: {}, urls: {}, el: [], g: [], cur: -1, scene: "", track: "", readPick: "", jingled: false, unlocked: false, src: [] };
function fbSceneOf(name) { if (FB_MAP.read.includes(name)) return "read"; if (FB_MAP.shop.includes(name)) return "shop"; if (FB_MAP.jingle.includes(name)) return "jingle"; const z = FB_MAP.zones.indexOf(name); return z >= 0 ? "zone" : "zone+"; }
function fbReady() { return !!(fb.list && fb.list.length && S.bgmFiles !== false); }
function fbLoad() { fbAll().then(l => { fb.list = l; fb.by = {}; l.forEach(t => { fb.by[t.name] = t; }); fb.k = ""; try { updateUI(true); } catch (e) {} }).catch(() => { fb.list = []; }); }
function fbUrl(t) { if (!fb.urls[t.name]) fb.urls[t.name] = URL.createObjectURL(t.blob); return fb.urls[t.name]; }
function fbHave(names) { return names.filter(n => fb.by[n]); }
function fbZoneTrack(z) {
  const want = FB_MAP.zones[z % FB_MAP.zones.length];
  if (fb.by[want]) return want;
  const pool = fb.list.map(t => t.name).filter(n => !FB_MAP.read.includes(n) && !FB_MAP.shop.includes(n) && !FB_MAP.jingle.includes(n));
  return pool.length ? pool[z % pool.length] : fb.list[0].name;
}
function fbScene() {
  if (readingNow()) return S.focusMusic === false ? "" : "read";
  if (curTab === "suit" || curTab === "treasure") return "shop";
  const w = bgmWant(); return "z" + w[0];
}
function fbTrackFor(scene) {
  if (!scene) return "";
  if (scene === "read") { const c = fbHave(FB_MAP.read); if (!c.length) return fbZoneTrack(0); if (!fb.readPick || !fb.by[fb.readPick]) fb.readPick = c[Math.floor(Math.random() * c.length)]; return fb.readPick; }
  if (scene === "shop") { const c = fbHave(FB_MAP.shop); return c.length ? c[0] : fbZoneTrack(0); }
  return fbZoneTrack(+scene.slice(1) || 0);
}
function fbEnsure() {
  if (fb.el.length) return;
  for (let i = 0; i < 2; i++) {
    const el = document.createElement("audio"); el.preload = "auto"; el.loop = true; el.setAttribute("playsinline", "");
    const g = audioCtx.createGain(); g.gain.value = 0.0001; g.connect(masterGain);
    try { const src = audioCtx.createMediaElementSource(el); src.connect(g); fb.src.push(src); } catch (e) { el.volume = 0; }
    fb.el.push(el); fb.g.push(g);
  }
}
function fbVol(scene) { return BGM_VOL * sndVol("m") * (scene === "read" ? 0.6 : 1); }
function fbPlay(name, scene, loop) {
  const t = fb.by[name]; if (!t) return;
  fbEnsure(); const now = audioCtx.currentTime, next = fb.cur < 0 ? 0 : 1 - fb.cur, el = fb.el[next], g = fb.g[next];
  if (fb.cur >= 0) { const og = fb.g[fb.cur], oe = fb.el[fb.cur]; og.gain.cancelScheduledValues(now); og.gain.setTargetAtTime(0.0001, now, 0.5); setTimeout(() => { try { if (fb.cur !== fb.el.indexOf(oe)) { oe.pause(); } } catch (e) {} }, 2200); }
  el.loop = loop !== false; el.src = fbUrl(t); el.currentTime = 0;
  const p = el.play(); if (p && p.catch) p.catch(() => {});
  g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(0.0001, now); g.gain.setTargetAtTime(fbVol(scene), now + 0.05, 0.7);
  fb.cur = next; fb.track = name; fb.scene = scene;
  if (!loop) el.onended = () => { fb.track = ""; fb.scene = ""; try { bgmUpdate(); } catch (e) {} };
  else el.onended = null;
}
function fbStop() {
  if (fb.cur < 0) return; const now = audioCtx ? audioCtx.currentTime : 0;
  fb.g.forEach(g => { g.gain.cancelScheduledValues(now); g.gain.setTargetAtTime(0.0001, now, 0.5); });
  const els = fb.el.slice(); setTimeout(() => els.forEach(e => { try { e.pause(); } catch (x) {} }), 2200);
  fb.cur = -1; fb.track = ""; fb.scene = "";
}
function fbUpdate(on) {
  if (!on) { fbStop(); return; }
  if (!fb.jingled && fb.by[FB_MAP.jingle[0]]) { fb.jingled = true; fbPlay(FB_MAP.jingle[0], "jingle", false); return; }
  if (fb.scene === "jingle") return;                              // 시작 소리 끝나면 onended → 다시 고름
  const scene = fbScene(), name = fbTrackFor(scene);
  if (!name) { if (fb.cur >= 0) fbStop(); return; }
  if (name === fb.track && fb.cur >= 0) { const g = fb.g[fb.cur]; const v = fbVol(scene); if (Math.abs(g.gain.value - v) > 0.01 && scene !== fb.scene) { g.gain.setTargetAtTime(v, audioCtx.currentTime, 0.5); fb.scene = scene; } return; }
  fbPlay(name, scene, true);
}
/* ---------- 설정 탭 카드 ---------- */
function buildFbCard() {
  const card = el("div", "card stg fbgm");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stFbIc"></span><div><b>내 배경음악</b><small id="stFbSub">음악 파일을 넣으면 그 곡으로 틀어요</small></div>${stSw("stFbOn", "fbon", "내 음악 쓰기")}</div>
    <div class="row-btns"><button type="button" class="buy" data-act="fbadd"><span class="act">음악 파일 넣기</span></button><button type="button" class="btn" data-act="fbclear">모두 지우기</button></div>
    <input type="file" id="stFbFile" accept="audio/*,.mp3,.m4a" multiple hidden>
    <div class="log" id="stFbList"></div>
    <p class="muted">곡은 이 기기 안에만 저장돼요(인터넷에 올라가지 않아요). 이름으로 자리를 정해요 — 읽을 때: Aquarium·RestNPeace·Resting place of God·RaindropFlower·WhenTheMorningComes·AboveTheTreetops / 옷장·보물: ShopBgm / 시작 소리: Title_2002 / 나머지는 50층마다 한 곡씩.</p>`;
  addCustom("set", card, () => {
    const n = fb.list ? fb.list.length : 0, on = S.bgmFiles !== false, k = n + ":" + on + ":" + (fb.track || "");
    if (fb.k === k) return; fb.k = k;
    const sw = $("stFbOn"); if (sw) { sw.setAttribute("aria-checked", on ? "true" : "false"); sw.classList.toggle("on", on); }
    const mb = fb.list ? (fb.list.reduce((a, t) => a + (t.size || 0), 0) / 1048576).toFixed(0) : 0;
    $("stFbSub").textContent = n ? `${n}곡 · ${mb}MB · ${on ? (fb.track ? "지금: " + (fb.by[fb.track] ? fb.by[fb.track].orig.replace(/^[0-9a-f]{8}-/, "").replace(/\.[^.]+$/, "") : fb.track) : "곡 고르는 중") : "꺼짐 (합성 음악 사용)"}` : "음악 파일을 넣으면 그 곡으로 틀어요 (없으면 합성 음악)";
    $("stFbList").innerHTML = n ? fb.list.map(t => { const sc = fbSceneOf(t.name), z = FB_MAP.zones.indexOf(t.name); const lab = FB_SCENE_KO[sc] || (z >= 0 ? `${BGM_Z[z].n} 구역` : "구역 순환"); return `<div><span>${escapeHtml(t.orig.replace(/^[0-9a-f]{8}-/, "").replace(/\.[^.]+$/, ""))}${t.name === fb.track ? " ♪" : ""}</span><span class="num">${lab} <button type="button" class="btn ghost" data-del="${escapeHtml(t.name)}" aria-label="지우기">×</button></span></div>`; }).join("") : "";
  });
  stIcon("stFbIc", "music");
  card.addEventListener("click", e => {
    const d = e.target.closest("[data-del]"); if (d) { fbDel(d.dataset.del).then(() => { if (fb.track === d.dataset.del) fbStop(); fbLoad(); toast("지웠어요"); }); return; }
    const b = e.target.closest("[data-act]"); if (!b) return; const a = b.dataset.act;
    if (a === "fbadd") $("stFbFile").click();
    else if (a === "fbclear") { if (!fb.list || !fb.list.length) return; fbStop(); fbClear().then(() => { fbLoad(); toast("내 배경음악을 모두 지웠어요"); }); }
    else if (a === "fbon") { S.bgmFiles = S.bgmFiles === false; if (!S.bgmFiles) fbStop(); fb.k = ""; save(); updateUI(true); try { bgmUpdate(); } catch (x) {} }
  });
  $("stFbFile").addEventListener("change", e => {
    const files = Array.from(e.target.files || []).filter(f => /audio|mp3|m4a|aac|ogg|wav/i.test(f.type + " " + f.name)); e.target.value = "";
    if (!files.length) { toast("음악 파일이 아니에요"); return; }
    toast(`${files.length}곡 넣는 중…`);
    fbPut(files).then(() => { S.bgmFiles = true; fb.readPick = ""; fbLoad(); try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (x) {} toast(`${files.length}곡 넣었어요`); save(); })
      .catch(() => toast("저장하지 못했어요 · 저장 공간을 확인해 주세요"));
  });
}
try { buildFbCard(); } catch (e) {}
fbLoad();
document.addEventListener("pointerdown", () => { if (!fb.unlocked && fbReady() && audioCtx) { fb.unlocked = true; fbEnsure(); fb.el.forEach(el => { if (!el.src) { el.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA="; const p = el.play(); if (p && p.then) p.then(() => el.pause(), () => {}); } }); } }, { passive: true });
