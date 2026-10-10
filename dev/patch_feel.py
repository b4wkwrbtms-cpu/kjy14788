"""v35 기둥 8: 손맛 다시 세우기 (patch_menu 다음에)
게임 디자인 스킬 v1: action-combat(주) + fighting 프레임 데이터(보조), CP-01·04·12·13, 수치 P-FEEL, 점검 AP-FEEL·AP-CODE."""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('/* ===================== 탭 ===================== */',
    open('part_feel.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')
rep('var GAME_V = 34;', 'var GAME_V = 35;')

# ---- 피해: 곽준영 타격(평타·터치·직무)은 묶어서 한 번에 연출 ----
rep('  mon.hp -= amount;\n', '  mon.hp -= amount;\n  if (feelHit(amount, crit, src, px, py)) return;   // v35: 곽준영 타격은 손맛 레시피로 (part_feel)\n')
# ---- 처치: 전역 멈춤 95/170ms·흔들림 10/18 → 공격자·피격자 히트스톱 6/12f + 트라우마 ----
rep('''  hitStop = Math.max(hitStop, boss ? 170 : 95);
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, boss ? 18 : 10);
''', '''  feelKill(boss);
''')
# ---- 터치: 입력 프레임에 피해, 동작은 상태 기계 ----
rep('''  const st = stats(), crit = Math.random() < st.crit;
  startSwing(true, crit);
  const { w: mw, h: mh } = monSize();
  const ix = Math.max(MON_X - mw / 2, Math.min(MON_X + mw / 2, px)), iy = Math.max(GROUND - mh, Math.min(GROUND - 6, py));
  hit(st.tap * (crit ? st.critMul : 1), crit, "tap", ix, iy);
''', '''  const { w: mw, h: mh } = monSize();
  const ix = Math.max(MON_X - mw / 2, Math.min(MON_X + mw / 2, px)), iy = Math.max(GROUND - mh, Math.min(GROUND - 6, py));
  feelTap(ix, iy);
''')
# ---- 베기 이펙트 기준점 = 지금 어깨 ----
rep('const heroPivot = () => ({ x: HERO_X + 10 + 15.5 * 3.5, y: GROUND - 84 + 1 + 16 * 3.5 });', 'const heroPivot = () => feelPivot();')
# ---- 자세: 프레임 데이터에서 ----
rep('''function heroPose() {
  const a = anim.a, P = SWING_POSE[anim.type || "chop"], rest = 0.45;
  if (a >= 1) return { dx: 0, ang: rest, lift: 0 };
  if (a < 0.4) { const k = a / 0.4, e = k < 0.78 ? easeIO(k / 0.78) : 1; return { dx: -3 * e, ang: rest + (P[0] - rest) * e, lift: 2 * e }; }
  if (a < 0.6) { const k = (a - 0.4) / 0.2; return { dx: anim.type === "thrust" ? 14 : 10, ang: P[1] + P[2] * Math.sin(Math.PI * k), lift: 1 }; }
  const k = (a - 0.6) / 0.4, e = k * k * (3 - 2 * k);
  return { dx: (anim.type === "thrust" ? 14 : 10) * (1 - e), ang: P[1] + (rest - P[1]) * e, lift: 1 - e };
}''', '''function heroPose() { return feelPoseNow(); }''')

# ---- 그리기 ----
rep('  if (shakeAmt > 0.3 && shk > 0) { bgShx = (Math.random() - .5) * shakeAmt * 2 * shk; bgShy = (Math.random() - .5) * shakeAmt * 1.4 * shk; } else { bgShx = 0; bgShy = 0; }',
    '  feelView(t);   // v35: 트라우마 + 노이즈 흔들림·카메라 킥 (렌더만, CP-11)')
rep('  ctx.setTransform(s, 0, 0, s, (-x0 + bgShx * f) * s, (-y0 + bgShy * f) * s);', '  feelSetT(s, (-x0 + bgShx * f) * s, (-y0 + bgShy * f) * s);')
rep('  const s = CSH / VH; ctx.setTransform(s, 0, 0, s, -VX0 * s, -VY0 * s);', '  const s = CSH / VH; feelSetT(s, -VX0 * s, -VY0 * s);')
rep('''  reflect(() => drawSprite(ctx, look.map, look.pal, hx, hy - (look.top || 0) * hs, hs, { pretty: true }));
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(hx + 6, GROUND - 3, 60, 6);
  drawSprite(ctx, look.map, look.pal, hx, hy - (look.top || 0) * hs, hs, { pretty: true });
  const WS = 5;
  const px = hx + 15.5 * hs, py = hy + 16 * hs, ang = reduceMotion ? 0.45 + (pose.ang - 0.45) * 0.3 : pose.ang;
  if (smear > 0 && !reduceMotion) {
    const P = SWING_POSE[anim.type || "chop"], dir = Math.sign(P[1] - P[0]) || 1;
    for (let g = 1; g <= 3; g++) { ctx.save(); ctx.globalAlpha = 0.3 * smear / g; drawHeldWeapon(ctx, px, py, ang - dir * g * 0.42, WS, t, true); ctx.restore(); }
  }
  drawHeldWeapon(ctx, px, py, ang, WS, t, false, 1.8); heroHand.x = px; heroHand.y = py;
''', '''  drawHeroRig(t, look, pose, hx, hy, hs);   // v35: 몸 리그(어깨·팔꿈치·손) + 칼이 지나간 자리
  const px = heroHand.x, py = heroHand.y;
''')
rep('  drawPetsBack(t);', '  drawFeelMarks(); drawPetsBack(t);')
rep('  drawPetsFront(t);', '  feelFront(); drawPetsFront(t);')
rep('    const mxp = MON_X + ox + mon.kb * 26 + mon.fx + eo.dx + (Math.random() - .5) * 4 * mon.red, myp = GROUND + eo.dy + mon.fy;',
    '    const mxp = MON_X + ox + mon.kb * 26 + mon.fx + eo.dx + feelMonDX(), myp = GROUND + eo.dy + mon.fy;')
rep('ctx.fillRect(MON_X + ox - w / 2 + 8 + mon.kb * 24 + eo.dx, GROUND - 3, w - 16, 6);', 'ctx.fillRect(MON_X + ox - w / 2 + 8 + mon.kb * 24 + feelMonDX() + eo.dx, GROUND - 3, w - 16, 6);')
rep('    if (mon.flash > 0) { ctx.globalAlpha = baseA * mon.flash * 0.85; drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, { flip: true, pretty, white: true }); }',
    '    const fw = feelWhite(); if (mon.flash > 0 || fw) { ctx.globalAlpha = baseA * Math.max(fw ? 0.92 : 0, mon.flash * 0.85); drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, { flip: true, pretty, white: true }); }')

# ---- 진행: 고정 틱이 공격 시계·동작·히트스톱을 맡음 ----
rep('''  // 공격 동작 진행: 내리찍는 순간(0.4)에 피해가 들어감
  if (anim.a < 1) {
    const prev = anim.a; anim.a = Math.min(1, anim.a + dt / anim.dur);
    if (prev < 0.4 && anim.a >= 0.4) smear = 1;
    if (anim.pending && prev < 0.4 && anim.a >= 0.4) { anim.pending = false; if (mon && !mon.dying && spawnWait <= 0) heroStrike(st); }
  }
  if (spawnWait > 0) {
    spawnWait -= dt;
    if (mon) { mon.dying = Math.min(1, mon.dying + dt / 420); mon.fx += mon.vx * dt / 16; mon.fy += mon.vy * dt / 16; mon.vy += 0.9 * dt / 16; mon.rot += 0.22 * dt / 16; }
    if (spawnWait <= 0) spawn();
  } else if (mon && !introBlocking()) {
    mon.born = Math.min(1, mon.born + dt / 300);
    atkTimer += dt;
    if (atkTimer >= st.interval) {
      atkTimer = Math.min(atkTimer - st.interval, st.interval);
      if (anim.a >= 0.58) startSwing(false);
      else if (!anim.pending) heroStrike(st);
      else { heroStrike(st); }
    }
''', '''  // v35: 곽준영 공격 시계·기술 프레임·히트스톱은 1/60초 고정 틱 (part_feel, CP-01)
  feelRun(dt, st);
  if (spawnWait > 0) {
    const kd = feelMonFrozen() ? 0 : dt;   // 처치 히트스톱 동안은 날아가기·다음 몬스터 대기가 멈춤
    spawnWait -= kd;
    if (mon && kd) { mon.dying = Math.min(1, mon.dying + kd / 420); mon.fx += mon.vx * kd / 16; mon.fy += mon.vy * kd / 16; mon.vy += 0.9 * kd / 16; mon.rot += 0.22 * kd / 16; }
    if (spawnWait <= 0) spawn();
  } else if (mon && !introBlocking()) {
    mon.born = Math.min(1, mon.born + dt / 300);
''')
rep('''  if (mon) {
    mon.flash = Math.max(0, mon.flash - dt / 70);''', '''  if (mon && !feelMonFrozen()) {   // 히트스톱 동안 피격 자세 유지
    mon.flash = Math.max(0, mon.flash - dt / 70);''')
rep('d.life -= dt / 700; }); debris = debris.filter(d => d.life > 0);', 'd.life -= dt / (d.y >= GROUND - 2.5 ? 1700 : 700); }); debris = debris.filter(d => d.life > 0);')

# ---- 데미지 숫자: 늘 같은 모양 · 같은 움직임 · 묶음 ×n ----
rep('''  if (style === "hit" || style === "crit") { const sl = dmgSlot++ % 6; x += [-34, 26, -6, 44, -48, 12][sl]; y -= [0, 14, 28, 6, 20, 34][sl]; vx = (Math.random() - 0.3) * 1.6; }''',
    '''  if (style === "hit" || style === "crit") { const sl = dmgSlot++ % 6; x += [-30, 22, -6, 38, -42, 10][sl]; y -= [0, 14, 28, 6, 20, 34][sl]; vx = [-0.4, 0.4, 0, 0.5, -0.5, 0.2][sl]; }''')
rep('''  floats.push({ x: x + (Math.random() - .5) * 12, y, text, color, size, life: 1, age: 0, pop, style, vx, rot: style === "crit" ? (Math.random() - .5) * 0.24 : isDmg ? (Math.random() - .5) * 0.12 : 0,
    look: isDmg ? dmgLookFor(style === "crit") : "", motion: isDmg ? pick(DMG_MOTIONS) : "", seed: Math.random() * 6.28, dir: Math.random() < 0.5 ? -1 : 1,
    accent: pick(style === "hit" ? NEON_COLS.concat(RIBBON_COLS) : NEON_COLS), label: pick(CRIT_LABELS),''',
    '''  floats.push({ x: isDmg ? x : x + (Math.random() - .5) * 12, y, text, color, size, life: 1, age: 0, pop, style, vx, rot: style === "crit" ? -0.05 : 0,
    look: isDmg ? feelDmgLook(style === "crit") : "", motion: isDmg ? "pop" : "", seed: 1.7, dir: 1,
    accent: NEON_COLS[0], label: "치명타!",''')
rep('vy: style === "crit" ? 5.2 : style === "hit" ? 4.4 : pop ? 3.2 : 1.4, dur: style === "crit" ? 1500 : style === "hit" ? 1050 : 950 });',
    'vy: style === "crit" ? 5.2 : style === "hit" ? 4.4 : pop ? 3.2 : 1.4, dur: style === "crit" ? 1100 : style === "hit" ? 900 : 950 });')
rep('    if (t < 240) c.translate((Math.random() - .5) * 8, (Math.random() - .5) * 6);',
    '    if (t < 240 && !reduceMotion) { const k = 1 - t / 240; c.translate(feelNoise(t / 14) * 4 * k, feelNoise(t / 14 + 50) * 3 * k); }')
rep('      case "split": break;', '      case "split": case "clean": break;')
rep('''    } else outlined(c, f.text, 0, 4, fill, "#2a0606", "#fff36b", 11, 4);
    c.restore(); return;''', '''    } else outlined(c, f.text, 0, 4, fill, "#2a0606", "#fff36b", 11, 4);
    feelMult(c, f, w, s);
    c.restore(); return;''')
rep('''      outlined(c, f.text, 0, 0, "#ffffff", "#1b1206", "#ffb13b");
  }
  c.restore();
}''', '''      outlined(c, f.text, 0, 0, "#ffffff", "#1b1206", "#ffb13b");
  }
  feelMult(c, f, w, s);
  c.restore();
}''')

# ---- 직무 스킬 '실적 대시': 전역 멈춤 40/110ms → 공격자·피격자 히트스톱 2/7f ----
rep('  hitStop = Math.max(hitStop, last ? 110 : 40);', '  feelFreeze(last ? 7 : 2, true, last ? 7 : 4);')
# ---- 작은 치명 숫자: 일반 숫자 모양에 빨강 ----
rep('''    case "pixel": drawPixelText(c, f.text, s, f.accent); break;''', '''    case "pixel": drawPixelText(c, f.text, s, f.accent); break;
    case "critlite": c.fillStyle = "rgba(0,0,0,.45)"; c.fillText(f.text, 3, 4); outlined(c, f.text, 0, 0, "#ff5d5d", "#2a0606", "#fff36b", 8, 2); break;''')

open(P, 'w', encoding='utf-8').write(s)
print('patch_feel ok', len(s))
