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
let fb = { list: null, by: {}, cur: null, pending: "", scene: "", track: "", readPick: "", jingled: false, bad: {} };
function fbSceneOf(name) { if (FB_MAP.read.includes(name)) return "read"; if (FB_MAP.shop.includes(name)) return "shop"; if (FB_MAP.jingle.includes(name)) return "jingle"; const z = FB_MAP.zones.indexOf(name); return z >= 0 ? "zone" : "zone+"; }
function fbReady() { return !!(fb.list && fb.list.length && S.bgmFiles !== false); }
function fbLoad() { fbAll().then(l => { fb.list = l; fb.by = {}; l.forEach(t => { fb.by[t.name] = t; }); fb.k = ""; try { updateUI(true); } catch (e) {} }).catch(() => { fb.list = []; }); }
function fbHave(names) { return names.filter(n => fb.by[n]); }
function fbZoneTrack(z) {
  const want = FB_MAP.zones[z % FB_MAP.zones.length];
  if (fb.by[want] && !(S.bgmMap && S.bgmMap[want] && S.bgmMap[want] !== "z" + z)) return want;
  const pool = fb.list.map(t => t.name).filter(n => { const k = fbSceneKey(n); return k !== "read" && k !== "shop" && k !== "jingle" && k !== "off"; });
  return pool.length ? pool[z % pool.length] : "";
}
function fbScene() {
  if (readingNow()) return S.focusMusic === false ? "" : "read";
  if (curTab === "suit" || curTab === "treasure") return "shop";
  const w = bgmWant(); return "z" + w[0];
}
function fbTrackFor(scene) {
  if (!scene) return "";
  if (scene === "read") {
    const rm = readMode(); if (rm === "off" || rm === "synth") return ""; if (rm !== "auto") return fb.by[rm] ? rm : "";
    const c = fbIn("read"); return c.length ? fbPickFrom(c, "read") : fbZoneTrack(0);
  }
  if (scene === "shop") { const c = fbIn("shop"); return c.length ? fbPickFrom(c, "shop") : fbZoneTrack(0); }
  const z = +scene.slice(1) || 0, c = fbIn("z" + z); if (c.length) return fbPickFrom(c, "z" + z);
  const spare = fbIn("zone+"); if (spare.length) return spare[z % spare.length];
  return fbZoneTrack(z);
}
/* 재생: 파일을 디코드해 웹오디오 버퍼로 틂 (아이폰 사파리에서 <audio>+MediaElementSource는 소리가 안 나는 일이 잦아서).
   32kHz 모노로 디코드해 메모리를 아낌(3분 곡 ≈ 23MB). 최근 3곡만 캐시. */
let fbBuf = new Map(), fbDecoding = null;
function fbDecode(name) {
  if (fbBuf.has(name)) { const b = fbBuf.get(name); fbBuf.delete(name); fbBuf.set(name, b); return Promise.resolve(b); }
  const t = fb.by[name]; if (!t) return Promise.reject(new Error("no track"));
  const rd = t.blob.arrayBuffer ? t.blob.arrayBuffer() : new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error); fr.readAsArrayBuffer(t.blob); });
  return rd.then(ab => new Promise((res, rej) => {
    let oc; try { oc = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 1, 32000); } catch (e) { oc = audioCtx; }
    const p = oc.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej);
  })).then(buf => { fbBuf.set(name, buf); while (fbBuf.size > 3) fbBuf.delete(fbBuf.keys().next().value); return buf; });
}
function fbVol(scene) { return BGM_VOL * sndVol("m") * (scene === "read" ? 0.6 : 1); }
function fbHold(g) { const now = audioCtx.currentTime, v = Math.max(0.0001, g.gain.value); g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(v, now); return now; }   // 자동화 취소 뒤 값이 튀어 '틱' 나는 것 막기
function fbFadeOut(v, sec) { if (!v) return; try { const now = fbHold(v.g); v.g.gain.setTargetAtTime(0.0001, now, sec || 1); v.src.stop(now + (sec || 1) * 5); v.src.onended = null; } catch (e) {} }
const FB_FADE = { out: 1.2, in: 1.8, read: 2.4 };
/* 사용자 배치(S.bgmMap: 곡 이름 → 장면 "read"|"shop"|"jingle"|"z0".."z20"|"off"), 없으면 이름 기본 배치 */
function fbSceneKey(name) { const m = S.bgmMap && S.bgmMap[name]; if (m) return m; const sc = fbSceneOf(name); if (sc === "zone") return "z" + FB_MAP.zones.indexOf(name); return sc === "zone+" ? "zone+" : sc; }
function fbIn(scene) { return (fb.list || []).map(t => t.name).filter(n => fbSceneKey(n) === scene && !(fb.bad && fb.bad[n])); }
function fbPickFrom(list, seedKey) { if (!list.length) return ""; fb.picks = fb.picks || {}; if (!fb.picks[seedKey] || !list.includes(fb.picks[seedKey])) fb.picks[seedKey] = list[Math.floor(Math.random() * list.length)]; return fb.picks[seedKey]; }
function fbPlay(name, scene, loop) {
  const t = fb.by[name]; if (!t || !audioCtx) return;
  fb.pending = name; fb.track = name; fb.scene = scene; fb.k = "";
  fbDecode(name).then(buf => {
    if (fb.pending !== name || !audioCtx) return;
    fb.pending = "";
    const now = audioCtx.currentTime, src = audioCtx.createBufferSource(), g = audioCtx.createGain();
    src.buffer = buf; src.loop = loop !== false; g.gain.setValueAtTime(0.0001, now); src.connect(g); g.connect(masterGain); src.start(now + 0.02);
    const slow = scene === "read" || (fb.cur && fb.cur.scene === "read");
    g.gain.setTargetAtTime(fbVol(scene), now + 0.05, slow ? FB_FADE.read : FB_FADE.in);
    if (fb.cur) fbFadeOut(fb.cur, slow ? FB_FADE.read : FB_FADE.out);
    fb.cur = { src, g, name, scene, t0: now };
    if (loop === false) src.onended = () => { if (fb.cur && fb.cur.src === src) { fb.cur = null; fb.track = ""; fb.scene = ""; } try { bgmUpdate(); } catch (e) {} };
    try { updateUI(true); } catch (e) {}
  }).catch(e => { fb.pending = ""; fb.bad = fb.bad || {}; fb.bad[name] = 1; fb.track = ""; fb.scene = ""; toast("이 곡은 열 수 없어요: " + (t.orig || name)); });
}
function fbStop() {
  fb.pending = ""; if (fb.cur) fbFadeOut(fb.cur, FB_FADE.out); fb.cur = null; fb.track = ""; fb.scene = ""; fb.k = "";
}
function fbUpdate(on) {
  if (!on) { if (fb.cur || fb.pending) fbStop(); return; }
  if (!masterGain) return;
  if (!fb.jingled) { fb.jingled = true; const j = fbIn("jingle"); if (j.length) { fbPlay(j[0], "jingle", false); return; } }
  if (fb.scene === "jingle" && (fb.cur || fb.pending)) return;          // 시작 소리 끝나면 onended → 다시 고름
  const scene = fbScene(); let name = fbTrackFor(scene);
  if (name && fb.bad && fb.bad[name]) name = "";
  if (!name) { if (fb.cur || fb.pending) fbStop(); return; }
  if (name === fb.track && (fb.cur || fb.pending)) {
    if (fb.cur && scene !== fb.scene) { const now = fbHold(fb.cur.g); fb.cur.g.gain.setTargetAtTime(fbVol(scene), now, 1.5); fb.scene = scene; fb.cur.scene = scene; }
    return;
  }
  fbPlay(name, scene, true);
}
/* ---------- 설정 탭 카드 ---------- */
function buildFbCard() {
  const card = el("div", "card stg fbgm");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stFbIc"></span><div><b>내 배경음악</b><small id="stFbSub">음악 파일을 넣으면 그 곡으로 틀어요</small></div>${stSw("stFbOn", "fbon", "내 음악 쓰기")}</div>
    <div class="row-btns"><button type="button" class="buy" data-act="fbadd"><span class="act">음악 파일 넣기</span></button><button type="button" class="btn" data-act="fbclear">모두 지우기</button></div>
    <input type="file" id="stFbFile" accept="audio/*,.mp3,.m4a" multiple hidden>
    <div class="log" id="stFbList"></div>
    <p class="muted">곡은 이 기기 안에만 저장돼요(인터넷에 올라가지 않아요). 곡마다 자리를 고를 수 있어요 — 읽을 때 · 옷장·보물 · 시작 소리(앱 열 때 한 번) · 구역(50층마다) · 안 씀. 한 자리에 여러 곡이면 그때그때 하나를 골라 틀어요. 처음엔 이름을 보고 자동으로 정해 둬요.</p>`;
  addCustom("set", card, () => {
    const n = fb.list ? fb.list.length : 0, on = S.bgmFiles !== false, k = n + ":" + on + ":" + (fb.track || "");
    if (fb.k === k) return; fb.k = k;
    const sw = $("stFbOn"); if (sw) { sw.setAttribute("aria-checked", on ? "true" : "false"); sw.classList.toggle("on", on); }
    const mb = fb.list ? (fb.list.reduce((a, t) => a + (t.size || 0), 0) / 1048576).toFixed(0) : 0;
    $("stFbSub").textContent = n ? `${n}곡 · ${mb}MB · ${on ? (fb.track ? "지금: " + (fb.by[fb.track] ? fb.by[fb.track].orig.replace(/^[0-9a-f]{8}-/, "").replace(/\.[^.]+$/, "") : fb.track) : "곡 고르는 중") : "꺼짐 (합성 음악 사용)"}` : "음악 파일을 넣으면 그 곡으로 틀어요 (없으면 합성 음악)";
    const SC = [["read", "읽을 때"], ["shop", "옷장·보물"], ["jingle", "시작 소리"]].concat(BGM_Z.map((z, i) => ["z" + i, z.n])).concat([["off", "안 씀"]]);
    $("stFbList").innerHTML = n ? fb.list.map(t => { const k = fbSceneKey(t.name), kk = k === "zone+" ? "" : k; return `<div class="fb-row"><span>${escapeHtml(t.orig.replace(/^[0-9a-f]{8}-/, "").replace(/\.[^.]+$/, ""))}${t.name === fb.track ? " ♪" : ""}</span><span class="fb-ctl"><select class="fb-sel" data-map="${escapeHtml(t.name)}" aria-label="자리">${kk ? "" : `<option value="" selected>구역 순환</option>`}${SC.map(([v, l]) => `<option value="${v}"${v === kk ? " selected" : ""}>${escapeHtml(l)}</option>`).join("")}</select><button type="button" class="btn ghost" data-del="${escapeHtml(t.name)}" aria-label="지우기">×</button></span></div>`; }).join("") : "";
  });
  stIcon("stFbIc", "music");
  card.addEventListener("change", e => { const sel = e.target.closest("select[data-map]"); if (!sel) return; S.bgmMap = S.bgmMap || {}; if (sel.value) S.bgmMap[sel.dataset.map] = sel.value; else delete S.bgmMap[sel.dataset.map]; fb.picks = {}; fb.k = ""; save(); try { bgmUpdate(); } catch (x) {} toast("자리를 바꿨어요"); });
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
/* 음량 설정이 바뀌면 지금 곡에도 반영 */
setInterval(() => { try { if (fb.cur && audioCtx && !fb.pending) { const v = fbVol(fb.scene); if (Math.abs(fb.cur.g.gain.value - v) > 0.02 && audioCtx.currentTime - (fb.cur.t0 || 0) > 6) { const now = fbHold(fb.cur.g); fb.cur.g.gain.setTargetAtTime(v, now, 0.5); } } } catch (e) {} }, 1000);
