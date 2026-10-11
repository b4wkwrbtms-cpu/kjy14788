// v40 확인: 무기 모양마다 영업 전직 공격(검기)·직무 스킬 색이 그 무기 색으로 바뀌는지 — 사용자 설정(로봇·흔들림 0·번쩍임 0·동작 줄이기)
// 사용: node pw_v40.js prefix page.html scenario(chain|deal|dash|rookie) skin n
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const [PREFIX, PAGE, SC, SKIN, NN] = [process.argv[2] || 'v40', process.argv[3] || 'dbg.html', process.argv[4] || 'chain', +(process.argv[5] || 20), +(process.argv[6] || 60)];
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 }, reducedMotion: 'reduce' }); await fontRoutes(ctx);
  await ctx.addInitScript(([f]) => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, [JSON.stringify(save)]);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install({ time: new Date('2026-10-11T10:00:00+09:00') });
  await p.goto('http://localhost:8766/' + PAGE);
  for (let i = 0; i < 40; i++) await p.clock.runFor(100);
  for (let i = 0; i < 12; i++) {
    if (await p.locator('#celeb').isVisible()) await p.evaluate(() => document.getElementById('celeb').click());
    else if (await p.locator('#back').isVisible()) await p.evaluate(() => document.getElementById('backGo').click());
    await p.clock.runFor(900);
  }
  const rookie = SC === 'rookie';
  await p.evaluate(([skin, rookie]) => window.__ev(`S.bestFloor = Math.max(S.bestFloor || 0, 329); S.maxFloor = Math.max(S.maxFloor || 0, 329);
    S.wi = 29; S.wl = 5; S.skin = ${skin}; S.char = "robo"; S.fx = { shake: 0, flash: 0, body: 1 };
    S.rank = ${rookie ? 1 : 2}; S.jobs = ${rookie ? '[]' : '["sales"]'}; S.job = ${rookie ? '""' : '"sales"'}; S.autoSkill = false;
    const W = wardState(); ["ch_arm", "ch_tie", "ch_top", "a_boss", "ch_head", "sa_prop", "sa_shoes", "t_boss"].forEach(id => { if (W.own[id] == null) W.own[id] = 1; });
    W.eq = { arm: "ch_arm", tie: "ch_tie", top: "ch_top", aura: "a_boss", head: "ch_head", prop: "sa_prop", shoes: "sa_shoes", title: "t_boss" }; W.look = {};
    jskKey = null; renderJobSkills(); 0`), [SKIN, rookie]);
  for (let i = 0; i < 20; i++) await p.clock.runFor(50);
  for (let i = 0; i < 60 && !(await p.evaluate(() => window.__ev('!!(mon && !mon.dying && spawnWait <= 0)'))); i++) await p.clock.runFor(50);
  await p.evaluate(() => { window.__noFloat = true; window.__ev('mon.hp = mon.max = 1e300; S.pets = {}; bubble.t = 0; bubbleCd = 1e9; floats.length = 0; 0'); });
  const info = await p.evaluate(() => window.__ev('JSON.stringify({ v: GAME_V, skin: skinIdx(), w: WEAPONS[skinIdx()].n, pal: feelFxPal(0), job: S.job })'));
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.clock.runFor(200);
  let T = await p.evaluate(() => window.__ev('last'));
  if (SC === 'deal' || SC === 'dash') await p.evaluate(sc => window.__ev(`castJob(JSK.${sc}, false); 0`), SC);
  const labels = [];
  for (let f = 0; f < NN; f++) {
    T += 1000 / 60;
    const d = await p.evaluate(t => { window.__ev(`frame(${t}); mon.hp = mon.max = 1e300; bubble.t = 0; 0`); const c = document.getElementById('cv'); return { u: c.toDataURL('image/png'), a: window.__ev('(() => { const d = feelDebug(); return d.state[0] + " " + (d.mv || "-") + "@" + d.f; })()') }; }, T);
    fs.writeFileSync(`feelshots/${PREFIX}_${String(f).padStart(3, '0')}.png`, Buffer.from(d.u.split(',')[1], 'base64'));
    labels.push(d.a);
  }
  fs.writeFileSync(`feelshots/${PREFIX}.json`, JSON.stringify(labels));
  console.log(PREFIX, info, 'errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
