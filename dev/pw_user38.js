// 사용자 실제 설정(블랙카드 +5, 로봇 대리, 옷장 ch_* · 무기 이펙트 w_moon · 오라 a_boss, 흔들림 0 · 번쩍임 0, 휴대폰 동작 줄이기 켬, 대리 영업)으로 한 틱씩 찍기
// 사용: node pw_user38.js prefix page.html [n]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'u38', PAGE = process.argv[3] || 'dbg.html', N = +process.argv[4] || 50;
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 }, reducedMotion: 'reduce' }); await fontRoutes(ctx);
  await ctx.addInitScript(([f]) => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, [JSON.stringify(save)]);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install({ time: new Date('2026-10-11T10:00:00+09:00') });
  await p.goto('http://localhost:8766/' + PAGE);
  for (let i = 0; i < 40; i++) await p.clock.runFor(100);
  for (let i = 0; i < 12; i++) {
    if (await p.locator('#celeb').isVisible()) await p.evaluate(() => document.getElementById('celeb').click());
    else if (await p.locator('#back').isVisible()) await p.evaluate(() => document.getElementById('backGo').click());
    await p.clock.runFor(900);
  }
  await p.evaluate(() => window.__ev(`S.bestFloor = Math.max(S.bestFloor || 0, 329); S.maxFloor = Math.max(S.maxFloor || 0, 329);
    S.wi = 20; S.wl = 5; S.skin = -1; S.char = "robo"; S.fx = { shake: 0, flash: 0, body: 1 };
    S.rank = 2; S.jobs = ["sales"]; S.job = "sales";
    const W = wardState(); ["ch_arm", "ch_tie", "ch_top", "w_moon", "a_boss", "ch_head", "sa_prop", "sa_shoes", "t_boss"].forEach(id => { if (W.own[id] == null) W.own[id] = 1; });
    W.eq = { arm: "ch_arm", tie: "ch_tie", top: "ch_top", wfx: "w_moon", aura: "a_boss", head: "ch_head", prop: "sa_prop", shoes: "sa_shoes", title: "t_boss" }; W.look = {};
    if (typeof jskKey !== "undefined") { jskKey = null; renderJobSkills(); } 0`));
  for (let i = 0; i < 20; i++) await p.clock.runFor(50);
  for (let i = 0; i < 60 && !(await p.evaluate(() => window.__ev('!!(mon && !mon.dying && spawnWait <= 0)'))); i++) await p.clock.runFor(50);
  await p.evaluate(() => { window.__noFloat = true; window.__ev('mon.hp = mon.max = 1e300; S.pets.idol = 0; bubble.t = 0; bubbleCd = 1e9; floats.length = 0; 0'); });
  const info = await p.evaluate(() => window.__ev('JSON.stringify({ v: typeof GAME_V !== "undefined" ? GAME_V : "?", rm: reduceMotion, wi: S.wi, skin: skinIdx(), char: curChar().id, wfx: wardWfxShown(), aps: +stats().aps.toFixed(2) })'));
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.clock.runFor(200);
  let T = await p.evaluate(() => window.__ev('last'));
  for (let f = 0; f < N; f++) {
    T += 1000 / 60;
    const u = await p.evaluate(t => { window.__ev(`frame(${t}); mon.hp = mon.max = 1e300; bubble.t = 0; 0`); return document.getElementById('cv').toDataURL('image/png'); }, T);
    fs.writeFileSync(`feelshots/${PREFIX}_${String(f).padStart(3, '0')}.png`, Buffer.from(u.split(',')[1], 'base64'));
  }
  console.log(PREFIX, info, 'errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
