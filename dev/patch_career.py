"""승진·직무 + 전설 무기 바로 해금 패치 (patch_att, patch_plan, patch_cloud 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:140]); sys.exit(1)
    s = s.replace(old, new)

# CSS
rep('</style>', open('css_career.css', encoding='utf-8').read() + '</style>', 1)
# 전투 화면: 캔버스를 감싸 직무 스킬 버튼을 위에 올림
rep('<canvas id="cv" width="900" height="600" aria-label="화면을 눌러 공격"></canvas>',
    '<div class="cvw"><canvas id="cv" width="900" height="600" aria-label="화면을 눌러 공격"></canvas><div class="jobsk" id="jobSk" hidden></div></div>')
# 직무 고르기 팝업
rep('<div id="reader" class="reader" hidden role="dialog" aria-label="성경 읽기">', '''<div id="jobPick" class="jp" hidden role="dialog" aria-modal="true" aria-labelledby="jpT">
  <div class="jp-card">
    <div class="jp-hd"><b id="jpT">어느 팀으로 갈까요?</b><small id="jpS"></small></div>
    <div class="jp-list" id="jpList"></div>
    <button class="buy jp-go" id="jpGo" type="button" disabled><span class="act">팀을 하나 골라 주세요</span></button>
    <button class="back-link" id="jpLater" type="button">나중에 고를게요</button>
  </div>
</div>
<div id="reader" class="reader" hidden role="dialog" aria-label="성경 읽기">''')
# 저장값
rep('    promo: false, sneakerUntil: 0, retires: 0, totalKills: 0, bossKills: 0,',
    '    promo: false, sneakerUntil: 0, retires: 0, totalKills: 0, bossKills: 0, rank: 0, rankAsk: 0, jobs: [], job: "",')
rep('''  if (s.away && typeof s.away !== "object") s.away = null;
  return s;''', '''  if (s.away && typeof s.away !== "object") s.away = null;
  s.rank = Math.max(0, Math.min(9, Math.floor(+d.rank || 0))); s.rankAsk = Math.max(0, Math.floor(+d.rankAsk || 0));
  s.jobs = Array.isArray(d.jobs) ? d.jobs.filter((x, i, a) => ["sales", "dev", "plan", "hr"].indexOf(x) >= 0 && a.indexOf(x) === i).slice(0, 4) : [];
  s.job = s.jobs.indexOf(d.job) >= 0 ? d.job : (s.jobs[0] || "");
  return s;''')
# 능력치: 직급·직무
rep('  const atk = wp * add * mul;', '  const atk = wp * add * mul * careerAtk();')
rep('(skillOn("rush") ? 2 : 1);', '(skillOn("rush") ? 2 : 1) * careerAps();')
rep('Math.min(1, 0.05 + (own("tie", 0) ? 0.25 : 0))', 'Math.min(1, 0.05 + (own("tie", 0) ? 0.25 : 0) + careerCrit())')
rep('  const critMul = 1.5 + 3 * legLv("tie") + (L >= 2 ? 3.5 : 0);', '  const critMul = (1.5 + 3 * legLv("tie") + (L >= 2 ? 3.5 : 0)) * careerCritMul();')
rep('  const clone = cl ? heroDps * (0.3 + 0.1 * cl) * (cl >= 10 ? 2 : 1) : 0;', '  const clone = cl ? heroDps * (0.3 + 0.1 * cl) * (cl >= 10 ? 2 : 1) * careerPet() : 0;')
rep('  const cat = petLv("cat") ? atk * (1.5 + 0.5 * petLv("cat")) / 2.5 * 1.4 : 0;', '  const cat = petLv("cat") ? atk * (1.5 + 0.5 * petLv("cat")) / 2.5 * 1.4 * careerPet() : 0;')
rep('  const bossBonus = own("tie", 1) ? 2 : 1;', '  const bossBonus = (own("tie", 1) ? 2 : 1) * careerBoss();')
rep('(S.active.gold2 > 0 ? 2 : 1) * (S.promo ? 4 : 1);', '(S.active.gold2 > 0 ? 2 : 1) * (S.promo ? 4 : 1) * careerGold();')
rep('const bossTimeOf = kind => TIME_LIMIT[kind] ? TIME_LIMIT[kind] + treVal("pin") : 0;', 'const bossTimeOf = kind => TIME_LIMIT[kind] ? TIME_LIMIT[kind] + treVal("pin") + careerBossTime() : 0;')
# 피해: 동료 2배(인사), 약점·발령·인주 자국, 원거리 직무는 칼 궤적 없이
rep('  if ((src === "pet" || src === "clone") && skillOn("party")) amount *= 3;',
    '  if ((src === "pet" || src === "clone") && skillOn("party")) amount *= 3;\n  if (src === "pet" || src === "clone") amount *= careerPet();\n  amount *= careerTaken();')
rep('  const heavy = src === "hero" || src === "tap";', '  const heavy = src === "hero" || src === "tap" || src === "jhero";')
rep('    addSlash(ty, crit);', '    if (src !== "jhero") addSlash(ty, crit);')
# 기본 공격
rep('''function heroStrike(st) {
  const crit = Math.random() < st.crit;
  hit(st.atk * (crit ? st.critMul : 1), crit, "hero");''', '''function heroStrike(st) {
  const crit = Math.random() < st.crit;
  if (!jobStrike(st, crit)) hit(st.atk * (crit ? st.critMul : 1), crit, "hero");''')
# 그리기
rep('  reflect(() => drawSprite(ctx, look.map, look.pal, hx, hy - (look.top || 0) * hs, hs, { pretty: true }));',
    '  drawJobAura(t, hx, hy);\n  reflect(() => drawSprite(ctx, look.map, look.pal, hx, hy - (look.top || 0) * hs, hs, { pretty: true }));')
rep('  drawHeldWeapon(ctx, px, py, ang, WS, t, false);\n', '  drawHeldWeapon(ctx, px, py, ang, WS, t, false); heroHand.x = px; heroHand.y = py;\n')
rep('  drawSkillFx(t); drawCoins();', '  drawSkillFx(t); drawJobFx(t); drawCoins();')
rep('drawImpactFrame(); drawScreenFlash();', 'drawImpactFrame(); drawScreenFlash(); drawJobUi(t);')
rep('step(gdt); skillPhys(gdt); draw(now);', 'step(gdt); skillPhys(gdt); jobPhys(gdt); draw(now);')
# 스킬: 자동 사용·버튼
rep('''    if (castSkill(s, true)) break;   // 한 번에 하나씩
  }
}''', '''    if (castSkill(s, true)) return;   // 한 번에 하나씩
  }
  jobSkillAuto();
}''')
rep('auto.disabled = !SKILLS.some(skillUnlocked); }', 'auto.disabled = !SKILLS.some(skillUnlocked) && !curJob(); }')
rep('function renderSkills() {\n', 'function renderSkills() {\n  renderJobSkills();\n')
# 정보 탭 맨 위: 인사 기록
part = open('part_career.js', encoding='utf-8').read()
rep('/* ---------- 정보 탭 ---------- */\n(() => {\n  buildAcctCard();',
    part + '\n/* ---------- 정보 탭 ---------- */\n(() => {\n  buildCareerCard();\n  buildAcctCard();')
rep('  info: ["내 기록·캐릭터·도감·백업", () => ""],', '  info: ["인사 기록·내 기록·도감·백업", () => `<span>${rankName()}${curJob() ? " · " + curJob().team : ""}</span>`],')
rep('["퇴사 횟수", S.retires + "회"],', '["직급", rankName() + (curJob() ? " · " + curJob().n : "")], ["퇴사 횟수", S.retires + "회"],')
rep('곽준영의 <b>${S.retires + 1}번째 회사</b>', '${heroTitle()}의 <b>${S.retires + 1}번째 회사</b>', 2)
# 인사·총무: 자리 비운 동안 월급 +50%
rep('    r = simulateOffline(sec);\n', '    r = simulateOffline(sec); if (r && r.gold) r.gold *= careerAway();\n')
# 승진 심사 알림
rep('  planDailyCheck();\n  refreshCostumes(true);', '  planDailyCheck(); careerTick();\n  refreshCostumes(true);')

# ---------- 전설 무기: 잠김 버튼에서 바로 해금 ----------
rep('      const locked = nw.leg && !S.legUnlock[n - LEG_START];\n      b.className = "buy num" + (nw.leg ? " rare" : ""); b.disabled = locked || S.gold < c;',
    '      const locked = nw.leg && !S.legUnlock[n - LEG_START], lk = locked ? legLockInfo(n - LEG_START) : null;\n      b.className = "buy num" + (nw.leg ? " rare" : ""); b.disabled = locked ? !lk.ok : S.gold < c;')
rep('const wh = locked ? `<span class="act">잠김: ${nw.n}</span><small>아래 전설 무기 해금에서 광물로 풀어 주세요</small>` : btnInner(',
    'const wh = locked ? (lk.ok ? btnInner({ label: `${nw.n} 해금하기`, sub: `은괴 ${lk.req.silver} · 자수정 ${lk.req.ame} 사용` }) : `<span class="act">잠김: ${nw.n}</span><small>${lk.short} · 공부 탭에서 캐요</small>`) : btnInner(')
rep('$("wNote").textContent = nw.leg ? "전설 무기는 공부로 캔 은괴와 자수정으로 먼저 해금해야 해요." : "새 무기를 사면 모양이 바뀌어요.";',
    '$("wNote").textContent = nw.leg ? (locked ? (lk.ok ? "광물이 충분해요. 눌러서 해금하면 바로 월급으로 살 수 있어요." : `전설 무기는 은괴·자수정으로 먼저 해금해요. 지금 은괴 ${S.silver} · 자수정 ${S.ame} · 공부 탭 타이머를 켜 두면 광산에서 모여요.`) : "전설 무기예요. 월급으로 사면 바로 장착해요.") : "새 무기를 사면 모양이 바뀌어요.";')
rep('else { const n = i + 1, nw = WEAPONS[n], c = wBuy(n); if (nw.leg && !S.legUnlock[n - LEG_START]) return;',
    'else { const n = i + 1, nw = WEAPONS[n], c = wBuy(n); if (nw.leg && !S.legUnlock[n - LEG_START]) { legUnlockTry(n - LEG_START); updateUI(true); save(); return; }')
rep('      else if (i === S.wi) $("wBtn").click();\n      else if (i === S.wi + 1) $("wBtn").click();',
    '      else if (w.leg && !S.legUnlock[i - LEG_START]) legUnlockTry(i - LEG_START);\n      else if (i === S.wi) $("wBtn").click();\n      else if (i === S.wi + 1) $("wBtn").click();')
rep('const key = [lv, skinIdx() === i, nextOk, lockedLeg, cost && S.gold >= cost, i <= S.wi + 1].join();',
    'const lkI = lockedLeg ? legLockInfo(i - LEG_START) : null;\n      const key = [lv, skinIdx() === i, nextOk, lockedLeg, cost && S.gold >= cost, i <= S.wi + 1, lkI ? lkI.short : ""].join();')
rep('r.row.classList.toggle("locked", i > S.wi + 1 || lockedLeg);', 'r.row.classList.toggle("locked", lockedLeg ? !lkI.ok : i > S.wi + 1);')
rep('      else { b.className = "buy ghost num"; b.disabled = true; b.innerHTML = lockedLeg ? `<span class="act">잠김</span><small>광물 해금</small>` : `<span class="act">잠김</span>`; }',
    '      else if (lockedLeg) { b.className = "buy num rare" + (lkI.ok ? "" : " ghost"); b.disabled = false; b.innerHTML = lkI.ok ? btnInner({ label: "해금하기", sub: `은괴 ${lkI.req.silver} · 자수정 ${lkI.req.ame}` }) : `<span class="act">잠김</span><small>${lkI.short}</small>`; }\n      else { b.className = "buy ghost num"; b.disabled = true; b.innerHTML = `<span class="act">잠김</span>`; }')
# 치명타가 잦아도 화면이 붉게 깜빡이지 않게 (0.42초에 한 번), 큰 치명타 숫자도 0.26초에 하나
rep('    if (crit) { screenFlash = Math.max(screenFlash, 0.3); flashCol = "#ff2a2a"; critLines = 1; }',
    '    if (crit && performance.now() - critFxT > 420) { critFxT = performance.now(); screenFlash = Math.max(screenFlash, 0.3); flashCol = "#ff2a2a"; critLines = 1; }')
rep('  addFloat(px ?? MON_X - 10, (py ?? GROUND - mh) - 10, fmt(amount), crit ? "#ff2a2a" : fcol, crit ? 42 : heavy ? 28 : 17, heavy, crit ? "crit" : heavy ? "hit" : "pet");',
    '  const bigC = crit && performance.now() - critFloatT > 260; if (bigC) critFloatT = performance.now();\n  addFloat(px ?? MON_X - 10, (py ?? GROUND - mh) - 10, fmt(amount), crit ? "#ff2a2a" : fcol, bigC ? 42 : (heavy || crit) ? 28 : 17, heavy || crit, bigC ? "crit" : (heavy || crit) ? "hit" : "pet");')
open(P, 'w', encoding='utf-8').write(s)
print('career patched', len(s))
