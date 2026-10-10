run(600);
const back = () => { if ($("back") && !$("back").hidden && $("backGo")) { $("backGo").click(); run(300); } };
const at = (y, m, d, h) => { wall = new Date(y, m - 1, d, h || 12, 0, 0).getTime(); run(400); back(); run(400); };
out("[boot] celeb:", txt("celebT"), "/", txt("celebS").slice(0, 160));
out("[boot] season", E("S.fest.sid"), "lv", E("S.fest.lv"), "dev", E("S.fest.dev"));
// 추수감사: 헌신 길 열고 Lv 일부만 받기, 토큰 남겨 두기
E(`(() => { const H = habitState(); ["2026-10-05","2026-10-06","2026-10-07"].forEach(d => { H.td[d] = (H.td[d] || 0) | 1; }); festMemo.k = ""; })()`); run(300);
E("festClaimNow()"); run(200);
out("[thanks] lv/cf/cd/tok", E("[S.fest.lv, S.fest.cf, S.fest.cd, S.fest.tok].join('/')"), "| own hv_head", E("S.ward.own.hv_head != null"));
// 며칠 동안 매일 말씀 5장·공부 50분·암송 10구절 했다고 치고 (달력 기록)
E(`(() => { const L = attLog(); for (let i = 1; i <= 30; i++) { const k = addDays("2026-10-10", i); L[k] = { a: 1, c: 5, s: 50, m: 10 }; habitState().td[k] = 7; } attVer++; })()`);
at(2026, 11, 14);
out("[11/14] day", E("dayKey()"), "season", E("S.fest.sid"), "lv", E("S.fest.lv"), "xp", E("festGet(festCur(), true).xp"), "claimable", E("festClaimable()"), "wk", E("JSON.stringify(S.fest.wk)"), "tok", E("S.fest.tok"));
T("업무").click(); run(300);
out("[11/14 card] head:", txt("fsHead").slice(0, 200));
out("[11/14 track] ready", qsa(body, "#fsTrk .fs-f.ready").length, qsa(body, "#fsTrk .fs-d.ready").length, "| big imgs", qsa(body, "#fsTrk img").length);
const ore0 = E("S.ore"), tok0 = E("S.fest.tok"), own0 = E("Object.keys(S.ward.own).filter(k => k.startsWith('hv_') || k === 't_thanks').join(',')");
// 순례 사이 (11/20): 추수감사 마무리 — 못 받은 보상 자동 지급, 남은 토큰 → 광석
at(2026, 11, 20);
out("[11/20] season", JSON.stringify(E("S.fest.sid")), "| hist", E("JSON.stringify(S.fest.hist)"), "| ore +", E("S.ore") - ore0, "(tok was", tok0 + ")", "| owned", own0, "->", E("Object.keys(S.ward.own).filter(k => k.startsWith('hv_') || k === 't_thanks').join(',')"));
out("[11/20] cq/celeb", E("JSON.stringify((S.habit.cq||[]).map(o=>o.title))"), "|", txt("celebT"), "/", txt("celebS").slice(0, 200));
T("업무").click(); run(300);
out("[gap card]", txt("fsHead"), "| trk hidden", $("fsTrk").hidden, "| info:", JSON.stringify(txt("fsInfo")));
out("[gap ladder]", E("JSON.stringify(ladderRows().filter(r => r.k === '시즌').map(r => r.t))"));
// 대림 (12/1): 새 순례, 11/29부터 기록으로 XP
at(2026, 12, 1);
out("[12/1] season", E("S.fest.sid"), "lv", E("S.fest.lv"), "dev", E("S.fest.dev"), "xp", E("festGet(festCur(), true).xp"), "| celeb:", txt("celebT"), "/", txt("celebS").slice(0, 160));
T("업무").click(); run(300);
out("[12/1 card] head:", txt("fsHead").slice(0, 220));
out("[12/1 track] cols", qsa(body, "#fsTrk .fs-c").length, "| imgs", qsa(body, "#fsTrk img").length);
E("S.fest.tok = 200;"); qsa(body, "#fsInfo button").find(b => b.dataset.act === "shop").click(); run(200);
out("[12/1 shop]", qsa(body, "#fsShop .fs-it").map(x => x.textContent.replace(/\s+/g, " ").trim().slice(0, 30)).join(" | "));
// 주현 (1/7): 세트 없는 절기 → 5레벨마다 은괴·자수정
at(2027, 1, 7);
out("[1/7] season", E("S.fest.sid"), "| hist", E("JSON.stringify(S.fest.hist)"), "| dev rw 5", E("JSON.stringify(festDevRw(festCur(), 5))"), "| dev rw 20", E("JSON.stringify(festDevRw(festCur(), 20))"));
// 사순 (2027-02-10 ~ 03-27, 7주)
at(2027, 2, 20);
out("[2/20] season", E("S.fest.sid"), "maxL", E("festCur().maxL"), "week", E("festWeekIdx(festCur())"), "| theme", E("FEST_DEF.lent.wk[festWeekIdx(festCur())][0]"));
// 안식 모드: 7일 쉬면 헌신 길 요구가 줄어듦
out("[rest] need", E(`(() => { const H = habitState(); H.rest = { from: "2027-02-14", to: "2027-02-19", why: "시험" }; festMemo.k = ""; return JSON.stringify(festDevEval(festCur()).cur); })()`));
// 두루마리·묵상 2배 하루 리셋
E("S.scroll.u = 3; S.scroll.d = '2027-02-19'; S.dbl.n = 3; S.dbl.d = '2027-02-19';");
out("[day reset] scroll u", E("scrollDay().u"), "| dbl n", E("dblDay().n"));
out("errors", errors.length, errors.slice(0, 5).join("\n"));
