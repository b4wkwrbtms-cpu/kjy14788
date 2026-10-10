/* ===================== 메뉴 묶기 · 설정 탭 · 친구 초대 (v34) =====================
   1) 아래 메뉴 10개 → 5개: 말씀(읽기·암송·공부) · 성장(무기·동료·옷장·보물·퇴사) · 업무 · 정보 · 설정.
      안쪽 화면(패널)은 그대로 두고, 묶음 안의 화면은 탭 머리띠 맨 위 작은 메뉴로 고름. 묶음마다 마지막으로 본 화면을 기억.
      묶음 안에서 열린 화면이 하나뿐이면 작은 메뉴를 숨김 (탭 차례로 열기와 같이 감).
   2) 설정 탭: 앱으로 설치(브라우저에서 열었을 때만) · 소리(전체 · 배경 음악 · 효과음, 크기) · 화면(흔들림 · 번쩍임 · 말씀 글자 크기)
      · 말씀 알림(읽을 때와 곳으로 이동) · 친구 초대 · 아이디 로그인 · 기록 백업. 위쪽 스피커 버튼은 소리 전체를 한 번에 끄고 켬.
   3) 친구 초대: 링크 보내기(공유) · 복사 · QR 코드. 초대 링크(?invite=1)로 처음 온 사람은 첫 출근 카드 인사가 달라짐.
   TABS 만들기 전에 불리므로 함수 선언과 var(+ 아이콘 등록)만 씀 */
var APP_URL = "https://b4wkwrbtms-cpu.github.io/kjy14788/";
var INV_TEXT = "말씀 읽고 공부하며 오르는 본사 타워, 곽준영 키우기 같이 해요!";
var MENU_G = [
  { id: "word", n: "말씀", ic: "bible", tabs: ["bible", "mem", "study"] },
  { id: "grow", n: "성장", ic: "grow", tabs: ["weapon", "pet", "suit", "treasure", "retire"] },
  { id: "work", n: "업무", ic: "daily", tabs: ["daily"] },
  { id: "info", n: "정보", ic: "info", tabs: ["info"] },
  { id: "set", n: "설정", ic: "set", tabs: ["set"] },
];
var MENU_SUB = { bible: "읽기" };
var MENU_GUIDE = [
  ["메뉴 묶음", "아래 메뉴는 말씀·성장·업무·정보·설정 다섯 개예요. 말씀에는 읽기·암송·공부, 성장에는 무기·동료·옷장·보물·퇴사가 있고 위쪽 작은 메뉴로 골라요. 묶음마다 마지막으로 본 화면을 기억해요."],
  ["설정", "소리(배경 음악·효과음 크기), 화면(흔들림·번쩍임·말씀 글자 크기), 말씀 알림, 친구 초대, 아이디 로그인, 기록 백업이 모여 있어요. 위쪽 스피커 버튼은 소리를 한 번에 끄고 켜요."],
  ["친구 초대", "설정 탭에서 초대 링크를 보내거나 복사하고, QR 코드를 친구 휴대폰 카메라로 찍게 할 수 있어요. 친구 기록은 친구 기기(계정)에 따로 쌓여요."],
];
var menuUI = { last: {}, dot: {}, btn: {}, seg: {}, hk: "", setSeen: 0, invited: false, bip: null, inst: null, k: {} };

UIICON.set = { m: ["..............", "......WW......", "..WW..WW..gg..", "..WWWWWWWggg..", "...WWWWWggg...", "...WWW..ggg...", ".WWWW....gddd.", ".WWWW....dddd.", "...Wgg..ddd...", "...ggggdddd...", "..ggggdddddd..", "..gg..dd..dd..", "......dd......", ".............."], p: { W: "#e3e9f6", g: "#a3afc9", d: "#66738f" } };
UIICON.grow = { m: ["............wW", "...........wWw", "..........wWw.", ".........wWw..", "........wWw...", ".......wWw....", "...g..WWw.....", "..gggWWw...a..", "...gggw...Aaa.", "...hheg..aAaaa", "..hhhggg..aaa.", ".hhh..g...aaa.", ".pp.......aaa.", ".pp.......aaa."], p: { W: "#f4f8ff", w: "#a9b6d0", g: "#ffd54a", h: "#7c5cff", p: "#ffb53a", e: "#ff6b6b", a: "#7fe3a0", A: "#e6fff0" } };
UIICON.friends = { m: ["..............", "........bbb...", ".......bBBbb..", ".......bBbbb..", "..aaa...bbb...", ".aAAaa........", ".aAaaa.bbbbb..", "..aaa.bBbbbbb.", "......bbbbbbb.", ".aaaaa.bbbbbb.", "aAAaaaa.bbbbb.", "aAaaaaa.......", "aaaaaaa.......", ".............."], p: { a: "#ffd54a", A: "#fff2b0", b: "#6fd3ff", B: "#d6f3ff" } };
UIICON.screen = { m: ["...kkkkkkkk...", "...kssssssk...", "...ksssyysk...", "...ksssyysk...", "...kssssssk...", "...kssssssk...", "...ksgssssk...", "...kgggsGsk...", "...kgggGGGk...", "...kggGGGGk...", "...kkkkkkkk...", "...kkkwwkkk...", "...kkkkkkkk...", ".............."], p: { k: "#3b4566", s: "#4aa3e0", y: "#ffe14a", g: "#7fe3a0", G: "#3fb871", w: "#c9d2e6" } };
UIICON.inst = { m: ["......aa......", "......aa......", "....aaaaaa....", ".....aaaa.....", "......aa......", "...kkkkkkkk...", "...kssssssk...", "...kssssssk...", "...kssssssk...", "...kssssssk...", "...kssssssk...", "...kkkkkkkk...", "...kkkwwkkk...", "...kkkkkkkk..."], p: { a: "#7fe3a0", k: "#3b4566", s: "#4aa3e0", w: "#c9d2e6" } };
(function menuIconCss() {
  try {
    if (!document.head || !document.createElement("canvas").toDataURL) return;
    const css = ["set", "friends", "screen", "inst"].map(n => `.ri-${n},span.ri-${n},i.ri-${n}{background-image:url(${pixIcon(n, 16).toDataURL("image/png")})}`).join("");
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  } catch (e) {}
})();

/* ---------- 메뉴 묶음 ---------- */
function grpOf(id) { for (let i = 0; i < MENU_G.length; i++) if (MENU_G[i].tabs.indexOf(id) >= 0) return MENU_G[i]; return MENU_G[1]; }
function menuLabel(id) { const t = TABS.find(x => x[0] === id); return MENU_SUB[id] || (t ? t[1] : id); }
function menuPath(id) { const g = grpOf(id); return g.tabs.length > 1 ? `${g.n} › ${menuLabel(id)}` : menuLabel(id); }
/* 아래 메뉴(묶음 버튼 5개)와 머리띠 작은 메뉴 틀: TABS.forEach 바로 앞에서 한 번 */
function menuBuild() {
  const bar = $("tabs"), head = $("thSeg"); if (!bar) return;
  try { const o = JSON.parse(localStorage.getItem(SAVE_KEY + "-sub") || "{}"); if (o && typeof o === "object") menuUI.last = o; } catch (e) {}
  try { menuUI.setSeen = localStorage.getItem(SAVE_KEY + "-setseen") ? 1 : 0; } catch (e) {}
  MENU_G.forEach(g => {
    const b = document.createElement("button"); b.setAttribute("role", "tab"); b.setAttribute("aria-label", g.n); b.setAttribute("data-g", g.id);
    b.appendChild(pixIcon(g.ic, 32)); const tl = document.createElement("span"); tl.className = "tl"; tl.textContent = g.n; b.appendChild(tl);
    const dot = document.createElement("span"); dot.className = "dot"; dot.hidden = true; b.appendChild(dot);
    b.addEventListener("click", () => menuGo(g.id)); bar.appendChild(b); menuUI.btn[g.id] = b;
    const s = document.createElement("div"); s.className = "th-seg"; s.setAttribute("role", "tablist"); s.setAttribute("aria-label", g.n + " 안 메뉴"); s.setAttribute("data-g", g.id);
    if (head) head.appendChild(s); menuUI.seg[g.id] = s;
  });
  try {
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("beforeinstallprompt", e => { try { e.preventDefault(); } catch (er) {} menuUI.bip = e; menuUI.k.inst = ""; });
      window.addEventListener("appinstalled", () => { menuUI.bip = null; menuUI.k.inst = ""; toast("설치했어요 · 홈 화면의 곽준영키우기 앱으로 열어 주세요"); });
    }
  } catch (e) {}
}
/* 아래 묶음 버튼: 다른 묶음이면 그 묶음에서 마지막으로 본 화면, 같은 묶음이면 맨 위로 */
function menuGo(gid) {
  const g = MENU_G.find(x => x.id === gid); if (!g) return;
  if (grpOf(curTab).id === gid) { selectTab(curTab, true); return; }
  let t = menuUI.last[gid]; if (g.tabs.indexOf(t) < 0 || !tabOpen(t)) t = g.tabs.find(x => tabOpen(x)) || g.tabs[0];
  selectTab(t, true);
}
/* selectTab 에서: 묶음 버튼 표시 · 마지막 화면 기억 */
function menuSel(id) {
  const g = grpOf(id);
  MENU_G.forEach(x => { const b = menuUI.btn[x.id]; if (b) b.setAttribute("aria-selected", x.id === g.id ? "true" : "false"); });
  if (menuUI.last[g.id] !== id) { menuUI.last[g.id] = id; try { localStorage.setItem(SAVE_KEY + "-sub", JSON.stringify(menuUI.last)); } catch (e) {} }
  if (id === "set" && !menuUI.setSeen) { menuUI.setSeen = 1; try { localStorage.setItem(SAVE_KEY + "-setseen", "1"); } catch (e) {} }
}
/* 머리띠: 묶음 안에 열린 화면이 둘 이상이면 작은 메뉴를 보여 줌 */
function menuHead(th) {
  if (!th) return;
  const g = grpOf(curTab), open = g.tabs.filter(t => tabOpen(t)), k = g.id + ":" + open.join(",");
  if (menuUI.hk === k) return; menuUI.hk = k;
  const grp = open.length > 1;
  if (th.classList) th.classList.toggle("grp", grp);
  MENU_G.forEach(x => { const s = menuUI.seg[x.id]; if (s && s.classList) s.classList.toggle("on", grp && x.id === g.id); });
}
/* 묶음 빨간 점: 지금 묶음이 아니고, 안의 화면 하나라도 할 일이 있으면 */
function menuDots() {
  const cg = grpOf(curTab).id;
  MENU_G.forEach(g => {
    const b = menuUI.btn[g.id], d = b && b.querySelector ? b.querySelector(".dot") : null; if (!d) return;
    const on = g.id !== cg && g.tabs.some(t => menuUI.dot[t]); if (d.hidden !== !on) d.hidden = !on;
  });
}
function menuFresh(id) { const b = menuUI.btn[grpOf(id).id]; if (b && b.classList) { b.classList.add("fresh"); setTimeout(() => { if (b.classList) b.classList.remove("fresh"); }, 4000); } }
function menuGuideHTML() {
  return MENU_G.map(g => g.tabs.map(id => { const open = tabOpen(id); return `<div class="mg-row${open ? "" : " lock"}"><span class="mg-ic" data-ic="${open ? id : "lock"}"></span><div><b>${menuPath(id)}</b><small>${open ? TAB_INTRO[id] || "" : TAB_UNLOCK[id].d}</small></div></div>`; }).join("")).join("");
}
/* 시작할 때: 초대 링크로 왔는지, 메뉴가 바뀐 걸 한 번 알려 줄지 */
function menuArrive() {
  try {
    if (typeof location !== "undefined" && /[?&]invite=/.test(location.search || "")) {
      menuUI.invited = isFreshSave(S);
      const q = (location.search || "").replace(/^\?/, "").split("&").filter(x => x && !/^invite=/.test(x)).join("&");
      if (typeof history !== "undefined" && history.replaceState) history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + (location.hash || ""));
    }
  } catch (e) {}
  try {
    if (!localStorage.getItem(SAVE_KEY + "-menu34")) {
      localStorage.setItem(SAVE_KEY + "-menu34", "1");
      if (!isFreshSave(S)) celebrateLater({ ic: "set", title: "메뉴를 다섯 개로 묶었어요", sub: "말씀 › 읽기·암송·공부 · 성장 › 무기·동료·옷장·보물·퇴사<br>소리·화면·알림·친구 초대·로그인·백업은 새 <b>설정</b> 탭에", tone: "gold", ms: 4200, keep: 1 });
    }
  } catch (e) {}
}

/* ---------- 소리 ---------- */
function sfxOn() { return !!S.sound && !S.sfxOff; }
function sndAudible() { return !!S.sound && (S.music !== false || !S.sfxOff); }
function sndLabel() { return !sndAudible() ? "꺼짐" : S.music !== false && !S.sfxOff ? "음악+효과음" : S.music !== false ? "음악만" : "효과음만"; }
function sndVol(k) { const v = S.vol && typeof S.vol === "object" ? +S.vol[k] : NaN; return v >= 0 && v <= 1 ? v : 1; }
function sndApply() {
  try {
    if (!audioCtx) return; const now = audioCtx.currentTime;
    if (sfxGain) sfxGain.gain.setTargetAtTime(0.9 * sndVol("s"), now, 0.03);
    if (bgmGain && bgm && bgm.theme >= 0) bgmGain.gain.setTargetAtTime(BGM_VOL * sndVol("m"), now, 0.08);
  } catch (e) {}
}
function sndChanged() { if (S.sound) audioReady(); sndApply(); bgmUpdate(); renderBuffs(); menuUI.k.snd = ""; updateUI(true); save(); }
/* 위쪽 스피커 버튼: 소리 전체 끄기/켜기 (음악·효과음 따로는 설정 탭) */
function sndQuick() {
  if (sndAudible()) S.sound = false;
  else { S.sound = true; if (S.music === false && S.sfxOff) { S.music = true; S.sfxOff = false; } }
  sndChanged();
  toast(S.sound ? `소리 켜짐 · ${sndLabel()}` : "소리 꺼짐 · 음악·효과음은 설정 탭에서 따로 정해요");
}

/* ---------- 설정 탭 ---------- */
function stSw(id, act, label) { return `<button type="button" class="stg-sw" id="${id}" data-act="${act}" role="switch" aria-checked="false" aria-label="${label}"><em class="sw"></em></button>`; }
function stIcon(id, ic) { const e = $(id); if (e && !e.firstChild) e.appendChild(pixIcon(ic, 28)); }
function stFill(inp, v) { try { if (inp && inp.style && inp.style.setProperty) inp.style.setProperty("--p", v + "%"); } catch (e) {} }
function rdFs() { const v = +S.rdfs; return v >= 14 && v <= 28 ? v : 18; }
function buildSetCards() {
  buildInstCard(); buildSndCard(); buildScrCard(); buildNotiCard(); buildInvCard();
  buildAcctCard();
}
function buildSetFoot() { const p = el("p", "stg-ver muted", `곽준영 키우기 v${GAME_V} · 새 버전은 앱을 다시 열면 바뀌어요`); panels.set.appendChild(p); }

/* 앱으로 설치: 브라우저에서 열었을 때만 (설치한 앱·미리보기 창에서는 숨김) */
function menuInstallable() { if (menuUI.inst == null) { try { menuUI.inst = typeof navigator !== "undefined" && !notiStandalone() && !cloudFramed(); } catch (e) { menuUI.inst = false; } } return menuUI.inst; }
function instPlat() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "", kakao = /KAKAOTALK/i.test(ua);
  return { ios: notiIOS(), and: /Android/i.test(ua), kakao, inapp: kakao || /Instagram|FBAN|FBAV|FB_IAB|Line\/|NAVER\(inapp|DaumApps|everytimeApp|BAND\//i.test(ua) };
}
function instHTML() {
  const P = instPlat(); let steps, btn = "";
  if (P.inapp) {
    steps = [`지금은 ${P.kakao ? "카카오톡" : "다른 앱"} 안의 브라우저예요`, P.ios ? "Safari로 열어 주세요 (아래 버튼, 또는 ⋯ 메뉴 → 다른 브라우저로 열기)" : "Chrome으로 열어 주세요 (아래 버튼, 또는 ⋮ 메뉴 → 다른 브라우저로 열기)", "열린 브라우저에서 '홈 화면에 추가'"];
    if (P.kakao || P.and) btn = `<button type="button" class="buy" data-act="ext"><span class="act">${P.ios ? "Safari로 열기" : "Chrome으로 열기"}</span></button>`;
  } else if (P.ios) steps = ["아래쪽(또는 주소창 옆) 공유 버튼을 눌러요", "'홈 화면에 추가' → 오른쪽 위 '추가'", "홈 화면에 생긴 곽준영키우기 앱으로 열어요"];
  else if (menuUI.bip) { steps = ["아래 버튼을 누르고 '설치'", "홈 화면에 생긴 앱으로 열어요"]; btn = `<button type="button" class="buy" data-act="bip"><span class="act">앱 설치하기</span></button>`; }
  else if (P.and) steps = ["Chrome 오른쪽 위 ⋮ 메뉴를 눌러요", "'홈 화면에 추가' 또는 '앱 설치'", "홈 화면에 생긴 앱으로 열어요"];
  else steps = ["주소창 오른쪽의 설치 아이콘을 눌러요", "없으면 브라우저 메뉴에서 '앱 설치' 또는 '홈 화면에 추가'"];
  return `<ol class="inst-steps">${steps.map(s => `<li>${s}</li>`).join("")}</ol>${btn}<p class="muted">브라우저에서 한 기록은 설치한 앱으로 저절로 옮겨지지 않아요. 아이디로 로그인해 두면 어디서든 같은 기록으로 이어져요.</p>`;
}
function instOpenExt() {
  try {
    const P = instPlat();
    if (P.kakao) { location.href = "kakaotalk://web/openExternal?url=" + encodeURIComponent(APP_URL); return; }
    if (P.and) { location.href = "intent://" + APP_URL.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;end"; return; }
  } catch (e) {}
  toast("오른쪽 위 메뉴에서 '다른 브라우저로 열기'를 눌러 주세요");
}
function instPrompt() {
  const b = menuUI.bip; if (!b || !b.prompt) { toast("브라우저 메뉴에서 '앱 설치'를 눌러 주세요"); return; }
  try { b.prompt(); Promise.resolve(b.userChoice).then(r => { if (r && r.outcome === "accepted") toast("설치했어요 · 홈 화면의 앱으로 열어 주세요"); menuUI.bip = null; menuUI.k.inst = ""; updateUI(true); }, () => {}); } catch (e) {}
}
function buildInstCard() {
  const card = el("div", "card stg inst"); card.hidden = true;
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stInsIc"></span><div><b>앱으로 설치</b><small>홈 화면에 추가하면 앱처럼 열리고 말씀 알림도 받을 수 있어요</small></div></div><div id="stInsBody"></div>`;
  panels.set.appendChild(card); stIcon("stInsIc", "inst");
  updaters.set.push({
    update() {
      const on = menuInstallable(); if (card.hidden !== !on) card.hidden = !on; if (!on) return;
      const k = menuUI.bip ? "b" : "-"; if (menuUI.k.inst === k) return; menuUI.k.inst = k;
      const b = $("stInsBody"); if (b) b.innerHTML = instHTML();
    },
    ready: () => !menuUI.setSeen && menuInstallable(),
  });
  card.addEventListener("click", e => { const b = hbBtn(e, card); if (!b || !b.dataset) return; if (b.dataset.act === "ext") instOpenExt(); else if (b.dataset.act === "bip") instPrompt(); });
}

/* 소리: 전체 · 배경 음악 · 효과음 (켜고 끄기 + 크기) */
function buildSndCard() {
  const card = el("div", "card stg snd");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stSndIc"></span><div><b>소리</b><small id="stSndSub"></small></div>${stSw("stSnd", "snd", "소리 전체")}</div>
    <div class="stg-rows" id="stSndRows">
      <div class="stg-row"><span class="stg-l">배경 음악</span><input type="range" id="stVm" min="0" max="100" step="10" aria-label="배경 음악 크기"><b class="stg-v num" id="stVmV"></b>${stSw("stMus", "mus", "배경 음악")}</div>
      <div class="stg-row"><span class="stg-l">효과음</span><input type="range" id="stVs" min="0" max="100" step="10" aria-label="효과음 크기"><b class="stg-v num" id="stVsV"></b>${stSw("stSfx", "sfx", "효과음")}</div>
    </div>
    <p class="muted">아이폰 무음 모드에서도 소리가 나요. 맨 위 스피커 버튼을 누르면 한 번에 끄고 켜요.</p>`;
  addCustom("set", card, sndRender); stIcon("stSndIc", "music");
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset) return; const a = b.dataset.act;
    if (a === "snd") { S.sound = !S.sound; if (S.sound && S.music === false && S.sfxOff) { S.music = true; S.sfxOff = false; } }
    else if (a === "mus") { S.music = S.music === false; if (S.music) S.sound = true; }
    else if (a === "sfx") { S.sfxOff = !S.sfxOff; if (!S.sfxOff) S.sound = true; }
    else return;
    sndChanged();
    if (a === "sfx" && sfxOn()) sfx("coin");
  });
  const onRange = (e, fin) => {
    const t = e && e.target; if (!t || (t.id !== "stVm" && t.id !== "stVs")) return;
    const k = t.id === "stVm" ? "m" : "s", v = Math.max(0, Math.min(100, Math.round(+t.value || 0)));
    if (!S.vol || typeof S.vol !== "object") S.vol = { m: 1, s: 1 };
    S.vol[k] = v / 100; sndApply();
    const lb = $(t.id + "V"); if (lb) lb.textContent = v; stFill(t, v);
    if (k === "s") sfx("tick");
    if (fin) { menuUI.k.snd = ""; save(); }
  };
  card.addEventListener("input", e => onRange(e, false));
  card.addEventListener("change", e => onRange(e, true));
}
function sndRender() {
  const k = [S.sound ? 1 : 0, S.music !== false ? 1 : 0, S.sfxOff ? 0 : 1, sndVol("m"), sndVol("s")].join("|");
  if (menuUI.k.snd === k) return; menuUI.k.snd = k;
  const sw = (id, on) => { const b = $(id); if (b) b.setAttribute("aria-checked", on ? "true" : "false"); };
  sw("stSnd", !!S.sound); sw("stMus", S.music !== false); sw("stSfx", !S.sfxOff);
  const rows = $("stSndRows"); if (rows && rows.classList) rows.classList.toggle("off", !S.sound);
  [["stVm", "m"], ["stVs", "s"]].forEach(([id, kk]) => { const v = Math.round(sndVol(kk) * 100), inp = $(id), lb = $(id + "V"); if (inp && document.activeElement !== inp && +inp.value !== v) inp.value = String(v); if (lb) lb.textContent = v; stFill(inp, v); });
  const sub = $("stSndSub"); if (sub) sub.textContent = sndAudible() ? `${sndLabel()} 켜짐` : S.sound ? "음악과 효과음이 모두 꺼져 있어요" : "꺼져 있어요 · 스위치를 켜면 다시 나요";
}

/* 화면: 흔들림 · 번쩍임 · 말씀 본문 글자 크기 */
function buildScrCard() {
  const card = el("div", "card stg fxset scr");
  const seg = (id, lbl) => `<div class="fx-row"><span>${lbl}</span><div class="seg" role="group" aria-label="${lbl}">${[[1, "기본"], [0.5, "약하게"], [0, "끄기"]].map(([v, n]) => `<button type="button" data-fx="${id}" data-v="${v}" aria-pressed="false">${n}</button>`).join("")}</div></div>`;
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stScrIc"></span><div><b>화면</b><small>흔들림 · 번쩍임 · 말씀 본문 글자 크기</small></div></div>`
    + seg("shake", "화면 흔들림") + seg("flash", "번쩍임")
    + `<div class="fx-row"><span>말씀 글자</span><div class="stg-fs"><button type="button" class="btn" data-act="fs-" aria-label="말씀 글자 작게">가−</button><b class="num" id="stFs"></b><button type="button" class="btn" data-act="fs+" aria-label="말씀 글자 크게">가+</button></div></div>
    <p class="stg-pv" id="stFsPv">태초에 하나님이 천지를 창조하시니라</p>
    <p class="muted" id="stFxNote"></p>`;
  const fxBtns = []; card.querySelectorAll("button").forEach(b => { if (b.dataset && b.dataset.fx) fxBtns.push(b); });
  addCustom("set", card, () => {
    const f = fxSet(), fs = rdFs(), k = [f.shake, f.flash, fs].join("|"); if (menuUI.k.scr === k) return; menuUI.k.scr = k;
    fxBtns.forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === +f[b.dataset.fx])));
    const n = $("stFs"); if (n) n.textContent = fs;
    const pv = $("stFsPv"); if (pv && pv.style) pv.style.fontSize = fs + "px";
    const note = $("stFxNote"); if (note) note.textContent = (reduceMotion ? "휴대폰의 '동작 줄이기'가 켜져 있어 흔들림은 꺼져 있어요. " : "휴대폰의 '동작 줄이기'를 켜면 흔들림이 저절로 꺼져요. ") + "번쩍임은 1초에 3번까지, 화면 가운데 일부에만 나오고 빨간 화면 전체 번쩍임은 쓰지 않아요.";
  });
  stIcon("stScrIc", "screen");
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset) return;
    if (b.dataset.fx) fxSet()[b.dataset.fx] = +b.dataset.v;
    else if (b.dataset.act === "fs-" || b.dataset.act === "fs+") { S.rdfs = Math.max(14, Math.min(28, rdFs() + (b.dataset.act === "fs+" ? 2 : -2))); const rb = $("rdBody"); if (rb && rb.style) rb.style.fontSize = S.rdfs + "px"; }
    else return;
    menuUI.k.scr = ""; updateUI(true); save();
  });
}

/* 말씀 알림: 지금 상태 + 말씀 › 읽을 때와 곳으로 */
function buildNotiCard() {
  const card = el("div", "card stg noti");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stNoIc"></span><div><b>말씀 알림</b><small>정한 시각에 아직 안 읽었으면 알려 줘요</small></div></div><div id="stNoBody"></div>`;
  addCustom("set", card, () => {
    const I = iiState(), why = I.push ? "" : notiWhy(), k = [I.on, I.push, I.t, I.t2, I.days, I.cue, I.where, why].join("|");
    if (menuUI.k.noti === k) return; menuUI.k.noti = k;
    const box = $("stNoBody"); if (!box) return;
    const st = !I.on ? "아직 읽을 때를 정하지 않았어요" : I.push ? "알림 켜짐" : "알림 꺼짐";
    box.innerHTML = `<div class="stg-st${I.on && I.push ? " on" : ""}">${ri("bell")}<span><b>${st}</b>${I.on ? `<small>${escapeHtml(iiSentence(I))}</small>` : ""}${why ? `<small>${escapeHtml(why)}</small>` : ""}</span></div>
      <button type="button" class="btn" data-act="noti">${I.on ? "말씀 › 읽을 때와 곳에서 바꾸기" : "말씀 › 읽을 때와 곳에서 정하기"} ›</button>`;
  });
  stIcon("stNoIc", "bell");
  card.addEventListener("click", e => { const b = hbBtn(e, card); if (b && b.dataset && b.dataset.act === "noti") { selectTab("bible", true); measGoAt(".iip"); } });
}

/* 친구 초대: 보내기(공유) · 복사 · QR */
function invUrl() { return APP_URL + "?invite=1"; }
function buildInvCard() {
  const card = el("div", "card stg inv"), short = APP_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stInvIc"></span><div><b>친구 초대</b><small>링크를 받은 친구도 자기 기록으로 같이 키워요</small></div></div>
    <button type="button" class="inv-url" data-act="copy" aria-label="초대 링크 복사"><span class="num">${short}</span><small>복사</small></button>
    <input type="text" class="inv-in" id="stInvIn" readonly hidden aria-label="초대 링크">
    <div class="row-btns"><button type="button" class="buy" data-act="share"><span class="act">초대 링크 보내기</span></button><button type="button" class="btn" data-act="qr" id="stQrBtn" aria-expanded="false">QR 코드</button></div>
    <div class="inv-qr" id="stQr" hidden><canvas id="stQrCv" width="1" height="1" role="img" aria-label="초대 링크 QR 코드"></canvas><small>친구 휴대폰 카메라로 찍으면 바로 열려요</small></div>
    <p class="muted">친구는 받은 링크를 Safari나 Chrome으로 열고 '홈 화면에 추가'하면 앱처럼 쓸 수 있어요. 기록은 사람마다 따로 쌓여요.</p>`;
  panels.set.appendChild(card); stIcon("stInvIc", "friends");
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset) return; const a = b.dataset.act;
    if (a === "share") invShare(); else if (a === "copy") invCopy(false); else if (a === "qr") invQr();
  });
}
function invShare() {
  const data = { title: "곽준영 키우기", text: INV_TEXT, url: invUrl() };
  try {
    if (typeof navigator !== "undefined" && navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      navigator.share(data).then(() => {}, e => { if (!(e && e.name === "AbortError")) invCopy(true); });
      return;
    }
  } catch (e) {}
  invCopy(true);
}
function invCopy(withText) {
  const url = invUrl(), txt = withText ? `${INV_TEXT}\n${url}` : url;
  const done = () => toast(withText ? "초대 문구와 링크를 복사했어요 · 카톡이나 문자에 붙여 넣어 보내 주세요" : "초대 링크를 복사했어요");
  const manual = () => {
    let ok = false;
    try {
      const ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, txt.length); ok = !!(document.execCommand && document.execCommand("copy")); ta.remove();
    } catch (e) {}
    if (ok) { done(); return; }
    const inp = $("stInvIn"); if (inp) { inp.hidden = false; inp.value = url; try { inp.focus(); inp.select(); inp.setSelectionRange(0, url.length); } catch (e) {} }
    toast("링크를 길게 눌러 복사해 주세요");
  };
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, manual); return; } } catch (e) {}
  manual();
}
function invQr() {
  const box = $("stQr"), btn = $("stQrBtn"), cv = $("stQrCv"); if (!box) return;
  const show = !!box.hidden;
  if (show && cv && !cv._done) cv._done = qrDraw(cv, invUrl());
  box.hidden = !show;
  if (btn) { btn.setAttribute("aria-expanded", show ? "true" : "false"); btn.textContent = show ? "QR 닫기" : "QR 코드"; }
}
/* QR 그리기: 모듈 한 칸을 정수 픽셀로 (흐리지 않게), 둘레 4칸 흰 여백 */
function qrDraw(cv, text) {
  try {
    const M = qrMatrix(text); if (!M || !cv.getContext) return false;
    const n = M.length, q = 4, tot = n + q * 2, d = uiDpr(), u = Math.max(2, Math.floor(184 * d / tot));
    cv.width = cv.height = tot * u; if (cv.style) cv.style.width = cv.style.height = (tot * u / d) + "px";
    const g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, tot * u, tot * u); g.fillStyle = "#000";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (M[y][x]) g.fillRect((x + q) * u, (y + q) * u, u, u);
    return true;
  } catch (e) { return false; }
}
/* 첫 출근 카드: 브라우저에서 처음 왔으면 설치 안내 한 줄 */
function backInstNote(a) {
  const e = $("backInst"); if (!e) return;
  const on = !a && attTotal() === 0 && menuInstallable();
  if (e.hidden !== !on) e.hidden = !on;
}
