"""v37: 직무별 대표 동작(전사·거너·마법사·소환사·저격수) · 새 직무 감사팀 · 겸직 속성 (patch_v36 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 36;', 'var GAME_V = 37;')
# ---- 서는 자리: 검사만 몬스터에 붙고 원거리 직무는 떨어져 섬 (feelStandStep이 매 프레임 정함) ----
rep('const HERO_X = 334, MON_X = 474;', 'const HERO_X0 = 334, MON_X0 = 474; let HERO_X = HERO_X0, MON_X = MON_X0;   // v37: 대표 직무마다 서는 자리 (원거리 직무는 몬스터와 떨어져 섬)')
rep('  const gdt = fxStep(dt); fx5Step(dt);\n', '  const gdt = fxStep(dt); fx5Step(dt); feelStandStep(dt);\n')
rep('if (localStorage.getItem(SAVE_KEY + "-feel36")) return;\n    localStorage.setItem(SAVE_KEY + "-feel36", "1");',
    'if (localStorage.getItem(SAVE_KEY + "-feel37")) return;\n    localStorage.setItem(SAVE_KEY + "-feel37", "1");')
rep('celebrateLater({ ic: "weapon", title: "몸 전체로 휘둘러요", sub: "허리를 숙이고 뒷발을 빼며 내려쳐요<br>무기 30개를 새로 그렸고, 무기마다 이펙트 색이 달라요", tone: "gold", ms: 4200, keep: 1 });',
    'celebrateLater({ ic: "weapon", title: "직무마다 싸우는 법이 달라요", sub: "영업 전사는 붙어서 베고, 거너·마법사·소환사·저격수(새 직무)는 떨어져서 쏴요<br>대표 직무는 인사 기록에서 고르고, 다른 직무는 <b>겸직 속성</b> +20%씩", tone: "gold", ms: 4800, keep: 1 });')
# 새 직무·겸직 속성 코드는 직무 코드(JOBS·JSK_CAST·JFX_DRAW) 뒤에
rep('/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */',
    open('part_job37.js', encoding='utf-8').read() + '\n/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */')
# ---- 능력치: 감사 특징 · 겸직 속성 ----
rep('function careerAtk() { return rankMul(); }',
    'function careerAtk() { return rankMul() * (jobOn("audit") ? 2 : 1) * (typeof jobSubMul === "function" ? jobSubMul() : 1); }   // v37: 감사 한 발 2배 · 겸직 속성 +20%씩')
rep('function careerAps() { return jobOn("dev") ? 1.4 : 1; }',
    'function careerAps() { return (jobOn("dev") ? 1.4 : 1) * (jobOn("audit") ? 0.7 : 1); }')
rep('function careerCrit() { return skillOn("j_deal") ? 1 : jobOn("sales") ? 0.25 : 0; }',
    'function careerCrit() { return skillOn("j_deal") || skillOn("j_censure") ? 1 : jobOn("sales") ? 0.25 : 0; }')
rep('function careerCritMul() { return jobOn("sales") ? 2 : 1; }',
    'function careerCritMul() { return (jobOn("sales") ? 2 : 1) * (jobOn("audit") ? 1.5 : 1) * (skillOn("j_censure") ? 2 : 1); }')
# ---- 기본 공격: 탄·빔은 총구·지팡이 끝·손에서 (대표 동작의 맞는 순간 자세) ----
rep('    jobProj.push({ kind: "code", x0: heroHand.x + 8, y0: heroHand.y - 6, tx, ty, t: 0, dur: 110,',
    '    const sky = fHero.mv === "m_storm", o = sky ? { x: tx + 22, y: GROUND - 300 } : feelMuzzle();   // 마법사 마무리: 지팡이를 들면 하늘에서 번개\n'
    '    if (sky && !reduceMotion) jvAdd("chain", { dur: 260, segs: [jBoltPts(o.x, o.y, tx, ty, 9, 26), jBoltPts(o.x - 30, o.y + 40, tx - 6, ty + 8, 7, 20)] });\n'
    '    jobProj.push({ kind: "code", x0: o.x, y0: o.y, tx, ty, t: 0, dur: sky ? 70 : 110,')
rep('    jvAdd("pointer", { dur: snipe ? 340 : 140, x0: heroHand.x + 6, y0: heroHand.y - 4, x1: tx, y1: ty, snipe });',
    '    const o = feelMuzzle(); jvAdd("pointer", { dur: snipe ? 340 : 140, x0: o.x, y0: o.y, x1: tx, y1: ty, snipe, live: 1 });')
# 레이저 포인터는 쏘는 동안 지금 총구(반동으로 튀는 무기 끝)에서 나감
rep('''  pointer(f) {
    const k = f.t / f.dur, a = 1 - k, ang = Math.atan2(f.y1 - f.y0, f.x1 - f.x0);''', '''  pointer(f) {
    if (f.live && fHero.mv && FEEL_MOVES[fHero.mv].kit === "gun" && heroTip.on) { f.x0 = heroTip.x; f.y0 = heroTip.y; }
    const k = f.t / f.dur, a = 1 - k, ang = Math.atan2(f.y1 - f.y0, f.x1 - f.x0);''')
rep('    jobProj.push({ kind: "stamp", x0: heroHand.x, y0: heroHand.y - 10, tx, ty, t: 0, dur: 165,',
    '    const big = fHero.mv === "s_call", o = big ? { x: tx - 4, y: GROUND - 270 } : feelMuzzle();   // 소환사 마무리: 손을 들면 큰 결재 도장이 위에서 쾅\n'
    '    jobProj.push({ kind: "stamp", big, x0: o.x, y0: o.y, tx, ty, t: 0, dur: big ? 150 : 165,')
# 큰 도장: 포물선 없이 곧게 떨어지고 두 배 크기, 맞으면 '인' 도장 자국
rep('      const x = p.x0 + (p.tx - p.x0) * k, y = p.y0 + (p.ty - p.y0) * k - Math.sin(k * Math.PI) * 46;\n      const k2 = Math.max(0, k - 0.15), px = p.x0 + (p.tx - p.x0) * k2, py = p.y0 + (p.ty - p.y0) * k2 - Math.sin(k2 * Math.PI) * 46;',
    '      const arc = p.big ? 0 : 46, x = p.x0 + (p.tx - p.x0) * k, y = p.y0 + (p.ty - p.y0) * k * (p.big ? k : 1) - Math.sin(k * Math.PI) * arc;\n      const k2 = Math.max(0, k - 0.15), px = p.x0 + (p.tx - p.x0) * k2, py = p.y0 + (p.ty - p.y0) * k2 * (p.big ? k2 : 1) - Math.sin(k2 * Math.PI) * arc;')
rep('      ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot + k * 10);\n      ctx.fillStyle = "#8a5a3a"; ctx.fillRect(-4, -14, 8, 12);',
    '      ctx.save(); ctx.translate(x, y); if (p.big) { ctx.rotate(-0.12); ctx.scale(2.2, 2.2); } else ctx.rotate(p.rot + k * 10);\n      ctx.fillStyle = "#8a5a3a"; ctx.fillRect(-4, -14, 8, 12);')
rep('  } else if (p.kind === "stamp") {\n    jvAdd("splat", { dur: 300, x: p.tx, y: p.ty });',
    '  } else if (p.kind === "stamp") {\n    jvAdd("splat", { dur: 300, x: p.tx, y: p.ty });\n    if (p.big) { jvAdd("aseal", { dur: 700, x: p.tx, y: p.ty - 4, r: 26 }); if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 8); }')
rep('''    sfx("toss"); return true;
  }
  return false;
}''', '''    sfx("toss"); return true;
  }
  if (j.id === "audit") return auditStrike(st, crit);   // v37 감사팀: 정밀 저격
  return false;
}''')
# ---- 승진·사장 글 ----
rep('const extra = R.job ? (r === RANKS.length - 1 ? "<br>네 직무를 모두 겸직해요" : "<br>새 직무를 고를 수 있어요") : "";',
    'const extra = R.job ? (r === RANKS.length - 1 ? "<br>모든 직무를 겸직해요" : "<br>새 직무를 고를 수 있어요") : "";')
rep('celebrate({ icon: bizIcon(rankIdx()), title: "사장 취임!", sub: "네 직무를 모두 겸직해요<br>영업·개발·기획·인사총무 특징이 한꺼번에 적용돼요", tone: "rare", ms: 3200 });',
    'celebrate({ icon: bizIcon(rankIdx()), title: "사장 취임!", sub: "다섯 직무를 모두 겸직해요<br>모든 직무 특징이 함께 적용되고, 대표 직무 말고는 겸직 속성으로 붙어요", tone: "rare", ms: 3400 });')
rep('$("jpS").textContent = S.jobs.length ? `지금 직무: ${S.jobs.map(id => jobById(id).team).join(" · ")} · 가진 직무는 인사 기록에서 언제든 바꿔 쓸 수 있어요` : "고른 팀에 따라 공격 모양과 스킬이 달라져요. 과장·부장이 되면 직무를 더 얻어요.";',
    '$("jpS").textContent = S.jobs.length ? `지금 직무: ${S.jobs.map(id => jobById(id).team).join(" · ")} · 새로 얻은 직무는 겸직 속성(피해 +20%·이펙트)으로 붙고, 대표 직무는 인사 기록에서 언제든 바꿔요` : "고른 팀에 따라 싸우는 동작·기본 공격·스킬이 달라져요. 직무를 더 얻으면 겸직 속성(피해 +20%)이 붙어요.";')
rep('const tx = el("span", "jp-tx", `<b>${j.team}</b><small>${j.type} · ${j.atk}</small>',
    'const tx = el("span", "jp-tx", `<b>${j.team} · ${FEEL_KITS[FEEL_KIT_OF[j.id]].n}</b><small>${j.type} · ${j.atk}</small>')
# ---- 인사 기록 카드 ----
rep('$("crTeam").textContent = j ? `본사 타워 · ${j.team} · ${j.type}` + (isCEO() ? " · 네 직무 겸직" : "") : "본사 타워 · 아직 직무 없음";',
    '$("crTeam").textContent = j ? `본사 타워 · ${j.team} · ${FEEL_KITS[FEEL_KIT_OF[j.id]].n}` + (jobSubs().length ? ` · 겸직 속성 +${Math.round((jobSubMul() - 1) * 100)}%` : "") : "본사 타워 · 아직 직무 없음";')
rep('note.hidden = !nx.job; note.textContent = r + 1 === RANKS.length - 1 ? `${iga(nx.n)} 되면 넷째 직무가 열리고 네 직무 특징이 모두 적용돼요` : nx.job ? `${iga(nx.n)} 되면 새 직무를 하나 더 골라요` : "";',
    'note.hidden = !nx.job; note.textContent = r + 1 === RANKS.length - 1 ? `${iga(nx.n)} 되면 남은 직무가 모두 열리고 모든 직무 특징이 함께 적용돼요` : nx.job ? `${iga(nx.n)} 되면 새 직무를 하나 더 골라요 · 겸직 속성 +20%` : "";')
rep('go.hidden = true; note.hidden = false; note.textContent = "네 직무 특징이 모두 적용되고 있어요. 직무 스킬은 고른 직무 것을 써요.";',
    'go.hidden = true; note.hidden = false; note.textContent = "모든 직무 특징이 함께 적용되고 있어요. 동작·직무 스킬은 대표 직무 것을 써요.";')
rep('$("crJobS").textContent = pend ? "새 직무를 고를 수 있어요!" : (S.jobs.length ? `가진 직무 ${S.jobs.length}/4` + (nxr > 0 ? ` · 다음 직무는 ${rankName(nxr)}` : "") : `${iga(rankName(nextJobRank()))} 되면 첫 직무`);',
    '$("crJobS").textContent = pend ? "새 직무를 고를 수 있어요!" : (S.jobs.length ? `가진 직무 ${S.jobs.length}/${JOBS.length}` + (nxr > 0 ? ` · 다음 직무는 ${rankName(nxr)}` : "") : `${iga(rankName(nextJobRank()))} 되면 첫 직무`);')
rep('t.st.textContent = on ? (isCEO() ? "대표 직무" : "근무 중") : own ? (isCEO() ? "겸직 중" : "바꿀 수 있음") : pend ? "고를 수 있음" : "잠김";',
    't.st.textContent = on ? "대표 직무" : own ? "겸직 +20%" : pend ? "고를 수 있음" : "잠김";')
rep('if (fOwn && !fOn) btn = `<button type="button" class="buy cr-use" data-act="use" data-job="${focus.id}">${btnInner({ label: `${focus.team}으로 바꾸기`, sub: "스킬 버튼도 바뀌어요" })}</button>`;',
    'if (fOwn && !fOn) btn = `<button type="button" class="buy cr-use" data-act="use" data-job="${focus.id}">${btnInner({ label: "대표 직무로", sub: `${FEEL_KITS[FEEL_KIT_OF[focus.id]].n} 동작 · 기본 공격 · 스킬이 바뀌어요` })}</button>`;')
rep('''    <p class="cr-dl"><span>기본 공격</span>${focus.atk}</p>''',
    '''    <p class="cr-dl"><span>대표 동작</span>${FEEL_KITS[FEEL_KIT_OF[focus.id]].n} · ${focus.atk}</p>
    <p class="cr-dl"><span>겸직 속성</span>${JOB_ATTR[focus.id].d}${fOwn && !fOn ? " · 지금 적용 중" : ""}</p>''')
rep('toast(`${j.team}으로 옮겼어요 · ${j.type}`); renderJobSkills(); updateUI(true); save();',
    'toast(`대표 직무: ${j.team} · ${FEEL_KITS[FEEL_KIT_OF[j.id]].n} 동작 · 나머지는 겸직 속성`); renderJobSkills(); updateUI(true); save();')
# ---- 전투 화면: 대표 직무 빛 + 겸직 직무 색 점이 둘레를 돎 (사장만이 아니라 겸직이 있으면) ----
rep('  if (isCEO()) JOBS.forEach((jj, i) => { const an = t / 800 + i * Math.PI / 2; ctx.fillStyle = hexA(jj.col, 0.85); ctx.fillRect(cx + Math.cos(an) * 42 - 2.5, cy - 24 + Math.sin(an) * 12 - 2.5, 5, 5); });',
    '  const subs = typeof jobSubs === "function" ? jobSubs() : []; subs.forEach((id, i) => { const jj = jobById(id), an = t / 800 + i * Math.PI * 2 / subs.length; ctx.fillStyle = hexA(jj.col, 0.85); ctx.fillRect(cx + Math.cos(an) * 42 - 2.5, cy - 24 + Math.sin(an) * 12 - 2.5, 5, 5); });')
# 겸직 속성 피해 숫자는 그 직무 색 (hitFloatCol, part_job37)
rep('  const fcol = src === "pet" ? "#6fd3ff" : src === "clone" ? "#c9a6ff" : crit ? "#ff5d5d" : "#ffffff";',
    '  const fcol = typeof hitFloatCol !== "undefined" && hitFloatCol ? hitFloatCol : src === "pet" ? "#6fd3ff" : src === "clone" ? "#c9a6ff" : crit ? "#ff5d5d" : "#ffffff";')
rep('  addFloat(px ?? MON_X - 10, (py ?? GROUND - mh) - 10, fmt(amount), crit ? "#ff2a2a" : fcol,',
    '  addFloat(px ?? MON_X - 10, (py ?? GROUND - mh) - 10, fmt(amount), crit && !(typeof hitFloatCol !== "undefined" && hitFloatCol) ? "#ff2a2a" : fcol,')
# ---- 직무를 더 얻으면: 대표 직무는 그대로, 새 직무는 겸직 속성으로 (사용자: "대표동작은 내가 선택", "직무가 추가되면 겸직속성을 입혀서") ----
rep('  go.innerHTML = j ? btnInner({ label: `${j.team}으로 갈게요`, sub: `${JSK[j.sk[0]].n} · ${JSK[j.sk[1]].n}` }) : `<span class="act">팀을 하나 골라 주세요</span>`;',
    '  go.innerHTML = j ? (S.job && S.jobs.length ? btnInner({ label: `${j.team} 겸직할게요`, sub: `겸직 속성 ${JOB_ATTR[j.id].n} · 피해 +20%` }) : btnInner({ label: `${j.team}으로 갈게요`, sub: `${FEEL_KITS[FEEL_KIT_OF[j.id]].n} 동작 · ${JSK[j.sk[0]].n} · ${JSK[j.sk[1]].n}` })) : `<span class="act">팀을 하나 골라 주세요</span>`;')
rep('''  S.jobs.push(j.id); S.job = j.id; crFocus = "";
  closeJobPick(); sfx("bigup");
  celebrate({ icon: pixIcon(j.ic, 76), title: `${j.team} 배치!`, sub: `${j.type} · 직무 스킬 '${JSK[j.sk[0]].n}' '${JSK[j.sk[1]].n}'이<br>전투 화면 왼쪽 위에 생겼어요`, tone: "gold", ms: 3000 });
  jobCut = { t: 0, dur: 1300, name: `${j.team} 배치`, team: heroTitle(), col: j.col };
  say(`오늘부터 ${j.team}! 잘 부탁드립니다`, 3);''',
    '''  const first = !curJob(); S.jobs.push(j.id); if (first) S.job = j.id; crFocus = "";
  closeJobPick(); sfx("bigup");
  if (first) {
    celebrate({ icon: pixIcon(j.ic, 76), title: `${j.team} 배치!`, sub: `${FEEL_KITS[FEEL_KIT_OF[j.id]].n} 동작으로 싸워요 · 직무 스킬 '${JSK[j.sk[0]].n}' '${JSK[j.sk[1]].n}'이<br>전투 화면 왼쪽 위에 생겼어요`, tone: "gold", ms: 3200 });
    jobCut = { t: 0, dur: 1300, name: `${j.team} 배치`, team: heroTitle(), col: j.col };
    say(`오늘부터 ${j.team}! 잘 부탁드립니다`, 3);
  } else {
    const A = JOB_ATTR[j.id], m = curJob();
    celebrate({ icon: pixIcon(j.ic, 76), title: `${j.team} 겸직!`, sub: `겸직 속성 '${A.n}' · 모든 피해 +20% · 3연타 마무리마다 발동<br>대표 직무는 그대로 ${m.team}(${FEEL_KITS[FEEL_KIT_OF[m.id]].n}) · 바꾸려면 정보 › 인사 기록`, tone: "gold", ms: 3800 });
    jobCut = { t: 0, dur: 1300, name: `${j.team} 겸직`, team: heroTitle(), col: j.col };
    say(`${j.team} 일도 같이 맡겠습니다!`, 3);
  }''')
open(P, 'w', encoding='utf-8').write(s)
print('patch_v37 ok', len(s))
