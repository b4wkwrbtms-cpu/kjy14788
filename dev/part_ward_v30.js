/* ===================== 옷장 (v30) =====================
   2층 구조: 입은 옷 = 착용 효과(부위마다 다른 능력치 + 입었을 때 효과), 가진 옷 = 보유 효과(모든 피해 +) + 고유 효과.
   겉모습은 덧입기로 따로 (능력치는 그대로). 세트는 같은 세트 2·4·6벌, 회장님 세트는 가지고만 있어도(소장 효과).
   열쇠는 말씀·공부·암송 기록과 층·퇴사 기록, 사는 옷은 공부로 캔 광석. 강화: 고급~전설은 광석, 신화는 만나.
   이미 가진 옷은 자동으로 도감에 들어가고, 모은 수마다 영구 효과 + 선물. 무기 이펙트·오라는 모양을 덮지 않음. */
var WIT = {}, WSETX = {}, WSLOTX = {};
(function wardIndex() {
  WSLOT.forEach(s => { WSLOTX[s.id] = s; });
  WSETS.forEach(s => { WSETX[s.id] = s; });
  WITEMS.forEach(it => { if (!it.g) it.g = it.set && WSETX[it.set] ? WSETX[it.set].g : 1; WIT[it.id] = it; });
  Object.keys(WHAIR).forEach(k => { HAIR[k] = WHAIR[k]; });
})();
var wardDirty = 1, wardStatC = null, wardCV = null, wardNewsCheck = true;
var WARD_FLAG = { sneaker: 1, vault: 1, badge2: 1, floor5: 1 };
var WFX_STYLE = { flame: "flame", volt: "spark", venom: "leaf", frost: "frost", crystal: "frost", sakura: "holy", blizzard: "frost", gold: "gold", moon: "cosmic", dragon: "flame", star: "cosmic", holy: "holy", spirit: "holy" };
var WFX_PAL = { flame: ["#ff7a1a", "#ffd54a"], volt: ["#5cc8ff", "#ffffff"], venom: ["#3fc04a", "#c8ff6a"], frost: ["#8ff0ff", "#ffffff"], crystal: ["#bfe4ff", "#ffffff"], sakura: ["#ff8fb0", "#ffe3ec"], blizzard: ["#a9dcff", "#ffffff"], gold: ["#ffc23b", "#fff6cf"], moon: ["#b18cff", "#fff7c2"], dragon: ["#c8202c", "#ff8a2a"], star: ["#ffe14a", "#ff9be0"], holy: ["#ffe27a", "#ffffff"], spirit: ["#ffffff", "#ffd54a"] };

/* ---------- 저장 ---------- */
function wardNew() { return { v: 1, own: {}, eq: {}, look: {}, seen: [], nv: [], coll: 0, ops: 0 }; }
function wardState() { if (!S.ward || typeof S.ward !== "object") S.ward = wardNew(); return S.ward; }
function wardMerge(w, d) {
  if (!w || typeof w !== "object" || w.v !== 1 || !w.own || typeof w.own !== "object") return wardFromOld(d || {});
  const o = wardNew();
  Object.keys(w.own).forEach(id => { const it = WIT[id]; if (!it) return; const e = Math.floor(+w.own[id] || 0); o.own[id] = it.slot === "title" ? 0 : Math.max(0, Math.min(WENH_MAX, e)); });
  WSLOT.forEach(s => {
    const e = w.eq && w.eq[s.id]; if (typeof e === "string" && o.own[e] != null && WIT[e].slot === s.id) o.eq[s.id] = e;
    const l = w.look && w.look[s.id]; if (l === "-") o.look[s.id] = "-"; else if (typeof l === "string" && o.own[l] != null && WIT[l].slot === s.id && l !== o.eq[s.id]) o.look[s.id] = l;
  });
  o.seen = Array.isArray(w.seen) ? w.seen.filter((x, i, a) => WIT[x] && a.indexOf(x) === i) : null;
  o.nv = Array.isArray(w.nv) ? w.nv.filter((x, i, a) => o.own[x] != null && a.indexOf(x) === i).slice(-40) : [];
  o.coll = Math.max(0, Math.min(WCOLL.length, Math.floor(+w.coll || 0)));
  o.ops = Math.max(0, Math.floor(+w.ops || 0));
  if (w.mig && typeof w.mig === "object") o.mig = { outfit: WSETX[w.mig.outfit] ? w.mig.outfit : "", wskin: WIT[w.mig.wskin] ? w.mig.wskin : "", look: w.mig.look && typeof w.mig.look === "object" ? w.mig.look : null };
  return o;
}
/* 예전 정장(S.cos)·오라·의상·무기 스킨 → 옷장. 예전 전설은 강화 단계 그대로(전설 +n → 고유 효과 n단계) */
function wardFromOld(d) {
  const w = wardNew(), cos = (d && d.cos) || {};
  WITEMS.forEach(it => {
    if (!it.old) return; const a = cos[it.old[0]]; if (!Array.isArray(a) || !a[it.old[1]]) return;
    w.own[it.id] = it.old[1] === 2 ? Math.max(0, Math.min(WENH_MAX, Math.floor(+a[2] || 1) - 1)) : 0;
  });
  const old = !!(d && (Object.keys(cos).length || Array.isArray(d.costSeen) || d.wskin || d.outfit || (+d.bestFloor || 0) > 1 || (d.bible && +d.bible.total)));
  if (old) { w.seen = null; w.mig = { outfit: WOLD_OUTFIT[d.outfit] || "", wskin: WOLD_SKIN[d.wskin] || "", look: d.look && typeof d.look === "object" ? Object.assign({}, d.look) : null }; }
  return w;
}

/* ---------- 열쇠(조건) ---------- */
function wardCondVal(k) {
  if (!wardCV) wardCV = {};
  if (k in wardCV) return wardCV[k];
  let v = 0;
  if (k === "floor") v = +S.bestFloor || 0;
  else if (k === "chap") v = (S.bible && +S.bible.total) || 0;
  else if (k === "study") v = (S.study && +S.study.total) || 0;
  else if (k === "sstreak") v = Math.max((S.study && +S.study.best) || 0, studyStreak());
  else if (k === "rstreak") v = Math.max((S.bible && +S.bible.best) || 0, readStreak());
  else if (k === "astreak") v = Math.max((S.att && +S.att.best) || 0, attStreak());
  else if (k === "mem") v = memMastered();
  else if (k === "memp") v = (S.mem && +S.mem.total) || 0;
  else if (k === "round") v = (S.bible && +S.bible.rounds) || 0;
  else if (k === "planfin") v = +S.planFin || 0;
  else if (k === "boss") v = +S.bossKills || 0;
  else if (k === "retire") v = +S.retires || 0;
  else if (k === "att") v = attTotal();
  else if (k === "rank") v = rankIdx();
  return (wardCV[k] = v);
}
function wardCondOk(it) { if (!it.cond) return false; const k = it.cond[0], v = it.cond[1]; if (k === "job") return (S.jobs || []).indexOf(v) >= 0; return wardCondVal(k) >= v; }
function wardCondProg(it) { if (!it.cond) return 0; const k = it.cond[0], v = it.cond[1]; if (k === "job") return wardCondOk(it) ? 1 : 0; return Math.max(0, Math.min(1, wardCondVal(k) / v)); }
function wardCondText(it) {
  const k = it.cond[0], v = it.cond[1], I = WCOND[k];
  if (k === "job") return `${I[1](v)} 배치 (인사 기록에서 직무 고르기)`;
  const cur = wardCondVal(k);
  return `${I[0]} ${I[1](v)} (지금 ${k === "study" || k === "rank" ? I[1](cur) : I[1](Math.floor(cur))})`;
}

/* ---------- 수치 ---------- */
function wardMul(g) { return (WGRADE[g] || WGRADE[1]).m; }
function wardEqVal(it, e) { const sl = WSLOTX[it.slot]; return sl && sl.k ? sl.base * wardMul(it.g) * (1 + 0.1 * e) : 0; }
function wardOwnVal(it, e) { return WOWN_BASE * wardMul(it.g) * (1 + 0.1 * e); }
function wardUqLv(e) { return Math.min(5, (e || 0) + 1); }
function wardUqFx(it, e) { return !it.uq ? null : typeof it.uq.fx === "function" ? it.uq.fx(wardUqLv(e)) : it.uq.fx; }
function wardUqText(it, e) { return !it.uq ? "" : typeof it.uq.d === "function" ? it.uq.d(wardUqLv(e)) : it.uq.d; }
function wardScale(fx, k) { const o = {}; for (const key in fx) { const v = fx[key]; o[key] = key[0] === "x" ? 1 + (v - 1) * k : key === "btime" || key === "jobcd" || WARD_FLAG[key] ? v : v * k; } return o; }
function wardSetPieces(set) { return WITEMS.filter(it => it.set === set.id); }
function wardSetSize(set) { return wardSetPieces(set).length; }
function wardSetN(set) {
  const W = wardState(); let n = 0;
  if (set.own) { for (const id in W.own) if (WIT[id] && WIT[id].set === set.id) n++; return n; }
  WSLOT.forEach(sl => { const id = W.eq[sl.id]; if (id && W.own[id] != null && WIT[id].set === set.id) n++; });
  return n;
}
function wardEnhCost(it, e) {
  if (it.g >= 5) return { manna: Math.round(30 * Math.pow(1.35, e)) };
  if (it.g === 4) return { ore: Math.ceil(1500 * Math.pow(1.6, e)), silver: 5 * (e + 1) };
  const base = [0, 40, 100, 250][it.g] || 40, c = { ore: Math.ceil(base * Math.pow(1.5, e)) };
  if (it.g === 3 && e >= 5) c.silver = e - 4;
  return c;
}
function wardStats() {
  const W = wardState();
  if (wardStatC && wardStatC.w === W && wardStatC.v === wardDirty) return wardStatC.s;
  const s = { dmg: 0, xdmg: 1, xaps: 1, xstamp: 1, crit: 0, critd: 0, aps: 0, gold: 0, boss: 0, wpn: 0, pet: 0, ore: 0, manna: 0, mem: 0, stamp: 0, btime: 0, jobcd: 0, sneaker: 0, vault: 0, badge2: 0, floor5: 0 };
  const add = fx => { if (!fx) return; for (const key in fx) { const v = fx[key]; if (key[0] === "x") s[key] = (s[key] || 1) * v; else if (WARD_FLAG[key]) s[key] = 1; else s[key] = (s[key] || 0) + v; } };
  for (const id in W.own) { const it = WIT[id]; if (!it) continue; const e = W.own[id] || 0; s.dmg += wardOwnVal(it, e); add(wardUqFx(it, e)); }
  WSLOT.forEach(sl => {
    const id = W.eq[sl.id]; if (!id || W.own[id] == null) return; const it = WIT[id], e = W.own[id] || 0;
    if (sl.k) s[sl.k] += wardEqVal(it, e);
    if (it.perk) add(wardScale(it.perk, 1 + 0.1 * e));
  });
  WSETS.forEach(set => { const n = wardSetN(set); Object.keys(set.bonus).forEach(t => { if (n >= +t) add(set.bonus[t]); }); });
  for (let i = 0; i < W.coll && i < WCOLL.length; i++) add(WCOLL[i].fx);
  s.jobcd = Math.min(60, s.jobcd);
  wardStatC = { w: W, v: wardDirty, s }; return s;
}
function wardNum(v) { const a = Math.abs(v); return a >= 100 ? Math.round(v).toLocaleString("ko-KR") : String(+v.toFixed(1)); }
function wardFxText(fx, sep) {
  const out = [];
  for (const key in fx) {
    const v = fx[key], N = WSTAT[key];
    if (key === "sneaker" || key === "vault" || key === "badge2" || key === "floor5" || !N) continue;
    if (key[0] === "x") out.push(`${N[0]} x${wardNum(v)}`);
    else if (key === "btime") out.push(`${N[0]} +${wardNum(v)}초`);
    else if (key === "jobcd") out.push(`${N[0]} −${wardNum(v)}%`);
    else out.push(`${N[0]} +${wardNum(v)}%`);
  }
  return out.join(sep || " · ");
}
function wardCount(pred) { const W = wardState(); let n = 0; for (const id in W.own) if (WIT[id] && (!pred || pred(WIT[id]))) n++; return n; }

/* ---------- 해금 · 도감 ---------- */
function wardTick(announce) {
  if (!S) return;
  const W = wardState(); wardCV = null;
  let fresh = 0;
  for (let i = 0; i < WITEMS.length; i++) {
    const it = WITEMS[i]; if (!it.cond || W.own[it.id] != null) continue;
    if (wardCondOk(it)) { W.own[it.id] = 0; fresh++; if (!W.eq[it.slot]) W.eq[it.slot] = it.id; if (W.seen) W.nv.push(it.id); }
  }
  if (fresh) { wardDirty++; wardNewsCheck = true; }
  if (!announce) return;
  if (W.seen == null) { wardMigrate(); return; }
  if (wardNewsCheck) {
    wardNewsCheck = false;
    const news = Object.keys(W.own).filter(id => W.seen.indexOf(id) < 0);
    news.forEach(id => W.seen.push(id));
    if (news.length > 2) {
      celebrateLater({ wid: news[0], title: `새 옷 ${news.length}벌 해금!`, sub: news.slice(0, 4).map(id => WIT[id].n).join(" · ") + (news.length > 4 ? ` 외 ${news.length - 4}벌` : "") + `<br><span class="muted">옷장에서 입어 보세요 · 가지고만 있어도 모든 피해 +</span>`, tone: "rare", sound: "pass", ms: 3000 });
    } else news.forEach(id => {
      const it = WIT[id], why = it.cond ? `${WCOND[it.cond[0]][0]} 달성` : "";
      const t = it.slot === "title" ? "칭호 획득!" : it.slot === "aura" ? "새 오라 해금!" : it.slot === "wfx" ? "무기 이펙트 해금!" : "새 옷 해금!";
      celebrateLater({ wid: id, title: t, sub: `${it.n} · ${WGRADE[it.g].n}<br><span class="muted">${why}${it.set && WSETX[it.set] ? ` · ${WSETX[it.set].n} ${wardCount(x => x.set === it.set)}/${wardSetSize(WSETX[it.set])}` : ""} · 옷장에서 입어 보세요</span>`, tone: it.g >= 4 ? "rare" : "ore", sound: "pass", ms: 2800 });
    });
  }
  wardCollTick(true);
}
function wardCollTick(announce) {
  const W = wardState(), n = wardCount();
  while (W.coll < WCOLL.length && n >= WCOLL[W.coll].n) {
    const m = WCOLL[W.coll]; W.coll++; wardDirty++;
    Object.keys(m.rw).forEach(k => { S[k] = (+S[k] || 0) + m.rw[k]; });
    if (announce) celebrateLater({ ic: "suit", title: `옷장 도감 ${m.n}벌!`, sub: `${wardFxText(m.fx)} (영구)<br><span class="rws">${rwHTML(m.rw)}</span>`, tone: "ore", sound: "pass", ms: 2800 });
  }
}
/* 예전 저장에서 처음 열 때: 이미 열린 옷은 조용히 받고, 가장 좋은 옷을 입히고, 예전 겉모습을 덧입기로 지킴 */
function wardMigrate() {
  const W = wardState(), mig = W.mig || {};
  W.seen = Object.keys(W.own); W.nv = [];
  wardAutoBest(mig.wskin);
  if (mig.look) Object.keys(mig.look).forEach(o => {
    const sl = WOLD_SLOT[o], idx = +mig.look[o]; if (!sl || !(idx >= 0)) return;
    const it = WITEMS.find(x => x.old && x.old[0] === o && x.old[1] === idx);
    if (it && W.own[it.id] != null && W.eq[sl] !== it.id) W.look[sl] = it.id;
  });
  if (mig.outfit) wardSetPieces(WSETX[mig.outfit]).forEach(it => { if (W.own[it.id] != null) W.look[it.slot] = W.eq[it.slot] === it.id ? "" : it.id; });
  if (mig.wskin && W.own[mig.wskin] != null) W.look.wfx = W.eq.wfx === mig.wskin ? "" : mig.wskin;
  Object.keys(W.look).forEach(k => { if (!W.look[k]) delete W.look[k]; });
  delete W.mig; wardDirty++;
  const n = wardCount();
  celebrateLater({ ic: "suit", title: "옷장이 새로 열렸어요", sub: `정장·코스튬·무기 스킨이 옷장 하나로 합쳐졌어요 · 지금 ${n}벌<br><span class="muted">모든 옷에 능력치 · 세트 효과 · 겉모습은 덧입기로 따로</span>`, tone: "rare", sound: "pass", ms: 3600 });
  wardCollTick(true);
}

/* ---------- 입기 · 사기 · 강화 ---------- */
function wardScore() { const st = stats(); return st.dps * Math.sqrt(st.bossBonus) * Math.pow(goldMult(), 0.25); }
function wardTryEq(eq) { const W = wardState(), keep = W.eq; W.eq = eq; wardDirty++; const v = wardScore(); W.eq = keep; wardDirty++; return v; }
function wardAutoBest(prefer) {
  const W = wardState(), owned = Object.keys(W.own).map(id => WIT[id]).filter(Boolean);
  const pick = (slot, base) => {
    const c = owned.filter(it => it.slot === slot); if (!c.length) return base[slot] || "";
    let best = null, bv = -1;
    c.forEach(it => { const v = wardMul(it.g) * (1 + 0.1 * (W.own[it.id] || 0)) + (it.id === prefer ? 0.001 : 0) + 0.01 * wardCount(x => x.set && x.set === it.set); if (v > bv) { bv = v; best = it; } });
    return best.id;
  };
  const base = {}; WBODY.forEach(sl => { const id = pick(sl, W.eq); if (id) base[sl] = id; });
  ["aura", "wfx", "title"].forEach(sl => { const id = pick(sl, W.eq); if (id) base[sl] = id; });
  let best = Object.assign({}, base), bv = wardTryEq(best);
  WSETS.forEach(set => {
    if (set.own) return;
    const pcs = wardSetPieces(set).filter(it => W.own[it.id] != null); if (pcs.length < 2) return;
    const cand = Object.assign({}, best); pcs.forEach(it => { cand[it.slot] = it.id; });
    const v = wardTryEq(cand); if (v > bv * 1.0001) { bv = v; best = cand; }
  });
  ["aura", "wfx", "title"].forEach(sl => {
    owned.filter(it => it.slot === sl).forEach(it => { if (best[sl] === it.id) return; const cand = Object.assign({}, best, { [sl]: it.id }), v = wardTryEq(cand); if (v > bv * 1.0001) { bv = v; best = cand; } });
  });
  W.eq = best; Object.keys(W.look).forEach(k => { if (W.look[k] === W.eq[k]) delete W.look[k]; });
  wardDirty++;
}
function wardBuy(id) {
  const it = WIT[id], W = wardState(); if (!it || !it.cost || W.own[id] != null) return false;
  const need = it.cost.ore || 0; if ((S.ore || 0) < need) { toast(`광석이 ${fmtR(need - (S.ore || 0))} 모자라요 · 공부 탭 타이머로 광산을 파요`); return false; }
  S.ore -= need; W.own[id] = 0; W.ops++; if (W.seen && W.seen.indexOf(id) < 0) W.seen.push(id);
  const cur = W.eq[it.slot] && WIT[W.eq[it.slot]];
  if (!cur || it.g > cur.g) W.eq[it.slot] = id;
  wardDirty++;
  celebrate({ icon: wardBig(id, 92), title: it.g >= 4 ? "전설 옷 구매!" : "새 옷!", sub: `${it.n} · ${WGRADE[it.g].n}<br><span class="muted">${W.eq[it.slot] === id ? "바로 입었어요" : "옷장에서 입을 수 있어요"} · 가지고만 있어도 모든 피해 +${wardNum(wardOwnVal(it, 0))}%</span>`, tone: it.g >= 4 ? "rare" : "ore" });
  wardCollTick(true);
  return true;
}
function wardEquip(id) {
  const it = WIT[id], W = wardState(); if (!it || W.own[id] == null) return;
  W.eq[it.slot] = id; if (W.look[it.slot] === id) delete W.look[it.slot]; wardDirty++;
  toast(`${hbJosa(it.n, "을", "를")} 입었어요 · ${WSLOTX[it.slot].k ? "입으면 " + wardFxText({ [WSLOTX[it.slot].k]: wardEqVal(it, W.own[id]) }) : wardFxText(it.perk || {})}`);
}
function wardSetLook(slot, v) {
  const W = wardState();
  if (v === "-" || v === "") { if (v === "-") W.look[slot] = "-"; else delete W.look[slot]; }
  else { const it = WIT[v]; if (!it || it.slot !== slot || W.own[v] == null) return; if (W.eq[slot] === v) delete W.look[slot]; else W.look[slot] = v; }
  wardDirty++;
}
function wardEnh(id) {
  const it = WIT[id], W = wardState(); if (!it || W.own[id] == null || it.slot === "title") return false;
  const e = W.own[id]; if (e >= WENH_MAX) return false;
  const c = wardEnhCost(it, e);
  for (const k in c) if ((+S[k] || 0) < c[k]) { toast(`${ECO_NAME[k] || k} ${fmtR(c[k] - (+S[k] || 0))} 모자라요`); return false; }
  for (const k in c) S[k] -= c[k];
  W.own[id] = e + 1; W.ops++; wardDirty++;
  if (e + 1 >= WENH_MAX) celebrate({ icon: wardBig(id, 92), title: "옷 강화 MAX!", sub: `${it.n} +${WENH_MAX}`, tone: "rare" });
  return true;
}
function wardWearSet(setId, mode) {
  const set = WSETX[setId], W = wardState(); if (!set) return;
  const pcs = wardSetPieces(set).filter(it => W.own[it.id] != null); if (!pcs.length) { toast("아직 이 세트 옷이 없어요"); return; }
  pcs.forEach(it => { if (mode === "look") wardSetLook(it.slot, it.id); else { W.eq[it.slot] = it.id; if (W.look[it.slot] === it.id) delete W.look[it.slot]; } });
  wardDirty++;
  toast(mode === "look" ? `${set.n} ${pcs.length}벌을 덧입었어요 · 능력치는 그대로` : `${set.n} ${pcs.length}벌을 입었어요`);
}

/* ---------- 겉모습 ---------- */
function wardShown(slot) {
  const W = wardState(), l = W.look[slot];
  if (l === "-") return null;
  if (l && W.own[l] != null && WIT[l]) return WIT[l];
  const e = W.eq[slot]; return e && W.own[e] != null ? WIT[e] : null;
}
var WL_POOL = "0123456789!#$%&*+-/:;<=>?@^_~ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ", WL_ORDER = ["top", "tie", "arm", "shoes", "head", "prop"];
/* 몸 그림 + 부위 옷 덧그림 (아이템 전용 색 글자는 겹치지 않게 새 글자로 바꿔 씀) */
function wardCompose(c, sh) {
  const pal = Object.assign({}, PAL.hero, c.pal); let hair = c.hair, top = 0;
  const use = WL_ORDER.map(sl => sh[sl]).filter(it => it && it.look && !(it.look.keep && c.id !== "choi"));
  use.forEach(it => { const L = it.look; if (L.pal) Object.assign(pal, L.pal); if (L.hair) hair = L.hair; [L.f, L.b].forEach(m => { if (m) Object.keys(m).forEach(y => { if (+y < 0) top = 3; }); }); });
  if (hair === "bald") pal.e = pal.e || "#ffd54a";
  const rows = []; for (let y = 0; y < top; y++) rows.push(".".repeat(18).split(""));
  heroMap(hair).forEach(r => rows.push(r.split("")));
  let pi = 0; const remap = use.map(it => { const m = {}; Object.keys(it.look.c || {}).forEach(ch => { const nc = WL_POOL[pi++ % WL_POOL.length]; m[ch] = nc; pal[nc] = it.look.c[ch]; }); return m; });
  ["b", "f"].forEach(layer => use.forEach((it, j) => {
    const m = it.look[layer]; if (!m) return;
    Object.keys(m).forEach(yk => {
      const y = +yk + top, src = m[yk]; if (y < 0 || y >= rows.length) return;
      for (let x = 0; x < 18 && x < src.length; x++) { const ch = src[x]; if (ch === ".") continue; const out = remap[j][ch] || ch; if (layer === "b") { if (rows[y][x] === ".") rows[y][x] = out; } else rows[y][x] = out; }
    });
  }));
  return { map: rows.map(r => r.join("")), pal: heroPal(pal), hair, top };
}
var wardLookCache = new Map();
function wardLookWith(c, sh) {
  const key = c.id + "|" + WSLOT.map(s => sh[s.id] ? sh[s.id].id : "").join(",");
  let v = wardLookCache.get(key);
  if (!v) {
    v = wardCompose(c, sh); v.aura = sh.aura ? sh.aura.aura : null; v.wfx = sh.wfx ? sh.wfx.fx : ""; v.title = sh.title || null;
    if (wardLookCache.size > 24) wardLookCache.clear();
    wardLookCache.set(key, v);
  }
  return v;
}
function wardLook(c) { const sh = {}; WSLOT.forEach(s => { sh[s.id] = wardShown(s.id); }); return wardLookWith(c, sh); }
function heroLookFor(c) { return wardLook(c); }
function heroLook() { return wardLook(curChar()); }
function wardWfxShown() { const it = wardShown("wfx"); return it ? it.fx : ""; }
function curFx() { const fx = wardWfxShown(); return fx ? WFX_STYLE[fx] || "steel" : WEAPONS[skinIdx()].fx; }

/* ---------- 오라 그리기 (곽준영 뒤, 몸 가운데 cx·cy, s = 그림 한 칸 크기) ---------- */
function wardRnd(i) { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }
function wardPlus(g, x, y, s, col, a) { g.fillStyle = hexA(col, Math.min(1, a * (g.__gain || 1))); g.fillRect(x - s / 2, y - s * 1.5, s, s * 3); g.fillRect(x - s * 1.5, y - s / 2, s * 3, s); }
function drawWardAura(g, au, cx, cy, s, t, still, gain) {
  if (!au || !g || !g.createRadialGradient) return;
  const tt = still ? 0 : t, c1 = au.c1, c2 = au.c2 || au.c1, ga = gain || 1, gp = g.__gain;
  g.save(); g.globalCompositeOperation = "lighter"; g.__gain = ga;
  const hA = (c, a) => hexA(c, Math.min(1, a * ga));
  const a0 = still ? 0.3 : 0.24 + Math.sin(tt / 260) * 0.06, R = 22 * s;
  const gr = g.createRadialGradient(cx, cy, 2, cx, cy, R); gr.addColorStop(0, hA(c1, a0)); gr.addColorStop(1, hA(c1, 0));
  g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2);
  const k = au.k;
  if (k === "flame") {
    for (let i = 0; i < 18; i++) {
      const life = still ? wardRnd(i) : (tt / 820 + i / 18) % 1, side = i % 2 ? 1 : -1, w0 = 7 + 4 * wardRnd(i + 40);
      const x = cx + side * w0 * s * (1 - 0.45 * life) + (still ? 0 : Math.sin(tt / 210 + i) * 0.8 * s), y = cy + 11 * s - life * 25 * s, z = s * (2.4 - 1.7 * life);
      g.fillStyle = hA(life < 0.4 ? c2 : c1, (1 - life) * 0.85); g.fillRect(x - z / 2, y - z / 2, z, z);
    }
    if (au.ember) for (let i = 0; i < 6; i++) { const life = still ? wardRnd(i + 20) : (tt / 1100 + i / 6) % 1; g.fillStyle = hA("#ff9b3d", 1 - life); g.fillRect(cx + (wardRnd(i + 9) - 0.5) * 22 * s, cy + 10 * s - life * 26 * s, s, s); }
  } else if (k === "pillar") {
    const top = cy - 24 * s, bot = cy + 13 * s, lg = g.createLinearGradient(0, bot, 0, top);
    lg.addColorStop(0, hA(c1, still ? 0.34 : 0.28 + Math.sin(tt / 400) * 0.06)); lg.addColorStop(1, hA(c1, 0));
    g.fillStyle = lg; g.fillRect(cx - 6 * s, top, 12 * s, bot - top);
    g.fillStyle = hA(c2, 0.25); g.fillRect(cx - 1.5 * s, top, 3 * s, bot - top);
    for (let i = 0; i < 8; i++) { const life = still ? wardRnd(i) : (tt / 1300 + i / 8) % 1; g.fillStyle = hA(c2, (1 - life) * 0.9); g.fillRect(cx + (wardRnd(i + 3) - 0.5) * 11 * s, bot - life * (bot - top), s, s); }
  } else if (k === "orbit") {
    for (let i = 0; i < 7; i++) { const an = (still ? 0 : tt / 900) + i * 0.9; wardPlus(g, cx + Math.cos(an) * 13 * s, cy + 2 * s + Math.sin(an) * 3.5 * s, s * 0.7, i % 2 ? c1 : c2, 0.9); }
    for (let i = 0; i < 4; i++) { const an = -(still ? 0 : tt / 1300) + i * 1.57; wardPlus(g, cx + Math.cos(an) * 8 * s, cy - 11 * s + Math.sin(an) * 2 * s, s * 0.5, c2, 0.8); }
  } else if (k === "rays") {
    const L = 27 * s, rg = g.createRadialGradient(cx, cy - 2 * s, 3 * s, cx, cy - 2 * s, L); rg.addColorStop(0, hA(c2, 0.42)); rg.addColorStop(0.5, hA(c1, 0.18)); rg.addColorStop(1, hA(c1, 0)); g.fillStyle = rg;
    for (let i = 0; i < 9; i++) { const an = (still ? 0 : tt / 4000) + i * 0.698; g.beginPath(); g.moveTo(cx, cy - 2 * s); g.lineTo(cx + Math.cos(an - 0.07) * L, cy - 2 * s + Math.sin(an - 0.07) * L); g.lineTo(cx + Math.cos(an + 0.07) * L, cy - 2 * s + Math.sin(an + 0.07) * L); g.closePath(); g.fill(); }
    const g2 = g.createRadialGradient(cx, cy - 2 * s, 1, cx, cy - 2 * s, 9 * s); g2.addColorStop(0, hA(c2, 0.5)); g2.addColorStop(1, hA(c2, 0)); g.fillStyle = g2; g.fillRect(cx - 9 * s, cy - 11 * s, 18 * s, 18 * s);
  } else if (k === "embers") {
    const g2 = g.createRadialGradient(cx, cy + 12 * s, 1, cx, cy + 12 * s, 14 * s); g2.addColorStop(0, hA(c1, 0.32)); g2.addColorStop(1, hA(c1, 0)); g.fillStyle = g2; g.fillRect(cx - 14 * s, cy + 6 * s, 28 * s, 12 * s);
    for (let i = 0; i < 11; i++) { const life = still ? wardRnd(i) : (tt / 1200 + i / 11) % 1; const x = cx + (wardRnd(i + 5) - 0.5) * 24 * s + Math.sin(tt / 300 + i) * 1.5 * s; g.fillStyle = hA(i % 2 ? c1 : c2, 1 - life); g.fillRect(x, cy + 12 * s - life * 28 * s, s, s); }
  } else if (k === "wind") {
    g.lineWidth = Math.max(1, s * 0.7);
    for (let j = 0; j < 3; j++) {
      const a0 = (still ? 0 : tt / 520) + j * 2.1, yc = cy + (j - 1) * 8 * s; g.strokeStyle = hA(j === 1 ? c1 : c2, 0.55); g.beginPath();
      for (let q = 0; q <= 8; q++) { const an = a0 + q * 0.2, x = cx + Math.cos(an) * 12 * s, y = yc + Math.sin(an) * 4 * s; if (q) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
  } else if (k === "sparkle") {
    for (let i = 0; i < 9; i++) { const on = still ? 0.8 : (Math.sin(tt / 300 + i * 1.7) + 1) / 2, an = i * 0.7 + 0.3, r = (8 + wardRnd(i) * 7) * s; wardPlus(g, cx + Math.cos(an) * r, cy + Math.sin(an) * r * 1.1, s * (0.35 + on * 0.6), i % 2 ? c1 : c2, 0.4 + on * 0.6); }
  }
  g.__gain = gp; g.restore();
}

/* ---------- 무기 이펙트 그리기 (무기 쥔 손이 0,0, 칼날은 위쪽 -2 ~ -15칸) ---------- */
function drawWfxBack(g, fx, sc, t, still, gain) {
  if (!g || !g.createRadialGradient) return;
  const ga = gain || 1;
  const P = WFX_PAL[fx] || ["#ffffff", "#ffffff"], big = fx === "dragon" || fx === "holy" || fx === "spirit";
  g.save(); g.globalCompositeOperation = "lighter";
  const pulse = (still ? 0.3 : 0.26 + Math.sin(t / 260) * 0.08) * ga, cy = -9 * sc, r = (big ? 15 : 12) * sc;
  const gr = g.createRadialGradient(0, cy, 1, 0, cy, r); gr.addColorStop(0, hexA(P[0], Math.min(0.9, pulse + (big ? 0.08 : 0)))); gr.addColorStop(1, hexA(P[0], 0));
  g.fillStyle = gr; g.fillRect(-r, cy - r, r * 2, r * 2);
  if (fx === "holy" || fx === "spirit") {
    g.fillStyle = hexA(P[1], fx === "spirit" ? 0.3 : 0.24);
    for (let i = 0; i < 6; i++) { const an = (still ? 0 : t / 2600) + i * 1.047, L = (11 + (i % 2) * 4) * sc; g.beginPath(); g.moveTo(0, cy); g.lineTo(Math.cos(an - 0.08) * L, cy + Math.sin(an - 0.08) * L); g.lineTo(Math.cos(an + 0.08) * L, cy + Math.sin(an + 0.08) * L); g.closePath(); g.fill(); }
  }
  g.restore();
}
function drawWfxFront(g, fx, sc, t, still, gain) {
  if (!g) return;
  const P = WFX_PAL[fx] || ["#ffffff", "#ffffff"], R = wardRnd, ga = gain || 1, zk = 0.6 + 0.4 * ga, gp = g.__gain;
  const box = (x, y, w, h, col, a) => { g.fillStyle = hexA(col, Math.min(1, a * ga)); g.fillRect(x - w * (zk - 1) / 2, y - h * (zk - 1) / 2, w * zk, h * zk); };
  g.save(); g.__gain = ga; if (fx !== "venom" && fx !== "sakura") g.globalCompositeOperation = "lighter";
  if (fx === "flame" || fx === "dragon" || fx === "spirit") {
    const n = fx === "dragon" ? 14 : 13, cols = fx === "dragon" ? ["#ffb35a", "#ff5a1a", "#7a0c14"] : fx === "spirit" ? ["#ffffff", "#fff2b8", "#ffd54a"] : ["#fff3b0", "#ffb13b", "#ff5a1a"];
    for (let i = 0; i < n; i++) {
      const life = still ? R(i) : (t / (fx === "dragon" ? 460 : 540) + i / n) % 1, side = i % 2 ? 1 : -1;
      const x = side * (1.1 + 1.9 * R(i + 1)) * sc * (1 - 0.3 * life) + (still ? 0 : Math.sin(t / 170 + i) * 0.6 * sc), y = (-2 - 13 * R(i + 3)) * sc - life * (fx === "dragon" ? 8 : 6) * sc, z = sc * ((fx === "dragon" ? 2.2 : 1.8) - 1.2 * life);
      box(x - z / 2, y - z / 2, z, z, life < 0.35 ? cols[0] : life < 0.7 ? cols[1] : cols[2], 1 - life);
    }
    if (fx === "spirit") for (let i = 0; i < 4; i++) { const life = still ? R(i + 30) : (t / 1300 + i / 4) % 1; wardPlus(g, (R(i + 11) - 0.5) * 8 * sc, -4 * sc - life * 16 * sc, sc * 0.45, "#ffd54a", 1 - life); }
  } else if (fx === "volt") {
    const seed = still ? 3 : Math.floor(t / 80); g.lineWidth = Math.max(1, sc * 0.45);
    for (let k = 0; k < 2; k++) {
      let x = 0, y = -(3 + 11 * R(seed * 3 + k)) * sc; const dir = R(seed + k * 7) < 0.5 ? -1 : 1;
      g.strokeStyle = hexA(k ? "#ffffff" : P[0], 0.9); g.beginPath(); g.moveTo(x, y);
      for (let q = 0; q < 4; q++) { x += dir * (0.9 + R(seed + q + k * 5) * 1.2) * sc; y += (R(seed * 2 + q + k) - 0.5) * 3 * sc; g.lineTo(x, y); }
      g.stroke(); box(x - sc / 2, y - sc / 2, sc, sc, "#ffffff", 0.9);
    }
  } else if (fx === "venom") {
    for (let i = 0; i < 5; i++) { const life = still ? R(i) * 0.6 : (t / 950 + i / 5) % 1, x = (R(i) - 0.5) * 3 * sc, y0 = -(4 + 10 * R(i + 7)) * sc; box(x - sc / 2, y0 + life * life * 15 * sc, sc, sc * (1 + life), life < 0.5 ? P[1] : P[0], 1 - life); }
    for (let i = 0; i < 4; i++) { const on = still ? 0.8 : (Math.sin(t / 240 + i * 1.9) + 1) / 2; box((R(i + 20) - 0.5) * 4 * sc, -(3 + 12 * R(i + 21)) * sc, sc * 0.8, sc * 0.8, P[1], 0.3 + on * 0.6); }
  } else if (fx === "frost" || fx === "blizzard") {
    const n = fx === "blizzard" ? 10 : 6, sp = fx === "blizzard" ? 700 : 950;
    for (let i = 0; i < n; i++) {
      const an = (still ? 0 : t / sp) + i * (6.283 / n), x = Math.cos(an) * (fx === "blizzard" ? 5 : 3.5) * sc, y = -9 * sc + Math.sin(an) * (fx === "blizzard" ? 7.5 : 6) * sc, z = sc * (fx === "blizzard" ? 0.8 : 1);
      if (fx === "blizzard") box(x - z / 2, y - z / 2, z, z, "#ffffff", Math.sin(an) > 0 ? 0.95 : 0.45);
      else { box(x - z / 2, y - z * 1.5, z, z * 3, "#e6f6ff", 0.85); box(x - z * 1.5, y - z / 2, z * 3, z, "#8ff0ff", 0.6); }
    }
    for (let i = 0; i < 4; i++) { const life = still ? R(i) : (t / 1600 + i / 4) % 1; box((R(i + 4) - 0.5) * 6 * sc, -12 * sc + life * 14 * sc, sc * 0.7, sc * 0.7, "#ffffff", (1 - life) * 0.7); }
  } else if (fx === "crystal") {
    for (let i = 0; i < 7; i++) { const on = still ? 0.8 : (Math.sin(t / 260 + i * 1.3) + 1) / 2; const col = `hsl(${Math.round((i * 52 + (still ? 0 : t / 12)) % 360)},90%,76%)`; g.fillStyle = col; g.globalAlpha = Math.min(1, (0.35 + on * 0.65) * ga); const x = (R(i) - 0.5) * 6 * sc, y = -(2 + 13 * R(i + 2)) * sc, z = sc * (0.4 + on * 0.7); g.fillRect(x - z / 2, y - z * 1.5, z, z * 3); g.fillRect(x - z * 1.5, y - z / 2, z * 3, z); g.globalAlpha = 1; }
  } else if (fx === "sakura") {
    for (let i = 0; i < 7; i++) { const life = still ? R(i) : (t / 1500 + i / 7) % 1, dir = i % 2 ? 1 : -1; const x = (R(i) - 0.5) * 2 * sc + dir * life * 7 * sc + (still ? 0 : Math.sin(t / 300 + i) * sc), y = -(3 + 11 * R(i + 4)) * sc + life * 7 * sc; box(x, y, sc * 1.4, sc * 0.8, i % 3 ? P[0] : P[1], 1 - life); }
  } else if (fx === "gold") {
    const p = still ? 0.4 : (t % 1700) / 1700, yb = -(1 + p * 15) * sc; box(-2 * sc, yb, 4 * sc, sc, "#fff6cf", p < 0.85 ? 0.85 : (1 - p) * 5);
    for (let i = 0; i < 3; i++) { const on = still ? 0.7 : (Math.sin(t / 330 + i * 2.1) + 1) / 2; wardPlus(g, (R(i + 2) - 0.5) * 5 * sc, -(3 + 11 * R(i + 6)) * sc, sc * (0.3 + on * 0.5), "#ffd54a", on); }
  } else if (fx === "moon") {
    for (let k = 0; k < 2; k++) {
      const an = (still ? 0.6 : t / 800) + k * Math.PI, x = Math.cos(an) * 4.5 * sc, y = -9 * sc + Math.sin(an) * 6.5 * sc, z = sc * 0.8;
      box(x, y - z * 2, z, z * 4, P[1], 0.95); box(x - z, y - z * 2.6, z, z, P[1], 0.95); box(x - z, y + z * 1.6, z, z, P[1], 0.95); box(x + z, y - z, z * 0.6, z * 2, P[0], 0.6);
    }
    for (let i = 0; i < 4; i++) { const on = still ? 0.6 : (Math.sin(t / 280 + i * 1.6) + 1) / 2; box((R(i + 8) - 0.5) * 7 * sc, -(2 + 13 * R(i + 9)) * sc, sc * 0.6, sc * 0.6, P[0], on); }
  } else if (fx === "star") {
    for (let i = 0; i < 5; i++) { const an = (still ? 0 : t / 900) + i * 1.257, on = still ? 0.8 : (Math.sin(t / 220 + i * 2) + 1) / 2; wardPlus(g, Math.cos(an) * 5 * sc, -9 * sc + Math.sin(an) * 7 * sc, sc * (0.4 + on * 0.5), i % 2 ? P[0] : P[1], 0.6 + on * 0.4); }
  } else if (fx === "holy") {
    for (let i = 0; i < 6; i++) { const life = still ? R(i) : (t / 1400 + i / 6) % 1; box((R(i + 1) - 0.5) * 5 * sc, -(2 + 12 * R(i + 5)) * sc - life * 6 * sc, sc * 0.8, sc * 0.8, "#ffffff", (1 - life) * 0.9); }
  }
  g.__gain = gp; g.restore();
}
function drawHeldWeapon(ctx, px, py, angle, sc, t, still, gain) {
  const fx = wardWfxShown(), wi = skinIdx();
  if (fx) { ctx.save(); ctx.translate(px, py); ctx.rotate(angle); drawWfxBack(ctx, fx, sc, t, still, gain); ctx.restore(); }
  drawWeapon(ctx, wi, wi === S.wi ? S.wl : 5, px, py, angle, sc, t, still);
  if (fx && !(still && t)) { ctx.save(); ctx.translate(px, py); ctx.rotate(angle); drawWfxFront(ctx, fx, sc, t, still, gain); ctx.restore(); }
}
/* 칭호 명패 */
function drawWardTitle(g, it, cx, y, k) {
  if (!it || !g || !g.fillText) return;
  k = k || 1; const col = WGRADE[it.g].c, txt = it.n;
  g.save(); g.font = `${Math.round(12 * k)}px "Do Hyeon", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  const w = (g.measureText ? g.measureText(txt).width : txt.length * 11 * k) + 14 * k, h = 17 * k;
  g.fillStyle = "rgba(10,14,26,.86)"; g.fillRect(cx - w / 2, y, w, h);
  g.fillStyle = col; g.fillRect(cx - w / 2, y, w, Math.max(1, k)); g.fillRect(cx - w / 2, y + h - Math.max(1, k), w, Math.max(1, k)); g.fillRect(cx - w / 2, y, Math.max(1, k), h); g.fillRect(cx + w / 2 - Math.max(1, k), y, Math.max(1, k), h);
  g.fillStyle = col; g.fillText(txt, cx, y + h / 2 + 0.5 * k);
  g.restore();
}

/* ---------- 아이콘 ---------- */
var wardIconCache = new Map(), WARD_CROP = { head: [-3, 12], top: [6, 22], tie: [7, 20], arm: [8, 21], shoes: [13, 24] };
function wardSceneCanvas(size, sh, opt) {
  opt = opt || {};
  const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext && c.getContext("2d"); if (!g) return c;
  g.imageSmoothingEnabled = false;
  const ch = opt.char || CHARS[0], lk = wardLookWith(ch, sh), top = lk.top || 0, cr = opt.crop || [-top, 24], rows = cr[1] - cr[0], u = Math.max(1, Math.floor(size * (opt.zoom || 0.84) / rows));
  const x0 = Math.round(size / 2 - 9 * u - (opt.weapon ? 3 * u : 0)), y0 = Math.round((size - rows * u) / 2) - cr[0] * u;
  if (opt.aura && lk.aura) drawWardAura(g, lk.aura, x0 + 10 * u, y0 + 13 * u, u, 0, true);
  if (opt.dim) { g.globalAlpha = 0.55; drawSprite(g, lk.map, lk.pal, x0, y0 - (lk.top || 0) * u, u, { pretty: true, solid: "#1a2240" }); g.globalAlpha = 1; }
  else drawSprite(g, lk.map, lk.pal, x0, y0 - (lk.top || 0) * u, u, { pretty: true });
  if (opt.weapon) {
    const fx = sh.wfx ? sh.wfx.fx : "", px = x0 + 15.5 * u, py = y0 + 16 * u, ang = 0.35, ws = u * 1.25, wi = skinIdx();
    if (fx) { g.save(); g.translate(px, py); g.rotate(ang); drawWfxBack(g, fx, ws, 0, true); g.restore(); }
    drawWeapon(g, wi, wi === S.wi ? S.wl : 5, px, py, ang, ws, 0, true);
    if (fx) { g.save(); g.translate(px, py); g.rotate(ang); drawWfxFront(g, fx, ws, 0, true); g.restore(); }
  }
  return c;
}
function wardItemCanvas(it, size) {
  const sh = {}, slot = it.slot;
  if (slot === "aura") { sh.aura = it; return wardSceneCanvas(size, sh, { aura: true, zoom: 0.62 }); }
  if (slot === "wfx") { sh.wfx = it; return wardWeaponCanvas(it, size); }
  if (slot === "title") return wardTitleCanvas(it, size);
  sh[slot] = it; return wardSceneCanvas(size, sh, { zoom: 0.92, crop: WARD_CROP[slot] && !(slot === "prop") ? WARD_CROP[slot] : null });
}
function wardWeaponCanvas(it, size) {
  const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext && c.getContext("2d"); if (!g) return c;
  g.imageSmoothingEnabled = false; const sc = size / 22, wi = skinIdx(), px = size * 0.36, py = size * 0.84, ang = 0.62;
  g.save(); g.translate(px, py); g.rotate(ang); drawWfxBack(g, it.fx, sc, 0, true); g.restore();
  drawWeapon(g, wi, wi === S.wi ? S.wl : 5, px, py, ang, sc, 0, true);
  g.save(); g.translate(px, py); g.rotate(ang); drawWfxFront(g, it.fx, sc, 0, true); g.restore();
  return c;
}
function wardTitleCanvas(it, size) {
  const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext && c.getContext("2d"); if (!g) return c;
  const col = WGRADE[it.g].c, u = size / 20;
  g.fillStyle = "#140f1c"; g.fillRect(2 * u, 4 * u, 16 * u, 12 * u);
  g.fillStyle = col; g.fillRect(3 * u, 5 * u, 14 * u, 10 * u);
  g.fillStyle = shade(col, -0.35); g.fillRect(3 * u, 13 * u, 14 * u, 2 * u); g.fillRect(1 * u, 7 * u, 2 * u, 6 * u); g.fillRect(17 * u, 7 * u, 2 * u, 6 * u);
  g.fillStyle = "#fff8e0"; g.fillRect(5 * u, 7 * u, 10 * u, 1.4 * u); g.fillRect(6 * u, 10 * u, 8 * u, 1.2 * u);
  return c;
}
function wardIconURL(it) {
  const key = it.id + (it.slot === "wfx" ? "|" + skinIdx() + "|" + (S.wi === skinIdx() ? S.wl : 5) : "");
  if (wardIconCache.has(key)) return wardIconCache.get(key);
  let url = "";
  try { const c = wardItemCanvas(it, 80); url = c.toDataURL ? c.toDataURL("image/png") : ""; } catch (e) {}
  if (wardIconCache.size > 400) wardIconCache.clear();
  wardIconCache.set(key, url); return url;
}
function wardSetURL(set) {
  const key = "set|" + set.id; if (wardIconCache.has(key)) return wardIconCache.get(key);
  let url = "";
  try { const sh = {}; wardSetPieces(set).forEach(it => { if (WBODY.indexOf(it.slot) >= 0 || it.slot === "aura") sh[it.slot] = it; }); const c = wardSceneCanvas(80, sh, { aura: !!sh.aura }); url = c.toDataURL ? c.toDataURL("image/png") : ""; } catch (e) {}
  wardIconCache.set(key, url); return url;
}
function wardBig(id, css) {
  const it = WIT[id]; if (!it) return pixIcon("suit", css || 76);
  const d = uiDpr(), size = Math.round((css || 76) * d);
  let c;
  if (it.slot === "wfx") c = wardWeaponCanvas(it, size);
  else if (it.slot === "title") c = wardTitleCanvas(it, size);
  else { const sh = {}; WSLOT.forEach(s => { sh[s.id] = wardShown(s.id); }); sh[it.slot] = it; c = wardSceneCanvas(size, sh, { aura: it.slot === "aura", char: curChar(), zoom: it.slot === "aura" ? 0.62 : 0.84 }); }
  c.className = "pix"; if (c.style) c.style.width = c.style.height = (css || 76) + "px";
  return c;
}
function wardPreview(id) {
  const it = WIT[id]; if (!it) return;
  const own = wardState().own[id] != null;
  celebrate({ icon: wardBig(id, 120), title: `미리 입기 · ${it.n}`, sub: `${WGRADE[it.g].n}${it.set && WSETX[it.set] ? " · " + WSETX[it.set].n : ""}<br><span class="muted">${own ? "가지고 있어요" : it.cost ? `광석 ${fmtR(it.cost.ore)}으로 살 수 있어요` : "열쇠: " + wardCondText(it)}</span>`, tone: "ore", quiet: true, ms: 3600 });
}

/* ---------- 옷방 그림 ---------- */
function drawRoom() {
  const c = $("roomCv"); if (!c || !c.getContext) return; const g = c.getContext("2d"); if (!g) return; g.imageSmoothingEnabled = false;
  g.fillStyle = "#3a1f2a"; g.fillRect(0, 0, 320, 170);
  g.fillStyle = "#4a2836"; for (let x = 0; x < 320; x += 24) g.fillRect(x, 0, 12, 130);
  g.fillStyle = "#6b3a2a"; g.fillRect(0, 130, 320, 40); g.fillStyle = "#5a3022"; for (let x = 0; x < 320; x += 32) g.fillRect(x, 130, 2, 40);
  g.fillStyle = "#ffd54a"; g.fillRect(0, 128, 320, 3);
  const look = heroLook();
  // 옷걸이: 지금 보이는 상의·넥타이·팔토시·신발 색
  g.fillStyle = "#8d97b6"; g.fillRect(14, 22, 70, 3);
  ["j", "t", "a", "b"].forEach((k, i) => { g.fillStyle = look.pal[k] || "#cfd6ea"; g.fillRect(18 + i * 16, 26, 12, 22); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(18 + i * 16, 44, 12, 4); });
  // 거울
  g.fillStyle = "#c9a43a"; g.fillRect(206, 18, 92, 112); g.fillStyle = "#8fb3c9"; g.fillRect(212, 24, 80, 100);
  g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(220, 30, 6, 60); g.fillRect(230, 30, 3, 40);
  const draw = (x, y, sc, flip, alpha) => {
    g.save(); g.globalAlpha = alpha;
    if (look.aura) drawWardAura(g, look.aura, x + 9 * sc, y + 13 * sc, sc, 0, true);
    drawSprite(g, look.map, look.pal, x, y - (look.top || 0) * sc, sc, { flip, pretty: true });
    g.restore();
  };
  g.save(); g.beginPath(); g.rect(212, 24, 80, 100); g.clip(); draw(236, 58, 2.35, true, 0.75); g.restore();
  draw(110, 44, 3.5, false, 1);
  drawHeldWeapon(g, 110 + 15.5 * 3.5, 44 + 16 * 3.5, 0.35, 3.4, 0, true);
  if (look.title) drawWardTitle(g, look.title, 110 + 9 * 3.5, 44 - (look.top || 0) * 3.5 - 6 - 17, 1);
  g.fillStyle = "#ffd54a"; g.font = '15px "Do Hyeon", sans-serif'; g.textAlign = "left"; g.textBaseline = "top";
  g.fillText("곽준영의 옷장", 10, 140);
  g.fillStyle = "#e9edf6"; g.textAlign = "right"; g.fillText(`${wardCount()} / ${WITEMS.length}벌`, 310, 140);
}

/* ---------- 옷장 탭 ---------- */
var wardUI = { mode: "eq", view: "slot", slot: "top", nvShow: null };
function wardBtn(b) { return `<button type="button" class="buy num${b.cls ? " " + b.cls : ""}${b.xc ? " " + b.xc : ""}"${b.ok ? "" : " disabled"}${b.act ? ` data-act="${b.act}"` : ""}${b.id ? ` data-id="${b.id}"` : ""}${b.set ? ` data-set="${b.set}"` : ""}>${btnInner(b)}</button>`; }
function wardCostLabel(c) { const k = c.manna ? "manna" : "ore"; return { label: `${k === "manna" ? "만나" : "광석"} ${fmtR(c[k])}`, ok: (+S[k] || 0) >= c[k] && (!c.silver || (+S.silver || 0) >= c.silver), cls: k === "manna" ? "manna" : "ore", silver: c.silver || 0 }; }
function wardRowHTML(it) {
  const W = wardState(), own = W.own[it.id] != null, e = own ? W.own[it.id] : 0, sl = WSLOTX[it.slot], gr = WGRADE[it.g];
  const isEq = W.eq[it.slot] === it.id, sh = wardShown(it.slot), isShown = !!(sh && sh.id === it.id), isNew = (wardUI.nvShow || []).indexOf(it.id) >= 0;
  const L = [];
  if (sl.k) L.push(`<span class="wd-k">입으면</span> ${wardFxText({ [sl.k]: wardEqVal(it, e) })}${it.perk ? " · " + wardFxText(wardScale(it.perk, 1 + 0.1 * e)) : ""}`);
  else if (it.perk) L.push(`<span class="wd-k">달면</span> ${wardFxText(it.perk)}`);
  L.push(`<span class="wd-k">보유</span> 모든 피해 +${wardNum(wardOwnVal(it, e))}%${it.uq ? ` · <b>고유</b> ${wardUqText(it, e)}` : ""}`);
  if (it.slot === "title" && it.d) L.push(`<i class="wd-d">${escapeHtml(it.d)}</i>`);
  else if (it.vs) L.push(`<i class="wd-d">${escapeHtml(it.vs)}</i>`);
  else if (it.d && !own) L.push(`<i class="wd-d">${escapeHtml(it.d)}</i>`);
  if (it.set && WSETX[it.set]) { const set = WSETX[it.set]; L.push(`<span class="wd-setln" style="color:${set.col}">${set.n}</span> ${set.own ? `소장 ${wardSetN(set)}/${wardSetSize(set)}` : `입은 ${wardSetN(set)}/${wardSetSize(set)}`}`); }
  if (!own) L.push(it.cond ? `<span class="wd-key">열쇠</span> ${wardCondText(it)}` : `<span class="wd-key">사기</span> 공부로 캔 광석`);
  let b1, b2 = "";
  if (!own && it.cost) b1 = wardBtn({ label: `광석 ${fmtR(it.cost.ore)}`, sub: "사기", ok: (S.ore || 0) >= it.cost.ore, cls: "ore", act: "buy", id: it.id });
  else if (!own) b1 = wardBtn({ label: "미리 입기", sub: `${Math.floor(wardCondProg(it) * 100)}%`, ok: true, cls: "ghost", act: "prev", id: it.id });
  else if (wardUI.mode === "look") b1 = isShown ? wardBtn({ label: "보이는 중", ok: false, cls: "ghost" }) : wardBtn({ label: "덧입기", sub: "겉모습만", ok: true, cls: "rare", act: "look", id: it.id });
  else b1 = isEq ? wardBtn({ label: "입는 중", ok: false, cls: "ghost" }) : wardBtn({ label: "입기", sub: sl.k ? "능력치" : "칭호 달기", ok: true, cls: "rare", act: "eq", id: it.id });
  if (own && it.slot !== "title" && wardUI.mode === "eq") {
    if (e < WENH_MAX) { const c = wardEnhCost(it, e), cl = wardCostLabel(c); b2 = wardBtn({ label: cl.label, sub: `+${e + 1} 강화${cl.silver ? ` · 은괴 ${cl.silver}` : ""}`, ok: cl.ok, cls: cl.cls, xc: "wd-enh", act: "enh", id: it.id }); }
    else b2 = `<span class="wd-max num">+${WENH_MAX} MAX</span>`;
  }
  const lvb = own && e > 0 ? `<span class="lvb num${e >= WENH_MAX ? " mx" : ""}">+${e}</span>` : "";
  const prog = !own && it.cond ? `<div class="qbar"><i style="width:${Math.round(wardCondProg(it) * 100)}%"></i></div>` : "";
  return `<div class="up wd-up${own ? "" : " locked"}${isEq ? " wd-eq" : ""}${isShown ? " wd-shown" : ""}" data-id="${it.id}" style="--gc:${gr.c}">
    <div class="icon" data-act="prev" data-id="${it.id}"><img class="pix" alt="" src="${wardIconURL(it)}">${lvb}</div>
    <div class="up-info"><div class="up-name"><span class="nm" style="color:${gr.c}">${escapeHtml(it.n)}</span><span class="lv num">${gr.n}${isEq ? " · 착용" : ""}${isShown && !isEq ? " · 덧입음" : ""}</span>${isNew ? `<span class="wd-new">NEW</span>` : ""}</div>
    <div class="up-desc num">${L.join("<br>")}</div>${prog}</div>
    <div class="wd-bts">${b1}${b2}</div></div>`;
}
function wardSlotItems(slot) {
  const W = wardState(), rank = it => {
    const own = W.own[it.id] != null;
    if (own) return [0, W.eq[slot] === it.id ? 0 : 1, -it.g, -(W.own[it.id] || 0)];
    if (it.cost) return [1, 0, it.cost.ore, 0];
    return [2, 0, -wardCondProg(it), it.g];
  };
  return WITEMS.filter(it => it.slot === slot).map(it => ({ it, r: rank(it) })).sort((a, b) => { for (let i = 0; i < 4; i++) if (a.r[i] !== b.r[i]) return a.r[i] - b.r[i]; return 0; }).map(x => x.it);
}
function wardSetHTML(set) {
  const W = wardState(), pcs = wardSetPieces(set), ownN = pcs.filter(it => W.own[it.id] != null).length, n = wardSetN(set), gr = WGRADE[set.g];
  const bon = Object.keys(set.bonus).map(t => `<span class="${n >= +t ? "on" : ""}">${set.own ? "소장 " : ""}${t}벌 ${wardFxText(set.bonus[t])}</span>`).join("");
  const next = pcs.filter(it => W.own[it.id] == null).sort((a, b) => wardCondProg(b) - wardCondProg(a))[0];
  const nextTxt = !next ? "모두 모았어요!" : next.cost ? `다음: ${escapeHtml(next.n)} · 광석 ${fmtR(next.cost.ore)}` : `다음: ${escapeHtml(next.n)} · ${wardCondText(next)}`;
  const pcsHTML = pcs.map(it => `<button type="button" class="wd-pc${W.own[it.id] != null ? "" : " off"}${W.eq[it.slot] === it.id ? " eq" : ""}" data-act="prev" data-id="${it.id}" aria-label="${escapeHtml(it.n)}"><img class="pix" alt="" src="${wardIconURL(it)}"></button>`).join("");
  return `<div class="card wd-set" style="--sc:${set.col}">
    <div class="wd-set-h"><img class="pix wd-set-ic" alt="" src="${wardSetURL(set)}"><div><b style="color:${gr.c}">${escapeHtml(set.n)}</b> <small>${gr.n} · 가진 ${ownN}/${pcs.length}${set.own ? "" : ` · 입은 ${n}/${pcs.length}`}</small><small class="wd-d">${escapeHtml(set.d)}</small></div></div>
    <div class="wd-pcs">${pcsHTML}</div>
    <div class="wd-bon">${bon}</div>
    <div class="wd-next">${nextTxt}</div>
    ${ownN ? `<div class="row-btns">${set.own ? "" : wardBtn({ label: "세트 입기", sub: "능력치", ok: true, cls: "rare", act: "seteq", set: set.id })}${wardBtn({ label: "겉모습만", sub: "덧입기", ok: true, cls: "ghost", act: "setlook", set: set.id })}</div>` : ""}
  </div>`;
}
function wardSetOrder() {
  const W = wardState(), js = S.jobs || [];
  return WSETS.slice().map((s, i) => ({ s, i, o: wardSetPieces(s).filter(it => W.own[it.id] != null).length, lock: s.job && js.indexOf(s.job) < 0 }))
    .sort((a, b) => (a.lock - b.lock) || (b.o > 0) - (a.o > 0) || (b.o - a.o) || (a.i - b.i)).map(x => x.s);
}
function wardListKey() {
  const W = wardState(), money = [S.ore, S.silver, S.manna].map(v => Math.floor(+v || 0));
  let prog = "";
  if (wardUI.view === "slot") WITEMS.forEach(it => { if (it.slot === wardUI.slot && W.own[it.id] == null && it.cond) prog += Math.floor(wardCondProg(it) * 100) + ","; });
  else WITEMS.forEach(it => { if (W.own[it.id] == null && it.cond) prog += Math.floor(wardCondProg(it) * 100) + ","; });
  return JSON.stringify([wardUI.mode, wardUI.view, wardUI.slot, W.own, W.eq, W.look, money, prog, wardUI.nvShow, skinIdx(), S.wl, (S.jobs || []).join()]);
}
function wardListUpdate() {
  const box = $("wdList"); if (!box) return; wardCV = null;
  const W = wardState();
  if (wardUI.nvShow == null) { wardUI.nvShow = W.nv.slice(); }
  if (W.nv.length) { W.nv.forEach(id => { if (wardUI.nvShow.indexOf(id) < 0) wardUI.nvShow.push(id); }); W.nv = []; }
  const key = wardListKey(); if (box._k === key) return; box._k = key;
  const segM = $("wdMode"), segV = $("wdView");
  if (segM) segM.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === wardUI.mode));
  if (segV) segV.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === wardUI.view));
  if (wardUI.view === "set") { box.innerHTML = `<p class="muted wd-hint">세트는 같은 세트를 2·4·6벌 입으면 효과가 커져요. 회장님 세트는 가지고만 있어도 쌓여요.</p>` + wardSetOrder().map(wardSetHTML).join(""); return; }
  const sl = WSLOTX[wardUI.slot], items = wardSlotItems(wardUI.slot), own = items.filter(it => W.own[it.id] != null).length;
  const head = `<div class="wd-lh"><b>${sl.n}</b><small>${own}/${items.length}벌${sl.k ? ` · 입으면 ${WSTAT[sl.k][0]}` : " · 하나를 달면 그 효과"}</small></div>`;
  const lookOpts = wardUI.mode === "look" ? `<div class="wd-lopts"><button type="button" data-act="lookeq" data-slot="${sl.id}" aria-pressed="${!W.look[sl.id]}">입은 옷대로 보이기</button><button type="button" data-act="lookoff" data-slot="${sl.id}" aria-pressed="${W.look[sl.id] === "-"}">${sl.id === "title" || sl.id === "aura" || sl.id === "wfx" || sl.id === "prop" ? "안 보이기" : "기본 모습"}</button></div>` : "";
  box.innerHTML = head + lookOpts + items.map(wardRowHTML).join("");
}
function wardSlotsUpdate() {
  const box = $("wdSlots"); if (!box) return;
  const W = wardState(), key = JSON.stringify([wardUI.slot, wardUI.view, W.eq, W.look, Object.keys(W.own).length, skinIdx(), S.wl]);
  if (box._k === key) return; box._k = key;
  box.innerHTML = WSLOT.map(s => {
    const it = wardShown(s.id) || (W.eq[s.id] && WIT[W.eq[s.id]]), n = WITEMS.filter(x => x.slot === s.id && W.own[x.id] != null).length;
    return `<button type="button" class="wd-sl${wardUI.view === "slot" && wardUI.slot === s.id ? " on" : ""}" data-slot="${s.id}">${it ? `<img class="pix" alt="" src="${wardIconURL(it)}">` : `<i class="wd-sl-e"></i>`}<span>${s.n}</span><small class="num">${n}</small></button>`;
  }).join("");
}
function wardSumUpdate() {
  const box = $("wdSum"); if (!box) return;
  const W = wardState(), st = wardStats(), key = JSON.stringify([wardDirty, W.own, W.eq]);
  if (box._k === key) return; box._k = key;
  const chips = [];
  const pct = (k, n) => { if (st[k] > 0.05) chips.push(`<span>${n} <b>+${wardNum(st[k])}%</b></span>`); };
  pct("dmg", "모든 피해"); if (st.xdmg > 1.0001) chips.push(`<span>모든 피해 <b>x${wardNum(st.xdmg)}</b></span>`); if (st.xaps > 1.0001) chips.push(`<span>공격 속도 <b>x${wardNum(st.xaps)}</b></span>`); if (st.xstamp > 1.0001) chips.push(`<span>퇴사 도장 <b>x${wardNum(st.xstamp)}</b></span>`);
  pct("crit", "치명타"); pct("critd", "치명 피해"); pct("aps", "공격 속도"); pct("boss", "보스 피해"); pct("gold", "보스 월급"); pct("wpn", "무기"); pct("pet", "동료"); pct("manna", "만나"); pct("ore", "광석"); pct("mem", "암송"); pct("stamp", "도장");
  if (st.btime) chips.push(`<span>보스 시간 <b>+${wardNum(st.btime)}초</b></span>`); if (st.jobcd) chips.push(`<span>직무 스킬 대기 <b>−${wardNum(st.jobcd)}%</b></span>`);
  const sets = WSETS.map(s => ({ s, n: wardSetN(s) })).filter(x => x.n > 0 && (x.s.own || x.n >= 2 || x.n === 1)).map(({ s, n }) => {
    const tiers = Object.keys(s.bonus).map(Number), got = tiers.filter(t => n >= t), nx = tiers.find(t => n < t);
    if (!got.length && !s.own && n < 2) return "";
    return `<span style="--sc:${s.col}"><b>${escapeHtml(s.n)}</b> ${s.own ? "소장 " : ""}${n}벌${got.length ? "" : " (효과 전)"}${nx ? ` · ${nx}벌까지 ${nx - n}` : " · 최대"}</span>`;
  }).filter(Boolean);
  box.innerHTML = `<div class="wd-chips num">${chips.join("") || `<span>아직 입은 옷이 없어요</span>`}</div>`
    + (sets.length ? `<div class="wd-sets">${sets.join("")}</div>` : "")
    + `<p class="muted">모은 옷 ${wardCount()}/${WITEMS.length}벌 · 착용 효과는 입은 옷만, 보유 효과는 가진 옷 모두 · 겉모습은 덧입기로 따로 골라요</p>`;
}
function wardCollUpdate() {
  const box = $("wdColl"); if (!box) return;
  const W = wardState(), n = wardCount(), key = n + "|" + W.coll; if (box._k === key) return; box._k = key;
  const cat = (lab, f) => { const all = WITEMS.filter(f).length, got = wardCount(f); return `<span>${lab} <b>${got}/${all}</b></span>`; };
  const ms = WCOLL.map((m, i) => `<div class="wd-ms${i < W.coll ? " on" : ""}"><b class="num">${m.n}벌</b><span>${wardFxText(m.fx)}</span><small>${i < W.coll ? "받음" : rwHTML(m.rw)}</small></div>`).join("");
  box.innerHTML = `<div class="wd-coll-h"><b class="num">${n} / ${WITEMS.length}벌</b><span class="num">${Math.floor(n / WITEMS.length * 100)}%</span></div>
    <div class="qbar wd-cbar"><i style="width:${n / WITEMS.length * 100}%"></i></div>
    <div class="wd-cats">${cat("옷", it => WBODY.indexOf(it.slot) >= 0)}${cat("무기 이펙트", it => it.slot === "wfx")}${cat("오라", it => it.slot === "aura")}${cat("칭호", it => it.slot === "title")}</div>
    <div class="wd-mss">${ms}</div>`;
}
var wardRoomKey = "";
function wardRoomUpdate() {
  const W = wardState(), lk = heroLook(), k = [WSLOT.map(s => (wardShown(s.id) || {}).id || "").join(), curChar().id, skinIdx(), S.wl, wardCount()].join("|");
  if (k !== wardRoomKey) { wardRoomKey = k; drawRoom(); }
  wardSlotsUpdate();
  return lk && W;
}
function wardClick(e) {
  let t = e.target; const root = panels.suit;
  while (t && t !== root && !(t.dataset && (t.dataset.act || t.dataset.mode || t.dataset.view || t.dataset.slot))) t = t.parentElement || t.parent;
  if (!t || t === root || !t.dataset || t.disabled) return;
  const d = t.dataset, W = wardState();
  if (d.mode) { wardUI.mode = d.mode; sfx("tick"); }
  else if (d.view) { wardUI.view = d.view; sfx("tick"); }
  else if (d.act === "lookeq") { wardSetLook(d.slot, ""); sfx("tick"); }
  else if (d.act === "lookoff") { wardSetLook(d.slot, "-"); sfx("tick"); }
  else if (d.slot && !d.act) { wardUI.slot = d.slot; wardUI.view = "slot"; sfx("tick"); }
  else if (d.act === "prev") { wardPreview(d.id); return; }
  else if (d.act === "buy") { if (wardBuy(d.id)) sfx("buy"); }
  else if (d.act === "eq") { wardEquip(d.id); sfx("tick"); }
  else if (d.act === "look") { wardSetLook(WIT[d.id].slot, d.id); sfx("tick"); toast(`${hbJosa(WIT[d.id].n, "을", "를")} 덧입었어요 · 능력치는 그대로`); }
  else if (d.act === "enh") { const d0 = stats().dps; if (wardEnh(d.id)) { sfx("upgrade"); const row = t.closest ? t.closest(".up") : null; if (row) rowPop(row, `+${W.own[d.id]}!`); dpsPop(d0); } }
  else if (d.act === "seteq") { wardWearSet(d.set, "eq"); sfx("tick"); }
  else if (d.act === "setlook") { wardWearSet(d.set, "look"); sfx("tick"); }
  else if (d.act === "best") { const d0 = stats().dps; wardAutoBest(); sfx("tick"); toast("가장 좋은 조합으로 입었어요 · 겉모습은 덧입기 그대로"); dpsPop(d0); }
  else return;
  wardDirty++; updateUI(true); save();
}
function buildWardTab() {
  const room = el("div", "card hero-card wd-room");
  room.innerHTML = `<canvas id="roomCv" width="320" height="170" class="wd-cv"></canvas><div class="wd-slots" id="wdSlots"></div>`;
  addCustom("suit", room, () => wardRoomUpdate());
  const sum = el("div", "card wd-sum");
  sum.innerHTML = `<div class="wd-sum-h"><b>옷장 효과</b><button type="button" class="wd-best" data-act="best">가장 좋은 조합 입기</button></div><div id="wdSum"></div>`;
  addCustom("suit", sum, () => wardSumUpdate());
  const bar = el("div", "wd-bar");
  bar.innerHTML = `<div class="seg" id="wdMode"><button type="button" data-mode="eq" aria-pressed="true">착용 · 능력치</button><button type="button" data-mode="look" aria-pressed="false">덧입기 · 겉모습</button></div><div class="seg" id="wdView"><button type="button" data-view="slot" aria-pressed="true">부위별</button><button type="button" data-view="set" aria-pressed="false">세트별</button></div>`;
  panels.suit.appendChild(bar);
  const list = el("div", "wd-list"); list.id = "wdList";
  addCustom("suit", list, () => wardListUpdate());
  secTitle("suit", "옷장 도감", "모은 수마다 영구 효과 + 선물");
  const coll = el("div", "card wd-coll"); coll.id = "wdColl";
  addCustom("suit", coll, () => wardCollUpdate());
  panels.suit.addEventListener("click", wardClick);
  updaters.suit.push({ update() {}, ready: () => !!(S && S.ward && S.ward.nv && S.ward.nv.length) });
}
/* 정보 탭 도감 칸: 세트 14 + 무기 이펙트·오라·칭호 */
function wardInfoCells(parent, cell) {
  const out = [];
  WSETS.forEach(set => { const c = cell(parent, () => { const img = document.createElement("img"); img.className = "pix"; img.alt = ""; img.src = wardSetURL(set); if (img.style) { img.style.width = img.style.height = "40px"; } return img; }); out.push({ c, f: it => it.set === set.id, all: wardSetSize(set) }); });
  [["wfx", "무기"], ["aura", "오라"], ["title", "칭호"]].forEach(([sl]) => { const it0 = WITEMS.find(x => x.slot === sl); const c = cell(parent, () => { const img = document.createElement("img"); img.className = "pix"; img.alt = ""; img.src = wardIconURL(it0); if (img.style) { img.style.width = img.style.height = "40px"; } return img; }); out.push({ c, f: it => it.slot === sl, all: WITEMS.filter(x => x.slot === sl).length }); });
  return () => out.forEach(o => { const n = wardCount(o.f); o.c.em.textContent = `${n}/${o.all}`; o.c.d.classList.toggle("off", !n); o.c.d.classList.toggle("max", n >= o.all); });
}
