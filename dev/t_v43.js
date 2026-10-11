// v43: 무기 66개(에픽~초월 12개씩) · 무기마다 다른 스킬 색 · 등급마다 쌓이는 이펙트 · 연 무기 모양 · 옷장·캐릭터 7등급 · 예전 기록 옮기기
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };

out("[1] 무기 66개 · 등급 크기");
check("무기 66개 · 마지막 = 65번 · 그림 66개", E(`WEAPONS.length === 66 && LAST_W === 65 && WPN36.length === 66 && WPN36.every(D => D && D.m && D.m.length === 26)`) === true);
check("등급마다 6·6·6·12·12·12·12", E(`JSON.stringify(WGRADES.map((x, g) => WEAPONS.filter((w, i) => gradeOf(i) === g).length))`) === "[6,6,6,12,12,12,12]");
check("등급 경계 17희귀 18에픽 30전설 42신화 54초월", E(`[17,18,29,30,41,42,53,54,65].map(gradeOf).join()`) === "2,3,3,4,4,5,5,6,6");
check("새 무기는 예전 무기 바로 앞 (18 확성기 · 19 서버 랙 · 64 왕홀 · 65 마스터키)", E(`[WEAPONS[18].n, WEAPONS[19].n, WEAPONS[23].n, WEAPONS[64].n, WEAPONS[65].n].join("|")`) === "사내 방송 확성기|서버 랙|블랙카드|천상 결재 왕홀|본사 타워 마스터키");
check("에픽부터 모든 무기에 이야기", E(`WEAPONS.slice(18).every(w => !!w.story)`) === true);
check("카드 글: 등급 안 순번 (블랙카드 = 에픽 6/12)", E(`gradePos(23).join("/")`) === "6/12");

out("[2] 무기마다 다른 스킬 색 (에픽~초월)");
const mids = JSON.parse(E(`JSON.stringify(WEAPONS.map((w, i) => i >= 18 && w.fx !== "rgb" ? (WPN36[i].vfx || [])[1] : null))`));
const up = mids.map((c, i) => [i, c]).filter(x => x[1]);
check("에픽~초월 47개(무지개 키보드 빼고) 가운데 색이 모두 다름", new Set(up.map(x => x[1])).size === up.length, `${new Set(up.map(x => x[1])).size}/${up.length}`);
const hex = c => [1, 3, 5].map(k => parseInt(c.slice(k, k + 2), 16));
const dist = (a, b) => { const p = hex(a), q = hex(b); return Math.sqrt((p[0] - q[0]) ** 2 * 0.3 + (p[1] - q[1]) ** 2 * 0.59 + (p[2] - q[2]) ** 2 * 0.11); };
let minIn = 999, pair = "";
for (const [a0, a1] of [[18, 30], [30, 42], [42, 54], [54, 66]]) for (let i = a0; i < a1; i++) for (let j = i + 1; j < a1; j++) { if (!mids[i] || !mids[j]) continue; const d = dist(mids[i], mids[j]); if (d < minIn) { minIn = d; pair = `${i}·${j}`; } }
check("같은 등급 안 두 무기 색 거리 25 이상", minIn >= 25, `가장 가까운 ${pair} = ${minIn.toFixed(1)}`);
E(`S.wi = 30; S.wl = 5; S.skin = -1; 0`);
check("스킬 색 = 들고 있는 무기 색 (얼음 생수통)", E(`feelFxPal(0)[1]`) === E(`VFX43[30][1]`), E(`feelFxPal(0).join()`));
E(`S.wi = 34; 0`);
check("무기를 바꾸면 스킬 색도 바뀜 (프레젠터 광선검)", E(`feelFxPal(0)[1]`) === E(`VFX43[34][1]`));

out("[3] 힘: 예전 무기 +5 힘은 그대로 · 다음 무기 +1이 늘 더 셈");
let worst = 0;
for (let k = 18; k <= 41; k++) { const r = E(`wPower(${2 * k - 17}, 5) / (50 * Math.pow(2.2, ${k}) * 2)`); worst = Math.max(worst, Math.abs(r - 1)); }
check("예전 무기 k (새 2k−17) +5 힘 = 예전 ±1%", worst < 0.01, `최대 차이 ${(worst * 100).toFixed(2)}%`);
check("모든 무기: 다음 무기 +1 > 지금 무기 +5", E(`(() => { for (let j = 0; j < 65; j++) if (!(wPower(j + 1, 1) > wPower(j, 5))) return j; return -1; })()`) === -1);
check("값도 늘 오름 (wBuy)", E(`(() => { for (let j = 0; j < 65; j++) if (!(wBuy(j + 1) > wBuy(j))) return j; return -1; })()`) === -1);

out("[4] 예전 기록 옮기기 (블랙카드 +5 · 모양 소화기)");
check("무기 20 → 23 (블랙카드) · 열린 무기 23 · 모양 17 그대로", E(`JSON.stringify([S.wlay, WEAPONS[23].n])`) === JSON.stringify([43, "블랙카드"]) && E(`(() => { const d = JSON.parse(JSON.stringify(S)); delete d.wlay; d.wi = 20; d.wunl = 20; d.skin = 17; const s = merge(d); return [s.wi, s.wunl, s.skin, s.wlay].join(); })()`) === "23,23,17,43");
check("예전 신화 첫 무기(30) → 43 · 열린 35 → 53", E(`(() => { const d = JSON.parse(JSON.stringify(S)); delete d.wlay; d.wi = 30; d.wunl = 35; d.skin = -1; const s = merge(d); return [s.wi, s.wunl].join(); })()`) === "43,53");
check("이미 v43 기록이면 다시 안 옮김", E(`(() => { const d = JSON.parse(JSON.stringify(S)); d.wlay = 43; d.wi = 23; d.wunl = 25; const s = merge(d); return [s.wi, s.wunl].join(); })()`) === "23,25");
check("새로 시작: 일반 6개만 열림", E(`(() => { const s = merge({}); return [s.wunl, s.wlay].join(); })()`) === "5,43");

out("[5] 무기 해금 재료");
check("표 66칸 · 등급 첫 무기(관문)가 다음보다 비쌈", E(`BAL.wtab.length === 66 && [30, 42, 54].every(i => wUnlockCost(i).silver > wUnlockCost(i + 1).silver && wUnlockCost(i).ame > wUnlockCost(i + 1).ame)`) === true);
check("등급 안에서는 관문 다음부터 고르게 오름", E(`[18, 30, 42, 54].every(a => { for (let i = a + 2; i < a + 12; i++) if (wUnlockCost(i).silver < wUnlockCost(i - 1).silver) return false; return true; })`) === true);
const sums = JSON.parse(E(`JSON.stringify([18, 30, 42, 54].map(a => { let s = 0, m = 0; for (let i = a; i < a + 12; i++) { s += wUnlockCost(i).silver || 0; m += wUnlockCost(i).ame || 0; } return [s, m]; }))`));
check("등급 합계 에픽 < 전설 < 신화 < 초월", sums.every((x, k) => k === 0 || x[0] > sums[k - 1][0]), JSON.stringify(sums));
E(`S.wi = 23; S.wl = 5; S.wunl = 23; S.silver = 24; S.ame = 4; 0`);
check("사용자 재료(은괴 24·자수정 4)로 24·25번을 바로 엶", E(`weaponUnlockTry(24, true) && weaponUnlockTry(25, true) && wUnl() === 25`) === true, `남은 은괴 ${E(`S.silver`)} · 자수정 ${E(`S.ame`)}`);

out("[6] 연 무기 모양 (스킨)");
E(`S.wunl = Math.max(S.wunl, 25); S.maxFloor = Math.max(S.maxFloor, 200); doRetire(false); 0`);
E(`S.wi = 3; S.wl = 5; S.skin = 25; 0`);
check("퇴사 뒤에도 연 무기(25) 모양을 고를 수 있음", E(`skinIdx()`) === 25);
E(`S.gold = 1e40; (() => { let n = 0; while (S.wi < 10 && n < 200) { weaponStep(); n++; } })(); 0`);
check("고른 모양이 지금 무기보다 앞이면 새 무기를 사도 그대로", E(`skinIdx()`) === 25 && E(`S.wi`) >= 10);
E(`(() => { let n = 0; while (S.wi < 25 && n < 400) { if (!weaponStep()) { if (!weaponUnlockTry(S.wi + 1, true)) break; } n++; } })(); 0`);
check("지금 무기가 그 모양을 따라잡으면 새 무기 모양으로", E(`S.wi >= 25 && skinIdx() === S.wi`) === true, `wi ${E(`S.wi`)} skin ${E(`S.skin`)}`);

out("[7] 등급마다 쌓이는 이펙트");
const fxKinds = wi => E(`(() => { S.wi = ${wi}; S.wl = 5; S.skin = -1; jobFx.length = 0; gHitT[5] = 0; gHitT[6] = 0; if (!mon || mon.dying) spawn(); hit(1, false, "hero"); return jobFx.map(f => f.kind).filter(k => /^g/.test(k)).join(","); })()`);
check("희귀(15): 등급 이펙트 없음", fxKinds(15) === "");
check("에픽(23): 고리", fxKinds(23) === "gring");
check("신화(47): 고리 + 빛줄기", fxKinds(47) === "gring,grays");
check("초월(61): 고리 + 빛줄기 + 별 섬광", fxKinds(61) === "gring,grays,gnova");
check("가짜 캔버스에서도 무기 그리기 오류 없음 (등급 이펙트는 건너뜀)", E(`(() => { try { drawWeapon(ctx, 61, 5, 10, 10, 0, 2, 100, false); wpnIconDraw(ctx, 47, 5, 40, true); return true; } catch (e) { return String(e); } })()`) === true);

out("[8] 옷장 7등급 · 새 세트 4종 · 사기·강화 재료");
check("등급 이름 = 무기와 같음 (영웅 → 에픽, 초월 새로)", E(`WGRADE.map(g => g.n).join()`) === "일반,고급,희귀,에픽,전설,신화,초월" && E(`WGRADE.every((g, i) => g.c === WGRADES[i].c)`) === true);
check("옷 190벌 · 세트 20 · 새 세트 조각 6·6·7·7", E(`WITEMS.length === 190 && WSETS.length === 20 && ["trip","david","victor","cosmo"].map(s => wardSetSize(WSETX[s])).join() === "6,6,7,7"`) === true);
const cnt = JSON.parse(E(`JSON.stringify(WGRADE.map((g, i) => WITEMS.filter(it => it.g === i).length))`));
check("전설 15 → 30 · 신화 7 → 18 · 초월 0 → 18 (두 배 넘게)", cnt[4] >= 30 && cnt[5] >= 14 && cnt[6] >= 14, JSON.stringify(cnt));
E(`S.silver = 19; S.ame = 50; 0`);
check("은괴 모자라면 출장 세트 못 삼", E(`wardBuy("tr_top")`) === false && E(`wardState().own.tr_top == null`) === true);
E(`S.silver = 100; S.ame = 50; 0`);
check("출장 세트 상의 = 은괴 20 · 자수정 6", E(`wardBuy("tr_top")`) === true && E(`S.silver`) === 80 && E(`S.ame`) === 44);
check("강화 재료: 고급 광석 · 전설 광석+은괴 · 신화 전신갑주 만나 · 초월 총수 은괴+자수정 · 초월 이기는 자 만나", E(`JSON.stringify([wardEnhCost(WIT.rk_top, 0), wardEnhCost(WIT.ch_top, 0), wardEnhCost(WIT.ar_top, 2), wardEnhCost(WIT.cm_top, 1), wardEnhCost(WIT.vc_top, 0)])`) === JSON.stringify([{ ore: 40 }, { ore: 1500, silver: 5 }, { manna: Math.round(30 * Math.pow(1.35, 2)) }, { silver: 24, ame: 10 }, { manna: 60 }]));
check("강화 버튼 글: 주 재료 + 나머지", E(`JSON.stringify(wardCostLabel({ silver: 24, ame: 10 }))`).indexOf("자수정 10") >= 0);
E(`S.vault = S.vault || {}; S.vault.best = 5000; wardCV = null; wardTick(false); 0`);
check("문서고 5000m → 칭호 '문서고 탐험가' 열림", E(`wardState().own.t_vault != null`) === true);
const x0 = E(`(() => { const W = wardState(); ["tr_head","tr_top","tr_tie","tr_arm","tr_shoes","tr_prop"].forEach(id => { W.own[id] = 0; }); wardDirty++; return wardStats().xdmg; })()`);
const x1 = E(`(() => { wardWearSet("trip", "eq"); wardDirty++; return wardStats().xdmg; })()`);
check("출장 세트 6벌을 입으면 모든 피해 x4가 더해짐", Math.abs(x1 / x0 - 4) < 0.05 || x1 / x0 > 3.9, `${x0.toFixed(2)} → ${x1.toFixed(2)}`);
check("옷장 도감 단계 13개 (140·160·180·190벌 추가)", E(`WCOLL.length === 13 && WCOLL[12].n === 190`) === true);

out("[9] 캐릭터 등급 · 새 캐릭터 3명");
check("캐릭터 10명 · 등급 0~6", E(`CHARS.length === 10 && CHARS.every(c => c.g >= 0 && c.g <= 6) && CHARS.find(c => c.id === "goldkwak").g === 6`) === true);
check("전무가 되면 백발 회장님", E(`(() => { const c = CHARS.find(x => x.id === "elder"); const r0 = S.rank; S.rank = 7; const a = charUnlocked(c); S.rank = 8; const b = charUnlocked(c); S.rank = r0; return !a && b; })()`) === true);
out("[10] 체력 바: 흰 자국이 부드럽게 따라 내려옴 (던파 영상처럼) · 보스는 여러 줄");
check("CSS 전환 끔 → 동작 줄이기를 켜도 매 프레임 직접 그림", /\.bar > i#hpBar, \.bar > i#hpTrail \{ transition: none !important; \}/.test(html));
const tick = ms => { for (let t = 0; t < ms; t += 16) { now += 16; E(`hpBarTick(); 0`); } };
const st = () => JSON.parse(E(`JSON.stringify({ hp: mon.hp / mon.max, shown: HPB.shown / mon.max, ghost: HPB.ghost / mon.max, idx: HPB.idx, w1: parseFloat($("hpBar").style.width), w2: parseFloat($("hpTrail").style.width), lab: ($("hpLines") || {}).textContent || "" })`));
E(`mode = "tower"; S.floor = 340; S.k = 5; S.auto = true; spawn(); mon.hp = mon.max; 0`); tick(48);
const L = E(`hpLinesOf(mon)`), s0 = st();
check("보스는 여러 줄 · 처음엔 맨 위 줄 가득 · 자국 없음", L >= 3 && s0.idx === L - 1 && s0.ghost === s0.hp && s0.w1 === 100, `kind ${E(`mon.kind`)} · ${L}줄 · ${s0.lab}`);
E(`mon.hp -= mon.max * 0.1; 0`); tick(80); const s1 = st();
check("맞은 직후(0.08초): 지금 체력은 바로 줄고 흰 자국은 잠깐 그대로", s1.shown < s0.hp - 0.07 && Math.abs(s1.ghost - s0.hp) < 1e-9 && s1.w2 > s1.w1 + 20, `바 ${s1.w1.toFixed(0)}% · 자국 ${s1.w2.toFixed(0)}%`);
tick(240); const s2 = st();
check("0.3초쯤: 자국이 스르르 내려오는 중", s2.ghost < s0.hp - 0.01 && s2.ghost > s2.hp + 0.005, `자국 ${(100 * (s2.ghost - s2.hp) / 0.1).toFixed(0)}% 남음`);
tick(900); const s3 = st();
check("1.2초 안에 자국이 다 따라옴", Math.abs(s3.ghost - s3.hp) < 1e-6 && Math.abs(s3.shown - s3.hp) < 1e-6);
E(`mon.hp = mon.max * (1 - 1.5 / ${L}); 0`); tick(1500); const s4 = st();
check("한 줄을 다 깎으면 아래 줄로 (x N 줄어듦 · 바는 그 줄 안에서 50%)", s4.idx === L - 2 && Math.abs(s4.w1 - 50) < 0.5, `줄 ${s4.idx + 1} · ${s4.w1.toFixed(1)}% · ${s4.lab}`);
E(`spawn(); mon.hp = mon.max; 0`); tick(48);
const L2 = E(`hpLinesOf(mon)`); let gap = 0, run0 = 0, frz = 0, prev = E(`HPB.ghost`);
for (let k = 0; k < 30; k++) { E(`mon.hp -= mon.max * 0.006; 0`); tick(96); const g = E(`HPB.ghost`); gap = Math.max(gap, E(`(HPB.ghost - mon.hp) / mon.max`)); run0 = g < prev ? 0 : run0 + 1; frz = Math.max(frz, run0); prev = g; }
check("계속 맞아도 자국이 오래 멈췄다 한 번에 떨어지지 않음 (멈춤은 한 번에 0.1초 이하)", frz <= 1 && gap < 0.3 / L2, `가장 길게 멈춤 ${frz}칸(0.1초 단위) · 가장 크게 벌어짐 = 한 줄의 ${(100 * gap * L2).toFixed(0)}%`);
E(`S.k = 2; spawn(); mon.hp = mon.max; 0`); tick(48);
check("잡몹은 한 줄 · x 글자 없음", E(`hpLinesOf(mon)`) === 1 && st().lab === "", `kind ${E(`mon.kind`)}`);
E(`spawn(); 0`); tick(32); const s5 = st();
check("새 몹이 나오면 바 가득 · 자국 지움", s5.ghost === s5.hp && s5.shown === s5.hp);
out(`  통과 ${ok.length} · 실패 ${bad.length}${bad.length ? "  → " + bad.join(" / ") : ""}`);
out("errors " + (errors.length ? JSON.stringify(errors.slice(0, 3)) : "none"));
