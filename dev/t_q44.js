run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
out(E(`JSON.stringify({ v: GAME_V, n: VERSES.length, sets: VERSE_SETS.length, int: MEM_INT, mem: { sets: S.mem.sets, setDay: S.mem.setDay, round: S.mem.round, rg: S.mem.rg, vset: S.mem.vset, total: S.mem.total, keys: Object.keys(S.mem.v) } })`));
out(E(`JSON.stringify(memQueue().map(v => v.no))`));
out(E(`JSON.stringify((() => { const P = memParts(); return { rev: P.rev.length, rot: P.rot.length, nw: P.nw.length, more: P.more, batch: P.batch.map(v => v.no) }; })())`));
out(E(`memRoundLine()`));
out("mGo: " + ($("mGo") ? $("mGo").textContent : "-") + " | mRd: " + ($("mRd") ? $("mRd").innerHTML : "-"));
out("errors " + (errors.length ? JSON.stringify(errors.slice(0, 3)) : "none"));
