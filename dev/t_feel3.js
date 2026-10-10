// v35 손맛 점검 3: 상태 기계·입력 버퍼·히트스톱·흔들림 규칙 (AP-FEEL-01·02·04·05, CP-04·12·13)
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };
function frames(n) { for (let i = 0; i < n; i++) { now += 1000 / 60; wall += 1000 / 60; const cb = rafCb; rafCb = null; try { cb && cb(now); } catch (e) { errors.push("frame: " + e.stack); break; } } }
// 아무 무작위 없이: 치명 없음, 아이돌 응원 끔, 안 죽는 몬스터
function dummy() {
  for (let i = 0; i < 300 && !E(`feelLive()`); i++) frames(3);
  E(`mon.hp = mon.max = 1e300; S.pets.idol = 0; idolBuff.t = 0; 0`);
}
const st = () => JSON.parse(E(`JSON.stringify({ s: fHeroM.cur.id, mv: fHero.mv, f: fHero.f, buf: fHero.buf, frz: fHero.frz, pend: fHero.pend, vf: feelV.frz, hp: mon.hp, live: feelLive(), fd: fHero.fd })`));
const tap = () => $("cv").dispatch("pointerdown", { clientX: 520, clientY: 200 });
E(`window.__crit0 = stats; stats = function () { const s = window.__crit0(); s.crit = 0; return s; }; 0`);   // 치명 끔 (규칙 점검용)
dummy();

out("[1] 예비동작 중 터치 → 바로 찌르기, 피해는 입력 프레임 (AP-FEEL-01, U-FEEL-02)");
for (let i = 0; i < 400; i++) { const s = st(); if (s.s === "windup" && s.mv !== "jab" && s.f >= 1 && s.f < s.fd.startup - s.fd.strike) break; frames(1); }
let a = st(); E(`mon.hp = 1e12; 0`); const hp0 = +E(`mon.hp`); tap(); let b = st();
check("터치한 그 프레임에 피해", +E(`mon.hp`) < hp0, `hp ${hp0} → ${E("mon.hp")}`);
check("자동 기술 예비동작이 찌르기로 바뀜", a.mv !== "jab" && b.mv === "jab" && (b.s === "windup" || b.s === "active"), `${a.s}/${a.mv}@${a.f} → ${b.s}/${b.mv}@${b.f}`);
E(`mon.hp = mon.max = 1e300; 0`);

out("[2] 판정 중 터치 → 버퍼(9f), 캔슬 창에서 실행, 첫 입력만 (AP-FEEL-04, P-FEEL-02·03)");
frames(40);
for (let i = 0; i < 400; i++) { const s = st(); if (s.s === "active" && s.mv !== "jab") break; frames(1); }
a = st(); E(`mon.hp = 1e12; 0`); const hp1 = +E(`mon.hp`);
tap(); const hp2 = +E(`mon.hp`); tap(); const hp3 = +E(`mon.hp`);
b = st();
check("판정 중 터치는 동작을 버퍼에 (9f)", b.buf === 9 && b.mv === a.mv, `buf=${b.buf} mv=${b.mv}`);
check("버퍼돼도 피해는 터치마다 그 프레임에", hp2 < hp1 && hp3 < hp2);
let jabStarts = 0, prevMv = b.mv, waited = 0;
for (let i = 0; i < 30; i++) { frames(1); const s = st(); if (s.mv === "jab" && prevMv !== "jab") { jabStarts++; waited = i + 1; } prevMv = s.mv; if (s.mv === "jab" && s.s === "recover") break; }
check("캔슬 창이 열리면 찌르기 1번 실행 (두 번 눌러도 동작은 한 번)", jabStarts === 1, `${waited}f 뒤 시작`);
check("버퍼는 실행할 때 비움", st().buf === 0);
E(`mon.hp = mon.max = 1e300; 0`);

out("[3] 버퍼 수명 9f: 캔슬까지 9f보다 멀면 사라짐 (히트스톱 동안은 버퍼 시간이 안 흐름)");
E(`window.__slow = stats; stats = function () { const s = window.__slow(); s.interval = 500; s.aps = 2; return s; }; 0`);   // 느린 공속(단계 1)에서 돌진은 캔슬까지 11f
frames(60);
// 돌진(lunge)의 판정 첫 프레임: 캔슬까지 hold+active 가 9f보다 김
for (let i = 0; i < 800; i++) { const s = st(); if (s.s === "active" && s.mv === "lunge" && s.f === s.fd.startup) break; frames(1); }
a = st(); const gap = a.fd.cancel - a.f;
tap(); let started = false;
for (let i = 0; i < gap + 3; i++) { frames(1); const s = st(); if (s.mv === "jab") { started = true; break; } }
check(`캔슬까지 ${gap}f → ${gap > 9 ? "버퍼 만료, 찌르기 안 나감" : "찌르기 나감"}`, gap > 9 ? !started : started, `started=${started}`);
E(`stats = window.__slow; mon.hp = mon.max = 1e300; 0`);

out("[4] 히트스톱: 프레임 정지·판정 좌표 고정·합산 대신 큰 값 (AP-FEEL-05, CP-12·13)");
frames(30);
E(`fHero.frz = 0; feelV.frz = 0; 0`);
for (let i = 0; i < 400; i++) { const s = st(); if (s.s === "recover") break; frames(1); }
E(`feelFreeze(5, true, 4); feelFreeze(3, true, 4); 0`);
a = st();
const box0 = E(`JSON.stringify(feelHitPoint(fHero.mv || "chop"))`), dx0 = +E(`feelMonDX()`);
frames(1); const mid = st(); const box1 = E(`JSON.stringify(feelHitPoint(fHero.mv || "chop"))`), dx1 = +E(`feelMonDX()`);
check("합산 대신 큰 값 (5f, 3f → 5f)", a.frz === 5 && a.vf === 5, `frz=${a.frz} vf=${a.vf}`);
check("프리즈 중 기술 프레임이 멈춤", mid.f === a.f && mid.frz === 4, `f ${a.f} → ${mid.f}`);
check("프리즈 중 판정 좌표는 그대로, 흔들림은 그림에만", box0 === box1 && dx0 !== dx1, `hit ${box1}, 그림 흔들림 ${dx0.toFixed(1)} → ${dx1.toFixed(1)}`);
frames(6); const after = st();
check("프리즈가 끝나면 다시 진행", after.frz === 0 && (after.f !== a.f || after.mv !== a.mv));

out("[5] 처치 히트스톱 동안 날아가기·다음 몬스터 대기 멈춤");
E(`mon.hp = 1; 0`);
for (let i = 0; i < 200 && E(`!mon.dying`); i++) frames(1);
const k0 = JSON.parse(E(`JSON.stringify({ vf: feelV.frz, sw: spawnWait, fx: mon.fx })`)); frames(2);
const k1 = JSON.parse(E(`JSON.stringify({ vf: feelV.frz, sw: spawnWait, fx: mon.fx })`));
check("처치 6f 프리즈", k0.vf >= 4, `victim frz=${k0.vf}`);
check("프리즈 동안 spawnWait·날아가기 멈춤", k1.sw === k0.sw && k1.fx === k0.fx, `sw ${k0.sw}→${k1.sw}`);
dummy();

out("[6] 흔들림은 렌더에만 (AP-FEEL-02, U-FEEL-08)");
// 같은 순간에 트라우마만 바꿔 렌더용 계산(feelView)을 돌림 → 판정·위치는 그대로, 화면 오프셋만 바뀜
const r6 = JSON.parse(E(`(() => { const q = () => JSON.stringify([feelBox(), feelHitPoint("chop"), MON_X, HERO_X, mon.hp, fHero.f, atkTimer]);
  feelCam.trauma = 0; feelCam.last = 0; feelView(1000); const a = q(), x0 = bgShx;
  let x1 = 0; feelCam.last = 0; for (let i = 0; i < 12; i++) { feelCam.trauma = 1; feelView(1000 + i * 16.7); if (Math.abs(bgShx) > Math.abs(x1)) x1 = bgShx; } const b = q();
  return JSON.stringify({ same: a === b, x0, x1 }); })()`));
check("트라우마 1에서 화면만 흔들리고 판정·위치·게임 상태는 그대로", r6.same && Math.abs(r6.x1) > 0.5, `bgShx ${r6.x0.toFixed(2)} → ${r6.x1.toFixed(2)}`);
const r6b = JSON.parse(E(`(() => { const out = []; feelCam.trauma = 1; feelCam.last = 0; let t = 5000; feelView(t);
  for (let i = 0; i < 120; i++) { feelCam.trauma = 1; t += 1000 / 60; feelView(t); out.push(bgShx); }
  feelCam.trauma = 0; return JSON.stringify(out); })()`));
const md = r6b.slice(1).reduce((s, v, i) => s + Math.abs(v - r6b[i]), 0) / (r6b.length - 1);
check("노이즈라 연속적: 프레임 사이 평균 변화 < 무작위(±20px 균등)의 75%", md < 0.75 * 40 / 3, `평균 ${md.toFixed(2)}px (무작위면 ${(40 / 3).toFixed(1)}px)`);

out("[7] 흰 번쩍임 초당 3회 이하 (광과민, CP-12 · XAG 118)");
let whites = 0, wasW = false;
for (let i = 0; i < 180; i++) { if (i % 6 === 0) tap(); frames(1); const w = E(`feelWhite()`); if (w && !wasW) whites++; wasW = w; }
check("터치 10회/초 3초 동안 흰 번쩍임 ≤ 9회", whites <= 9, `${whites}회`);

out("[8] 같은 입력이면 프레임레이트가 달라도 같은 결과 (CP-01, AP-CODE-01)");
out(`  통과 ${ok.length} · 실패 ${bad.length}` + (bad.length ? "  → " + bad.join(" / ") : ""));
out("errors", errors.length ? errors.slice(0, 4) : "none");
