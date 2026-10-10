run(600);
E(`(() => { const L = attLog(), H = habitState(); for (let d = "2026-05-01"; d <= "2026-10-07"; d = addDays(d, 1)) { L[d] = Object.assign(L[d] || {}, { a: 1, c: 2, s: 50, m: 6 }); H.td[d] = (H.td[d] || 0) | 1; S.met.d[d] = { g: 600, rs: 900, t1: 450, fF: 1, tg: 2 }; } attVer++; measUI.first = null; })()`);
T("정보").click(); run(300);
const n = E("updaters.info.length");
const res = [];
for (let i = 0; i < n; i++) { const t0 = process.hrtime.bigint(); for (let k = 0; k < 50; k++) E(`updaters.info[${i}].update(false)`); res.push([i, (Number(process.hrtime.bigint() - t0) / 1e6 / 50).toFixed(3)]); }
out("[per updater ms]", JSON.stringify(res.filter(r => +r[1] > 0.05)));
out("[src]", E(`updaters.info.map((u, i) => i + ':' + String(u.update).slice(0, 50)).filter((s, i) => [${res.filter(r => +r[1] > 0.5).map(r => r[0]).join(",")}].indexOf(i) >= 0).join(' || ')`));
for (const tab of ["weapon", "daily", "bible"]) { E(`selectTab("${tab}")`); const t0 = process.hrtime.bigint(); for (let k = 0; k < 50; k++) E("updateUI(false)"); out("[updateUI]", tab, (Number(process.hrtime.bigint() - t0) / 1e6 / 50).toFixed(3), "ms"); }
