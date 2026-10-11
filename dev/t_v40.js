// v40: 무기 모양을 바꾸면 직무 스킬 색이 바뀜 · 영업 전직 공격(검기) · 직무 없으면 검기 없음 · 겸직 속성·물건은 제 색
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };
function runF(ms) { const end = now + ms; while (now < end - 1e-6) { const st = 1000 / 60; now += st; wall += st; const cb = rafCb; rafCb = null; try { cb && cb(now); } catch (e) { errors.push("frame: " + e.stack); break; } } }
E(`window.__dummy = () => { if (mon && !mon.dying) { mon.hp = mon.max = 1e300; } S.pets.idol = 0; idolBuff.t = 0; }; window.__kinds = {}; const _ja = jvAdd; jvAdd = function (k, o) { window.__kinds[k] = (window.__kinds[k] || 0) + 1; return _ja(k, o); }; 0`);
out("[1] 색 바꾸기 (무기 팔레트로)");
E(`S.wi = 29; S.wl = 5; S.skin = 16; tintPal = null; tintFrame = -2; tintSync(0); 0`);
const red = E(`tintMap("#ffd54a")`), white = E(`tintMap("#ffffff")`), dark = E(`tintMap("#5a3a0c")`);
check("금빛(#ffd54a) → 레이저 포인터 빨강 쪽", /^rgba\((2[0-9]{2}),\s*([0-9]{1,2}),/.test(red) || /^rgba\((2\d\d),(\d{1,2}),/.test(red), red);
check("흰색은 그대로 (빛의 심)", white === "#ffffff", white);
check("진한 금 → 진한 빨강", /^rgba\(1[0-9]{2},\d{1,2},/.test(dark), dark);
E(`S.skin = 29; tintFrame = -3; tintSync(0); 0`);
const pur = E(`tintMap("#ffd54a")`);
check("은하 지팡이면 보라", (() => { const m = /rgba\((\d+),(\d+),(\d+)/.exec(pur); return m && +m[3] > +m[2] && +m[1] > +m[2]; })(), pur);
out("[2] 영업(전사) 전직 공격 = 검기, 직무 없으면 없음");
E(`S.rank = 2; S.jobs = ["sales"]; S.job = "sales"; jskKey = null; renderJobSkills(); window.__kinds = {}; 0`);
for (let i = 0; i < 200 && !E(`!!(mon && !mon.dying && spawnWait <= 0)`); i++) runF(50);
for (let i = 0; i < 12; i++) { E(`window.__dummy(); 0`); runF(500); }
const k1 = JSON.parse(E(`JSON.stringify(window.__kinds)`));
check("영업: 솟구치는 검기·지면 강타·관통 검기가 나감", (k1.kwave || 0) > 3 && (k1.kquake || 0) > 0 && (k1.kpierce || 0) > 0, JSON.stringify(k1));
check("영업: 예전 금빛 초승달(slash)은 안 씀", !k1.slash, String(k1.slash || 0));
E(`S.rank = 1; S.jobs = []; S.job = ""; jskKey = null; renderJobSkills(); window.__kinds = {}; 0`);
for (let i = 0; i < 12; i++) { E(`window.__dummy(); 0`); runF(500); }
const k0 = JSON.parse(E(`JSON.stringify(window.__kinds)`));
check("직무 없음: 검기 없음 (기본 베기만)", !k0.kwave && !k0.kquake && !k0.kpierce, JSON.stringify(k0));
out("[3] 스킬 그릴 때만 색이 바뀌고 다른 그림은 그대로");
E(`S.rank = 2; S.jobs = ["sales"]; S.job = "sales"; S.skin = 16; jskKey = null; renderJobSkills(); 0`);
E(`window.__sk = []; const _ja3 = jvAdd; jvAdd = function (k, o) { const r = _ja3(k, o); window.__sk.push([k, !!o.noTint, !!TINT_SKIP[k]]); return r; }; window.__dummy(); castJob(JSK.deal, false); 0`); runF(1200);
check("그리고 나면 tintOn 꺼짐", E(`tintOn`) === false);
const sk = JSON.parse(E(`JSON.stringify(window.__sk)`)), lsp = sk.filter(r => r[0] === "lspear" || r[0] === "goldrain");
check("계약 성사 빛의 창·금빛 비는 무기 색으로 칠할 대상 (noTint 아님)", lsp.length >= 3 && lsp.every(r => !r[1] && !r[2]), JSON.stringify(lsp.slice(0, 4)));
check("계약서·도장은 제 색 (칠하지 않음)", sk.filter(r => r[0] === "contract").every(r => r[2]), JSON.stringify(sk.filter(r => r[0] === "contract")));
out("[4] 겸직 속성은 제 색 (무기 색으로 안 바뀜)");
E(`S.rank = 6; S.jobs = ["sales", "dev"]; S.job = "sales"; jskKey = null; renderJobSkills(); window.__sub = []; const _ja2 = jvAdd; jvAdd = function (k, o) { const r = _ja2(k, o); if (k === "chain") window.__sub.push(!!o.noTint); return r; }; 0`);
for (let i = 0; i < 16; i++) { E(`window.__dummy(); 0`); runF(500); }
const sub = JSON.parse(E(`JSON.stringify(window.__sub)`));
check("개발 겸직 번개(chain)는 noTint", sub.length > 0 && sub.every(Boolean), JSON.stringify(sub.slice(0, 6)));
E(`S.rank = 1; S.jobs = []; S.job = ""; S.skin = -1; jskKey = null; renderJobSkills(); 0`);
out(`  통과 ${ok.length} · 실패 ${bad.length}` + (bad.length ? "  → " + bad.join(" / ") : ""));
out("errors", errors.length ? errors.slice(0, 4) : "none");
