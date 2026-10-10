run(600);
// 0) 켜자마자: 추수감사 순례가 열리고 지난 기록으로 XP
out("[boot] errors", errors.length, errors.slice(0, 3).join("\n"));
out("[season]", E(`(() => { const se = festCur(), F = S.fest, c = festGet(se, true); return JSON.stringify({ key: se.key, start: se.start, end: se.end, maxL: se.maxL, lv: F.lv, dev: F.dev, xp: c.xp, day: c.day, wb: c.wb, today: c.today, dv: c.dv, wk: F.wk, tok: F.tok, b: F.b }); })()`));
out("[weeks]", E(`JSON.stringify(festGet(festCur()).weeks)`));
out("[cq]", E(`JSON.stringify((S.habit.cq || []).map(o => o.title))`));
// 1) 첫걸음 꾸러미
out("[start] ready", E("startReady()"), "prog", E("JSON.stringify(startProg())"));
T("업무").click(); run(300);
out("[start card] hidden", $("stpGo") && $("stpGo").parentElement.hidden, "| q:", txt("stpQ"), "| btn:", txt("stpGo"), "| dot:", !T("업무").querySelector(".dot").hidden);
const m0 = E("S.manna"), o0 = E("S.ore");
$("stpGo").click(); run(400);
out("[start open] manna +", E("S.manna") - m0, "ore +", E("S.ore") - o0, "| start", E("S.firsts.start"), "| t_first own", E("S.ward.own.t_first != null"), "| celeb:", txt("celebT"));
// 2) 절기 순례 카드
out("[fest card] head:", txt("fsHead").slice(0, 260));
out("[fest card] info:", txt("fsInfo").slice(0, 400));
out("[fest track cols]", qsa(body, "#fsTrk .fs-c").length, "| ready free:", qsa(body, "#fsTrk .fs-f.ready").length, "| lock dev:", qsa(body, "#fsTrk .fs-d.lock").length);
// 헌신 길: 7일 안에 말씀 5일 → 소급 개방
E(`(() => { const H = habitState(); ["2026-10-05","2026-10-06","2026-10-07"].forEach(d => { H.td[d] = (H.td[d] || 0) | 1; }); festMemo.k = ""; })()`); run(400);
out("[dev] dev", E("S.fest.dev"), "| cur", E("JSON.stringify(festGet(festCur(), true).dv)"), "| claimable", E("festClaimable()"));
const t0 = E("S.fest.tok");
qsa(body, "#fsInfo button").find(b => b.dataset.act === "claim").click(); run(300);
out("[claim] cf/cd", E("S.fest.cf + '/' + S.fest.cd"), "| tok", t0, "->", E("S.fest.tok"), "| celeb:", txt("celebT"), "/", txt("celebS").slice(0, 120));
// 3) 상점: 토큰으로 절기 옷
E("S.fest.tok = 60;"); run(100);
qsa(body, "#fsInfo button").find(b => b.dataset.act === "shop").click(); run(200);
out("[shop] items", qsa(body, "#fsShop .fs-it").length, "| buy buttons", qsa(body, "#fsShop button").length);
const bb = qsa(body, "#fsShop button").find(b => b.dataset.k === "piece"); bb.click(); run(300);
out("[shop buy]", bb.dataset.id, "own", E(`S.ward.own["${bb.dataset.id}"] != null`), "| tok", E("S.fest.tok"), "| celeb:", txt("celebT"));
const rb = qsa(body, "#fsShop button").find(b => b.dataset.id === "scroll"); rb.click(); run(200);
out("[shop res] scroll n", E("S.scroll.n"), "| tok", E("S.fest.tok"));
// 4) 시간의 두루마리
E("S.study.today = 20;"); E("addStudy(10 * 60000)"); run(200);
out("[scroll earn] n", E("S.scroll.n"), "| got", E("S.scroll.got"), "| toast:", txt("toast"));
T("공부").click(); run(300);
out("[scroll card]", txt("scrN"), "|", txt("scrGo"), "|", txt("scrSub"));
const g0 = E("S.gold"), fl0 = E("S.floor + '/' + S.maxFloor + '/' + S.bestFloor");
$("scrGo").click(); run(300);
out("[scroll use] gold +", (E("S.gold") - g0).toExponential(3), "| floor", fl0, "->", E("S.floor + '/' + S.maxFloor + '/' + S.bestFloor"), "| u", E("S.scroll.u"), "| celeb:", txt("celebS").slice(0, 100));
out("[scroll vs offline 2h]", E(`(() => { const a = scrollGold(), keep = S.auto; const r = simulateOffline(7200); S.auto = keep; return a.toExponential(3) + " vs sim " + r.gold.toExponential(3) + " (버프 " + JSON.stringify(S.active) + ")"; })()`));
E("S.scroll.n = 5;"); $("scrGo").click(); run(100); $("scrGo").click(); run(100); $("scrGo").click(); run(200);
out("[scroll cap] u", E("S.scroll.u"), "n", E("S.scroll.n"), "| btn:", txt("scrGo"));
// 5) 묵상 2배
const gb = E("S.gold"), mb = E("S.manna");
out("[dbl add]", E(`dblAdd("back", 5e6, { manna: 30, haste: 1 })`), "| pending", E("S.dbl.p.length"));
T("업무").click(); run(300);
out("[dbl card]", txt("dblT"), "|", txt("dblL"));
out("[ladder strip]", txt("gsT"), "|", txt("gsV"));
E(`S.bible.total += 1`); run(300);
out("[dbl done] gold +", (E("S.gold") - gb).toExponential(3), "manna +", E("S.manna") - mb, "| pending", E("S.dbl.p.length"), "| cq", E("JSON.stringify((S.habit.cq||[]).map(o=>o.title))"), "| celeb:", txt("celebT"));
E(`dblAdd("daily", 0, { manna: 20 }); dblAdd("daily", 0, { manna: 20 }); dblAdd("daily", 0, { manna: 20 });`);
out("[dbl cap] n", E("S.dbl.n"), "pending", E("S.dbl.p.length"));
// 6) 달란트 항아리
const jg = E("S.jar.g");
E("jarAdd(1e6)");
out("[jar add] +", E("S.jar.g") - jg);
T("암송").click(); run(300);
out("[jar card]", txt("jarG"), "|", txt("jarN"), "|", txt("jarGo"));
E("for (let i = 0; i < 10; i++) jarOnMem();"); run(300);
out("[jar ready]", E("jarReady()"), "| card:", txt("jarN"), "|", txt("jarGo"), "| mem dot:", !T("암송").querySelector(".dot").hidden);
const gj = E("S.gold"), jv = E("S.jar.g");
$("jarGo").click(); run(300);
out("[jar open] gold +", (E("S.gold") - gj).toExponential(3), "(jar", jv.toExponential(3) + ")", "| jar", E("JSON.stringify(S.jar)"), "| celeb:", txt("celebT"));
// 7) 첫 암송 2배
out("[mem first]", E(`(() => { const v = VERSES.find(x => !S.mem.v[x.no]); const m0 = S.manna, g0 = S.gold; const base = memReward(0); const r = memPass(v); return v.no + " base " + JSON.stringify({ manna: base.manna, gold: base.gold.toExponential(2) }) + " got manna +" + (S.manna - m0) + " gold +" + (S.gold - g0).toExponential(2) + " bonus='" + r.bonus + "' firsts.mem=" + S.firsts.mem + " jar.n=" + S.jar.n; })()`));
out("[mem second]", E(`(() => { const v = VERSES.find(x => S.mem.v[x.no] && S.mem.v[x.no].n === 1); const m0 = S.manna; const r = memPass(v); return v.no + " manna +" + (S.manna - m0) + " bonus='" + r.bonus + "'"; })()`));
// 8) 첫 완독: 오바댜(1장) 읽고 확인
out("[book] before", E("JSON.stringify({ bk: S.firsts.bk[30], br: S.firsts.br[30] })"));
const mbk = E("S.manna"), sbk = E("S.stamp");
E(`(() => { S.bible.rsec = (S.bible.rsec || 0) + 9999; toggleChapter(30, 0); })()`); run(300);
out("[book] after", E("JSON.stringify({ bk: S.firsts.bk[30], br: S.firsts.br[30], bc: S.firsts.bc[30] })"), "manna +", E("S.manna") - mbk, "stamp +", E("S.stamp") - sbk, "| cq", E("JSON.stringify((S.habit.cq||[]).map(o=>o.title))"));
E("toggleChapter(30, 0)"); E("toggleChapter(30, 0)"); run(200);
out("[book again same round] bc", E("S.firsts.bc[30]"));
T("말씀").click(); run(300);
out("[dex]", txt("dexSub"), "| cells", qsa(body, "#dexBody .bdx-c").length, "| done", qsa(body, "#dexBody .bdx-c.done").length, "|", txt("dexBody").slice(-200));
const cell = qsa(body, "#dexBody .bdx-c").find(b => b.dataset.b === "42"); cell.click(); run(200);
out("[dex tap] bibleBook", E("bibleBook"), "test", E("bibleTest"), "| chTitle:", txt("chTitle"));
// 9) 묶음 칭호: 모세오경 5권
E(`(() => { [0,1,2,3,4].forEach(b => { S.firsts.bk[b] = dayKey(); }); wardCV = null; })()`); run(400);
out("[torah title] own", E("S.ward.own.t_torah != null"), "| cond", E("wardCondText(WIT.t_gospel)"), "| prog", E("wardCondProg(WIT.t_gospel)"));
out("[fest cond]", E("wardCondText(WIT.hv_shoes)"), "|", E("wardCondProg(WIT.hv_shoes).toFixed(2)"), "|", E("wardCondText(WIT.av_head)"));
// 10) 저장값 검사
out("[sanitize]", E(`(() => { const s = {}; payMerge(s, { fest: { sid: "x", lv: 500, cf: 900, tok: -3, b: { "2026-10-10": 5, bad: 3 }, wk: { "2026-10-05": 15 }, hist: [{ k: "thanks-2025", L: 7 }, { k: "<script>" }] }, jar: { g: "NaN", n: 4 }, scroll: { n: 3.7, u: 99 }, dbl: { p: [{ s: "back", g: 100, rw: { manna: 3, bogus: 1 } }, { s: "x" }] }, firsts: { start: 1, bk: { 0: "2026-01-01", 1: "nope" }, br: { 0: -1, 1: -5 }, bc: { 0: 2 } } }); return JSON.stringify(s); })()`));
out("errors", errors.length, errors.slice(0, 5).join("\n"));
