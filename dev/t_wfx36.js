run(600);
out("wfx shown", E(`JSON.stringify({ wfx: wardWfxShown(), style: slashStyle(), wi: S.wi, skin: S.skin, skinIdx: skinIdx(), n: WEAPONS[skinIdx()].n, eq: (S.ward && S.ward.eq) ? S.ward.eq.wfx : null, look: (S.ward && S.ward.look) ? S.ward.look.wfx : null, pal: feelFxPal(0) })`));
out("errors", errors.length ? errors.slice(0, 3) : "none");
