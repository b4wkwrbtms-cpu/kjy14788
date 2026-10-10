run(1200);
const r = E("(() => { const st = stats(); return { dps: st.dps, atk: st.atk, aps: st.aps, crit: st.crit, critMul: st.critMul, boss: st.bossBonus, gold: goldMult(), stamp: stampMult(), read: readMult(), ore: oreMult(), floor: S.floor, best: S.bestFloor, vault: vaultTickets(), bt: bossTimeOf(2), mem: memMult() }; })()");
out(JSON.stringify(r));
out("errors", errors.length, errors.slice(0, 3).join("\n"));
