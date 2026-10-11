// v44: 암송 = 필수 300 중 201~300 · 하루 5구절 · 20일 한 바퀴 · 간격 1·3·7·14·30·60일 · 2바퀴부터 하루 한 묶음 점검
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };
const J = c => JSON.parse(E(`JSON.stringify(${c})`));
const nextDay = (n = 1) => { wall += 86400000 * n; run(100); E(`rollDay(); 0`); };
const passAll = () => E(`(() => { let k = 0, q; while ((q = memQueue()).length && k < 400) { memPass(q[0]); k++; } memTryUnlock(); return k; })()`);
const plain = t => t.replace(/ \/ /g, " ");

out("[1] 구절 100개 · 카드 순서 · 5구절씩 20묶음");
check("100구절 · 201~300 차례대로 · 묶음 20개 × 5", E(`VERSES.length === 100 && VERSES.every((v, i) => v.no === String(201 + i) && v.day === Math.floor(i / 5) + 1) && VERSE_SETS.length === 20 && VERSE_SETS.every(s => s.v.length === 5)`) === true);
check("1일차 = 201~205 (창세기 22:17 ~ 출애굽기 19:5a) · 20일차 = 296~300", E(`VERSE_SETS[0].range + "|" + VERSE_SETS[0].title + "|" + VERSE_SETS[19].range + "|" + VERSE_SETS[19].title`) === "201~205|창세기 22:17 ~ 출애굽기 19:5a|296~300|야고보서 4:10 ~ 요한계시록 22:12");
const V = J(`VERSES.map(v => [v.no, v.ref, v.text, v.keys, v.title])`), by = {}; V.forEach(v => { by[v[0]] = v; });
const CARD = {   // 카드에서 그대로 옮긴 몇 구절 (끊어 읽기 '/' 빼고 같아야 함)
  "201": ["창세기 22:17", "내가 네게 큰 복을 주고 네 씨가 크게 번성하여 하늘의 별과 같고 바닷가의 모래와 같게 하리니 네 씨가 그 대적의 성문을 차지하리라"],
  "205": ["출애굽기 19:5a", "세계가 다 내게 속하였나니…"],
  "208": ["출애굽기 33:13中", "…주의 길을 내게 보이사 내게 주를 알리시고…"],
  "224": ["사무엘상 17:45", "다윗이 블레셋 사람에게 이르되 너는 칼과 창과 단창으로 내게 나아 오거니와 나는 만군의 여호와의 이름 곧 네가 모욕하는 이스라엘 군대의 하나님의 이름으로 네게 나아가노라"],
  "249": ["이사야 41:10", "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라"],
  "287": ["빌립보서 4:6", "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라"],
  "300": ["요한계시록 22:12", "보라 내가 속히 오리니 내가 줄 상이 내게 있어 각 사람에게 그가 행한 대로 갚아 주리라"],
};
check("카드 본문 그대로 (201 · 205 · 208 · 224 · 249 · 287 · 300)", Object.entries(CARD).every(([no, [ref, t]]) => by[no][1] === ref && plain(by[no][2]) === t), Object.entries(CARD).filter(([no, [ref, t]]) => !(by[no][1] === ref && plain(by[no][2]) === t)).map(x => x[0]).join(","));
check("핵심어(카드에 색칠한 말)는 모두 본문 안에 · 구절마다 주제 이름", V.every(v => v[3].length && v[3].every(k => v[2].includes(k)) && v[4]));
check("간격 1 · 3 · 7 · 14 · 30 · 60일", E(`MEM_INT.join()`) === "0,1,3,7,14,30,60,60");

out("[2] 예전 기록 옮기기 (사용자 기록: 예전 1일차 4구절)");
check("1바퀴 1일차부터 · 누적 통과 11번 그대로 · 바퀴 1", E(`S.mem.vset === 44 && S.mem.sets === 1 && S.mem.round === 1 && S.mem.total === 11`) === true, E(`JSON.stringify({ sets: S.mem.sets, round: S.mem.round, total: S.mem.total })`));
check("오늘 목록 = 새 구절 201~205", E(`memQueue().map(v => v.no).join()`) === "201,202,203,204,205");
check("이미 외운 201~300 기록이 있으면 그 묶음은 건너뛰고 시작", E(`(() => { const d = JSON.parse(JSON.stringify(S)); delete d.mem.vset; ["201","202","203","204","205","206"].forEach(no => { d.mem.v[no] = { s: 2, n: 3, f: 0, due: "2026-10-12", rd: 1 }; }); const s = merge(d); return [s.mem.sets, s.mem.vset].join(); })()`) === "2,44");
check("이미 옮긴 기록은 다시 안 옮김", E(`(() => { const d = JSON.parse(JSON.stringify(S)); d.mem.sets = 7; d.mem.round = 2; d.mem.rg = 3; const s = merge(d); return [s.mem.sets, s.mem.round, s.mem.rg].join(); })()`) === "7,2,3");
check("처음 시작: 1바퀴 1일차", E(`(() => { const s = merge({}); return [s.mem.sets, s.mem.round, s.mem.vset].join(); })()`) === "1,1,44");

out("[3] 20일 한 바퀴 (날마다 다 통과한다고 치고, 진짜 게임 코드로)");
const day0 = E(`dayKey()`);
const loads = [], log = [];
let n1 = passAll(); loads.push(n1);
check("1일차: 5구절 통과 · 같은 날 2일차는 안 열림", n1 === 5 && E(`S.mem.sets`) === 1);
check("201의 다음 복습 = 내일 (1일 뒤)", E(`memRec("201").due`) === E(`addDays(dayKey(), 1)`));
for (let d = 2; d <= 20; d++) { nextDay(); E(`memTryUnlock(); 0`); loads.push(passAll()); if (d === 2) log.push(J(`[S.mem.sets, memRec("201").due, memRec("201").s]`)); }
check("2일차: 새 묶음 열림 · 201은 통과 뒤 3일 뒤 복습", log[0][0] === 2 && log[0][1] === E(`addDays("${day0}", 4)`), JSON.stringify(log[0]));
check("20일째: 100구절 모두 외움 · 아직 1바퀴", E(`VERSES.every(memLearned) && memRoundOf() === 1 && S.mem.sets === 20`) === true);
check("1바퀴 하루 시험 수(모두 맞힐 때) 최대 20 · 날마다 새 5", Math.max(...loads) <= 20 && loads.length === 20, loads.join(" "));
const tail = J(`["296","297","298","299","300"].map(no => memRec(no).due)`);
check("마지막 묶음(296~300)은 다음 날 바로 복습 (뒤쪽도 안 잊게)", tail.every(d => d === E(`addDays(dayKey(), 1)`)));
const head = J(`["201","202","203","204","205"].map(no => [memRec(no).s, memRec(no).due])`);
check("첫 묶음(201~205)은 20일째까지 4번 복습 (1·4·11일째) → 4단계 · 25일째에 다시", head.every(x => x[0] === 4 && x[1] === E(`addDays("${day0}", 25)`)), JSON.stringify(head[0]));

out("[4] 2바퀴: 하루 한 묶음씩 다시 점검");
nextDay(); E(`memTryUnlock(); 0`);
check("21일째: 2바퀴 시작 · 1묶음 점검", E(`memRoundOf() === 2 && S.mem.rg === 1`) === true, E(`memRoundLine()`));
const p21 = J(`(() => { const P = memParts(); return { rev: P.rev.map(v => v.no), rot: P.rot.map(v => v.no), nw: P.nw.length }; })()`);
check("21일째 목록: 어제 외운 296~300 복습 + 1묶음(201~205) 점검 · 새 구절 없음", p21.rot.join() === "201,202,203,204,205" && ["296", "297", "298", "299", "300"].every(no => p21.rev.includes(no)) && p21.nw === 0, JSON.stringify(p21));
const loads2 = [passAll()];
check("점검을 마친 묶음은 오늘 ✓ · 다음 묶음은 내일", E(`S.mem.rg`) === 1 && E(`memRowMark(1)`).indexOf("✓") >= 0);
for (let d = 22; d <= 60; d++) { nextDay(); E(`memTryUnlock(); 0`); loads2.push(passAll()); }
check("2·3바퀴 하루 시험 수 최대 20 · 평균 10 안팎", Math.max(...loads2) <= 20, `평균 ${(loads2.reduce((a, b) => a + b, 0) / loads2.length).toFixed(1)} · 최대 ${Math.max(...loads2)}`);
check("60일째: 3바퀴째 (바퀴마다 20일)", E(`memRoundOf()`) === 3, E(`memRoundLine()`));
const gap = J(`VERSES.map(v => { const r = memRec(v.no); return [v.no, r.rd, r.last]; })`);
check("모든 구절을 마지막으로 본 날이 25일 안 (한 구절도 오래 묵히지 않음)", gap.every(x => E(`(new Date(dayKey()) - new Date("${x[2]}")) / 86400000`) <= 25), "");
check("이번 바퀴 점검 기록(rd)이 바퀴 수를 따라감", gap.every(x => x[1] >= 2));

out("[5] 복습이 밀린 날: 급한 것부터 20개씩");
E(`(() => { const t = dayKey(); VERSES.slice(0, 40).forEach((v, i) => { const r = memRec(v.no); r.due = t; r.s = 1 + (i % 6); }); return 0; })()`);
const P5 = J(`(() => { const P = memParts(); return { rev: P.rev.length, batch: P.batch.length, more: P.more, s: P.batch.slice(0, 20).map(v => memRec(v.no).s) }; })()`);
check("밀린 복습 40 → 이번 판 20 · 남은 20은 다음 판", P5.rev >= 40 && P5.more === P5.rev - 20 && P5.batch >= 20, JSON.stringify({ rev: P5.rev, more: P5.more }));
check("단계 낮은(새로 외운) 구절부터", P5.s.every((x, i) => i === 0 || x >= P5.s[i - 1]), P5.s.join(""));

out("[6] 틀린 새 구절 · 다음 묶음은 다 통과해야 열림");
E(`(() => { const d = JSON.parse(JSON.stringify(S)); d.mem = { v: {}, sets: 1, setDay: "", total: 0, vset: 44, round: 1, rg: 0 }; S = merge(d); return 0; })()`);
E(`(() => { memTryUnlock(); const q = memQueue(); memPass(q[0]); memPass(q[1]); memFail(q[2]); return 0; })()`);
nextDay(); E(`memTryUnlock(); 0`);
check("하나 틀리고 안 고치면 다음 날도 1일차 그대로 · 틀린 구절은 새 구절로 다시", E(`S.mem.sets`) === 1 && E(`memParts().nw.map(v => v.no).join()`) === "203,204,205");
E(`(() => { memParts().nw.forEach(v => memPass(v)); memTryUnlock(); return 0; })()`);
nextDay(); E(`memTryUnlock(); 0`);
check("다 통과한 다음 날 2일차가 열림", E(`S.mem.sets`) === 2);

out("[7] 화면 · 글");
E(`selectTab("mem"); updateUI(true); 0`); run(200);
const go = txt("mGo"), rd = $("mRd") ? $("mRd").textContent : "";
check("시작 버튼: 복습 + 새 구절 개수", /암송 시작 · 복습 \d+ \+ 새 구절 5/.test(go), go);
check("바퀴 줄: 1바퀴 · 2/20일차 · 206~210", rd.indexOf("1바퀴 · 2/20일차 · 206~210") >= 0, rd);
check("안내: 하루 새 5구절 · 1 → 3 → 7 → 14 → 30 → 60일 · 2바퀴", txt("mInfo").indexOf("하루 새 5구절") >= 0 && txt("mInfo").indexOf("1 → 3 → 7 → 14 → 30 → 60일") >= 0);
check("예전 글(200구절 · 새 10구절) 없음", html.indexOf("새 10구절이 열렸어요") < 0 && E(`(() => { const m = String(TAB_META.mem[0]); return m; })()`).indexOf("200구절") < 0);

out("[8] 옷장 · 업적 (100구절에 맞춤)");
check("새 이름의 흰 돌 = 암송 4바퀴 · 마음판에 새긴 사람 = 2바퀴", E(`JSON.stringify([WIT.vc_tie.cond, WIT.t_heart.cond])`) === JSON.stringify([["memr", 4], ["memr", 2]]));
check("옷장 조건 중 '암송 완료'가 100을 넘는 것 없음", E(`WITEMS.every(it => !it.cond || it.cond[0] !== "mem" || it.cond[1] <= 100)`) === true);
check("업적: 암송 완료 5~100 · 바퀴 완주 1~10", E(`JSON.stringify([ACH.find(a => a.id === "memm").tiers, ACH.find(a => a.id === "memr").tiers])`) === "[[5,20,40,60,80,100],[1,2,3,5,10]]");
E(`S.mem.round = 3; 0`);
check("바퀴 완주 수 = 지금 바퀴 − 1 (옷장 열쇠도 같은 값)", E(`memRoundsDone() === 2 && wardCondVal("memr") === 2`) === true);
out(`  통과 ${ok.length} · 실패 ${bad.length}${bad.length ? "  → " + bad.join(" / ") : ""}`);
out("errors " + (errors.length ? JSON.stringify(errors.slice(0, 3)) : "none"));
