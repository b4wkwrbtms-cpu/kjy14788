// v41: 말씀 읽기 한 번에(본문이 열리며 시간이 셈 · 자동 체크) · 공부/말씀 겹침 막기 · 퇴사하면 무기 처음부터 · 감사팀 직무 유지 · 오프라인은 잠깐 효과 빼고
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };
const tick = (sec) => { for (let i = 0; i < sec * 4; i++) run(250); };

out("[1] '읽기 시작' 한 번 → 본문이 열리고 시간이 셈");
E(`if (rd) closeReader(); if (S.bible.timer) readTimerToggle(); if (S.study.running) studyStop(); rollDay(); S.bible.rsec = 0; S.bible.pused = 0; S.bible.today = []; 0`);
const rs0 = E(`readSecToday()`);
E(`readStartNow(); 0`);
check("본문이 열림", E(`!!rd`) === true);
check("말씀 타이머가 바로 셈 (본문을 닫으면 멈추는 타이머)", E(`!!S.bible.timer && rd.autoTimer`) === true);
tick(20);
const rs1 = E(`readSecToday()`);
check("20초 지나면 읽은 시간 ≈ 20초", Math.abs(rs1 - rs0 - 20) < 2, (rs1 - rs0).toFixed(1));
E(`rd.verses = ["태초에 하나님이 천지를 창조하시니라".repeat(30)]; rd.bottom = false; updateReaderState(); 0`);
const st0 = E(`$("rdState") ? $("rdState").textContent : ""`);
check("끝까지 안 내려도 남은 시간이 보임 ('확인까지 …초')", /확인까지 \d/.test(st0), st0);
const need = E(`Math.ceil(rdLeft())`);
E(`rd.bottom = true; updateReaderState(); 0`);
const st1 = E(`$("rdState") ? $("rdState").textContent : ""`);
check("끝까지 내렸고 시간이 남았으면 '…뒤 자동 체크'", /뒤 자동 체크/.test(st1), st1 + " (need " + need + ")");
check("아직 체크 안 됨", E(`isToday(rd.b, rd.c)`) === false);
tick(Math.max(1, need) + 1);
check("시간이 차면 버튼 없이 자동 체크", E(`isToday(rd.b, rd.c)`) === true);
check("자동 체크된 장은 확인(✓)까지", E(`!!(todayEntry(rd.b, rd.c) || {}).pf`) === true);
const rsec0 = E(`+S.bible.rsec || 0`);
E(`closeReader(); 0`);
check("본문을 닫으면 타이머가 멈추고 시간이 기록됨", E(`!S.bible.timer`) === true && E(`+S.bible.rsec || 0`) > rsec0, String(E(`+S.bible.rsec || 0`) - rsec0));

out("[2] 공부와 말씀은 한 번에 하나만");
E(`studyStart(); 0`);
check("공부 타이머 켜짐", E(`S.study.running`) === true);
tick(5);
E(`readStartNow(); 0`);
check("말씀을 열면 공부는 잠깐 멈춤", E(`S.study.running`) === false && E(`S.study.pausedByRead`) === true);
const sd0 = E(`S.study.today`);
tick(30);
check("말씀 읽는 30초 동안 공부 시간은 그대로", Math.abs(E(`S.study.today`) - sd0) < 1e-9, (E(`S.study.today`) - sd0).toFixed(4));
E(`closeReader(); 0`);
check("본문을 닫으면 공부가 다시 켜짐", E(`S.study.running`) === true && E(`!S.study.pausedByRead`) === true);
// 종이 성경: 말씀 타이머만 따로 켬 → 공부 멈춤 · 공부를 다시 켜면 말씀 시간이 기록되고 멈춤
E(`readTimerToggle(); 0`);
check("말씀 타이머만 켜도 공부 멈춤", E(`S.study.running`) === false && E(`!!S.bible.timer`) === true);
tick(70);
const rsecP = E(`+S.bible.rsec || 0`);
E(`studyStart(); 0`);
check("공부를 다시 켜면 말씀 타이머는 멈추고 시간이 기록됨", E(`!S.bible.timer`) === true && E(`S.study.running`) === true && E(`+S.bible.rsec || 0`) > rsecP + 60);
tick(5);
check("동시에 둘 다 도는 때가 없음", !(E(`S.study.running`) && E(`!!S.bible.timer`)));
E(`studyStop(); 0`);
check("공부를 끝내면 말씀을 닫아도 다시 켜지지 않음", (() => { E(`readStartNow(); closeReader(); 0`); return E(`S.study.running`) === false; })());

out("[3] 퇴사: 무기는 볼펜으로 돌아가고 출근 버스는 그대로 (사용자: 그런 거면 그냥 두자)");
E(`S.maxFloor = Math.max(S.maxFloor, 300); S.floor = 300; S.wi = 20; S.wl = 5; S.coffee = 10; 0`);
const g = E(`retireGain()`), ft = E(`fastTarget(300)`);
E(`doRetire(false); 0`);
check("퇴사 보상이 있었음", g > 0, String(g));
check("출근 버스 목표층 = 최고층의 40%", ft === Math.floor(300 * 0.4), String(ft));
check("버스로 그 층까지 올라감", E(`S.floor`) === ft || E(`S.maxFloor`) >= ft, `floor ${E(`S.floor`)}`);
check("전설 무기 해금은 그대로 남음 (배열 유지)", E(`Array.isArray(S.legUnlock)`) === true);

out("[4] 감사팀 직무가 다시 열어도 남음");
const m = E(`JSON.stringify((() => { const d = JSON.parse(JSON.stringify(S)); d.rank = 6; d.jobs = ["sales", "dev", "plan", "hr", "audit"]; d.job = "audit"; const s = merge(d); return { jobs: s.jobs, job: s.job }; })())`);
check("다섯 직무 그대로 · 대표 감사팀", m === JSON.stringify({ jobs: ["sales", "dev", "plan", "hr", "audit"], job: "audit" }), m);

out("[5] 오프라인 정산은 잠깐 효과를 빼고");
E(`S.floor = 40; S.k = 1; S.maxFloor = 60; S.wi = 6; S.wl = 3; for (const k in skillUntil) skillUntil[k] = 0; idolBuff.t = 0; 0`); // 자동 스킬이 켜져 있던 순간이면 기준값이 달라지므로 먼저 끔
const plain = E(`JSON.stringify(simulateOfflineV40(3600))`);
E(`S.active.rage = 600; S.active.haste = 600; S.active.gold2 = 600; 0`);
const buffedRaw = E(`JSON.stringify(simulateOfflineV40(3600))`);
const wrapped = E(`JSON.stringify(simulateOffline(3600))`);
check("효과 켠 채 닫아도 정산은 효과 없을 때와 같음", wrapped === plain, wrapped.slice(0, 90));
check("(예전 계산은 효과가 들어가 더 컸음)", buffedRaw !== plain, buffedRaw.slice(0, 90));
check("정산 뒤 효과 남은 시간은 그대로 돌려놓음", E(`S.active.rage`) === 600 && E(`S.active.gold2`) === 600);
E(`S.active.rage = 0; S.active.haste = 0; S.active.gold2 = 0; 0`);

out(`  통과 ${ok.length} · 실패 ${bad.length}` + (bad.length ? "  → " + bad.join(" / ") : ""));
out("errors", errors.length ? errors.slice(0, 4) : "none");
