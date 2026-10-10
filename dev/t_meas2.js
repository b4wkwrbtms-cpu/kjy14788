run(600);
const back = () => { for (let i = 0; i < 3; i++) if ($("back") && !$("back").hidden && $("backGo")) { $("backGo").click(); run(300); } };
const celebs = () => { const o = []; for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden && txt("celebT") !== "(none)") { o.push(txt("celebT") + " / " + txt("celebS").slice(0, 160)); $("celeb").click(); run(200); } } return o; };
const at = iso => { wall = new Date(iso).getTime(); run(300); back(); };
// 평소 기록 3주 심기 (09-21 ~ 10-07): 말씀 2장 · 공부 50분 · 암송 6구절, 주 5일
E(`(() => { const L = attLog(), H = habitState(); for (let d = "2026-09-21"; d <= "2026-10-07"; d = addDays(d, 1)) { const dow = (keyDate(d).getDay() + 6) % 7; if (dow >= 5) continue; L[d] = Object.assign(L[d] || {}, { a: 1, c: 2, s: 50, m: 6 }); H.td[d] = (H.td[d] || 0) | 1; } attVer++; measUI.first = null; })()`);
out("[first]", E("measFirst()"), "| base for 10-12", E(`JSON.stringify(roffBase("2026-10-12"))`));
// 1) 정보 탭 → 보상 끄기 주간 시작 (다음 월요일) → 취소 → 다시 시작
T("정보").click(); run(300);
out("[rof idle]", txt("rofBody").slice(0, 200));
const rbtn = act => qsa(body, "#rofBody button").find(b => b.dataset.act === act);
rbtn("start").click(); run(200);
out("[rof planned]", E("JSON.stringify(S.roff.on)"), "| on?", E("roffOn()"), "|", txt("rofBody").slice(0, 160));
rbtn("stop").click(); run(200);
out("[rof cancel]", E("JSON.stringify(S.roff.on)"));
rbtn("start").click(); run(200);
// 2) 월요일: 보상 끄기 주간
at("2026-10-12T09:00:00+09:00");
out("[mon] day", E("dayKey()"), "on?", E("roffOn()"), "| devWgt", E("devWgt()"));
out("[ladder]", E("JSON.stringify(ladderRows().filter(r => /보상 끄기/.test(r.t)).map(r => [r.k, r.t, r.v, r.s]))"));
const R0 = E("JSON.stringify({ manna: S.manna, stamp: S.stamp, gold: S.gold, ore: S.ore, silver: S.silver, ame: S.ame })");
E(`(() => { S.bible.rsec = (S.bible.rsec || 0) + 99999; toggleChapter(1, 0); toggleChapter(1, 1); })()`); run(100);
out("[read] toast:", txt("toast"), "| rewarded", E("S.bible.rewarded"), "| chap", E("S.day.chap"), "| t1", E("S.met.d[dayKey()].t1"));
E(`saveNote("월요일 묵상: 보상 없이 읽어 보기")`); out("[note] toast:", txt("toast"));
E("S.bible.timer = Date.now() - 15 * 60000; readTimerToggle()"); out("[timer] toast:", txt("toast"));
out("[grace]", E("graceGift('bible')"));
// 암송: 새 구절 첫 통과(보너스 보관) · 완료 보너스(보관)
E(`(() => { const t = dayKey(); delete S.mem.v[VERSES[30].no]; S.mem.v[VERSES[31].no] = { s: MEM_MASTER - 1, n: 6, f: 0, due: t, last: addDays(t, -3) }; })()`);
out("[mem]", E("JSON.stringify(memPass(VERSES[30]))"), "|", E("JSON.stringify(memPass(VERSES[31]))"));
out("[esc]", E("JSON.stringify(S.roff.esc)"));
// 공부: 광석 없이 깊이만
E("studyStart()"); wall += 26 * 60000; E("studyConfirm(); studyPause()");
out("[study] depth", E("S.study.depth"), "| scroll", E("S.scroll.n"));
const R1 = E("JSON.stringify({ manna: S.manna, stamp: S.stamp, gold: S.gold, ore: S.ore, silver: S.silver, ame: S.ame })");
out("[wallet] before", R0, "\n         after ", R1);
// 업무 탭: 말씀·공부·암송 받기는 쉼, 보스·문서고는 그대로 · 업적은 '주 끝나면'
E("S.day.boss = 25; S.ach.chap = 0; S.ach.floor = 0"); T("업무").click(); run(300);
const taskBtn = name => { const r = qsa(body, ".task").find(x => x.textContent.indexOf(name) >= 0); return r ? r.querySelector("button") : null; };
const bt = n => { const b = taskBtn(n); return b ? `${b.textContent}${b.disabled ? "(잠김)" : ""}` : "없음"; };
out("[daily]", "말씀1:", bt("말씀 1장 읽기"), "| 묵상:", bt("묵상 한 줄"), "| 보스:", bt("보스 20마리"), "| 암송:", bt("암송 5구절"));
out("[ach]", "말씀 누적:", bt("말씀 누적"), "| 최고 층:", bt("최고 층 도달"));
out("[weekly]", bt("말씀 "), "| dot", !T("업무").querySelector(".dot").hidden);
const m2 = E("S.manna"); taskBtn("말씀 1장 읽기").disabled = false; taskBtn("말씀 1장 읽기").click(); run(100);
out("[force click guard] claimed", E("!!S.day.claimed.read1"), "| manna same", E("S.manna") === m2);
E("festClaimNow()"); out("[fest claim] toast:", txt("toast"));
out("[dbl]", E(`dblAdd("back", 1e9, { manna: 5 })`), "| jarReady", E("(S.jar.n = 99, S.jar.g = 1e9, jarReady())"));
// 1권 완독(보관)
E(`(() => { S.bible.read[56] = "1".repeat(BOOKS[56][1] - 1) + "0"; S.bible.rsec += 99999; toggleChapter(56, BOOKS[56][1] - 1); })()`); run(100);
out("[book] esc", E("JSON.stringify(S.roff.esc)"), "| first", E("S.firsts.bk[56]"));
// 3) 주중 기록 (화~토)
E(`(() => { const L = attLog(), H = habitState(); ["2026-10-13","2026-10-14","2026-10-15","2026-10-16"].forEach(d => { L[d] = Object.assign(L[d] || {}, { a: 1, c: 1, s: 30, m: 4 }); H.td[d] = (H.td[d] || 0) | 1; }); attVer++; })()`);
at("2026-10-17T21:00:00+09:00");
out("[sat] on?", E("roffOn()"), "| rof:", txt("rofBody").slice(0, 120));
// 4) 다음 월요일: 끝 → 결과 · 보관 보상 · 비중 잠금 풀림
const before = E("JSON.stringify({ manna: S.manna, stamp: S.stamp, gold: S.gold })");
at("2026-10-19T08:00:00+09:00");
out("[fin] on?", E("roffOn()"), "| hist", E("JSON.stringify(S.roff.hist)"), "| unl", E("S.roff.unl"), "| esc", E("JSON.stringify(S.roff.esc)"));
out("[fin wallet]", before, "->", E("JSON.stringify({ manna: S.manna, stamp: S.stamp, gold: S.gold })"));
out("[fin celeb]", JSON.stringify(celebs()), "| cq", E("JSON.stringify((S.habit.cq || []).map(o => o.title))"));
T("정보").click(); run(300);
out("[rof after]", txt("rofBody").slice(0, 300));
const wb = qsa(body, "#rofBody .seg button").find(b => b.dataset.v === "80"); out("[wgt btn]", !!wb); if (wb) { wb.click(); run(200); }
out("[wgt]", E("S.roff.wgt"), "devWgt", E("devWgt()"));
const m3 = E("S.manna"), rm = E("readMult()");
E(`(() => { S.bible.rsec = (S.bible.rsec || 0) + 99999; toggleChapter(2, 0); })()`);
out("[read w80] manna +", E("S.manna") - m3, "expect", Math.max(1, Math.round(10 * rm * 0.8)), "(100%:", Math.round(10 * rm), ")");
// 5) 읽을 때와 곳 (말씀 탭)
T("말씀").click(); run(300);
out("[ii idle]", txt("iiBody").slice(0, 120));
const ib = act => qsa(body, "#iiBody button").find(b => b.dataset.act === act);
ib("edit").click(); run(100);
$("iiT").value = "07:30"; $("iiCue").value = "아침 먹고 나서"; $("iiWhere").value = "식탁에서";
qsa(body, "#iiBody .iip-days button").filter(b => +b.dataset.i >= 5).forEach(b => b.click());
out("[ii preview]", txt("iiPv"));
ib("save").click(); run(200);
out("[ii saved]", E("JSON.stringify(S.ii)"), "| sentence:", E("iiSentence()"));
out("[ii view]", txt("iiBody").slice(0, 260));
E(`S.met.d[dayKey()].t1 = 470; measUI.k = {}`);
out("[context]", E("JSON.stringify(measContext())"));
at("2026-10-20T07:10:00+09:00");
out("[near]", E("iiNear()"), "| ladder[0]", E("JSON.stringify(ladderRows()[0])"));
at("2026-10-20T10:00:00+09:00"); out("[near later]", E("iiNear()"));
ib("non").click(); run(100); out("[noti no acct]", txt("iiBody").slice(-120));
// 주말(계획 없는 날)은 맥락 일치율에서 빠짐
at("2026-10-24T07:10:00+09:00"); out("[sat near]", E("iiNear()"), "| today?", E("iiToday()"));
out("errors", errors.length, errors.slice(0, 5).join("\n"));
