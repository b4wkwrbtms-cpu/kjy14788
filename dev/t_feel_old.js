// v34(예전) 타격 계측: 자동 공격 실제 타격 수 vs 능력치, 전역 멈춤 비율, 터치 연타 때 멈춤 비율
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
E(`window.__m = { strikes: 0, frozen: 0, live: 0, kills: 0 };
  const _hs = heroStrike; heroStrike = function (st) { window.__m.strikes++; return _hs(st); };
  const _k = kill; kill = function () { window.__m.kills++; return _k(); };
  0`);
// 실제 기기처럼 16.7ms 프레임으로 돌림 (하네스 기본은 50ms)
function runF(ms, step) { const end = now + ms; while (now < end - 1e-6) { now += step; wall += step; const cb = rafCb; rafCb = null; try { cb && cb(now); } catch (e) { errors.push("frame: " + e.stack); break; } } }
function measure(ms, tapEvery) {
  E(`window.__m = { strikes: 0, frozen: 0, live: 0, kills: 0 }; 0`);
  let t = 0, nextTap = tapEvery || Infinity;
  while (t < ms) {
    // 프레임마다 상태 기록 (50ms 단위 하네스)
    const s = JSON.parse(E(`JSON.stringify({ hs: hitStop, live: !!(mon && !mon.dying && spawnWait <= 0) })`));
    if (s.hs > 0) E(`window.__m.frozen += 1000 / 60; 0`);
    if (s.live) E(`window.__m.live += 1000 / 60; 0`);
    runF(1000 / 60, 1000 / 60); t += 1000 / 60;
    if (t >= nextTap) { $("cv").dispatch("pointerdown", { clientX: 520, clientY: 200 }); nextTap += tapEvery; }
  }
  const m = JSON.parse(E(`JSON.stringify(Object.assign(window.__m, { aps: stats().aps, interval: stats().interval }))`));
  return m;
}
const a = measure(20000, 0);
out("[자동만 20초]", JSON.stringify(a), "실제 타격/초(살아있는 시간 기준)", (a.strikes / (a.live / 1000)).toFixed(2), "능력치 공속", a.aps.toFixed(2), "비율", (a.strikes / (a.live / 1000) / a.aps).toFixed(3), "멈춘 시간 비율", (a.frozen / 20000).toFixed(3));
const b = measure(20000, 125);
out("[터치 8회/초 20초]", JSON.stringify(b), "자동 타격/초", (b.strikes / (b.live / 1000)).toFixed(2), "멈춘 시간 비율", (b.frozen / 20000).toFixed(3));
out("errors", errors.length ? errors.slice(0, 3) : "none");
