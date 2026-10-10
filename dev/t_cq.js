const d0 = require("fs").readFileSync(process.argv[3], "utf8");
out(E(`(() => { const keep = S; S = merge(${d0}); const before = JSON.stringify((S.habit.cq||[]).map(o=>o.title)); rollDay(); wardTick(false); const mid = JSON.stringify((S.habit.cq||[]).map(o=>o.title)); const fl = celebFlush; window.__f = 0; wardTick(true); const after = JSON.stringify((S.habit.cq||[]).map(o=>o.title)); S = keep; return before + " | " + mid + " | " + after; })()`));
out("errors", errors.length, errors.slice(0, 3).join("\n"));
