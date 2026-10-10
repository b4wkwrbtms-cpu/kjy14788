const d0 = require("fs").readFileSync(process.argv[3], "utf8");
const r = E(`(() => { const keep = S; S = merge(${d0}); rollDay(); for (const k in skillUntil) delete skillUntil[k]; idolBuff.t = 0; if (typeof wardTick === 'function') wardTick(true); const st = stats(); const r = { dps: st.dps, atk: st.atk, aps: st.aps, crit: st.crit, critMul: st.critMul, boss: st.bossBonus, gold: goldMult(), stamp: stampMult(), read: readMult(), ore: oreMult(), vault: vaultTickets(), bt: bossTimeOf(2), mem: memMult() }; S = keep; return r; })()`);
out(JSON.stringify(r, (k, v) => typeof v === "number" ? +v.toPrecision(5) : v));
out("errors", errors.length, errors.slice(0, 3).join("\n"));
