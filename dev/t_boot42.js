run(1200);
out("boot", E(`JSON.stringify({ v: GAME_V, n: WEAPONS.length, last: LAST_W, wgate: S.wgate, wi: S.wi, g: gradeOf(S.wi), tt: S.treTier, vb: S.vault, hp100: hpBase(100), lock21: wLocked(21), lock24: wLocked(24) })`));
out("errors", errors.length ? errors.slice(0, 4) : "none");
