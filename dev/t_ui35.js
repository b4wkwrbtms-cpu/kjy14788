// v35 기둥 9 점검: 축하 카드 모두 넘기기 · 모자란 값 글자 · 메뉴 글자 설정 저장
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = []; const check = (n, c, i) => { (c ? ok : bad).push(n); out((c ? "  ✓ " : "  ✗ ") + n + (i ? "  " + i : "")); };
E(`window.__st = setTimeout; setTimeout = () => 0; celebQ.length = 0; celebNext(); 0`);   // 하네스의 setTimeout은 바로 실행되므로 잠시 멈춤
E(`celebrate({ title: "하나", ic: "star" }); celebrate({ title: "둘", ic: "star" }); celebrate({ title: "셋", ic: "star" }); 0`);
const t1 = txt("celebT"), cAll = $("celebAll");
check("축하 3개가 몰리면 첫 카드에 '남은 2개 모두 넘기기'", t1 === "하나" && cAll && !cAll.hidden && /2개/.test(cAll.textContent), `${t1} / ${cAll && cAll.textContent} / ${txt("celebTap")}`);
cAll.dispatch("click");
check("모두 넘기기 → 카드 닫힘, 남은 것 없음", $("celeb").hidden && E(`celebQ.length`) === 0);
E(`celebrate({ title: "혼자", ic: "star" }); 0`);
check("하나뿐이면 넘기기 단추 숨김", $("celebAll").hidden && txt("celebTap") === "눌러서 닫기");
E(`setTimeout = window.__st; 0`);
E(`celebQ.length = 0; celebNext(); 0`);
const sh = E(`(() => { const g = S.gold; S.gold = 1000; const a = btnInner({ ok: false, label: "3.5A원", sub: "강화" }), b = btnInner({ ok: true, label: "3.5A원", sub: "강화" }), c = btnInner({ ok: false, label: "만나 50", sub: "강화" }); S.gold = g; return JSON.stringify([a, b, c, S.manna]); })()`);
const [a, b2, c, manna] = JSON.parse(sh);
check("못 사면 '2.5A 부족' 글자 (색 + 글자; A = 천)", /2\.5A 부족/.test(a), a.replace(/<[^>]+>/g, " ").trim());
check("살 수 있으면 원래 설명 그대로", /강화/.test(b2) && !/부족/.test(b2));
check("만나 같은 재화도 계산", manna >= 50 ? !/부족/.test(c) : /부족/.test(c), c.replace(/<[^>]+>/g, " ").trim());
E(`fxSet().ui = 1.3; save(); 0`);
const saved = JSON.parse(store.get("yageun-knight-v3")).fx;
check("메뉴 글자 크기 저장 (불러오기 정리에서도 남음)", saved.ui === 1.3 && E(`fxMerge({ shake: 1, flash: 1, ui: 1.3 }).ui`) === 1.3 && E(`fxMerge({ ui: 7 }).ui`) === undefined, JSON.stringify(saved));
E(`fxSet().ui = 1; save(); 0`);
out(`  통과 ${ok.length} · 실패 ${bad.length}`);
out("errors", errors.length ? errors.slice(0, 3) : "none");
