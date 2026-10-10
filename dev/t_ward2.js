run(800);
const W = () => E("S.ward");
const btn = (sel, pred) => qsa(body, sel).find(pred);
const tb = T("옷장"); out("tab", !!tb); tb.click(); run(300);
out("list rows", qsa($("wdList"), "div.up").length, "| head:", qsa($("wdList"), "div.wd-lh")[0] && qsa($("wdList"), "div.wd-lh")[0].textContent);
out("slots", qsa($("wdSlots"), "button").length, qsa($("wdSlots"), "button").map(b => b.dataset.slot + ":" + b.textContent).join(" "));
out("sum", txt("wdSum").slice(0, 300));
// 머리 칸
btn("#wdSlots button", b => b.dataset.slot === "head").click(); run(300);
out("head rows", qsa($("wdList"), "div.up").map(r => r.dataset.id).join(","));
const ore0 = E("S.ore");
btn("#wdList button", b => b.dataset.act === "buy" && b.dataset.id === "rk_head").click(); run(300);
out("buy rk_head", E("S.ward.own.rk_head"), "ore", ore0, "->", E("S.ore"), "eq.head", E("S.ward.eq.head"), "celeb", txt("celebT"));
const e0 = E("S.ward.own.dl_head");
const eb = btn("#wdList button", b => b.dataset.act === "enh" && b.dataset.id === "dl_head"); out("enh btn", !!eb, eb && eb.disabled, eb && eb.textContent);
if (eb) eb.click(); run(200);
out("enh dl_head", e0, "->", E("S.ward.own.dl_head"), "ore", E("S.ore"));
// 덧입기
btn("#wdMode button", b => b.dataset.mode === "look").click(); run(200);
out("look rows btn", qsa($("wdList"), "button").filter(b => b.dataset.act === "look").map(b => b.dataset.id).join(","));
btn("#wdList button", b => b.dataset.act === "look" && b.dataset.id === "ct_head").click(); run(200);
out("look.head", E("S.ward.look.head"), "shown", E("wardShown('head').id"), "eq still", E("S.ward.eq.head"));
btn("#wdList button", b => b.dataset.act === "lookoff").click(); run(200);
out("look off", E("S.ward.look.head"), "shown", E("String(wardShown('head'))"));
btn("#wdList button", b => b.dataset.act === "lookeq").click(); run(200);
out("look eq", E("JSON.stringify(S.ward.look)"));
// 세트별
btn("#wdView button", b => b.dataset.view === "set").click(); run(200);
out("set cards", qsa($("wdList"), "div.wd-set").length, "first:", qsa($("wdList"), "div.wd-set")[0].textContent.slice(0, 120));
btn("#wdMode button", b => b.dataset.mode === "eq").click(); run(200);
const se = btn("#wdList button", b => b.dataset.act === "seteq" && b.dataset.set === "cat"); out("seteq cat", !!se); se && se.click(); run(200);
out("eq after cat", E("JSON.stringify(S.ward.eq)"), "toast", txt("toast"));
const d1 = E("stats().dps");
btn("button", b => b.dataset.act === "best").click(); run(200);
out("best", E("JSON.stringify(S.ward.eq)"), "dps", d1.toExponential(3), "->", E("stats().dps").toExponential(3));
// 미리 입기 (잠긴 옷)
btn("#wdList button", b => b.dataset.act === "prev" && b.dataset.id === "pd_prop").click(); run(100);
out("preview", txt("celebT"), "|", txt("celebS"));
// 저장 → 다시 불러오기
E("save()");
const sv = S();
out("saved ward", JSON.stringify(sv.ward).slice(0, 200));
const re = E(`(() => { const w = wardMerge(${JSON.stringify(sv.ward)}, {}); return JSON.stringify({ n: Object.keys(w.own).length, eq: w.eq, seen: w.seen.length, coll: w.coll }); })()`);
out("remerge", re);
// 정보 탭
T("정보").click(); run(300);
out("info errors?", errors.length);
out("errors", errors.length, errors.slice(0, 5).join("\n"));
