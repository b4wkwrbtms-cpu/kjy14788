// v34 메뉴 묶기 · 설정 탭 점검 (가짜 DOM)
run(600);
const lbl = () => tabs().map(b => b.textContent.trim()).join(",");
out("[bar]", tabs().length, lbl());
out("[segs]", E(`MENU_G.map(g => g.id + ":" + menuUI.seg[g.id].children.filter(c => !c.isText).map(c => c.attrs["data-t"] + (c.hidden ? "(잠김)" : "")).join("/")).join(" | ")`));
out("[cur]", E("curTab"), "grp", E("grpOf(curTab).n"), "sel", E(`MENU_G.map(g => g.n + "=" + menuUI.btn[g.id].attrs["aria-selected"]).join(" ")`));
// 묶음 이동과 마지막 화면 기억
E(`selectTab("mem", true)`); run(100);
out("[mem] head grp", E(`$("tabHead").classList.contains("grp")`), "seg on", E(`menuUI.seg.word.classList.contains("on")`), "name", txt("thName"));
E(`menuGo("grow")`); run(100); out("[go grow]", E("curTab"));
E(`selectTab("suit", true)`); E(`menuGo("set")`); run(100); out("[go set]", E("curTab"), "head grp", E(`$("tabHead").classList.contains("grp")`), "name", txt("thName"));
E(`menuGo("word")`); out("[back word]", E("curTab")); E(`menuGo("grow")`); out("[back grow]", E("curTab"));
out("[last saved]", E(`localStorage.getItem(SAVE_KEY + "-sub")`));
// 같은 묶음 다시 누르면 그대로
E(`menuGo("grow")`); out("[same grp]", E("curTab"));
// 점: 묶음 버튼
E(`selectTab("daily", true)`); run(300);
out("[dots]", E(`MENU_G.map(g => g.n + (menuUI.btn[g.id].querySelector(".dot").hidden ? "" : "●")).join(" ")`), "| tab dots", E(`TABS.filter(([t]) => menuUI.dot[t]).map(t => t[0]).join(",")`));
// 설정 탭 내용
E(`selectTab("set", true)`); run(200);
out("[set cards]", E(`panels.set.children.map(c => (c.className || c.tagName) + (c.hidden ? "(숨김)" : "")).join(" / ")`));
out("[info has acct?]", E(`!!panels.info.children.find(c => c.id === "acCard")`), "fx in info?", E(`!!panels.info.children.find(c => /fxset/.test(c.className))`), "acct in set", E(`!!panels.set.children.find(c => c.id === "acCard")`));
out("[snd]", txt("stSndSub"), E(`[$("stSnd").attrs["aria-checked"], $("stMus").attrs["aria-checked"], $("stSfx").attrs["aria-checked"], $("stVm").value, $("stVmV").textContent].join(",")`));
$("stMus").click(); run(50); out("[music off]", E("S.music"), E("sndLabel()"), txt("stSndSub"), E(`$("stMus").attrs["aria-checked"]`));
$("stSfx").click(); run(50); out("[sfx off]", E("S.sfxOff"), E("sndLabel()"), E("sndAudible()"), txt("stSndSub"));
E("sndQuick()"); out("[quick on]", E("S.sound"), E("S.music"), E("S.sfxOff"), E("sndLabel()"));
E("sndQuick()"); out("[quick off]", E("S.sound"), E("sndLabel()"), E("sfxOn()"));
$("stSnd").click(); run(50); out("[master on]", E("S.sound"), E("sndLabel()"));
// 크기
$("stVs").value = "40"; $("stVs").dispatch("input", {}, $("stVs")); $("stVs").dispatch("change", {}, $("stVs")); run(50);
out("[vol s]", E("JSON.stringify(S.vol)"), E(`sndVol("s")`), txt("stVsV"), "saved", JSON.stringify(S().vol));
$("stVm").value = "0"; $("stVm").dispatch("change", {}, $("stVm")); out("[vol m 0]", E(`sndVol("m")`), E(`sndVol("x")`));
// 화면
const fsBtn = a => E(`panels.set.children.find(c => /scr/.test(c.className)).querySelectorAll("button").find(b => b.dataset.act === "${a}")`);
out("[fs]", E("rdFs()")); E(`(() => { const c = panels.set.children.find(c => /scr/.test(c.className)); c.querySelectorAll("button").find(b => b.dataset.act === "fs+").click(); c.querySelectorAll("button").find(b => b.dataset.act === "fs+").click(); })()`); out("[fs++]", E("S.rdfs"), txt("stFs"));
E(`(() => { const c = panels.set.children.find(c => /scr/.test(c.className)); c.querySelectorAll("button").find(b => b.dataset.fx === "shake" && b.dataset.v === "0").click(); })()`); out("[shake off]", E("JSON.stringify(S.fx)"));
// 알림 줄
out("[noti]", txt("stNoBody"));
// 초대
E(`invCopy(false)`); out("[copy fallback]", E(`$("stInvIn").hidden`), E(`$("stInvIn").value`));
E(`invQr()`); out("[qr]", E(`$("stQr").hidden`), E(`$("stQrCv")._done`), txt("stQrBtn"), "size", E(`qrMatrix(invUrl()).length`));
// 로그인으로 가기
E(`goLogin()`); out("[goLogin]", E("curTab"));
// 안내 다시 보기
E(`selectTab("info", true)`); run(100); out("[guide rows]", E(`$("mgTabs").children.filter(c => !c.isText).length`), E(`$("mgTabs").children.filter(c => !c.isText).map(c => c.querySelector("b").textContent).join(",")`));
out("[version]", E("GAME_V"), E(`panels.set.children[panels.set.children.length - 1].textContent`));
out("errors", errors.length ? errors.slice(0, 5) : "none");
