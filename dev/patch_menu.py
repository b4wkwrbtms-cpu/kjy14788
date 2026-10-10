"""v34: 메뉴 묶기(아래 10개 → 5개) · 설정 탭(소리·화면·알림·초대·계정·백업) · 친구 초대 링크·QR (patch_meas 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('</style>', open('css_menu.css', encoding='utf-8').read() + '</style>', 1)
rep('/* ===================== 탭 ===================== */',
    open('part_menu.js', encoding='utf-8').read() + '\n' + open('qr_core.js', encoding='utf-8').read()
    + '\n/* ===================== 탭 ===================== */')
rep('var GAME_V = 32;', 'var GAME_V = 34;')

# ---- 화면 틀: 머리띠 작은 메뉴 자리 · 첫 출근 카드 설치 안내 ----
rep('<div class="tab-head" id="tabHead"><span class="th-ic" id="thIc"></span>',
    '<div class="tab-head" id="tabHead"><div class="th-segs" id="thSeg"></div><span class="th-ic" id="thIc"></span>')
rep('    <button class="buy back-go" id="backGo" type="button"></button>\n',
    '    <button class="buy back-go" id="backGo" type="button"></button>\n'
    '    <p class="back-inst" id="backInst" hidden>홈 화면에 추가하면 앱처럼 쓸 수 있어요 · 아래 <b>설정</b> › 앱으로 설치</p>\n')

# ---- 탭: 안쪽 화면 11개(설정 추가), 버튼은 머리띠 작은 메뉴로 · 아래 메뉴는 묶음 5개 ----
rep('const TABS = [["weapon", "무기"], ["bible", "말씀"], ["mem", "암송"], ["study", "공부"], ["pet", "동료"], ["suit", "옷장"], ["treasure", "보물"], ["daily", "업무"], ["info", "정보"], ["retire", "퇴사"]];',
    'const TABS = [["weapon", "무기"], ["bible", "말씀"], ["mem", "암송"], ["study", "공부"], ["pet", "동료"], ["suit", "옷장"], ["treasure", "보물"], ["daily", "업무"], ["info", "정보"], ["retire", "퇴사"], ["set", "설정"]];')
rep('''const panels = {}, tabBtns = {}, updaters = {};
TABS.forEach(([id, label]) => {
  const b = document.createElement("button"); b.setAttribute("role", "tab"); b.setAttribute("aria-label", label);
  b.appendChild(pixIcon(id, 30)); const tl = document.createElement("span"); tl.className = "tl"; tl.textContent = label; b.appendChild(tl);
  const dot = document.createElement("span"); dot.className = "dot"; dot.hidden = true; b.appendChild(dot);
  b.addEventListener("click", () => selectTab(id, true)); $("tabs").appendChild(b); tabBtns[id] = b;''',
'''const panels = {}, tabBtns = {}, updaters = {};
menuBuild();
TABS.forEach(([id, label]) => {
  const b = document.createElement("button"); b.setAttribute("role", "tab"); b.setAttribute("aria-label", menuPath(id)); b.setAttribute("data-t", id);
  b.appendChild(pixIcon(id, 18)); const tl = document.createElement("span"); tl.className = "tl"; tl.textContent = MENU_SUB[id] || label; b.appendChild(tl);
  const dot = document.createElement("span"); dot.className = "dot"; dot.hidden = true; b.appendChild(dot);
  b.addEventListener("click", () => selectTab(id, true)); (menuUI.seg[grpOf(id).id] || $("tabs")).appendChild(b); tabBtns[id] = b;''')
rep('''  TABS.forEach(([t]) => { tabBtns[t].setAttribute("aria-selected", t === id); panels[t].hidden = t !== id; });
  try { localStorage.setItem(SAVE_KEY + "-tab", id); } catch (e) {}''',
'''  TABS.forEach(([t]) => { tabBtns[t].setAttribute("aria-selected", t === id); panels[t].hidden = t !== id; });
  menuSel(id);
  try { localStorage.setItem(SAVE_KEY + "-tab", id); } catch (e) {}''')
rep('''function renderTabHead() {
  const th = $("tabHead"); if (!th) return;
''', '''function renderTabHead() {
  const th = $("tabHead"); if (!th) return;
  menuHead(th);
''')
rep('''  info: ["인사 기록·말씀 상태판·경제·도감·백업", ''', '''  info: ["인사 기록·말씀 상태판·경제·도감", ''')
rep('''};
let thTab = "", thCur = "";''', '''  set: ["소리·화면·알림·친구 초대·계정·백업", () => ""],
};
let thTab = "", thCur = "";''')
rep('''  info: "인사 기록과 내 기록, 말씀 상태판(지표·월간 점검·보상 끄기 주간), 이번 주 경제, 도감, 화면 설정, 백업이 있어요.",''',
    '''  info: "인사 기록과 내 기록, 말씀 상태판(지표·월간 점검·보상 끄기 주간), 이번 주 경제, 도감, 안내 다시 보기가 있어요.",''')
rep('''};
var GR_GUIDE = [''', '''  set: "소리(배경 음악·효과음 크기), 화면(흔들림·번쩍임·말씀 글자 크기), 말씀 알림, 친구 초대 링크·QR, 아이디 로그인, 기록 백업이 있어요. 브라우저에서 열었다면 앱으로 설치하는 방법도 여기 있어요.",
};
var GR_GUIDE = [''')
# 탭 차례로 열기: 묶음 버튼도 반짝, 안내에 '묶음 › 화면', 아래 메뉴 칸 수는 5로 고정
rep('''      celebrateLater({ ic: id, title: `새 메뉴가 열렸어요 · ${label}`, sub: TAB_INTRO[id] || "", tone: "gold", sound: "pass", ms: 2800 });''',
    '''      menuFresh(id); celebrateLater({ ic: id, title: `새 메뉴가 열렸어요 · ${menuPath(id)}`, sub: TAB_INTRO[id] || "", tone: "gold", sound: "pass", ms: 2800 });''')
rep('''  if (n !== tabCols) { tabCols = n; const tb = $("tabs"); if (tb && tb.style) tb.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`; }\n''', '')
rep('${GR_GUIDE.concat(FEST_GUIDE).concat(MEAS_GUIDE).map', '${MENU_GUIDE.concat(GR_GUIDE).concat(FEST_GUIDE).concat(MEAS_GUIDE).map')
rep('''    box.innerHTML = TABS.map(([id, label]) => { const open = tabOpen(id); return `<div class="mg-row${open ? "" : " lock"}"><span class="mg-ic" data-ic="${open ? id : "lock"}"></span><div><b>${label}</b><small>${open ? TAB_INTRO[id] || "" : TAB_UNLOCK[id].d}</small></div></div>`; }).join("");''',
    '''    box.innerHTML = menuGuideHTML();''')
# 빨간 점: 묶음 버튼은 안의 화면 점을 모아서
rep('''    tabBtns[id].querySelector(".dot").hidden = !any || id === curTab;
  });
}''', '''    tabBtns[id].querySelector(".dot").hidden = !any || id === curTab; menuUI.dot[id] = any && tabOpen(id);
  });
  menuDots();
}''')

# ---- 소리: 위쪽 스피커는 전체 끄기/켜기, 효과음 따로 끄기, 크기 ----
rep('''soundBtn.addEventListener("click", () => { if (S.sound && S.music !== false) S.music = false; else if (S.sound) S.sound = false; else { S.sound = true; S.music = true; } if (S.sound) audioReady(); bgmUpdate(); renderBuffs(); save(); toast(!S.sound ? "소리 꺼짐" : S.music === false ? "효과음만 켜짐" : "음악과 효과음 켜짐"); });
soundBtn.setAttribute("aria-label", "소리 설정");''',
'''soundBtn.addEventListener("click", sndQuick);
soundBtn.setAttribute("aria-label", "소리 켜고 끄기 (음악·효과음 따로는 설정 탭)");''')
rep('''  const sm = !S.sound ? "mute" : S.music === false ? "sound" : "music";
  if (soundBtn.dataset.st !== sm) {
    soundBtn.dataset.st = sm;''', '''  const sm = !sndAudible() ? "mute" : musicOn() ? "music" : "sound", smk = sm + sndLabel();
  if (soundBtn.dataset.st !== smk) {
    soundBtn.dataset.st = smk;''')
rep('''    soundBtn.querySelector("small").textContent = sm === "mute" ? "꺼짐" : sm === "sound" ? "효과음만" : "음악+효과음";
  }
  soundBtn.classList.toggle("on", !!S.sound);''', '''    soundBtn.querySelector("small").textContent = sndLabel();
  }
  soundBtn.classList.toggle("on", sndAudible());''')
rep('if (!S.sound || !audioCtx', 'if (!sfxOn() || !audioCtx', 3)
rep('sfxGain = audioCtx.createGain(); sfxGain.gain.value = 0.9;', 'sfxGain = audioCtx.createGain(); sfxGain.gain.value = 0.9 * sndVol("s");')
rep('  bgmGain.gain.setTargetAtTime(BGM_VOL, now + 0.5, 0.35);', '  bgmGain.gain.setTargetAtTime(BGM_VOL * sndVol("m"), now + 0.5, 0.35);')

# ---- 계정·백업·화면 설정은 설정 탭으로 ----
rep('''  buildCareerCard();
  buildAcctCard();
''', '''  buildCareerCard();
''')
rep('  addCustom("info", card, renderAcct);', '  addCustom("set", card, renderAcct);')
rep('function goLogin() { backHide(); selectTab("info", true);', 'function goLogin() { backHide(); selectTab("set", true);')
rep('''  buildFxCard();
  secTitle("info", "기록 백업", "다른 기기나 앱으로 옮길 때");
  const card = el("div", "card");
  card.innerHTML = `<p class="muted">백업 코드를''', '''  buildSetCards();
  const card = el("div", "card stg");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="bkIc"></span><div><b>기록 백업</b><small>다른 기기나 앱으로 옮길 때</small></div></div><p class="muted">백업 코드를''')
rep('''  panels.info.appendChild(card);
  const encode = o =>''', '''  panels.set.appendChild(card); stIcon("bkIc", "scroll");
  const encode = o =>''')
rep('''/* ---------- 퇴사 탭 ---------- */''', '''buildSetFoot();

/* ---------- 퇴사 탭 ---------- */''')
rep('알림은 정보 탭에서 아이디로 로그인한 뒤에 켤 수 있어요', '알림은 설정 탭에서 아이디로 로그인한 뒤에 켤 수 있어요')

# ---- 시작 · 첫 출근 카드: 초대로 왔는지, 설치 안내 ----
rep('''  cloud.base = S.t;
  rollDay(); habitGuard(); wardTick(false);
''', '''  cloud.base = S.t;
  rollDay(); habitGuard(); wardTick(false);
  menuArrive();
''')
rep('T = fresh ? "첫 출근을 환영해요!" : "출근부가 생겼어요!";', 'T = fresh ? (menuUI.invited ? "초대받아 오셨군요!" : "첫 출근을 환영해요!") : "출근부가 생겼어요!";')
rep('''  const bl = $("backLogin"); if (bl) bl.hidden = !(!a && typeof cloudOn === "function" && cloudOn() && !acctGet() && isFreshSave(S));''',
    '''  const bl = $("backLogin"); if (bl) bl.hidden = !(!a && typeof cloudOn === "function" && cloudOn() && !acctGet() && isFreshSave(S));
  backInstNote(a);''')

# 강화 도구 줄: 도구 없는 탭에 갔다가 돌아오면 비어 있던 버그 (기억해 둔 열쇠도 지움)
rep('  if (!on) { if (toolsTab) { box.innerHTML = ""; toolsTab = ""; } return; }', '  if (!on) { if (toolsTab) { box.innerHTML = ""; toolsTab = ""; box._k = ""; } return; }')

open(P, 'w', encoding='utf-8').write(s)
print('patch_menu ok', len(s))
