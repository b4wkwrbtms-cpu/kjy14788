"""v42 화면: 무기 등급 이름표·해금 재료·등급 사다리 · 돌파 · 문서고·보물·재화 설명 · 막혔을 때 퇴사 안내 · 안내창 (patch_v42 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

# ---- 무기 등급 모양 ----
rep('.wname.leg { color: var(--rare); }',
    '.wname.leg { color: var(--rare); }\n'
    '.wgr { display: inline-block; font-family: var(--body, sans-serif); font-size: 11px; line-height: 16px; padding: 0 6px; border: 1px solid; border-radius: 9px; margin-right: 6px; vertical-align: 3px; background: rgba(10,14,26,.5); }\n'
    '.wgl { display: flex; flex-direction: column; gap: 6px; }\n'
    '.card.wgl .wgl-r { display: grid; grid-template-columns: auto 1fr auto; gap: 4px 8px; align-items: center; padding: 6px 8px; border-radius: 10px; background: var(--panel-2); }\n'
    '.wgl-r.cur { box-shadow: inset 0 0 0 1px var(--gold); }\n'
    '.wgl-r.off { opacity: .62; }\n'
    '.wgl-t { color: var(--muted); font-size: 12px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n'
    '.wgl-n { grid-column: 1 / -1; font-size: 12px; color: var(--gold); padding: 0 2px; }\n'
    '.wgl-s { font-size: 12px; white-space: nowrap; }\n'
    '.wgl-s .ok { color: #7fe3a0; font-weight: normal; }\n'
    '.wgl-f { font-size: 12px; line-height: 1.55; margin: 4px 2px 0; }')

# ---- 무기 카드 ----
rep('''    $("wName").className = "wname" + (w.leg ? " leg" : "");
    $("wName").innerHTML = `${w.n}<span class="plus">+${S.wl}</span>`;
    $("wStars").innerHTML = [1, 2, 3, 4, 5].map(n => `<i class="${n <= S.wl ? "on" : ""}"></i>`).join("") + (S.wl > 5 ? ` <span class="muted">초월 ${S.wl - 5}</span>` : "");
    $("wPow").textContent = `${i + 1}번째 무기 · 무기 공격력 ${fmt(wPower(i, S.wl))}`;
    $("wStory").hidden = !w.leg; $("wStory").textContent = w.story || "";''',
'''    $("wName").className = "wname" + (w.leg ? " leg" : ""); if ($("wName").style) $("wName").style.color = gradeOf(i) ? WGRADES[gradeOf(i)].c : "";
    $("wName").innerHTML = `${wGradeTag(i)}${w.n}<span class="plus">+${S.wl}</span>`;
    $("wStars").innerHTML = [1, 2, 3, 4, 5].map(n => `<i class="${n <= S.wl ? "on" : ""}"></i>`).join("") + (S.wl > 5 ? ` <span class="muted">돌파 ${S.wl - 5}</span>` : "");
    $("wPow").textContent = `${WGRADES[gradeOf(i)].n} ${i % WG_SIZE + 1}/${WG_SIZE} · ${i + 1}번째 무기 · 무기 공격력 ${fmt(wPower(i, S.wl))}`;
    $("wStory").hidden = !w.story; $("wStory").textContent = w.story || "";''')
rep('''      const c = wUp(i, S.wl);
      b.className = "buy num"; b.disabled = S.gold < c;
      const wh = btnInner({ ok: S.gold >= c, label: `${fmt(c)}원`, sub: S.wl < 5 ? `강화 +${S.wl} → +${S.wl + 1} · 공격력 +${Math.round(0.25 / (1 + 0.25 * (S.wl - 1)) * 100)}%` : "초월 강화 · 공격력 +12%" }); if (b._h !== wh) { b._h = wh; b.innerHTML = wh; }
      $("wNote").textContent = S.wl < 5 ? "5강까지 올리면 다음 무기를 살 수 있어요. 3강부터 반짝이고 5강이면 빛이 나요." : "마지막 무기는 끝없이 초월할 수 있어요.";''',
'''      const c = wUp(i, S.wl), over = S.wl >= 5, oa = over ? overAme(S.wl) : 0, okB = S.gold >= c && (S.ame || 0) >= oa;
      b.className = "buy num" + (over ? " rare" : ""); b.disabled = !okB;
      const wh = btnInner({ ok: okB, label: `${fmt(c)}원`, sub: !over ? `강화 +${S.wl} → +${S.wl + 1} · 공격력 +${Math.round(0.25 / (1 + 0.25 * (S.wl - 1)) * 100)}%` : `돌파 +${S.wl - 4} · 공격력 +12% · 자수정 ${oa}` }); if (b._h !== wh) { b._h = wh; b.innerHTML = wh; }
      $("wNote").textContent = !over ? "5강까지 올리면 다음 무기를 살 수 있어요. 3강부터 반짝이고 5강이면 빛이 나요." : `마지막 무기는 5강 뒤에도 끝없이 돌파해요. 한 단계마다 월급과 자수정 ${oa}개 (지금 ${fmtR(S.ame || 0)}개).`;''')
rep('''      const locked = nw.leg && !S.legUnlock[n - LEG_START], lk = locked ? legLockInfo(n - LEG_START) : null;
      b.className = "buy num" + (nw.leg ? " rare" : ""); b.disabled = locked ? !lk.ok : S.gold < c;
      const wh = locked ? (lk.ok ? btnInner({ label: `${nw.n} 해금하기`, sub: `은괴 ${lk.req.silver} · 자수정 ${lk.req.ame} 사용` }) : `<span class="act">잠김: ${nw.n}</span><small>${lk.short} · 공부 탭에서 캐요</small>`) : btnInner({ ok: S.gold >= c, label: `${fmt(c)}원`, sub: `새 무기 ${nw.n} · 공격력 x${(wPower(n, 1) / wPower(i, 5)).toFixed(1)}` }); if (b._h !== wh) { b._h = wh; b.innerHTML = wh; }
      $("wNote").textContent = nw.leg ? (locked ? (lk.ok ? "광물이 충분해요. 눌러서 해금하면 바로 월급으로 살 수 있어요." : `전설 무기는 은괴·자수정으로 먼저 해금해요. 지금 은괴 ${S.silver} · 자수정 ${S.ame} · 공부 탭 타이머를 켜 두면 광산에서 모여요.`) : "전설 무기예요. 월급으로 사면 바로 장착해요.") : "새 무기를 사면 모양이 바뀌어요.";''',
'''      const locked = wLocked(n), lk = locked ? wUnlockInfo(n) : null, ng = gradeOf(n);
      b.className = "buy num" + (nw.leg ? " rare" : ""); b.disabled = locked ? !lk.ok : S.gold < c;
      const wh = locked ? (lk.ok ? btnInner({ label: `${nw.n} 열기`, sub: `${lk.need} 사용${lk.entry ? ` · ${WGRADES[ng].n} 관문` : ""}` }) : `<span class="act">잠김: ${nw.n}</span><small>${lk.lack} 더 필요</small>`) : btnInner({ ok: S.gold >= c, label: `${fmt(c)}원`, sub: `새 무기 ${nw.n} · 공격력 x${(wPower(n, 1) / wPower(i, 5)).toFixed(1)}` }); if (b._h !== wh) { b._h = wh; b.innerHTML = wh; }
      $("wNote").textContent = locked ? (lk.ok ? `재료가 충분해요. 눌러서 열면 바로 월급으로 살 수 있어요${lk.entry ? ` · ${WGRADES[ng].n} 등급 관문이에요` : ""}.` : `${WGRADES[ng].n} 무기 ${nw.n}은 재료로 먼저 열어요 (${lk.need}). 지금 ${matHave(lk.req)} · 공부 탭 광산과 지하 문서고에서 모여요.`) : nw.leg ? `${WGRADES[ng].n} 무기예요. 월급으로 사면 바로 장착해요.` : "새 무기를 사면 모양이 바뀌어요.";''')
# 카드 버튼 누름
rep('''      if (S.wi !== startI) celebrate({ icon: weaponBig(S.wi, S.wl), title: WEAPONS[S.wi].leg ? "전설 무기 장착!" : "새 무기 장착!",''',
    '''      if (S.wi !== startI) celebrate({ icon: weaponBig(S.wi, S.wl), title: wEquipTitle(S.wi),''')
rep('''      const c = wUp(i, S.wl); if (S.gold < c) return; S.gold -= c; S.wl++;
      if (S.wl === 5) celebrate({ icon: weaponBig(i, 5), title: "+5 완성!", sub: `${WEAPONS[i].n} · 빛이 나기 시작해요`, tone: WEAPONS[i].leg ? "rare" : "gold" });
      else rowPop(card, `+${S.wl}!`, "#ffd54a");''',
'''      if (!weaponStep()) { if (i === LAST_W && S.wl >= 5 && (S.ame || 0) < overAme(S.wl)) toast(`돌파에는 자수정 ${overAme(S.wl)}개가 필요해요 · 지금 ${fmtR(S.ame || 0)}개`); return; }
      if (S.wl === 5) celebrate({ icon: weaponBig(i, 5), title: "+5 완성!", sub: `${WEAPONS[i].n} · 빛이 나기 시작해요`, tone: WEAPONS[i].leg ? "rare" : "gold" });
      else rowPop(card, S.wl > 5 ? `돌파 +${S.wl - 5}!` : `+${S.wl}!`, "#ffd54a");''')
rep('''    else { const n = i + 1, nw = WEAPONS[n], c = wBuy(n); if (nw.leg && !S.legUnlock[n - LEG_START]) { legUnlockTry(n - LEG_START); updateUI(true); save(); return; } if (S.gold < c) return; S.gold -= c; S.wi = n; S.wl = 1; if (S.skin >= 0) S.skin = -1; celebrate({ icon: weaponBig(n, 1), title: nw.leg ? "전설 무기 장착!" : "새 무기 장착!", sub: `${n + 1}번째 무기 · ${nw.n}`, tone: nw.leg ? "rare" : "gold" }); }''',
    '''    else { const n = i + 1, nw = WEAPONS[n], c = wBuy(n); if (wLocked(n)) { weaponUnlockTry(n); updateUI(true); save(); return; } if (S.gold < c) return; S.gold -= c; S.wi = n; S.wl = 1; if (S.skin >= 0) S.skin = -1; celebrate({ icon: weaponBig(n, 1), title: wEquipTitle(n), sub: `${WGRADES[gradeOf(n)].n} · ${n + 1}번째 무기 · ${nw.n}`, tone: nw.leg ? "rare" : "gold" }); }''')
# 자동 강화 축하
rep('''if (S.wi !== i0) { if (WEAPONS[S.wi].leg) celebrate({ icon: weaponBig(S.wi, S.wl), title: "전설 무기 장착!",''',
    '''if (S.wi !== i0) { if (WEAPONS[S.wi].leg) celebrate({ icon: weaponBig(S.wi, S.wl), title: wEquipTitle(S.wi),''')

# ---- 무기 목록 ----
rep('      else if (w.leg && !S.legUnlock[i - LEG_START]) legUnlockTry(i - LEG_START);',
    '      else if (wLocked(i)) weaponUnlockTry(i);')
rep('      const lockedLeg = w.leg && !S.legUnlock[i - LEG_START];', '      const lockedLeg = wLocked(i);')
rep('      const lkI = lockedLeg ? legLockInfo(i - LEG_START) : null;', '      const lkI = lockedLeg ? wUnlockInfo(i) : null;')
rep('''      r.nm.textContent = `${i + 1}. ${w.n}`; r.nm.style.color = w.leg ? "var(--rare)" : "";''',
    '''      r.nm.textContent = `${i + 1}. ${w.n}`; r.nm.style.color = gradeOf(i) ? WGRADES[gradeOf(i)].c : "";''')
rep('''      r.desc.textContent = `ATK ${fmt(wPower(i, Math.max(1, lv)))}` + (lockedLeg ? ` · 은괴 ${legReq(i - LEG_START).silver}, 자수정 ${legReq(i - LEG_START).ame}로 해금` : "");''',
    '''      r.desc.textContent = `${WGRADES[gradeOf(i)].n} · ATK ${fmt(wPower(i, Math.max(1, lv)))}` + (lockedLeg ? ` · ${lkI.need}로 열기` : "");''')
rep('''      r.row.classList.toggle("locked", lockedLeg ? !lkI.ok : i > S.wi + 1);''',
    '''      r.row.classList.toggle("locked", lockedLeg ? !lkI.ok : i > S.wi + 1);''')
rep('''      else if (lockedLeg) { b.className = "buy num rare" + (lkI.ok ? "" : " ghost"); b.disabled = false; b.innerHTML = lkI.ok ? btnInner({ label: "해금하기", sub: `은괴 ${lkI.req.silver} · 자수정 ${lkI.req.ame}` }) : `<span class="act">잠김</span><small>${lkI.short}</small>`; }''',
    '''      else if (lockedLeg) { b.className = "buy num rare" + (lkI.ok ? "" : " ghost"); b.disabled = !lkI.prev; b.innerHTML = lkI.ok ? btnInner({ label: "열기", sub: lkI.need }) : `<span class="act">잠김</span><small>${lkI.prev ? lkI.lack + " 더" : "앞 무기부터"}</small>`; }''')

# ---- 전설 무기 해금 칸 → 무기 등급 사다리 ----
i0 = s.index('  secTitle("weapon", "전설 무기 해금", "공부(광산)에서 캔 은괴·자수정 사용");')
i1 = s.index('\n})();', i0)
s = s[:i0] + '''  secTitle("weapon", "무기 등급", "7등급 · 연 무기는 퇴사해도 남아요");
  const wgl = el("div", "card wgl"); let wglKey = "";
  addCustom("weapon", wgl, () => {
    const k = [S.wi, wUnl(), S.ore, S.silver, S.ame].join("|"); if (k === wglKey) return; wglKey = k;
    wgl.innerHTML = wGradeLadderHTML();
  });''' + s[i1:]

# ---- 재화 설명 · 퇴사 탭 · 안내 ----
rep('  silver: "공부 7층마다 · 전설 무기와 전설 정장에 써요",', '  silver: "공부 광산 7층마다 · 지하 문서고 이정표 · \'공부 25분\' 업무 · 무기 해금과 전설 정장에 써요",')
rep('  ame: "공부 21층마다 · 전설 무기를 여는 데 써요",', '  ame: "공부 광산 21층마다 · 문서고 · \'암송 5구절\' 업무 · 플랜 하루 분량 · 높은 등급 무기 해금과 마지막 무기 돌파에 써요",')
rep('곡괭이, 전설무기 해금, 말씀·공부 기록', '곡괭이, 무기 해금(등급), 문서고 기록, 말씀·공부 기록')
rep('  weapon: "보스를 잡아 받은 월급으로 무기와 커피를 강화해요. 자동 강화를 켜 두면 알아서 사요.",',
    '  weapon: "보스를 잡아 받은 월급으로 무기와 커피를 강화해요. 무기는 일반부터 초월까지 7등급 42개, 고급부터는 공부·말씀으로 모은 재료로 한 번 열어 두면 퇴사해도 열린 채예요.",')
rep('  ["자리 비운 동안", "앱을 닫아 두어도 12시간까지 전투와 월급이 계산돼요."],',
    '''  ["무기 등급", "일반 · 고급 · 희귀 · 에픽 · 전설 · 신화 · 초월, 등급마다 6개씩 42개예요. 고급부터는 무기마다 재료로 한 번 열고(등급 첫 무기는 관문이라 조금 더), 연 무기는 퇴사해도 열린 채예요. 마지막 무기는 5강 뒤 자수정으로 끝없이 돌파해요."],
  ["지하 문서고", "30초로 시작해요. 서류함을 한 방에 부수면 1초가 늘어(최대 30초) 계속 내려갈 수 있고, 10m마다 서류함이 단단해져요. 100m마다 월급, 이정표(500·2000·4500·8000m…)마다 은괴, 처음 닿는 1000m마다 도장과 은괴를 받아요."],
  ["자리 비운 동안", "앱을 닫아 두어도 12시간까지 전투와 월급이 계산돼요. 분노·쾌속 같은 잠깐 효과는 빼고 계산해요."],''')
# 문서고 줄 (업무 탭)
rep('''    desc: () => `30초 동안 서류함을 부수며 내려가요. 하나에 40m, 월급과 30% 확률 도장, 1000m마다 도장 2. 오늘 최고 ${S.day.depth}m`,''',
    '''    desc: () => `30초로 시작 · 한 방에 부수면 +1초 · 10m마다 단단해져요. 100m마다 월급, 이정표마다 은괴, 처음 닿는 1000m마다 도장·은괴 · 오늘 ${S.day.depth}m · 최고 ${fmtR(vaultBestGet())}m · 다음 이정표 ${fmtR(vaultNextMile(S.day.depth || 0))}m`,''')
# 보물 탭 안내
rep('50레벨마다 진 → 벼려진 → 초월 → 궁극으로 차수가 오르며 효과는 커지지만 값이 훨씬 비싸져요.</p>',
    '50레벨마다 진 → 벼려진 → 초월 → 궁극으로 차수가 오르며 효과는 커지지만 값이 훨씬 비싸져요. 궁극(200레벨)을 넘으면 50레벨마다 값이 2배가 돼요.</p>')
# 퇴사 게이지: 벽에 막혔으면 퇴사를 권함 (G-IDLE-07 리셋 힌트)
rep('''  const msg = r >= 2 ? "지금 퇴사하면 크게 늘어요!" : r >= 0.5 ? "퇴사하기 좋은 때예요" : "조금 더 올라가면 더 많이 받아요";''',
    '''  const stuck = S.auto === false && mode === "tower";
  const msg = r >= 2 ? "지금 퇴사하면 크게 늘어요!" : r >= 0.5 ? "퇴사하기 좋은 때예요" : stuck ? "벽에 막혔다면 퇴사해도 좋아요 · 도장으로 보물을 올려 더 높이" : "조금 더 올라가면 더 많이 받아요";''')

# ---- 새 안내 ----
rep('if (localStorage.getItem(SAVE_KEY + "-feel41")) return;\n    localStorage.setItem(SAVE_KEY + "-feel41", "1");',
    'if (localStorage.getItem(SAVE_KEY + "-feel42")) return;\n    localStorage.setItem(SAVE_KEY + "-feel42", "1");')
rep('''celebrateLater({ ic: "bible", title: "말씀 읽기가 한 번에", sub: "\'읽기 시작\'을 누르면 본문이 바로 열리고 시간이 세져요 · 끝까지 읽으면 저절로 체크<br>말씀 읽는 동안 공부 시간은 잠깐 멈추고, 다 읽으면 다시 켜져요", tone: "gold", ms: 5400, keep: 1 });''',
    '''celebrateLater({ ic: "weapon", title: "무기 7등급 · 밸런스 패치", sub: "일반 → 고급 → 희귀 → 에픽 → 전설 → 신화 → 초월 · 무기 42개<br>무기는 재료로 한 번 열면 퇴사해도 열린 채 · 지하 문서고는 한 방에 부수면 +1초, 100m마다 보상", tone: "rare", ms: 5600, keep: 1 });''')

open(P, 'w', encoding='utf-8').write(s)
print('patch_v42ui ok', len(s))
