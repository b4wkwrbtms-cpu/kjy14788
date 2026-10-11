// v37 직무별 대표 동작 · 감사팀 · 겸직 속성 점검: 직무마다 초당 타격 = 공속, 기술 이름이 그 직무 키트, 능력치 배율, 마무리 발동
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };
function runF(ms, stepFn) { const end = now + ms; let i = 0; while (now < end - 1e-6) { const st = stepFn(i++); now += st; wall += st; const cb = rafCb; rafCb = null; try { cb && cb(now); } catch (e) { errors.push("frame: " + e.stack); break; } } }
E(`window.__m = { strikes: 0, moves: {}, procs: 0, subFx: 0 };
  const _hs = heroStrike; heroStrike = function (st) { window.__m.strikes++; return _hs(st); };
  const _fb = feelBegin; feelBegin = function (h, mv) { window.__m.moves[mv] = (window.__m.moves[mv] || 0) + 1; return _fb(h, mv); };
  const _sp = jobSubProc; jobSubProc = function (st) { if (jobSubs().length) window.__m.procs++; return _sp(st); };
  window.__dummy = () => { if (mon && !mon.dying) { mon.hp = mon.max = 1e300; } S.pets.idol = 0; idolBuff.t = 0; };
  0`);
function setJobs(main, jobs, rank) {
  E(`S.rank = ${rank}; S.jobs = ${JSON.stringify(jobs)}; S.job = ${JSON.stringify(main)}; crKey = ""; jskKey = null; renderJobSkills(); 0`);
}
function dummyRun(ms, label) {
  for (let i = 0; i < 200 && !E(`!!(mon && !mon.dying && spawnWait <= 0)`); i++) runF(50, () => 50);
  E(`window.__dummy(); window.__m.strikes = 0; window.__m.moves = {}; window.__m.procs = 0; 0`);
  let t0 = now, exp = 0;
  while (now - t0 < ms - 1e-6) {
    const st = 1000 / 60, q = JSON.parse(E(`JSON.stringify([stats().aps, !!(mon && !mon.dying && spawnWait <= 0 && !introBlocking())])`));
    if (q[1]) exp += q[0] * st / 1000;
    E(`window.__dummy(); 0`);
    runF(st, () => st);
  }
  const m = JSON.parse(E(`JSON.stringify(window.__m)`));
  return { ratio: m.strikes / Math.max(1e-9, exp), m, exp };
}
out("[1] 직무마다 대표 동작 키트 · 초당 타격 = 공속 (±3% 또는 ±2.5발)");
const kits = { sales: ["rise", "chop", "lunge"], plan: ["g_shot", "g_shot2", "g_burst"], dev: ["m_cast", "m_cast2", "m_storm"], hr: ["s_toss", "s_toss2", "s_call"], audit: ["n_aim", "n_aim2", "n_pierce"] };
for (const id in kits) {
  setJobs(id, [id], 2);
  const r = dummyRun(12000, id), mv = Object.keys(r.m.moves);
  check(`${id}: 키트 기술만 씀 (${kits[id].join("·")})`, mv.length > 0 && mv.every(k => kits[id].indexOf(k) >= 0), JSON.stringify(r.m.moves));
  check(`${id}: 초당 타격 = 공속`, Math.abs(r.m.strikes - r.exp) <= Math.max(0.03 * r.exp, 2.5), `기대 ${r.exp.toFixed(1)} 실제 ${r.m.strikes} 비율 ${r.ratio.toFixed(3)}`);   // 창 양 끝에서 ±1발씩 걸칠 수 있음
  check(`${id}: 겸직이 없으면 마무리 발동 0`, r.m.procs === 0, `procs ${r.m.procs}`);
}
out("[2] 감사팀 능력치: 한 발 2배 · 공속 ×0.7 · 치명 피해 ×1.5");
setJobs("", [], 2); const base = JSON.parse(E(`JSON.stringify(stats())`));
setJobs("audit", ["audit"], 2); const au = JSON.parse(E(`JSON.stringify(stats())`));
check("공격력 ×2", Math.abs(au.atk / base.atk - 2) < 1e-6, (au.atk / base.atk).toFixed(3));
check("공속 ×0.7", Math.abs(au.aps / base.aps - 0.7) < 1e-6, (au.aps / base.aps).toFixed(3));
check("치명 피해 ×1.5", Math.abs(au.critMul / base.critMul - 1.5) < 1e-6, (au.critMul / base.critMul).toFixed(3));
out("[3] 겸직 속성: 직무 하나당 +20% · 마무리마다 발동");
setJobs("plan", ["plan"], 3); const one = JSON.parse(E(`JSON.stringify(stats())`));
setJobs("plan", ["plan", "dev"], 3); const two = JSON.parse(E(`JSON.stringify({ st: stats(), subs: jobSubs(), mul: jobSubMul() })`));
check("겸직 1개 → 공격력 ×1.2", Math.abs(two.st.atk / one.atk - 1.2) < 1e-6 && two.subs.join() === "dev", `×${(two.st.atk / one.atk).toFixed(3)} subs=${two.subs}`);
check("겸직 직무의 패시브는 사장 전엔 안 붙음 (개발 공속 +40% 없음)", Math.abs(two.st.aps / one.aps - 1) < 1e-6, `aps ×${(two.st.aps / one.aps).toFixed(3)}`);
const r3 = dummyRun(12000, "plan+dev");
check("3연타 마무리마다 겸직 속성 발동", r3.m.procs > 0 && Math.abs(r3.m.procs - (r3.m.moves.g_burst || 0)) <= 1, `procs ${r3.m.procs} · 마무리 ${r3.m.moves.g_burst}`);
check("겸직이 있어도 초당 타격 = 공속", Math.abs(r3.m.strikes - r3.exp) <= Math.max(0.03 * r3.exp, 2.5), r3.ratio.toFixed(3));
setJobs("hr", ["plan", "dev", "hr", "audit"], 6); const four = JSON.parse(E(`JSON.stringify({ subs: jobSubs(), mul: jobSubMul() })`));
check("겸직 3개 → ×1.6", Math.abs(four.mul - 1.6) < 1e-9 && four.subs.length === 3, `${four.subs} ×${four.mul}`);
out("[4] 직무 칸: 이사 승진에 하나 더 · 다섯 직무");
check("직무 5개", E(`JOBS.length`) === 5 && E(`!!jobById("audit")`));
check("이사(6)까지 직무 칸 4개, 사장(9) 5개", E(`jobSlots(6)`) === 4 && E(`jobSlots(9)`) === 5 && E(`jobSlots(5)`) === 3, `부장 ${E("jobSlots(5)")} 이사 ${E("jobSlots(6)")} 사장 ${E("jobSlots(9)")}`);
out("[5] 터치는 대표 직무의 터치 기술");
setJobs("audit", ["audit"], 2);
for (let i = 0; i < 200 && !E(`feelLive()`); i++) runF(50, () => 50);
E(`window.__dummy(); fHeroM.swap(FH_IDLE); fHero.buf = 0; 0`);
$("cv").dispatch("pointerdown", { clientX: 520, clientY: 200 });
check("감사팀 터치 → n_tap", E(`fHero.mv`) === "n_tap", E(`fHero.mv`));
setJobs("", [], 1);
out(`  통과 ${ok.length} · 실패 ${bad.length}` + (bad.length ? "  → " + bad.join(" / ") : ""));
out("errors", errors.length ? errors.slice(0, 4) : "none");
