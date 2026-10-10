run(400);
out("[boot toast]", JSON.stringify(txt("toast")), "| fest", E("JSON.stringify({ sid: S.fest.sid, lv: S.fest.lv })"));
// festTick 비용: 1000번
out("[cost] festTick x1000 ms", E(`(() => { const t0 = performance.now ? 0 : 0; const a = Date.now(); for (let i = 0; i < 1000; i++) festTick(); return "memo ok"; })()`));
const t0 = process.hrtime.bigint(); E("for (let i = 0; i < 2000; i++) festTick();"); const t1 = process.hrtime.bigint();
out("[cost] festTick avg us", Number(t1 - t0) / 2000 / 1000);
const t2 = process.hrtime.bigint(); E("for (let i = 0; i < 200; i++) { festMemo.k = ''; festGet(festCur()); }"); const t3 = process.hrtime.bigint();
out("[cost] festGet full avg ms", (Number(t3 - t2) / 200 / 1e6).toFixed(3));
const t4 = process.hrtime.bigint(); E("for (let i = 0; i < 200; i++) { scrMemo.t = 0; scrollGoldMemo(); }"); const t5 = process.hrtime.bigint();
out("[cost] scrollGold avg ms", (Number(t5 - t4) / 200 / 1e6).toFixed(3));
T("말씀").click(); run(200);
const t6 = process.hrtime.bigint(); E("for (let i = 0; i < 200; i++) { document.getElementById('dexBody')._k = ''; dexRender(); }"); const t7 = process.hrtime.bigint();
out("[cost] dexRender avg ms", (Number(t7 - t6) / 200 / 1e6).toFixed(3));
out("errors", errors.length, errors.slice(0, 3).join("\n"));
