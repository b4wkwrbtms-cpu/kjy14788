// v37 서는 자리: 검사만 붙고 원거리 직무는 떨어짐 · 총구가 몬스터 밖 · 직무 바꾸면 미끄러지듯
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };
function setJob(main, rank) { E(`S.rank = ${rank}; S.jobs = ${JSON.stringify(main ? [main] : [])}; S.job = ${JSON.stringify(main)}; crKey = ""; jskKey = null; renderJobSkills(); 0`); }
const kits = { "": "melee", sales: "melee", plan: "gun", dev: "magic", hr: "summon", audit: "snipe" };
const geo = {};
for (const id in kits) {
  setJob(id, 2); run(1500);
  for (let i = 0; i < 200 && !E(`!!(mon && !mon.dying && spawnWait <= 0 && mon.born >= 1)`); i++) run(50);
  const g = JSON.parse(E(`JSON.stringify((() => { const K = feelKit(), mv = K.chain[0], B = feelBox(), mz = feelMuzzle(mv), tip = feelTip(FEEL_KEYS[mv].B), big = Math.max(0, MON_X - 64);
    return { hx: HERO_X, mx: MON_X, bx0: B.x0, bx1: B.x1, w: monSize().w, mz: [mz.x, mz.y], tip, edgeBoss: MON_X - 64, front: HERO_X + 17 * 3.5 }; })())`));
  geo[id] = g;
  out(`  ${id || "(없음)"} ${kits[id]}: 곽준영 x ${g.hx} · 몬스터 x ${g.mx} (폭 ${g.w}, 왼쪽 끝 ${g.bx0.toFixed(0)}) · 총구 ${g.mz[0].toFixed(0)} · 칼끝 ${g.tip[0].toFixed(0)} · 몸 앞 ${g.front.toFixed(0)} · 몸-몬스터 ${(g.bx0 - g.front).toFixed(0)}`);
}
check("검사는 그대로 붙어 섬", geo.sales.hx === 334 && geo.sales.mx === 474 && geo[""].hx === 334);
for (const id of ["plan", "dev", "hr", "audit"]) {
  const g = geo[id];
  check(`${id}: 몬스터와 떨어져 섬 (몸-몬스터 ≥ 110px)`, g.bx0 - g.front >= 110, (g.bx0 - g.front).toFixed(0));
  if (id !== "hr") check(`${id}: 총구·지팡이 끝이 몬스터 밖 (보스 폭이어도 ≥ 10px)`, g.edgeBoss - g.mz[0] >= 10 && g.bx0 - g.mz[0] >= 10, `일반 ${(g.bx0 - g.mz[0]).toFixed(0)} · 보스 ${(g.edgeBoss - g.mz[0]).toFixed(0)}`);
}
out("[직무 바꾸면 미끄러지듯]");
setJob("sales", 2); run(1500);
setJob("plan", 2);
const xs = []; for (let i = 0; i < 30; i++) { run(1000 / 60); xs.push(+E(`HERO_X`).toFixed(1)); }
const mono = xs.every((v, i) => i === 0 || v <= xs[i - 1] + 1e-9);
check("뒤로 물러나는 동안 한 방향으로 줄어듦", mono && xs[0] < 334 && xs[0] > 334 - 56, xs.slice(0, 8).join(" → "));
check("0.5초 안에 자리 잡음", xs[29] === 334 - 56, String(xs[29]));
setJob("", 1); run(1000);
out(`  통과 ${ok.length} · 실패 ${bad.length}` + (bad.length ? "  → " + bad.join(" / ") : ""));
out("errors", errors.length ? errors.slice(0, 4) : "none");
