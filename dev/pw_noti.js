// 알림 켜기·시험·쉬는 중·다시 켜기·끄기 흐름 (수파베이스 응답과 PushManager 는 흉내)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
(async () => {
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  save.ii = { on: 1, t: "07:30", t2: "", where: "식탁", cue: "아침 먹고 나서", days: 31, push: 0, tz: 540, since: "2026-10-12" };
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul' }); await fontRoutes(ctx);
  await ctx.clock.setSystemTime(new Date('2026-10-12T19:00:00+09:00'));
  const calls = []; let status = { ok: true, subs: 1, paused: false, ignored: 0 };
  await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', async r => {
    const u = r.request().url(), body = r.request().postData() || ''; let j = {};
    try { j = JSON.parse(body); } catch (e) {}
    const name = u.split('/').pop(); calls.push(name + (j.mode ? ':' + j.mode : '') + (j.p_sub ? ':' + j.p_sub.endpoint : '') + (j.p_save && j.p_save.ii ? ':push=' + j.p_save.ii.push : ''));
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' } });
    const res = name === 'kjy-noti' ? (j.mode === 'key' ? { ok: true, key: 'BDnLN_hxzgYqcy0L8iPpwBpH-wI-av_IFzMZiGE58G-QZ65amnVREtq3Yp9kSdaiJZp69XCIy-QqBdQ_IN956DA' } : j.mode === 'test' ? { ok: true, sent: 1 } : { ok: false })
      : name === 'kjy_pull' ? { ok: true, save: null, save_t: 0 } : name === 'kjy_push' ? { ok: true } : name === 'kjy_noti_status' ? status : { ok: true };
    return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(res) });
  });
  await ctx.addInitScript(f => {
    if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); localStorage.setItem('yageun-knight-v3-acct', JSON.stringify({ id: 'tester', token: 'tok', syncT: 0 })); }
    // 알림 권한·푸시 구독 흉내
    window.__subs = []; window.__perm = 'default';
    Object.defineProperty(window, 'Notification', { configurable: true, value: class { static get permission() { return window.__perm; } static async requestPermission() { window.__perm = 'granted'; return 'granted'; } } });
    if (!('PushManager' in window)) window.PushManager = function () {};
    const pm = { getSubscription: async () => window.__subs[0] || null, subscribe: async o => { const s = { endpoint: 'https://web.push.apple.com/QFakeToken', options: o, toJSON() { return { endpoint: this.endpoint, keys: { p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', auth: 'BTBZMqHH6r4Tts7J_aSIgg' } }; }, unsubscribe: async () => { window.__subs = []; return true; } }; window.__subs = [s]; return s; } };
    const reg = { pushManager: pm, scope: location.origin + '/' };
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: Promise.resolve(reg), register: async () => reg, addEventListener() {} } });
  }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(1800);
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(250); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 8) break; }
  await p.addStyleTag({ content: '.toast{display:none!important}' });
  const ev = c => p.evaluate(x => window.__ev(x), c);
  console.log('cloudOn', await ev('cloudOn()'), '| acct', await ev('JSON.stringify(acctGet())'), '| supported', await ev('notiSupported()'));
  await ev('selectTab("bible"); (() => { const e = document.querySelector(".iip"); e.scrollIntoView({ block: "start" }); window.scrollBy(0, -150); })()'); await p.waitForTimeout(500);
  const body = async () => (await p.locator('#iiBody').innerText()).replace(/\s+/g, ' ');
  console.log('[before]', await body());
  await p.click('#iiBody button[data-act="non"]'); await p.waitForTimeout(1200);
  console.log('[on]', await body(), '| I.push', await ev('S.ii.push'), '| perm', await ev('Notification.permission'));
  await p.screenshot({ path: 'measshots/n1_on.png' });
  await p.click('#iiBody button[data-act="ntest"]'); await p.waitForTimeout(800);
  console.log('[test]', await body());
  status = { ok: true, subs: 1, paused: true, ignored: 3 }; await ev('measUI.nstT = 0; measUI.k.ii = ""; updateUI(true)'); await p.waitForTimeout(1200); await ev('measUI.k.ii = ""; updateUI(true)'); await p.waitForTimeout(300);
  console.log('[paused]', await body());
  await p.screenshot({ path: 'measshots/n2_paused.png' });
  await p.click('#iiBody button[data-act="nres"]'); await p.waitForTimeout(800);
  status = { ok: true, subs: 0, paused: false, ignored: 0 }; await ev('measUI.nstT = 0; measUI.k.ii = ""; updateUI(true)'); await p.waitForTimeout(1200); await ev('measUI.k.ii = ""; updateUI(true)'); await p.waitForTimeout(300);
  console.log('[lost]', await body());
  await p.screenshot({ path: 'measshots/n3_lost.png' });
  await p.click('#iiBody button[data-act="noff"]'); await p.waitForTimeout(800);
  console.log('[off]', await body(), '| I.push', await ev('S.ii.push'), '| subs left', await p.evaluate(() => window.__subs.length));
  console.log('calls', JSON.stringify(calls.filter(c => !/kjy_pull/.test(c))));
  console.log('errors', errs.length ? errs : 'none');
  await b.close();
})();
