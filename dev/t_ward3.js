run(600);
// 1) 직무 배치 → 영업팀 정장 6벌 해금, 묶음 축하
out("job", E(`(() => { S.jobs = ["sales"]; S.job = "sales"; wardTick(true); const own = Object.keys(S.ward.own).filter(id => id.startsWith("sa_")); return own.join(",") + " | cq=" + JSON.stringify((S.habit.cq || []).map(o => o.title)) + " | celeb=" + document.getElementById("celebT").textContent; })()`));
// 2) 영업 세트 6벌 입기 → 직무 스킬 대기 -20%
out("jobcd", E(`(() => { wardWearSet("sales", "eq"); wardDirty++; const W = wardStats(); return "jobcd " + W.jobcd + " crit " + W.crit + " gold " + W.gold + " xdmg " + W.xdmg.toFixed(2) + " setN " + wardSetN(WSETX.sales); })()`));
out("castJob", E(`(() => { const sk = Object.values(JSK).find(x => x.job === "sales"); if (!sk) return "no JOB_SK"; S.skillCd = {}; const t0 = Date.now(); spawnWait = 0; const ok = castJob(sk, true); return "ok=" + ok + " cd=" + Math.round(((S.skillCd[sk.id] || 0) - t0) / 1000) + "s (base " + sk.cd + ")"; })()`));
// 3) 회장님 고유 효과: 강화 단계 → 배율 (예전 5강 = +4에서 최대)
out("chair uq", E(`(() => { const r = []; for (let e = 0; e <= 6; e++) { S.ward.own.ch_top = e; wardDirty++; r.push(e + ":" + wardUqText(WIT.ch_top, e)); } S.ward.own.ch_top = 0; wardDirty++; return r.join(" "); })()`));
// 4) 신화 강화는 만나
out("armor enh", E(`(() => { S.ward.own.ar_tie = 0; S.manna = 100; const c = wardEnhCost(WIT.ar_tie, 0); const ok = wardEnh("ar_tie"); return JSON.stringify(c) + " ok=" + ok + " lv=" + S.ward.own.ar_tie + " manna=" + S.manna; })()`));
// 5) 강화 비용표 (등급별 +1 → +10 합계)
out("enh totals", E(`(() => { const r = {}; [1,2,3,4,5].forEach(g => { const it = WITEMS.find(x => x.g === g && x.slot !== "title"); let o = 0, m = 0, sv = 0; for (let e = 0; e < 10; e++) { const c = wardEnhCost(it, e); o += c.ore || 0; m += c.manna || 0; sv += c.silver || 0; } r[WGRADE[g].n] = { ore: o, manna: m, silver: sv }; }); return JSON.stringify(r); })()`));
// 6) 칭호 효과: 암송 꿈나무 → 암송 보상
out("title", E(`(() => { const m0 = memMult(); wardEquip("t_mem1"); wardDirty++; return m0.toFixed(3) + " -> " + memMult().toFixed(3); })()`));
// 7) 도감 20벌 → 선물
out("coll20", E(`(() => { const o0 = S.ore, s0 = S.silver; ["cy_head","cy_top","ic_head","ic_top","pd_top","w_frost","w_crystal"].forEach(id => S.ward.own[id] = 0); wardDirty++; wardCollTick(true); return "coll=" + S.ward.coll + " n=" + wardCount() + " ore +" + (S.ore - o0) + " silver +" + (S.silver - s0); })()`));
// 8) 강화 MAX
out("max", E(`(() => { S.ore = 1e7; S.silver = 999; let n = 0; while (wardEnh("dl_head") && n < 20) n++; return "enh steps " + n + " lv " + S.ward.own.dl_head; })()`));
// 9) 옛 저장 → 옷장 옮기기 (전설 3강 대머리 = 강화 +2 = x16)
out("legacy", E(`(() => { const w = wardFromOld({ cos: { hair: [1, 1, 3], aura: [0, 0, 2] }, outfit: "cat", wskin: "scythe", look: { hair: 2 } }); return JSON.stringify(w.own) + " mig=" + JSON.stringify(w.mig) + " uq=" + wardUqText(WIT.ch_head, w.own.ch_head) + " / " + wardUqText(WIT.a_night, w.own.a_night); })()`));
// 10) 이상한 저장값 막기
out("sanitize", E(`(() => { const w = wardMerge({ v: 1, own: { rk_top: 99, bogus: 1, t_seed: 5 }, eq: { top: "rk_top", head: "rk_top", tie: "nope" }, look: { top: "-", head: "dl_head" }, seen: ["rk_top", "rk_top", "x"], coll: 99 }, {}); return JSON.stringify(w); })()`));
out("errors", errors.length, errors.slice(0, 5).join("\n"));
