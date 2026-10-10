"""동료 2.0 패치"""
import sys, json
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:100]); sys.exit(1)
    s = s.replace(old, new)
d = json.load(open('pets.json', encoding='utf-8'))
maps = dict(d['maps']); maps.update(d['hum'])
pals = dict(d['pal']); pals.update(d['humpal'])
tpl = open('pets_tpl.js', encoding='utf-8').read().replace('__PET_MAPS__', json.dumps(maps, ensure_ascii=False, separators=(',', ':'))).replace('__PET_PALS__', json.dumps(pals, ensure_ascii=False, separators=(',', ':')))
# 1) 배치·그리기 블록 교체 (PET_HAIR·petHeroPal·변수 선언은 유지)
i = s.index('/* 동료 배치: 뒷줄(사람) / 앞줄(동물·화분) / 맨 앞 로봇 */')
j = s.index('/* ---------- 화면 글자 레이어 (360 x 360 기준) ---------- */')
keep = '''const PET_HAIR = { intern: "side", idol: "long", legend: "slick", clone: "neat" };
var petPalCache;
const petHeroPal = id => { petPalCache = petPalCache || {}; return petPalCache[id] || (petPalCache[id] = heroPal(PAL[id])); };
let needles = [], hearts = [], cloneIdx = 0, cactusPop = 0;
'''
s = s[:i] + keep + tpl + '\n' + s[j:]
# 2) 분신 그리기
rep('''  const cl = petLv("clone");
  if (cl) for (let c = 0; c < (cl >= 10 ? 2 : 1); c++) { ctx.save(); ctx.globalAlpha = 0.4; drawSprite(ctx, look.map, clonePal(look.pal), HERO_X - 40 - c * 36 + pose.dx * 0.6, GROUND - 84 - (look.top || 0) * 3.5, 3.5, { pretty: true }); ctx.restore(); }''',
'''  drawClones(t, look, pose);''')
# 3) 고양이 공격
rep('''if (catTimer >= 2500) { catTimer -= 2500; petT = 1; const big = Math.random() < 0.1; addSkyStrike(MON_X + (Math.random() - .5) * 30, big); sfx("zap"); if (big) { shakeAmt = Math.max(shakeAmt, 9); screenFlash = Math.max(screenFlash, 0.25); } hit(''',
'''if (catTimer >= 2500) { catTimer -= 2500; const big = Math.random() < 0.1; catAttack(big); hit(''')
# 4) 회식
rep('''    let n = 0; const cl = petLv("cat"), ca = petLv("cactus"), il = petLv("idol");
    if (cl) { n++; addSkyStrike(MON_X, true); hit(''', '''    let n = 0; const cl = petLv("cat"), ca = petLv("cactus"), il = petLv("idol");
    petPartyHop(); if (petLv("ddeok") && mon && !mon.dying) ddeokThrow();
    if (cl) { n++; catAttack(true); hit(''')
# 5) 떡볶이 투척
rep('''addFloat(MON_X, 110, `떡볶이 -${Math.round(cut * 100)}%`, "#ff6b3b", 20); }''', '''addFloat(MON_X, 110, `떡볶이 -${Math.round(cut * 100)}%`, "#ff6b3b", 20); ddeokThrow(); }''')
# 6) 다람쥐 도장
rep('''{ S.stamp++; addFloat(MON_X, 96, "다람쥐가 도장 +1", "#ff7a6b", 22); }''', '''{ S.stamp++; addFloat(MON_X, 96, "다람쥐가 도장 +1", "#ff7a6b", 22); squirrelStamp(); }''')
# 7) 인턴 보너스
rep('''    S.gold += reward; S.bossKills++; S.day.boss++;''', '''    S.gold += reward; S.bossKills++; S.day.boss++;
    if (petLv("intern")) internBonus();''')
# 8) 전설 엄지 척
rep('''  hit(st.atk * (crit ? st.critMul : 1), crit, "hero");
  if (curFx() === "laser") laser = 1;''', '''  hit(st.atk * (crit ? st.critMul : 1), crit, "hero");
  if (crit && petLv("legend")) legendCheer();
  if (curFx() === "laser") laser = 1;''')
# 9) 효과음
rep('''      case "sizzle": noiseHit(t, 0.35, "highpass", 4000, 0.06); tone(180, 0.2, "sawtooth", 0.03, 0, 90); break;''',
'''      case "sizzle": noiseHit(t, 0.35, "highpass", 4000, 0.06); tone(180, 0.2, "sawtooth", 0.03, 0, 90); break;
      case "coin": tone(1976, 0.06, "square", 0.028); tone(2637, 0.14, "square", 0.028, 0.05); break;
      case "toss": noiseHit(t, 0.14, "bandpass", 900, 0.06, 2200); tone(420, 0.14, "triangle", 0.04, 0, 980); break;
      case "stamp": noiseHit(t, 0.09, "lowpass", 500, 0.3); tone(150, 0.14, "square", 0.05, 0, 70); tone(1568, 0.1, "triangle", 0.03, 0.1); break;
      case "cheer": [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.13, "triangle", 0.035, i * 0.055)); noiseHit(t + 0.2, 0.2, "highpass", 6000, 0.03); break;
      case "meow": tone(640, 0.16, "triangle", 0.045, 0, 1180); tone(1180, 0.2, "triangle", 0.035, 0.13, 700); break;''')
rep('''const SFX_GAP = { tick: 60, swing: 90, pop: 60, pew: 50, coin: 30, sparkle: 120, zap: 120 };''', '''const SFX_GAP = { tick: 60, swing: 90, pop: 60, pew: 50, coin: 90, sparkle: 120, zap: 120, toss: 150, stamp: 200, cheer: 300, meow: 400 };''')
# 10) 동료 탭 아이콘: 새 그림
rep('''const petIcon = id => iconCanvas((g) => {
  if (id === "intern" || id === "idol" || id === "legend" || id === "clone") drawSprite(g, heroMap(PET_HAIR[id]), id === "clone" ? clonePal(heroPal(PAL.hero)) : petHeroPal(id), 6, 1, 1.55, { pretty: true });
  else if (id === "cactus") drawSprite(g, SPR.pot, PAL.cactus, 2, 2, 3);
  else drawSprite(g, SPR[id], PAL[id], 2, 2, 3);
});''', '''const petIcon = id => iconCanvas((g) => {
  if (id === "clone") drawSprite(g, heroMap(PET_HAIR[id]), clonePal(heroPal(PAL.hero)), 6, 1, 1.55, { pretty: true });
  else if (id === "intern" || id === "idol" || id === "legend") drawSprite(g, PET2[id].idle, PET2PAL[id], 6, 1.55, 1.55, { pretty: true });
  else if (id === "robot") drawSprite(g, PET2.robot.idle, PET2PAL.robot, 2, -4, 2, { pretty: true });
  else drawSprite(g, PET2[id].idle, PET2PAL[id], 2, 2, 2, { pretty: true });
});''')
rep('''function petBig(id, css = 84) {
  if (id === "intern" || id === "idol" || id === "legend" || id === "clone") return bigSprite(heroMap(PET_HAIR[id]), id === "clone" ? clonePal(heroPal(PAL.hero)) : petHeroPal(id), css);
  return id === "cactus" ? bigSprite(SPR.pot, PAL.cactus, css) : bigSprite(SPR[id], PAL[id], css);
}''', '''function petBig(id, css = 84) {
  if (id === "clone") return bigSprite(heroMap(PET_HAIR[id]), clonePal(heroPal(PAL.hero)), css);
  return bigSprite(PET2[id].act, PET2PAL[id], css);
}''')
open(P, 'w', encoding='utf-8').write(s); print('ok', len(s))
