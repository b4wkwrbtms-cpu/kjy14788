// '읽을 때와 곳 · 알림' 찾기 쉬운지: 처음 화면 → 시간 정하고 알림 켜기 → 정하기 한 번에 알림까지
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
async function open(b, o) {
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul' }); await fontRoutes(ctx);
  await ctx.clock.setSystemTime(new Date('2026-10-10T23:50:00+09:00'));
  const calls = [];
  await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', async r => {
    const u = r.request().url(), body = r.request().postData() || ''; let j = {}; try { j = JSON.parse(body); } catch (e) {}
    const name = u.split('/').pop(); calls.push(name + (j.mode ? ':' + j.mode : '') + (j.p_save && j.p_save.ii ? ':push=' + j.p_save.ii.push : ''));
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' } });
    const res = name === 'kjy-noti' ? { ok: true, key: 'BDnLN_hxzgYqcy0L8iPpwBpH-wI-av_IFzMZiGE58G-QZ65amnVREtq3Yp9kSdaiJZp69XCIy-QqBdQ_IN956DA' } : name === 'kjy_pull' ? { ok: true, save: null, save_t: 0 } : name === 'kjy_noti_status' ? { ok: true, subs: 1, paused: false } : { ok: true };
    return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(res) });
  });
  await ctx.addInitScript(([f, o]) => {
    if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); if (o.login) localStorage.setItem('yageun-knight-v3-acct', JSON.stringify({ id: 'tester', token: 'tok', syncT: 0 })); }
    if (o.standalone) Object.defineProperty(navigator, 'standalone', { configurable: true, get: () => true });
    if (o.push) {
      window.__perm = 'default'; window.__subs = [];
      Object.defineProperty(window, 'Notification', { configurable: true, value: class { static get permission() { return window.__perm; } static async requestPermission() { window.__perm = 'granted'; return 'granted'; } } });
      if (!('PushManager' in window)) window.PushManager = function () {};
      const pm = { getSubscription: async () => window.__subs[0] || null, subscribe: async opt => { const s = { endpoint: 'https://web.push.apple.com/QFake', options: opt, toJSON() { return { endpoint: this.endpoint, keys: { p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', auth: 'BTBZMqHH6r4Tts7J_aSIgg' } }; }, unsubscribe: async () => true }; window.__subs = [s]; return s; } };
      const reg = { pushManager: pm, scope: location.origin + '/' };
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: Promise.resolve(reg), register: async () => reg, addEventListener() {} } });
    }
  }, [JSON.stringify(save), o]);
  const p = await ctx.newPage(); p.errs = []; p.calls = calls; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(1500);
  for (let i = 0; i < 24; i++) { await p.waitForTimeout(250); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
  await p.addStyleTag({ content: '.toast{display:none!important}' });
  await p.evaluate(() => window.__ev('selectTab("bible"); (() => { const e = document.querySelector(".iip"); e.scrollIntoView({ block: "start" }); window.scrollBy(0, -150); })()')); await p.waitForTimeout(500);
  return p;
}
const body = async p => (await p.locator('#iiBody').innerText()).replace(/\s+/g, ' ');
(async () => {
  const b = await chromium.launch();
  const A = await open(b, { login: true, standalone: true, push: true });
  console.log('[ladder rows]', await A.evaluate(() => window.__ev('JSON.stringify(ladderRows().filter(r => r.at).map(r => r.t + " → " + r.go + " " + r.at))')));
  await A.evaluate(() => window.__ev('selectTab("daily"); window.scrollTo(0, 0); updateUI(true)')); await A.waitForTimeout(1700);
  const row = A.locator('#glRows button[data-at=".iip"]');
  console.log('[row found]', await row.count());
  await row.scrollIntoViewIfNeeded(); await row.click(); await A.waitForTimeout(600);
  const r = await A.evaluate(() => { const e = document.querySelector('.iip').getBoundingClientRect(); return { tab: window.__ev('curTab'), top: Math.round(e.top), vh: innerHeight }; });
  console.log('[after click]', JSON.stringify(r));
  await A.screenshot({ path: 'measshots/n8_jump.png' });
  console.log('errors', A.errs.length ? A.errs : 'none');
  await b.close();
})();
