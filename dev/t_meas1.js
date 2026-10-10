run(600);
// 0) 켜자마자: 저장 구조 · 버전 도입일 · 지표
out("[boot] errors", errors.length, errors.slice(0, 3).join("\n"));
out("[state]", E(`JSON.stringify({ met: Object.keys(S.met), v: S.met.v, wpre: (S.met.wpre || []).length, stew: S.stew, roff: S.roff, ii: S.ii })`));
out("[first]", E("measFirst()"), "| roll7", E("measRoll7()"), "| weeks", E("JSON.stringify(measWeeks(4))"));
out("[rows]", E("JSON.stringify(measRows().map(r => r[0] + ' = ' + r[1] + ' [' + r[3] + ']'))"));
out("[checks]", E("JSON.stringify(measChecks().map(c => 'v' + c.v + ' ' + c.items.map(x => x.st + ':' + x.val).join(' | ')))"));
// 1) 게임 화면 시간 (읽기·암송·공부 중이 아닐 때)
const g0 = E("(S.met.d[dayKey()] || {}).g || 0");
run(3000);
out("[screen] g +", (E("S.met.d[dayKey()].g") - g0).toFixed(2), "(3초 돌림)");
E("document.hidden = true"); const g1 = E("S.met.d[dayKey()].g"); run(2000); out("[hidden] g +", (E("S.met.d[dayKey()].g") - g1).toFixed(2)); E("document.hidden = false");
// 2) 말씀: 처음 확인한 시각 t1
out("[t1 before]", E("S.met.d[dayKey()].t1"));
E(`(() => { S.bible.rsec = (S.bible.rsec || 0) + 99999; toggleChapter(0, 30); })()`); run(200);
out("[t1 after]", E("S.met.d[dayKey()].t1"), "(12:31 = 751)", "| toast:", txt("toast"));
// 타이머로 읽기: 시작 시각이 t1 (이미 있으면 그대로)
E("delete S.met.d[dayKey()].t1; S.bible.timer = Date.now() - 20 * 60000; readTimerToggle()"); out("[timer t1]", E("S.met.d[dayKey()].t1"), "(20분 전 = 731)", "| toast:", txt("toast"));
// 3) 공부: 25분 완주(확인) · 중간 멈춤 · 확인 안 하고 자동 멈춤
E("studyStart()"); wall += 26 * 60000; E("studyConfirm()");
wall += 6 * 60000; E("studyPause()");
E("studyStart()"); wall += 36 * 60000; run(100);
out("[focus]", E("JSON.stringify({ fF: S.met.d[dayKey()].fF, fP: S.met.d[dayKey()].fP })"), "(fF 2 · fP 1) | rate", E("JSON.stringify(measFocusRate())"));
// 확인을 일찍 눌러도 중단으로 안 셈
E("studyStart()"); wall += 8 * 60000; E("studyConfirm()"); wall += 25 * 60000; E("studyConfirm()"); E("studyPause()");
out("[focus2]", E("JSON.stringify({ fF: S.met.d[dayKey()].fF, fP: S.met.d[dayKey()].fP })"), "(fF 3 · fP 1)");
// 4) 암송 유지: 7일·30일 넘어 다시 본 구절의 첫 시도만
E(`(() => { const t = dayKey(); S.mem.v[VERSES[10].no] = { s: 2, n: 3, f: 0, due: t, last: addDays(t, -10) }; S.mem.v[VERSES[11].no] = { s: 3, n: 4, f: 0, due: t, last: addDays(t, -40) }; S.mem.v[VERSES[12].no] = { s: 3, n: 4, f: 0, due: t, last: addDays(t, -8) }; S.mem.v[VERSES[13].no] = { s: 1, n: 1, f: 0, due: t, last: addDays(t, -2) }; })()`);
E("memPass(VERSES[10]); memPass(VERSES[11]); memFail(VERSES[12]); memPass(VERSES[12]); memPass(VERSES[13])");
out("[mem keep]", E("JSON.stringify(S.met.mr)"), "| measMemKeep", E("JSON.stringify(measMemKeep())"), "(w 2/3 · m 1/1)");
// 5) 날 바뀜: 읽은 초·체크한 장 보관, mv 지움
const k0 = E("dayKey()");
wall += 864e5; run(400);
out("[archive]", E(`JSON.stringify(S.met.d["${k0}"])`));
out("[day2]", E("dayKey()"), "dow", E("new Date().getDay()"));
// 6) 정보 탭: 상태판 카드
T("정보").click(); run(400);
out("[board] rows", qsa(body, "#mstTbl .mst-r").length, "| chart bars", qsa(body, "#mstChart rect").length, "| chk", qsa(body, "#mstChk .mst-v").length, "| sub:", txt("mstSub"));
out("[board tbl]", txt("mstTbl").slice(0, 400));
out("[board week]", txt("mstWeek").slice(0, 200), "| input", !!$("mstWIn"));
// 주간 한 줄 (주일)
$("mstWIn").value = "말씀이 이번 주 나를 붙들어 주었다";
qsa(body, "#mstWeek button").find(b => b.dataset.act === "wsave").click(); run(300);
out("[week save]", E("JSON.stringify(S.stew.w)"), "| input gone", !$("mstWIn"), "| toast:", txt("toast"));
// 패치 메모 (도입 3일 안)
out("[rite open]", qsa(body, "#mstRite details").length, E("JSON.stringify(S.met.v)"));
$("mstR0").value = "상태판 글씨가 작다"; $("mstR2").value = "글씨 키우기";
qsa(body, "#mstRite button").find(b => b.dataset.act === "rsave").click(); run(300);
out("[rite save]", E("JSON.stringify(S.stew.rite)"), "| toast:", txt("toast"));
// 7) 월간 청지기 점검
out("[stew before]", txt("stwBody").slice(0, 160));
qsa(body, "#stwBody button").find(b => b.dataset.act === "open").click(); run(200);
out("[stew form] scale btns", qsa(body, "#stwBody .stw-sc button").length, "| rg", qsa(body, "#stwBody .stw-rg button").length);
qsa(body, "#stwBody button").find(b => b.dataset.act === "save").click(); run(100);
out("[stew empty save] toast:", txt("toast"), "| saved?", E("!!S.stew.m['2026-10']"));
const pick = (q, i, v) => qsa(body, "#stwBody .stw-sc button").find(b => b.dataset.q === q && +b.dataset.i === i && +b.dataset.v === v).click();
[5, 4, 5, 3].forEach((v, i) => pick("a", i, v)); [6, 7, 3, 2].forEach((v, i) => pick("mo", i, v));
out("[stew pressed]", qsa(body, "#stwBody .stw-sc button.on").length);
qsa(body, "#stwBody .stw-rg button").find(b => b.dataset.id === "battle").click();
qsa(body, "#stwBody .stw-rg button").find(b => b.dataset.id === "none").click();
qsa(body, "#stwBody .stw-rg button").find(b => b.dataset.id === "suit").click();
$("stwNx").value = "출근길 지하철에서 한 장"; $("stwRgt").value = "옷 고르다 30분";
qsa(body, "#stwBody button").find(b => b.dataset.act === "save").click(); run(200);
out("[stew save]", E("JSON.stringify(S.stew.m)"), "| toast:", txt("toast"));
out("[stew after]", txt("stwBody").slice(0, 220));
out("[auto row]", E("JSON.stringify(measRows()[6])"));
// 8) 다음 목표 사다리: 주일 한 줄은 남겼으니 안 뜨고, 이달 점검도 끝
out("[ladder]", E("JSON.stringify(ladderRows().filter(r => /주간 한 줄|청지기|보상 끄기|약속한/.test(r.t)).map(r => r.t))"));
// 9) 저장·불러오기 검증
out("[merge junk]", E(`(() => { const d = JSON.parse(JSON.stringify(S)); d.met = { d: { "x": { g: 5 }, "2026-10-10": { g: -5, ms: "abc", rs: 1e9, t1: 9999, fF: 3.7, mv: { "<b>": 1, "001": 1 } } }, mr: { "2026-10": { w: [5, 3], m: "x" }, "bad": {} }, ho: [{ k: "zzz", d: "2026-10-10" }, { k: "manna", d: "2026-10-10", ok: 1 }], rt: [{ d: "2026-10-10", r: "77.6" }], v: { "32": "2026-10-10", "abc": "2026-10-10" }, wu: { nope: "2026-10-10" } }; d.stew = { m: { "2026-10": { a: [9, 0, "x", 4, 5], mo: [1], rg: ["battle", "evil"], nx: "<script>alert(1)</script>" } }, w: { "2026-10-05": "  한 줄  " }, rite: { "32": [{ d: "2026-10-10", a: "<b>x</b>" }] } }; d.roff = { on: { from: "bad", to: "2026-10-18" }, wgt: 55, unl: "yes", esc: { manna: -1, ore: 5, junk: 9 }, hist: [{ from: "2026-09-01", pct: "88.4", got: { c: 3 } }] }; d.ii = { on: 1, t: "25:00", t2: "07:3", days: 0, where: "<script>", cue: "아침 먹고 나서 아주 긴 문장을 넣어 보면 잘리는지", tz: 99999, push: "1" }; const m = merge(d); return JSON.stringify({ met: m.met, stew: m.stew, roff: m.roff, ii: m.ii }); })()`));
out("errors", errors.length, errors.slice(0, 5).join("\n"));
