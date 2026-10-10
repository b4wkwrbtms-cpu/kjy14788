// v35 손맛 점검 1: 처치 속도·초당 타격(예전과 같은지), 멈춘 시간 비율, 오류
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const NEW = E(`typeof feelDebug === "function"`);
E(`window.__m = { strikes: 0, kills: 0 };
  const _hs = heroStrike; heroStrike = function (st) { window.__m.strikes++; return _hs(st); };
  const _k = kill; kill = function () { window.__m.kills++; return _k(); };
  0`);
function runF(ms, step) { const end = now + ms; while (now < end - 1e-6) { now += step; wall += step; const cb = rafCb; rafCb = null; try { cb && cb(now); } catch (e) { errors.push("frame: " + e.stack); break; } } }
function measure(ms, tapEvery, step) {
  step = step || 1000 / 60;
  E(`window.__m.strikes = 0; window.__m.kills = 0; 0`);
  let t = 0, nextTap = tapEvery || Infinity, frozen = 0, live = 0, hfrz = 0;
  while (t < ms) {
    const s = JSON.parse(E(`JSON.stringify({ hs: hitStop, live: !!(mon && !mon.dying && spawnWait <= 0), lf: ${NEW} ? (fHero.frz > 0 || feelV.frz > 0) : false, hf: ${NEW} ? fHero.frz > 0 : false })`));
    if (s.hs > 0 || s.lf) frozen += step;
    if (s.hf) hfrz += step;
    if (s.live) live += step;
    runF(step, step); t += step;
    if (t >= nextTap) { $("cv").dispatch("pointerdown", { clientX: 520, clientY: 200 }); nextTap += tapEvery; }
  }
  const m = JSON.parse(E(`JSON.stringify(Object.assign({}, window.__m, { aps: stats().aps }))`));
  return Object.assign(m, { live, frozen, hfrz, ms });
}
const show = (name, m) => out(name, "타격", m.strikes, "처치", m.kills, "처치/분", (m.kills / (m.ms / 60000)).toFixed(1), "살아있는 시간 기준 타격/초", (m.strikes / Math.max(0.001, m.live / 1000)).toFixed(2), "공속", m.aps.toFixed(2), "멈춤 비율(전체)", (m.frozen / m.ms).toFixed(3), "곽준영 멈춤", (m.hfrz / m.ms).toFixed(3));
show("[자동 20초 · 60fps]", measure(20000, 0));
show("[터치 8회/초 20초 · 60fps]", measure(20000, 125));
show("[자동 20초 · 30fps]", measure(20000, 0, 1000 / 30));
out("errors", errors.length ? errors.slice(0, 4) : "none");
