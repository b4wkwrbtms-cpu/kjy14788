// v37 직무 화면: 인사 기록 카드(대표 직무·겸직 +20%·대표 직무로 버튼) · 직무 고르기 창(다섯 직무) — 390px
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'job37', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1500);
  for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
  await p.evaluate(() => { window.__noAtk = true; window.__ev('S.rank = 6; S.jobs = ["plan", "dev", "hr"]; S.job = "plan"; crFocus = "dev"; crKey = ""; jskKey = null; renderJobSkills(); updateUI(true); 0'); });
  await p.click('#tabs button[data-g="info"]'); await p.waitForTimeout(600);
  await p.evaluate(() => { window.__ev('crKey = ""; renderCareer(); 0'); const c = document.getElementById('crCard'); if (c) c.scrollIntoView({ block: 'start' }); });
  await p.waitForTimeout(400);
  const card = p.locator('#crCard'); await card.screenshot({ path: `uishots/${PREFIX}_card.png` });
  const info = await p.evaluate(() => ({ team: document.getElementById('crTeam').textContent, jobs: document.getElementById('crJobS').textContent, tiles: [...document.querySelectorAll('#crJobs .cr-job')].map(b => b.textContent.replace(/\s+/g, ' ').trim()), det: document.getElementById('crDet').textContent.replace(/\s+/g, ' ').trim().slice(0, 300) }));
  console.log(JSON.stringify(info, null, 1));
  // 직무 고르기 창: 이사(4칸)에 세 직무 → 하나 더 고를 수 있음
  await p.evaluate(() => window.__ev('openJobPick(); 0')); await p.waitForTimeout(700);
  await p.screenshot({ path: `uishots/${PREFIX}_pick.png` });
  const opts = await p.evaluate(() => [...document.querySelectorAll('#jpList .jp-opt b')].map(b => b.textContent));
  console.log('pick options', opts);
  // 감사팀 고르기 → 대표 직무는 그대로, 감사가 겸직으로
  await p.evaluate(() => { const b = document.querySelector('#jpList .jp-opt[data-job="audit"]'); if (b) b.click(); });
  await p.waitForTimeout(200); await p.click('#jpGo').catch(() => {}); await p.waitForTimeout(800);
  const after = await p.evaluate(() => window.__ev('JSON.stringify({ job: S.job, jobs: S.jobs, subs: jobSubs(), mul: jobSubMul() })'));
  console.log('after pick', after);
  console.log('errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
