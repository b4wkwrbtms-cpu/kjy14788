"""v40: 무기 색 = 직무 스킬·기본 공격 이펙트 색 · 영업(전사) 전직 공격 검기 (patch_v39 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 39;', 'var GAME_V = 40;')
rep('if (localStorage.getItem(SAVE_KEY + "-feel39")) return;\n    localStorage.setItem(SAVE_KEY + "-feel39", "1");',
    'if (localStorage.getItem(SAVE_KEY + "-feel40")) return;\n    localStorage.setItem(SAVE_KEY + "-feel40", "1");')
rep('celebrateLater({ ic: "weapon", title: "무기 새 그림이 잘 보여요", sub: "무기 목록·카드에서 무기를 세워서 크게, 그 무기 색 빛을 둘렀어요<br>전투에서도 무기 둘레가 그 무기 색으로 빛나고, 무기 모양을 바꾸면 베기 색도 바뀌어요", tone: "gold", ms: 5200, keep: 1 });',
    'celebrateLater({ ic: "weapon", title: "무기 색 = 스킬 색 · 전직 공격", sub: "무기 모양을 바꾸면 직무 스킬과 기본 공격 이펙트가 그 무기 색으로 바뀌어요<br>영업(전사)은 전직 공격으로 싸워요: 솟구치는 검기 · 지면 강타 · 관통 검기", tone: "gold", ms: 5400, keep: 1 });')
rep('/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */',
    open('part_v40.js', encoding='utf-8').read() + '\n/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */')
# 직무 이펙트 그리기: 무기 색으로 칠함 (물건·겸직은 제외)
rep('''function drawJobFx(t) {
  if (!jobFx.length && !jobProj.length && !jobParts.length && !(jobMarks.m && jobMarks.n)) return;''', '''function drawJobFx(t) {
  if (!jobFx.length && !jobProj.length && !jobParts.length && !(jobMarks.m && jobMarks.n)) return;
  if (typeof tintSync === "function") tintSync(t);''')
rep('  for (const f of jobFx) { if (f.t < 0) continue; const d = JFX_DRAW[f.kind]; if (d) { try { d(f, t); } catch (e) { jobFxErr = f.kind + ": " + e; } } }',
    '  for (const f of jobFx) { if (f.t < 0) continue; const d = JFX_DRAW[f.kind]; if (d) { tintOn = jobTintOn(f); try { d(f, t); } catch (e) { jobFxErr = f.kind + ": " + e; } tintOn = false; } }')
rep('''    if (p.kind === "code") {
      const x = p.x0 + (p.tx - p.x0) * k, y = p.y0 + (p.ty - p.y0) * k - Math.sin(k * Math.PI) * 8, ang = Math.atan2(p.ty - p.y0, p.tx - p.x0);''', '''    if (p.kind === "code") {
      tintOn = !p.noTint && !!tintPal;
      const x = p.x0 + (p.tx - p.x0) * k, y = p.y0 + (p.ty - p.y0) * k - Math.sin(k * Math.PI) * 8, ang = Math.atan2(p.ty - p.y0, p.tx - p.x0);''')
rep('''    } else if (p.kind === "stamp") {
      const arc = p.big ? 0 : 46,''', '''      tintOn = false;
    } else if (p.kind === "stamp") {
      const arc = p.big ? 0 : 46,''')
rep('      jvComet(x, y, Math.atan2(y - py, x - px), 32, 5, "#7fe3a0", 0.75, p.seed);',
    '      tintOn = !p.noTint && !!tintPal; jvComet(x, y, Math.atan2(y - py, x - px), 32, 5, "#7fe3a0", 0.75, p.seed); tintOn = false;')
rep('    else if (q.kind === "digit") { ctx.globalAlpha = a * (q.amb ? 0.6 : 1); ctx.fillStyle = q.c;',
    '    else if (q.kind === "digit") { ctx.globalAlpha = a * (q.amb ? 0.6 : 1); ctx.fillStyle = !q.noTint && tintPal ? tintMap(q.c) : q.c;')
# 영업 기본 공격 = 전직 공격 검기 (직무가 없으면 이 함수가 안 불려서 기본 베기만)
rep('    jvAdd("slash", { x: x - 4, y, r: crit ? 48 : 34, ang: up ? -0.45 : 0.5, col: typeof feelFxPal === "function" ? feelFxPal(performance.now())[1] : "#ffd54a", dur: crit ? 240 : 170, th: crit ? 15 : 9, span: 1.25, drift: 8 });',
    '    warriorFx(x, y, crit);   // v40 전직 공격: 올려베기 솟구치는 검기 · 내려치기 지면 강타 · 마무리 관통 검기 (무기 색)')
# 아래 스킬 바: 커피 러시·야근 모드 고리와 번쩍임도 무기 색 (결재 폭탄·사직서·회식은 물건·동료라 그대로)
rep('  else if (s.id === "rush") { rings.push({ x: HERO_X + 30, y: GROUND - 50, life: 1, crit: false, big: true }); screenFlash = Math.max(screenFlash, 0.15); flashCol = "#c98a4a"; }',
    '  else if (s.id === "rush") { const wc = typeof feelFxPal === "function" ? feelFxPal(performance.now())[1] : "#c98a4a"; rings.push({ x: HERO_X + 30, y: GROUND - 50, life: 1, crit: false, big: true, col: wc }); screenFlash = Math.max(screenFlash, 0.15); flashCol = wc; }')
rep('  else if (s.id === "night") { rings.push({ x: HERO_X + 30, y: GROUND - 50, life: 1, crit: true, big: true }); screenFlash = Math.max(screenFlash, 0.25); flashCol = "#5a48c8"; say("오늘은 끝장을 본다!", 2); }',
    '  else if (s.id === "night") { const wp = typeof feelFxPal === "function" ? feelFxPal(performance.now()) : ["#5a48c8", "#ffb13b"]; rings.push({ x: HERO_X + 30, y: GROUND - 50, life: 1, crit: true, big: true, col: wp[1] }); screenFlash = Math.max(screenFlash, 0.25); flashCol = wp[0]; say("오늘은 끝장을 본다!", 2); }')
rep('    ctx.strokeStyle = hexA(r.crit ? "#ffb13b" : "#ffffff", r.life * 0.9); ctx.lineWidth = (r.big ? 10 : 6) * r.life + 1;',
    '    ctx.strokeStyle = hexA(r.col || (r.crit ? "#ffb13b" : "#ffffff"), r.life * 0.9); ctx.lineWidth = (r.big ? 10 : 6) * r.life + 1;')
open(P, 'w', encoding='utf-8').write(s)
print('patch_v40 ok', len(s))
