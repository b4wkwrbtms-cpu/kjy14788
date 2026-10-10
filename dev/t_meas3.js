run(600);
const back = () => { for (let i = 0; i < 3; i++) if ($("back") && !$("back").hidden && $("backGo")) { $("backGo").click(); run(300); } };
const at = iso => { wall = new Date(iso).getTime(); run(300); back(); };
E(`(() => { const L = attLog(), H = habitState(); for (let d = "2026-09-21"; d <= "2026-10-07"; d = addDays(d, 1)) { const dow = (keyDate(d).getDay() + 6) % 7; if (dow >= 5) continue; L[d] = Object.assign(L[d] || {}, { a: 1, c: 2, s: 50, m: 6 }); H.td[d] = (H.td[d] || 0) | 1; } attVer++; measUI.first = null; })()`);
// 1) 중간에 마치기: 두 번 눌러야 · 보관 보상은 바로 · 비교 없음 · 비중 잠금 그대로
T("정보").click(); run(200);
const rbtn = act => qsa(body, "#rofBody button").find(b => b.dataset.act === act);
rbtn("start").click(); run(100);
at("2026-10-14T20:00:00+09:00");
out("[wed] on?", E("roffOn()"), "|", txt("rofBody").slice(0, 60));
E("roffEsc({ manna: 50, stamp: 3, ore: 100, haste: 1, gold: 12345 })");
rbtn("stop").click(); run(100);
out("[stop once] on?", E("roffOn()"), "| btn:", rbtn("stop") && rbtn("stop").textContent);
const w0 = E("JSON.stringify({ manna: S.manna, stamp: S.stamp, ore: S.ore, haste: S.buffs.haste, gold: Math.round(S.gold) })");
E("measUI.roffAsk = Date.now() + 3000; roffCancel()");
out("[early fin]", w0, "->", E("JSON.stringify({ manna: S.manna, stamp: S.stamp, ore: S.ore, haste: S.buffs.haste, gold: Math.round(S.gold) })"));
out("[early hist]", E("JSON.stringify(S.roff.hist)"), "| unl", E("S.roff.unl"), "| on", E("S.roff.on"));
out("[early celeb]", E("JSON.stringify((S.habit.cq || []).map(o => o.title + ' / ' + o.sub.slice(0, 120)))"), "|", txt("celebT"), "/", txt("celebS").slice(0, 160));
// 2) 80% 넘는 주 → 비중 잠금 풀림, 결과 축하
E(`(() => { S.roff.on = { from: "2026-10-19", to: "2026-10-25", base: { c: 4, s: 120, m: 20 } }; })()`);
E(`(() => { const L = attLog(); ["2026-10-19","2026-10-20","2026-10-21","2026-10-22","2026-10-23"].forEach(d => { L[d] = Object.assign(L[d] || {}, { a: 1, c: 2, s: 40, m: 5 }); }); attVer++; })()`);
at("2026-10-27T09:00:00+09:00");
out("[80+] hist", E("JSON.stringify(S.roff.hist[S.roff.hist.length - 1])"), "| unl", E("S.roff.unl"), "|", txt("celebT"), "/", txt("celebS").slice(0, 200));
// 3) 판정: 도입 14일 지나서 (v28 10-09 → 10-23)
T("정보").click(); run(300);
out("[checks]", E("JSON.stringify(measChecks().map(c => 'v' + c.v + ' ' + c.items.map(x => x.st).join(',')))"));
out("[chk text]", txt("mstChk").slice(0, 300));
// 4) 고임 경보 → 7일 안에 쓰기
E(`(() => { const t = dayKey(); S.met.ho = [{ k: "manna", d: addDays(t, -9), ok: 0 }, { k: "ore", d: addDays(t, -3), ok: 0 }]; const E2 = ecoState(); E2.days[addDays(t, -2)] = { i: [0,0,0,0,0], o: [0,0,0,0,0] }; E2.days[addDays(t, -2)].o[ECO_KEYS.indexOf("ore")] = 50; measHoardTick(); })()`);
out("[hoard]", E("JSON.stringify(S.met.ho)"), "| keys", E("JSON.stringify(ECO_KEYS)"));
// 5) 퇴사 게이지 기록
E("S.maxFloor = Math.max(S.maxFloor, 80); S.floor = Math.max(S.floor, 80)");
const rr = E("Math.round(retireRatio() * 100)");
E("doRetire(false)"); run(200);
out("[retire]", E("JSON.stringify(S.met.rt)"), "expect r", rr);
// 6) 옷 해금 날짜
E(`(() => { const id = WITEMS.find(x => x.cond && S.ward.own[x.id] == null).id; S.ward.own[id] = 0; measUI.wuT = 0; window.__wid = id; })()`); run(100);
out("[wu]", E("JSON.stringify(S.met.wu)"));
// 7) 플랜 날 보상: 보상 끄기 주간에 채운 날(2)은 되돌릴 때 빼지 않음
out("[plan undo]", E(`(() => { if (!S.plan) return "no plan"; const m = S.manna; S.day.plan = 2; try { const st = planStats(); if (!st) return "no stats"; } catch (e) { return "err " + e.message; } const drw = S.day.plan === 2 ? { manna: 0, stamp: 0 } : planDayRw(); return "drw " + JSON.stringify(drw); })()`));
// 8) 주간 한 줄: 월요일엔 지난 주 키로, 이미 남겼으면 사다리에서 빠짐
at("2026-11-02T08:00:00+09:00");
out("[mon ladder]", E("JSON.stringify(ladderRows().filter(r => /주간 한 줄|청지기/.test(r.t)).map(r => r.t + ':' + r.s))"));
T("정보").click(); run(300);
out("[mon week]", !!$("mstWIn"), qsa(body, "#mstWeek button").map(b => b.dataset.wk).join(","));
out("[stew nov]", txt("stwBody").slice(0, 120));
out("[effort]", E("JSON.stringify(measEffort())"), "| gaps", E("JSON.stringify(measGaps())"), "| curr", E("JSON.stringify(measCurr())"));
out("[chart]", qsa(body, "#mstChart rect").length, "| svg text", txt("mstChart").slice(0, 120));
out("errors", errors.length, errors.slice(0, 5).join("\n"));
