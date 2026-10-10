run(600);
const back = () => { if ($("back") && !$("back").hidden && $("backGo")) { $("backGo").click(); run(300); } };
// 1) 정산서 → 묵상 2배 등록 → 묵상 한 줄로 받기
E(`(() => { S.away = { sec: 7200, sim: 7200, f0: S.floor, f1: S.floor, floors: 0, bosses: 120, gold: 7.5e9, wall: 0, cap: 0, miss: 0 }; backWant = true; })()`); run(400);
out("[back open]", !$("back").hidden, "| gold slip:", txt("backGold"));
const g0 = E("S.gold");
back(); run(400);
out("[back claim] gold +", (E("S.gold") - g0).toExponential(3), "| dbl", E("JSON.stringify(S.dbl.p.map(p => ({ s: p.s, g: p.g, nd: p.nd })))"), "| toast:", txt("toast"));
const g1 = E("S.gold");
E(`saveNote("오늘은 시편 126편을 묵상했다")`); run(300);
out("[note → dbl] gold +", (E("S.gold") - g1).toExponential(3), "| pending", E("S.dbl.p.length"), "| got", E("S.dbl.got"));
// 2) 오늘 업무 모두 완료 → 묵상 2배
E(`(() => { DAILY.forEach(d => { S.day.claimed[d.id] = 1; }); })()`); T("업무").click(); run(300);
const allBtn = qsa(body, ".task").map(r => r.querySelector("button")).find(b => b && b.parentElement && b.parentElement.textContent.indexOf("오늘 업무 모두 완료") >= 0);
allBtn.click(); run(300);
out("[all claim] dbl", E("JSON.stringify(S.dbl.p.map(p => p.s + ':' + JSON.stringify(p.rw)))"), "| celebS:", txt("celebS").slice(0, 120));
const h0 = E("S.buffs.haste");
E("S.mem.total += 5"); run(300);
out("[mem5 → dbl] haste +", E("S.buffs.haste") - h0, "| pending", E("S.dbl.p.length"));
// 3) 1독 완료: 마지막 장 체크 때 아직 완독으로 안 센 권을 모두 셈
E(`(() => { for (let b = 0; b < 66; b++) S.bible.read[b] = "1".repeat(BOOKS[b][1]); S.bible.read[65] = "1".repeat(21) + "0"; })()`);
const m0 = E("S.manna"), r0 = E("S.bible.rounds");
E(`(() => { S.bible.rsec = (S.bible.rsec || 0) + 99999; toggleChapter(65, 21); })()`); run(300);
out("[round] rounds", r0, "->", E("S.bible.rounds"), "| firsts", E("Object.keys(S.firsts.bk).length"), "| br sample", E("JSON.stringify([S.firsts.br[0], S.firsts.br[65], S.firsts.bc[0]])"), "| manna +", E("S.manna") - m0, "| titles", E("['t_torah','t_gospel','t_paul','t_ot','t_nt'].map(t => t + ':' + (S.ward.own[t] != null)).join(' ')"));
// 다음 독에서 같은 권 다시 끝내면 기본 선물 (2배 아님)
E(`(() => { S.bible.read[30] = "1"; })()`);
const m1 = E("S.manna");
out("[round2 book]", E(`JSON.stringify(bookCheck(30))`), "| bc", E("S.firsts.bc[30]"), "br", E("S.firsts.br[30]"));
// 4) 예전 저장: 지난 통독 1번 + 끝낸 권 2개
out("[migrate]", E(`(() => { const keep = S.firsts, kb = S.bible; S.firsts = firstsNew(); S.bible = Object.assign({}, kb, { rounds: 1, read: { 0: "1".repeat(50), 7: "1111", 8: "1" } }); const m = S.manna; firstsMigrate(); const r = { bk0: S.firsts.bk[0], bk7: S.firsts.bk[7], bk1: S.firsts.bk[1], bc0: S.firsts.bc[0], bc7: S.firsts.bc[7], br0: S.firsts.br[0], br1: S.firsts.br[1], manna: S.manna - m }; S.firsts = keep; S.bible = kb; return JSON.stringify(r); })()`));
// 5) 퇴사해도 항아리·두루마리 그대로
out("[retire keep]", E(`(() => { S.jar.g = 12345; S.scroll.n = 4; S.maxFloor = Math.max(S.maxFloor, 60); const before = JSON.stringify([S.jar.g, S.scroll.n]); doRetire(false); return before + " -> " + JSON.stringify([S.jar.g, S.scroll.n]) + " gold " + S.gold; })()`));
out("errors", errors.length, errors.slice(0, 5).join("\n"));
