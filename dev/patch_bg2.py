"""전투 배경 2.0 패치"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:100]); sys.exit(1)
    s = s.replace(old, new)

rep('/* ===================== 전투 ===================== */\nlet mode = "tower"', open('part_bg2.js', encoding='utf-8').read() + '\n/* ===================== 전투 ===================== */\nlet mode = "tower"')
# 그리기: 배경 묶음 만들고, 층별로 나눠 그림
rep('''  if (bgKey !== key) { bg = buildBg(shownFloor(), mode === "vault"); bgKey = key; }
  ambientFor(key);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#05070d"; ctx.fillRect(0, 0, CSW, CSH);
  camApply();
  ctx.save();
  if (shakeAmt > 0.3) ctx.translate((Math.random() - .5) * shakeAmt * 2, (Math.random() - .5) * shakeAmt * 1.4);
  ctx.drawImage(bg, 0, 0);
  drawAmbient(t);''',
'''  if (bgKey !== key) { bgSet = buildBgSet(shownFloor(), mode === "vault"); bg = bgSet ? null : buildBg(shownFloor(), mode === "vault"); bgKey = key; if (bgSet && mode !== "vault") bgPrefetch(shownFloor()); }
  ambientFor(key);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#05070d"; ctx.fillRect(0, 0, CSW, CSH);
  camApply();
  if (shakeAmt > 0.3) { bgShx = (Math.random() - .5) * shakeAmt * 2; bgShy = (Math.random() - .5) * shakeAmt * 1.4; } else { bgShx = 0; bgShy = 0; }
  ctx.save();
  drawBgBack(t);
  drawAmbient(t); drawBgAmbient(t);''')
rep('''  drawPetsFront(t);
  drawAnger(t); drawPuffs();
  drawPixelFx(t, hx);''', '''  drawPetsFront(t);
  drawAnger(t); drawPuffs();
  drawBgFore();
  drawPixelFx(t, hx);''')
# 반짝이 별: 새 배경이면 기록해 둔 '보이는 별'에서
rep('''function ambientFor(key) {
  if (AMB.key === key) return; AMB.key = key; AMB.stars = [];
  try {''', '''function ambientFor(key) {
  if (AMB.key === key) return; AMB.key = key; AMB.stars = [];
  if (bgSet) { AMB.stars = bgSet.tw.map(([x, y]) => ({ x, y, p: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.6 })); return; }
  try {''')
rep('''function drawAmbient(t) {
  AMB.stars.forEach(s => {''', '''function drawAmbient(t) {
  if (!bgSet) AMB.stars.forEach(s => {''')
rep('''  if (AMB.plane) { const p = AMB.plane, on = Math.floor(t / 400) % 2; ctx.fillStyle = "rgba(20,24,40,.9)"; ctx.fillRect(p.x - 8, p.y, 16, 3); ctx.fillRect(p.x - 2, p.y - 3, 4, 9); ctx.fillStyle = on ? "#ff4040" : "#ffffff"; ctx.fillRect(p.x + 8, p.y, 2, 2); ctx.fillStyle = on ? "#ffffff" : "#40ff70"; ctx.fillRect(p.x - 10, p.y, 2, 2); }
  const gl = ctx.createRadialGradient(404, GROUND + 6, 10, 404, GROUND + 6, 240);
  gl.addColorStop(0, "rgba(255,226,170,.16)"); gl.addColorStop(1, "rgba(255,226,170,0)");
  ctx.fillStyle = gl; ctx.fillRect(160, GROUND - 120, 490, 180);
  AMB.dust.forEach(d => { d.y -= d.v; d.x += Math.sin(t / 1300 + d.p) * 0.15; if (d.y < 30) { d.y = GROUND - 4; d.x = Math.random() * W; } ctx.fillStyle = `rgba(255,240,210,${0.12 + 0.12 * Math.sin(t / 700 + d.p)})`; ctx.fillRect(d.x, d.y, d.s, d.s); });''',
'''  if (AMB.plane && !bgSet) { const p = AMB.plane, on = Math.floor(t / 400) % 2; ctx.fillStyle = "rgba(20,24,40,.9)"; ctx.fillRect(p.x - 8, p.y, 16, 3); ctx.fillRect(p.x - 2, p.y - 3, 4, 9); ctx.fillStyle = on ? "#ff4040" : "#ffffff"; ctx.fillRect(p.x + 8, p.y, 2, 2); ctx.fillStyle = on ? "#ffffff" : "#40ff70"; ctx.fillRect(p.x - 10, p.y, 2, 2); }
  const fgc = (bgSet && bgSet.amb.floorGlow) || "255,226,170", dc = (bgSet && bgSet.amb.dust) || "255,240,210";
  const gl = ctx.createRadialGradient(404, GROUND + 6, 10, 404, GROUND + 6, 240);
  gl.addColorStop(0, `rgba(${fgc},.16)`); gl.addColorStop(1, `rgba(${fgc},0)`);
  ctx.fillStyle = gl; ctx.fillRect(160, GROUND - 120, 490, 180);
  AMB.dust.forEach(d => { d.y -= d.v; d.x += Math.sin(t / 1300 + d.p) * 0.15; if (d.y < 30) { d.y = GROUND - 4; d.x = Math.random() * W; } ctx.fillStyle = `rgba(${dc},${0.12 + 0.12 * Math.sin(t / 700 + d.p)})`; ctx.fillRect(d.x, d.y, d.s, d.s); });''')
rep('''  else if (AMB.planeCd <= 0 && AMB.stars.length > 5) {''', '''  else if (AMB.planeCd <= 0 && AMB.stars.length > 5 && (!bgSet || bgSet.amb.city)) {''')
open(P, 'w', encoding='utf-8').write(s); print('ok', len(s))
