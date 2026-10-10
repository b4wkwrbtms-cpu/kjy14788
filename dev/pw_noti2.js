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
  console.log('[A idle]', await body(A)); await A.screenshot({ path: 'measshots/n4_idle.png' });
  await A.click('#iiBody button[data-act="edit"]'); await A.waitForTimeout(300);
  await A.fill('#iiT', '07:30');
  console.log('[A form] toggle', await A.locator('#iiBody .iip-pt').getAttribute('aria-pressed'));
  await A.evaluate(() => { const e = document.querySelector('.iip-pt'); e.scrollIntoView({ block: 'center' }); }); await A.waitForTimeout(300);
  await A.screenshot({ path: 'measshots/n5_form_toggle.png' });
  await A.click('#iiBody button[data-act="save"]'); await A.waitForTimeout(1500);
  console.log('[A saved]', await body(A), '| push', await A.evaluate(() => window.__ev('S.ii.push')));
  console.log('[A calls]', JSON.stringify(A.calls.filter(c => !/kjy_pull/.test(c))));
  await A.evaluate(() => { const e = document.querySelector('.iip'); e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -150); }); await A.waitForTimeout(300);
  await A.screenshot({ path: 'measshots/n6_after_save.png' });
  // 스위치를 끄고 정하면 알림은 켜지 않음
  const D = await open(b, { login: true, standalone: true, push: true });
  await D.click('#iiBody button[data-act="edit"]'); await D.waitForTimeout(200); await D.click('#iiBody .iip-pt'); await D.waitForTimeout(100);
  console.log('[D toggle off]', await D.locator('#iiBody .iip-pt').getAttribute('aria-pressed'));
  await D.click('#iiBody button[data-act="save"]'); await D.waitForTimeout(800);
  console.log('[D saved] push', await D.evaluate(() => window.__ev('S.ii.push')), '| calls', JSON.stringify(D.calls.filter(c => /noti/.test(c))));
  const B2 = await open(b, { login: false, standalone: true, push: true });
  console.log('[B no login]', await body(B2));
  const C = await open(b, { login: true, standalone: false, push: false });
  console.log('[C safari]', await body(C)); await C.screenshot({ path: 'measshots/n7_safari.png' });
  console.log('errors', [A, D, B2, C].map(p => p.errs.length ? p.errs.slice(0, 2) : 'none'));
  await b.close();
})();
