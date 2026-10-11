// v38: 휴대폰 '동작 줄이기'여도 몸 동작은 그대로 · 설정 '곽준영 몸 동작' · 직무 동작 미리 보기
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };
function runF(ms) { const end = now + ms; while (now < end - 1e-6) { const st = 1000 / 60; now += st; wall += st; const cb = rafCb; rafCb = null; try { cb && cb(now); } catch (e) { errors.push("frame: " + e.stack); break; } } }
E(`window.__dummy = () => { if (mon && !mon.dying) { mon.hp = mon.max = 1e300; } S.pets.idol = 0; idolBuff.t = 0; }; 0`);
function sample(ms) {   // 공격 중 자세 최대값
  let lean = 0, dx = 0, fB = 0, n = 0;
  const end = now + ms;
  while (now < end) { E(`window.__dummy(); 0`); runF(1000 / 60); const p = JSON.parse(E(`JSON.stringify(heroPose())`)); lean = Math.max(lean, Math.abs(p.lean)); dx = Math.max(dx, p.dx); fB = Math.min(fB, p.fB); n++; }
  return { lean, dx, fB, n };
}
out(`[0] 휴대폰 동작 줄이기 = ${E("reduceMotion")}`);
E(`S.rank = 2; S.jobs = ["sales"]; S.job = "sales"; jskKey = null; renderJobSkills(); 0`);
for (let i = 0; i < 200 && !E(`!!(mon && !mon.dying && spawnWait <= 0)`); i++) runF(50);
out("[1] 몸 동작 기본 (설정 '기본')");
const a = sample(4000);
check("숙임·발 빼기·앞으로 나감이 그대로 보임", a.lean >= 4 && a.fB <= -2 && a.dx >= 10, JSON.stringify(a));
check("기본값 body = 1", E(`fxSet().body`) === 1);
out("[2] 설정 '약하게' = 반만 · '끄기' = 팔·무기만");
E(`fxSet().body = 0.5; 0`); const b = sample(4000);
check("약하게: 숙임 반쯤", b.lean >= 2 && b.lean <= 3.5 && b.dx <= a.dx * 0.6, JSON.stringify(b));
E(`fxSet().body = 0; 0`); const c = sample(4000);
check("끄기: 몸은 그대로", c.lean === 0 && c.fB === 0 && Math.abs(c.dx) <= 2, JSON.stringify(c));
E(`fxSet().body = 1; 0`);
out("[3] 동작 미리 보기 15초");
E(`window.__pv = 0; const _ja = jvAdd; jvAdd = function (k, o) { if (k === "pointer") window.__pv++; return _ja(k, o); }; jobPreviewStart("plan"); 0`);
runF(1500);
check("미리 보기 중 거너 동작", E(`feelKitId()`) === "gun" && E(`feelMainKitId()`) === "melee", `${E("feelKitId()")} / 대표 ${E("feelMainKitId()")}`);
check("미리 보기 중엔 떨어져 섬", E(`HERO_X`) < 334 - 40, String(E(`HERO_X`)));
for (let i = 0; i < 8; i++) { E(`window.__dummy(); 0`); runF(500); }
check("레이저 포인터로 공격 (기획 기본 공격)", E(`window.__pv`) > 3, `pointer ${E("window.__pv")}`);
check("대표 직무·스킬은 그대로", E(`S.job`) === "sales" && E(`curJob().id`) === "sales");
for (let i = 0; i < 24; i++) { E(`window.__dummy(); 0`); runF(500); }
check("15초 뒤 원래 동작·자리로", E(`feelKitId()`) === "melee" && E(`HERO_X`) === 334, `${E("feelKitId()")} x ${E("HERO_X")}`);
// [4] 인사 기록 버튼은 진짜 브라우저(pw_v38ui.js)에서 봄 — 이 하네스의 DOM은 innerHTML을 안 남김
E(`S.rank = 1; S.jobs = []; S.job = ""; jskKey = null; renderJobSkills(); 0`);
out(`  통과 ${ok.length} · 실패 ${bad.length}` + (bad.length ? "  → " + bad.join(" / ") : ""));
out("errors", errors.length ? errors.slice(0, 4) : "none");
