const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ timezoneId: 'Asia/Seoul' });
  await ctx.grantPermissions(['notifications'], { origin: 'http://localhost:8766' });
  await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', r => r.abort());
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/index.html'); await p.waitForTimeout(2500);
  const reg = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { scope: r.scope, active: !!r.active, perm: Notification.permission }; });
  console.log('sw', JSON.stringify(reg));
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('ServiceWorker.enable');
  let regId = null; cdp.on('ServiceWorker.workerRegistrationUpdated', e => { for (const r of e.registrations) if (r.scopeURL.indexOf('localhost:8766') >= 0) regId = r.registrationId; });
  await p.waitForTimeout(800);
  if (!regId) { console.log('no regId'); }
  else {
    await cdp.send('ServiceWorker.deliverPushMessage', { origin: 'http://localhost:8766', registrationId: regId, data: JSON.stringify({ title: '말씀 읽을 시간이에요', body: '한 장이면 충분해요. 지금 펼쳐 볼까요?', url: './?go=bible', tag: 'kjy-read' }) });
    await p.waitForTimeout(800);
    const ns = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; const n = await r.getNotifications(); return n.map(x => ({ t: x.title, b: x.body, tag: x.tag, d: x.data })); });
    console.log('notifications', JSON.stringify(ns));
    await cdp.send('ServiceWorker.deliverPushMessage', { origin: 'http://localhost:8766', registrationId: regId, data: 'plain text body' });
    await p.waitForTimeout(800);
    console.log('after plain', JSON.stringify(await p.evaluate(async () => (await (await navigator.serviceWorker.ready).getNotifications()).map(x => x.title + '|' + x.body))));
  }
  console.log('errors', errs.length ? errs : 'none');
  await b.close();
})();
