// v35 손맛 점검 2: 안 죽는 몬스터로 초당 타격 = 공속인지 (프레임레이트·흔들리는 프레임 간격), 접촉 수·묶음 크기, 히트스톱 표
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const NEW = E(`typeof feelDebug === "function"`);
function runF(ms, stepFn) { const end = now + ms; let i = 0; while (now < end - 1e-6) { const st = stepFn(i++); now += st; wall += st; const cb = rafCb; rafCb = null; try { cb && cb(now); } catch (e) { errors.push("frame: " + e.stack); break; } } }
E(`window.__m = { strikes: 0, contacts: 0, sizes: {} };
  const _hs = heroStrike; heroStrike = function (st) { window.__m.strikes++; return _hs(st); };
  ${NEW} && (function () { const _fi = feelImpact; feelImpact = function (b) { if (b.mv !== "proj") { window.__m.contacts++; window.__m.sizes[b.n] = (window.__m.sizes[b.n] || 0) + 1; } return _fi(b); }; })();
  window.__dummy = () => { if (mon && !mon.dying) { mon.hp = mon.max = 1e300; } S.pets.idol = 0; idolBuff.t = 0; };   // 아이돌 응원(무작위 공속 2배)은 끔
  0`);
function dummyRun(ms, stepFn, label, setup) {
  if (setup) E(setup);
  // 몬스터가 살아날 때까지
  for (let i = 0; i < 200 && !E(`!!(mon && !mon.dying && spawnWait <= 0)`); i++) runF(50, () => 50);
  E(`window.__dummy(); window.__m.strikes = 0; window.__m.contacts = 0; window.__m.sizes = {}; 0`);
  let t0 = now, exp = 0, i = 0;
  while (now - t0 < ms - 1e-6) {   // 기대 타격 = 프레임마다 (그때 공속 × 살아 있던 시간) — 버프가 켜졌다 꺼져도 맞게
    const st = stepFn(i++), q = JSON.parse(E(`JSON.stringify([stats().aps, !!(mon && !mon.dying && spawnWait <= 0 && !introBlocking())])`));
    if (q[1]) exp += q[0] * st / 1000;
    runF(st, () => st);
  }
  const m = JSON.parse(E(`JSON.stringify(Object.assign({}, window.__m, { aps: stats().aps }))`));
  const sec = (now - t0) / 1000;
  out(label, "기대 타격", exp.toFixed(1), "실제", m.strikes, "비율", (m.strikes / exp).toFixed(4), "접촉/초", (m.contacts / sec).toFixed(2), "묶음", JSON.stringify(m.sizes));
  return m.strikes / exp;
}
const r60 = dummyRun(20000, () => 1000 / 60, "[60fps]");
const r30 = dummyRun(20000, () => 1000 / 30, "[30fps]");
const r120 = dummyRun(20000, () => 1000 / 120, "[120fps]");
const rj = dummyRun(20000, i => [9, 23, 16, 31, 12, 18][i % 6], "[들쭉날쭉 9~31ms]");
const r20 = dummyRun(20000, () => 50, "[20fps]");
const rh = dummyRun(20000, () => 1000 / 60, "[공속 ×4 (러시·운동화)]", `S.sneakerUntil = Date.now() + 9e7; S.active.haste = 9e7; 0`);
E(`S.sneakerUntil = 0; S.active.haste = 0; 0`);
if (NEW) {
  const d = JSON.parse(E(`JSON.stringify(feelDebug())`));
  out("프레임 표 (공속 단계 1 / 0.85 / 0.7):");
  for (const mv in d.fd) out("  " + mv.padEnd(6), d.fd[mv].map(f => `시작${f.startup}(내려${f.strike}) 판정${f.active} 유지${f.hold} 복귀${f.ret} | 캔슬${f.cancel} 전체${f.total}`).join("  ||  "));
  const tiers = ["hit", "finisher", "tap", "proj", "crit"], ds = [1, 5, 10, 20, 40, 80];
  out("히트스톱(f) d=" + ds.join("/") + "%:");
  const tab = JSON.parse(E(`JSON.stringify(${JSON.stringify(tiers)}.map(t => [t, ${JSON.stringify(ds)}.map(d => feelHitlag(d, FEEL_RECIPE[t]))]))`));
  let mono = true; tab.forEach(([t, v]) => { out("  " + t.padEnd(9), v.join(" ")); for (let i = 1; i < v.length; i++) if (v[i] < v[i - 1]) mono = false; });
  out("  d가 커질수록 줄지 않음(단조):", mono, " 처치", E(`FEEL_RECIPE.kill.f`), "f · 큰 보스 처치", E(`FEEL_RECIPE.bossKill.f`), "f");
}
out("PASS 초당 타격=공속(±2%):", [r60, r30, r120, rj, r20, rh].every(r => Math.abs(r - 1) < 0.02));
out("errors", errors.length ? errors.slice(0, 4) : "none");
