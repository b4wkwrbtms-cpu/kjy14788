run(1200);
out("boot", E(`JSON.stringify({ v: GAME_V, n: WEAPONS.length, last: LAST_W, wpn36: WPN36.length, wi: S.wi, wl: S.wl, wunl: S.wunl, skin: S.skin, skinIdx: skinIdx(), wlay: S.wlay, g: gradeOf(S.wi), wname: WEAPONS[S.wi].n, gsizes: WGRADES.map((x, g) => WEAPONS.filter((w, i) => gradeOf(i) === g).length), witems: WITEMS.length, wsets: WSETS.length, wgrade: WGRADE.map(x => x.n), chars: CHARS.length })`));
out("power same", E(`JSON.stringify({ p23: wPower(23, 5), old20: 50 * Math.pow(2.2, 20) * 2 })`));
out("wtab", E(`JSON.stringify([17,18,19,22,23,24,29,30,31,41,42,43,53,54,55,65].map(i => [i, BAL.wtab[i]]))`));
out("errors", errors.length ? errors.slice(0, 6) : "none");
