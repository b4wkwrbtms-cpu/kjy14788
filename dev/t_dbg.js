const d0 = require("fs").readFileSync(process.argv[3], "utf8");
out(E(`(() => { const keep = S; S = merge(${d0}); rollDay(); wardTick(true); const W = wardStats(); const r = JSON.stringify({ W, eq: S.ward.eq, own: S.ward.own, coffee: S.coffee, tum: treVal("tumbler"), sneak: S.sneakerUntil, now: Date.now(), act: S.active, cAps: careerAps(), rush: skillOn("rush") }); S = keep; return r; })()`));
