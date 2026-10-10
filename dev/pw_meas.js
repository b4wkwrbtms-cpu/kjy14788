const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
async function page(b, save, opts = {}) {
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', ...(opts.ctx || {}) }); await fontRoutes(ctx);
  if (opts.time) await ctx.clock.setSystemTime(new Date(opts.time));
  await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', r => r.abort());
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); if (f) { const s = JSON.parse(f); s.t = Date.now(); s.autoSkill = false; s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } } }, save ? JSON.stringify(save) : "");
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html' + (opts.qs || '')); await p.waitForTimeout(1800);
  p.celebs = [];
  for (let i = 0; i < 24; i++) {
    await p.waitForTimeout(300);
    if (await p.locator('#celeb').isVisible()) { p.celebs.push(await p.locator('#celebT').textContent()); if (opts.shotCeleb && p.celebs[p.celebs.length - 1].indexOf(opts.shotCeleb[0]) >= 0) await p.screenshot({ path: opts.shotCeleb[1] }); await p.click('#celeb', { timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); }
    else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2500 }).catch(() => {});
    else if (i > 12) break;
  }
  await p.addStyleTag({ content: '.toast{display:none!important}' });
  await p.evaluate(() => { window.__noFloat = true; window.__noAtk = true; });
  return p;
}
const go = async (p, js, shot, wait) => { await p.evaluate(c => window.__ev(c), js); await p.waitForTimeout(wait || 500); if (shot) await p.screenshot({ path: 'measshots/' + shot }); };
const at = sel => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (e) { e.scrollIntoView({ block: "start" }); window.scrollBy(0, -150); } })()`;
const celebs = async p => { const o = []; for (let i = 0; i < 6; i++) { if (await p.locator('#celeb').isVisible()) { o.push(await p.locator('#celebT').textContent()); await p.click('#celeb').catch(() => {}); await p.waitForTimeout(350); } } return o; };
// 8주치 평소 기록 (주마다 3~7일)
const SEED = `(() => {
  const L = attLog(), H = habitState(), M = metState(), pat = [3, 4, 5, 4, 6, 5, 7, 5];
  let wk = "2026-08-10";
  pat.forEach((n, w) => { for (let i = 0; i < 7; i++) { const d = addDays(wk, i); if (d >= "2026-10-08") continue; if (i < n) { L[d] = Object.assign(L[d] || {}, { a: 1, c: 1 + (i % 3), s: 25 + 10 * (i % 4), m: 3 + (i % 5) }); H.td[d] = (H.td[d] || 0) | 1; M.d[d] = { g: 900 + 60 * i, rs: 600 + 120 * (i % 3), t1: 440 + 15 * (i % 6), fF: 1 + (i % 2), fP: i % 3 === 0 ? 1 : 0, tg: 1 + (i % 3) }; } } wk = addDays(wk, 7); });
  M.mr["2026-09"] = { w: [17, 19], m: [5, 6] }; M.mr["2026-10"] = { w: [8, 9], m: [2, 2] };
  const W = stewState(); W.m["2026-09"] = { d: "2026-09-01", a: [3, 4, 3, 2], mo: [5, 6, 4, 3], rg: ["weapon"], rgt: "", nx: "점심 먹고 한 장" };
  W.w["2026-09-28"] = "고난 중에도 함께하신다는 말씀이 버팀목이었다"; W.w["2026-09-21"] = "시편 23편을 하루 세 번 소리 내어 읽었다";
  attVer++; measUI.first = null; measUI.k = {}; updateUI(true);
})()`;
(async () => {
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const b = await chromium.launch();
  // 1) 정보 탭: 상태판 · 청지기 · 보상 끄기
  const p = await page(b, save, { time: '2026-10-11T19:30:00+09:00' });
  console.log('celebs', p.celebs);
  await go(p, SEED, null, 400);
  await go(p, 'selectTab("info"); ' + at('.mst'), 'm1_board.png', 900);
  await go(p, 'window.scrollBy(0, 420)', 'm2_board_rows.png', 400);
  await go(p, '(() => { const d = document.querySelector(".mst-chk"); if (d) d.open = true; })(); ' + at('.mst-chk'), 'm3_checks.png', 500);
  await go(p, at('#mstWeek'), 'm4_week_rite.png', 400);
  await p.fill('#mstWIn', '말씀이 이번 주 나를 붙들어 주었다');
  await p.click('#mstWeek button[data-act="wsave"]'); await p.waitForTimeout(400);
  await go(p, at('#mstWeek'), 'm5_week_saved.png', 300);
  await go(p, at('.stw'), 'm6_stew.png', 400);
  await p.click('#stwBody button[data-act="open"]'); await p.waitForTimeout(300);
  for (const [q, i, v] of [["a", 0, 5], ["a", 1, 4], ["a", 2, 5], ["mo", 0, 6], ["mo", 1, 7]]) await p.click(`#stwBody .stw-sc button[data-q="${q}"][data-i="${i}"][data-v="${v}"]`);
  await p.click('#stwBody .stw-rg button[data-id="suit"]');
  await go(p, at('.stw'), 'm7_stew_form.png', 300);
  await go(p, 'window.scrollBy(0, 560)', 'm8_stew_form2.png', 300);
  await p.click('#stwBody button[data-act="save"]'); await p.waitForTimeout(300);
  console.log('stew incomplete saved?', await p.evaluate(() => window.__ev('!!S.stew.m["2026-10"]')));
  for (const [q, i, v] of [["a", 3, 3], ["mo", 2, 3], ["mo", 3, 2]]) await p.click(`#stwBody .stw-sc button[data-q="${q}"][data-i="${i}"][data-v="${v}"]`);
  await p.fill('#stwNx', '출근길 지하철에서 한 장');
  await p.click('#stwBody button[data-act="save"]'); await p.waitForTimeout(400);
  await go(p, at('.stw'), 'm9_stew_done.png', 300);
  await go(p, at('.rof'), 'm10_roff_idle.png', 300);
  await p.click('#rofBody button[data-act="start"]'); await p.waitForTimeout(400);
  await go(p, at('.rof'), 'm11_roff_planned.png', 300);
  console.log('errors1', p.errs.length ? p.errs.slice(0, 5) : 'none');
  // 2) 보상 끄기 주간 중 (월요일): 업무 탭 · 암송 결과 · 상태판
  const save2 = JSON.parse(JSON.stringify(save)); save2.roff = { on: { from: '2026-10-12', to: '2026-10-18', base: { c: 5, s: 200, m: 25 } }, hist: [], esc: { manna: 40, stamp: 12 }, wgt: 100, unl: 0 };
  const q = await page(b, save2, { time: '2026-10-13T08:10:00+09:00' });
  console.log('q celebs', q.celebs);
  await go(q, SEED, null, 300);
  await go(q, '(() => { S.bible.rsec = (S.bible.rsec || 0) + 9999; toggleChapter(1, 4); S.day.boss = 25; S.ach.chap = 0; updateUI(true); })(); selectTab("daily"); window.scrollTo(0, 0)', 'm12_roff_daily_top.png', 700);
  await go(q, at('.task'), 'm13_roff_tasks.png', 400);
  await go(q, 'selectTab("info"); ' + at('.rof'), 'm14_roff_on.png', 500);
  await q.click('#rofBody button[data-act="stop"]'); await q.waitForTimeout(250);
  await go(q, at('.rof'), 'm15_roff_stop_ask.png', 200);
  await go(q, '(() => { const t = dayKey(); S.mem.v[VERSES[40].no] = { s: MEM_MASTER - 1, n: 6, f: 0, due: t, last: addDays(t, -9) }; })(); selectTab("mem"); window.scrollTo(0, 0)', null, 400);
  console.log('errors2', q.errs.length ? q.errs.slice(0, 5) : 'none');
  // 3) 결과 화면: 다음 월요일 (80% 넘음)
  const save3 = JSON.parse(JSON.stringify(save2)); save3.roff.on.base = { c: 3, s: 100, m: 10 };
  const r = await page(b, save3, { time: '2026-10-19T08:00:00+09:00', shotCeleb: ['보상 끄기', 'measshots/m16a_roff_celeb.png'] });
  console.log('r celebs', r.celebs);
  await go(r, SEED, null, 300);
  await go(r, 'selectTab("info"); ' + at('.rof'), 'm16_roff_result.png', 500);
  console.log('roff hist', await r.evaluate(() => window.__ev('JSON.stringify(S.roff.hist) + " unl " + S.roff.unl')));
  console.log('errors3', r.errs.length ? r.errs.slice(0, 5) : 'none');
  // 4) 말씀 탭: 읽을 때와 곳
  const s4 = await page(b, save, { time: '2026-10-12T07:05:00+09:00' });
  await go(s4, SEED, null, 300);
  await go(s4, 'selectTab("bible"); ' + at('.iip'), 'm17_ii_idle.png', 500);
  await s4.click('#iiBody button[data-act="edit"]'); await s4.waitForTimeout(300);
  await s4.fill('#iiT', '07:30'); await s4.fill('#iiCue', '아침 먹고 나서'); await s4.fill('#iiWhere', '식탁');
  await s4.click('#iiBody .iip-days button[data-i="5"]'); await s4.click('#iiBody .iip-days button[data-i="6"]');
  await s4.fill('#iiT2', '21:00');
  await go(s4, at('.iip'), 'm18_ii_form.png', 300);
  await s4.click('#iiBody button[data-act="save"]'); await s4.waitForTimeout(400);
  await go(s4, at('.iip'), 'm19_ii_set.png', 300);
  await s4.click('#iiBody button[data-act="non"]'); await s4.waitForTimeout(400);
  await go(s4, at('.iip'), 'm20_ii_noti_msg.png', 300);
  await go(s4, 'selectTab("weapon"); window.scrollTo(0, 0)', 'm21_strip_near.png', 1600);
  console.log('near', await s4.evaluate(() => window.__ev('iiNear() + " " + JSON.stringify(ladderRows()[0])')));
  console.log('errors4', s4.errs.length ? s4.errs.slice(0, 5) : 'none');
  // 5) 알림을 눌러 열기: ?go=bible
  const g = await page(b, save, { qs: '?go=bible' });
  console.log('go=bible tab', await g.evaluate(() => window.__ev('curTab')), '| url', await g.evaluate(() => location.href));
  console.log('errors5', g.errs.length ? g.errs.slice(0, 5) : 'none');
  // 6) 좁은 화면 360px
  const w = await page(b, save, { time: '2026-10-12T19:00:00+09:00', ctx: { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } });
  await go(w, SEED, null, 300);
  await go(w, 'selectTab("info"); ' + at('.mst'), 'm22_narrow_board.png', 700);
  await go(w, 'window.scrollBy(0, 480)', 'm23_narrow_rows.png', 300);
  await w.click('#stwBody button[data-act="open"]').catch(() => {}); await w.waitForTimeout(300);
  await go(w, at('.stw'), 'm24_narrow_stew.png', 300);
  const ox1 = await w.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await go(w, 'selectTab("bible"); ' + at('.iip'), null, 400);
  await w.click('#iiBody button[data-act="edit"]').catch(() => {}); await w.waitForTimeout(300);
  await go(w, at('.iip'), 'm25_narrow_ii.png', 300);
  const ox2 = await w.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('narrow overflowX', ox1, ox2, '| errors', w.errs.length ? w.errs.slice(0, 5) : 'none');
  // 7) 새 게임
  const n = await page(b, null);
  await go(n, 'selectTab("info"); ' + at('.mst'), 'm26_fresh_board.png', 600);
  console.log('fresh errors', n.errs.length ? n.errs.slice(0, 5) : 'none');
  await b.close();
})();
