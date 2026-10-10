/* 곽준영 공격 동작: 자동 공격은 올려베기 → 회전베기 → 내려찍기 순환, 터치는 찌르기, 치명타 터치는 내려찍기.
   몸은 거의 그대로, 무기만 크게: 천천히 치켜들고(예비 동작) → 한 번에 휘두르고 → 살짝 지나쳤다 → 제자리 */
function startSwing(tap, crit) {
  const st = stats();
  anim = { a: tap ? 0.4 : 0, dur: Math.max(110, Math.min(260, st.interval * 0.85)), pending: !tap, type: tap ? (crit ? "chop" : "thrust") : nextSwing() };
  if (tap) smear = 1;
}
function heroPose() {
  const a = anim.a, P = SWING_POSE[anim.type || "chop"], rest = 0.45;
  if (a >= 1) return { dx: 0, ang: rest, lift: 0 };
  if (a < 0.4) { const k = a / 0.4, e = k < 0.78 ? easeIO(k / 0.78) : 1; return { dx: -3 * e, ang: rest + (P[0] - rest) * e, lift: 2 * e }; }
  if (a < 0.6) { const k = (a - 0.4) / 0.2; return { dx: anim.type === "thrust" ? 14 : 10, ang: P[1] + P[2] * Math.sin(Math.PI * k), lift: 1 }; }
  const k = (a - 0.6) / 0.4, e = k * k * (3 - 2 * k);
  return { dx: (anim.type === "thrust" ? 14 : 10) * (1 - e), ang: P[1] + (rest - P[1]) * e, lift: 1 - e };
}

/* 전투 화면 그리기: 월드(카메라) → 화면 글자 레이어 */
function draw(t) {
  const key = mode === "vault" ? "vault" : "f" + shownFloor();
  if (bgKey !== key) { bg = buildBg(shownFloor(), mode === "vault"); bgKey = key; }
  ambientFor(key);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#05070d"; ctx.fillRect(0, 0, CS, CS);
  camApply();
  ctx.save();
  if (shakeAmt > 0.3) ctx.translate((Math.random() - .5) * shakeAmt * 2, (Math.random() - .5) * shakeAmt * 1.4);
  ctx.drawImage(bg, 0, 0);
  drawAmbient(t);
  const look = heroLook(), pose = heroPose();
  const hs = 6, hx = HERO_X + pose.dx, hy = GROUND - 14 * hs + pose.lift;
  drawPetsBack(t);
  // 분신
  const cl = petLv("clone");
  if (cl) for (let c = 0; c < (cl >= 10 ? 2 : 1); c++) { ctx.save(); ctx.globalAlpha = 0.4; drawSprite(ctx, look.map, clonePal(look.pal), HERO_X - 40 - c * 36 + pose.dx * 0.6, GROUND - 84, 6); ctx.restore(); }
  // 곽준영
  if (look.aura) {
    const a = 0.22 + Math.sin(t / 250) * 0.06;
    const gr = ctx.createRadialGradient(hx + 36, hy + 44, 8, hx + 36, hy + 44, 74);
    gr.addColorStop(0, hexA(look.aura, a)); gr.addColorStop(1, hexA(look.aura, 0));
    ctx.fillStyle = gr; ctx.fillRect(hx - 44, hy - 34, 160, 160);
  }
  reflect(() => drawSprite(ctx, look.map, look.pal, hx, hy, hs));
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(hx + 6, GROUND - 3, 60, 6);
  drawSprite(ctx, look.map, look.pal, hx, hy, hs);
  const wi = skinIdx(), wlv = wi === S.wi ? S.wl : 5, WS = 5;
  const px = hx + 9.5 * hs, py = hy + 8.4 * hs, ang = reduceMotion ? 0.45 + (pose.ang - 0.45) * 0.3 : pose.ang;
  if (smear > 0 && !reduceMotion) {
    const P = SWING_POSE[anim.type || "chop"], dir = Math.sign(P[1] - P[0]) || 1;
    for (let g = 1; g <= 3; g++) { ctx.save(); ctx.globalAlpha = 0.3 * smear / g; drawWeapon(ctx, wi, wlv, px, py, ang - dir * g * 0.42, WS, t, true); ctx.restore(); }
  }
  drawWeapon(ctx, wi, wlv, px, py, ang, WS, t, false);
  if (laser > 0) { ctx.strokeStyle = hexA("#ff3b3b", laser); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(px + 80, py + 10); ctx.lineTo(MON_X, GROUND - 60); ctx.stroke(); }
  // 적
  if (mon) {
    const map = SPR[mon.sprite], sc = mon.scale, pretty = !isBigBossMap(map);
    const w = map[0].length * sc, h = map.length * sc, ox = monOX(), boss = mon.kind >= 2;
    const breathe = mon.dying ? 0 : Math.sin(t / (boss ? 420 : 260)) * (boss ? 0.035 : 0.025);
    const sx = 1 + mon.squash * 0.22, sy = 1 - mon.squash * 0.18 + breathe;
    const eo = enterOffset();
    const mxp = MON_X + ox + mon.kb * 26 + mon.fx + eo.dx + (Math.random() - .5) * 4 * mon.red, myp = GROUND + eo.dy + mon.fy;
    const so = { flip: true, pretty }, baseA = (1 - mon.dying * 0.85) * eo.a;
    ctx.save();
    ctx.globalAlpha = baseA;
    if (mon.kind >= 1 && !mon.dying && !reduceMotion && eo.a > 0) {
      const ac = mon.kind >= 3 ? "255,70,30" : mon.kind === 2 ? "200,30,80" : hexRGB(zoneOf(S.floor).bossPal.t).join(",");
      const pa = (mon.kind >= 2 ? 0.34 : 0.22) + 0.08 * Math.sin(t / 300), R = h * (mon.kind >= 2 ? 0.9 : 0.75);
      const ag = ctx.createRadialGradient(mxp, myp - h * 0.5, 8, mxp, myp - h * 0.5, R);
      ag.addColorStop(0, `rgba(${ac},${pa})`); ag.addColorStop(1, `rgba(${ac},0)`);
      ctx.fillStyle = ag; ctx.fillRect(mxp - R, myp - h * 0.5 - R, R * 2, R * 2);
    }
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(MON_X + ox - w / 2 + 8 + mon.kb * 24 + eo.dx, GROUND - 3, w - 16, 6);
    if (!mon.dying) reflect(() => { ctx.translate(mxp, myp); ctx.rotate(-(mon.tilt * 0.22)); ctx.scale(sx * eo.s, sy * eo.s); drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, so); });
    if (mon.dying && !reduceMotion) for (let g = 1; g <= 2; g++) { ctx.save(); ctx.globalAlpha *= 0.25 / g; ctx.translate(mxp - mon.vx * g * 3.2, myp - mon.vy * g * 3.2); ctx.rotate(mon.tilt * 0.22 + mon.rot - 0.25 * g); ctx.scale(sx, sy); drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, { flip: true, pretty, white: true }); ctx.restore(); }
    ctx.translate(mxp, myp);
    ctx.rotate(mon.tilt * 0.22 + mon.rot);
    ctx.scale(sx * eo.s, sy * eo.s);
    drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, so);
    if (mon.red > 0) { ctx.globalAlpha = baseA * mon.red * 0.6; drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, { flip: true, pretty, solid: "#ff2a2a" }); }
    if (mon.flash > 0) { ctx.globalAlpha = baseA * mon.flash * 0.85; drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, { flip: true, pretty, white: true }); }
    if (mon.crown) { ctx.globalAlpha = baseA; drawSprite(ctx, SPR.crown, { y: "#ffd54a", r: "#ff5d5d" }, -12, -h - 15, 4, { pretty: true }); }
    if (boss && !mon.dying && eo.a > 0) {
      ctx.globalAlpha = baseA; ctx.globalCompositeOperation = "lighter";
      const cols = map[0].length, ec = mon.pal.e || "#ff3b3b", pulse = 0.55 + 0.25 * Math.sin(t / 120);
      eyeCells(map).forEach(([c, r]) => {
        const ex = -w / 2 + (cols - 1 - c + 0.5) * sc, ey = -h + (r + 0.5) * sc, gr = ctx.createRadialGradient(ex, ey, 0, ex, ey, sc * 2.8);
        gr.addColorStop(0, hexA(ec, pulse)); gr.addColorStop(1, hexA(ec, 0)); ctx.fillStyle = gr; ctx.fillRect(ex - sc * 3, ey - sc * 3, sc * 6, sc * 6);
      });
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
  }
  drawPetsFront(t);
  drawAnger(t); drawPuffs();
  drawPixelFx(t, hx);
  rings.forEach(r => {
    const k = 1 - r.life, rad = (r.big ? 26 : 12) + k * (r.big ? 110 : (r.crit ? 70 : 48));
    ctx.strokeStyle = hexA(r.crit ? "#ffb13b" : "#ffffff", r.life * 0.9); ctx.lineWidth = (r.big ? 10 : 6) * r.life + 1;
    ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, Math.PI * 2); ctx.stroke();
    if (r.life > 0.6) { ctx.fillStyle = hexA("#ffffff", (r.life - 0.6) * 2); ctx.beginPath(); ctx.arc(r.x, r.y, 10 + k * 22, 0, Math.PI * 2); ctx.fill(); }
  });
  // 각진 파편
  debris.forEach(d => {
    const a = Math.max(0, Math.min(1, d.life * 1.5)); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(d.x, d.y); ctx.rotate(d.rot || 0);
    const s = d.s; ctx.fillStyle = d.c; ctx.beginPath(); ctx.moveTo(-s * 0.6, -s * 0.45); ctx.lineTo(s * 0.75, -s * 0.6); ctx.lineTo(s * 0.3, s * 0.65); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(10,12,20,.7)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  });
  sparks.forEach(s => {
    ctx.globalAlpha = Math.max(0, s.life);
    if (s.line && s.px != null) { ctx.strokeStyle = s.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s.px - s.vx * 1.4, s.py - s.vy * 1.4); ctx.lineTo(s.x, s.y); ctx.stroke(); }
    else { ctx.fillStyle = s.c; ctx.fillRect(s.x, s.y, 5, 5); }
  });
  ctx.globalAlpha = 1;
  drawCoins(); drawCritLines(MON_X + monOX() * 0.5, GROUND - 60);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  floats.forEach(f => {
    const a = Math.min(1, f.life * 2.4);
    if (f.style === "crit" || f.style === "hit") drawDmg(f, a);
    else {
      const pop = f.pop ? 1 + 0.9 * Math.max(0, 1 - f.age / 110) : 1;
      ctx.globalAlpha = a; ctx.font = `${Math.round(f.size * pop)}px "Do Hyeon", sans-serif`;
      ctx.lineWidth = 6; ctx.strokeStyle = "#0e1321"; ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    }
  });
  if (combo >= 3) {
    const pop = 1 + comboPop * 0.5;
    ctx.save(); ctx.translate(MON_X - 150, 78); ctx.scale(pop, pop); ctx.globalAlpha = Math.min(1, comboT * 2);
    ctx.font = '40px "Do Hyeon", sans-serif'; ctx.lineWidth = 8; ctx.strokeStyle = "#1b1206"; ctx.strokeText(String(combo), 0, 0);
    ctx.fillStyle = combo >= 30 ? "#ff5d5d" : combo >= 10 ? "#ffb13b" : "#fff36b"; ctx.fillText(String(combo), 0, 0);
    ctx.font = '16px "Do Hyeon", sans-serif'; ctx.lineWidth = 5; ctx.strokeText("연속 타격", 0, 28); ctx.fillStyle = "#e9edf6"; ctx.fillText("연속 타격", 0, 28);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  if (bubble.t > 0 && !lift && !(intro && !intro.light && intro.t < intro.dur * 0.62)) drawBubble(hx + 30, hy - 4, bubble.text);
  ctx.restore();
  // 화면 글자 레이어
  uiApply();
  drawVignette(); drawDanger(t); drawFever(t); drawImpactFrame(); drawScreenFlash();
  drawFloorLabel();
  if (mode === "tower" && zoneBanner.t <= 0 && !lift && !(intro && !intro.light)) drawMissions();
  drawHint();
  drawLift(t); drawStamp(); drawIntro(t); drawZoneBanner();
  renderTop(false);
}
