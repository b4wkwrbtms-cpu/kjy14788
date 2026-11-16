// v51 확인: 서버를 흉내 낸 저장소로 올리기 → 폰 자료 지우기 → 저절로 받아 오기 (켈러·영웅서기5)
const { chromium, devices } = require('playwright');
const [KP, ZIP] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ ...devices['iPhone 14 Pro'] })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(3000);
  const ev = c => p.evaluate(c => { try { return window.__ev(c); } catch (e) { return 'ERR ' + e.message; } }, c);
  await ev(`window.__srv = {}; acctGet = () => ({ id: "tester", token: "t" }); cloudOn = () => true;
    cloudRpc = async (fn, a) => { const k = a.p_key; if (fn === "kjy_pack_put") { if (a.p_part === 0) __srv[k] = {}; __srv[k][a.p_part] = [a.p_total, a.p_data]; return { ok: true }; }
      if (fn === "kjy_pack_get") { const s = __srv[k]; if (!s) return { ok: true, none: true }; const n = Object.keys(s).length, x = s[a.p_part]; return x ? { ok: true, total: x[0], have: n, data: x[1] } : { ok: false }; } return { ok: true }; }; 0`);
  await ev('menuGo("bible"); typeof showTab === "function" && showTab("study"); 0'); await p.waitForTimeout(800);
  await p.setInputFiles('#kelFile', KP); for (let i = 0; i < 40 && !(await ev('!!(__srv.keller && psync.msg.keller.indexOf("올려 뒀") >= 0)')); i++) await p.waitForTimeout(500);
  console.log('keller uploaded parts', await ev('Object.keys(__srv.keller || {}).length'), await ev('psync.msg.keller'));
  await ev('menuGo("set"); 0'); await p.waitForTimeout(600);
  await p.setInputFiles('#hl5File', ZIP); for (let i = 0; i < 120 && !(await ev('!!(__srv.hl5 && psync.msg.hl5.indexOf("올려 뒀") >= 0)')); i++) await p.waitForTimeout(500);
  console.log('hl5 uploaded parts', await ev('Object.keys(__srv.hl5 || {}).length'), await ev('hl5StatText()'));
  // 폰 자료 지우고 다시 받기
  await ev(`kelDbDo("readwrite", s => s.delete("main")); hl5DbDo("readwrite", s => s.delete("main")); kel.ready = false; kel.list = []; kel.by = {}; hl5.ready = false; hl5.files = null; 0`); await p.waitForTimeout(500);
  await ev('psAuto(); 0'); for (let i = 0; i < 60 && !(await ev('kel.ready && hl5.ready')); i++) await p.waitForTimeout(500);
  console.log('after auto down: keller', await ev('kel.ready + " " + kel.list.length'), 'hl5', await ev('hl5.ready + " " + (hl5.files && hl5.files.size)'));
  console.log('stored again', await ev('kelDbDo("readonly", s => s.count()).then(n => window.__n = n), 0'), await p.waitForTimeout(500), await ev('window.__n'));
  console.log('errors', errs.length ? errs.slice(0, 4) : 'none'); await b.close();
})();
