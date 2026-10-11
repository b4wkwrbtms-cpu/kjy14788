"""v38: 몸 동작을 휴대폰 '동작 줄이기'와 떼어 냄(설정 '곽준영 몸 동작') · 직무 동작 미리 보기 15초 (patch_v37 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 37;', 'var GAME_V = 38;')
rep('if (localStorage.getItem(SAVE_KEY + "-feel37")) return;\n    localStorage.setItem(SAVE_KEY + "-feel37", "1");',
    'if (localStorage.getItem(SAVE_KEY + "-feel38")) return;\n    localStorage.setItem(SAVE_KEY + "-feel38", "1");')
rep('celebrateLater({ ic: "weapon", title: "직무마다 싸우는 법이 달라요", sub: "영업 전사는 붙어서 베고, 거너·마법사·소환사·저격수(새 직무)는 떨어져서 쏴요<br>대표 직무는 인사 기록에서 고르고, 다른 직무는 <b>겸직 속성</b> +20%씩", tone: "gold", ms: 4800, keep: 1 });',
    'celebrateLater({ ic: "weapon", title: "곽준영이 몸 전체로 싸워요", sub: "휴대폰 \'동작 줄이기\'가 켜져 있으면 몸 동작까지 꺼졌었어요 · 이제 그 설정은 화면 흔들림만 줄여요<br>정보 › 인사 기록에서 직무를 눌러 <b>동작 미리 보기</b>로 다섯 직무 동작을 볼 수 있어요", tone: "gold", ms: 5200, keep: 1 });')
# 미리 보기 코드는 직무 코드 뒤에
rep('/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */',
    open('part_v38.js', encoding='utf-8').read() + '\n/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */')
# 기본 공격: 미리 보기 중이면 그 직무의 공격 (피해 공식은 같음)
rep('function jobStrike(st, crit) {\n  const j = curJob(); if (!j || !mon || mon.dying) return false;',
    'function jobStrike(st, crit) {\n  const pv = typeof jobPreviewId === "function" ? jobPreviewId() : "", j = (pv && jobById(pv)) || curJob(); if (!j || !mon || mon.dying) return false;')
# 마법사 마무리 번개도 늘 보이게 (화면이 흔들리는 게 아님)
rep('    if (sky && !reduceMotion) jvAdd("chain",', '    if (sky) jvAdd("chain",')
# 맞은 몬스터가 밀리고 찌그러지는 것도 몸 동작 설정을 따름 (휴대폰 동작 줄이기와 따로)
rep('''  mon.red = 1; mon.flash = heavy ? 1 : 0.6;
  if (!reduceMotion) {
    mon.kb = Math.min(1.8, mon.kb + (heavy ? (crit ? 1.5 : 1) : 0.4));''', '''  mon.red = 1; mon.flash = heavy ? 1 : 0.6;
  if (feelBodyK() > 0) {
    mon.kb = Math.min(1.8, mon.kb + (heavy ? (crit ? 1.5 : 1) : 0.4));''')
# ---- 설정 › 화면: '곽준영 몸 동작' (기본 · 약하게 · 끄기) ----
rep('function fxSet() { if (!S.fx || typeof S.fx !== "object") S.fx = { shake: 1, flash: 1 }; return S.fx; }',
    'function fxSet() { if (!S.fx || typeof S.fx !== "object") S.fx = { shake: 1, flash: 1 }; if (S.fx.body == null) S.fx.body = 1; return S.fx; }')
rep('    + seg("shake", "화면 흔들림") + seg("flash", "번쩍임") + uiSegRow()\n',
    '    + seg("shake", "화면 흔들림") + seg("flash", "번쩍임") + seg("body", "곽준영 몸 동작") + uiSegRow()\n')
rep('    const f = fxSet(), fs = rdFs(), k = [f.shake, f.flash, fs, uiZoom()].join("|"); if (menuUI.k.scr === k) return; menuUI.k.scr = k;',
    '    const f = fxSet(), fs = rdFs(), k = [f.shake, f.flash, f.body, fs, uiZoom()].join("|"); if (menuUI.k.scr === k) return; menuUI.k.scr = k;')
rep('''    const note = $("stFxNote"); if (note) note.textContent = (reduceMotion ? "휴대폰의 '동작 줄이기'가 켜져 있어 흔들림은 꺼져 있어요. " : "휴대폰의 '동작 줄이기'를 켜면 흔들림이 저절로 꺼져요. ") + "번쩍임은 1초에 3번까지, 화면 가운데 일부에만 나오고 빨간 화면 전체 번쩍임은 쓰지 않아요.";''',
    '''    const note = $("stFxNote"); if (note) note.textContent = (reduceMotion ? "휴대폰의 '동작 줄이기'가 켜져 있어 흔들림은 꺼져 있어요. " : "휴대폰의 '동작 줄이기'를 켜면 흔들림이 저절로 꺼져요. ") + "곽준영 몸 동작은 그 설정과 따로 여기서 정해요(끄기 = 팔·무기만). 번쩍임은 1초에 3번까지, 화면 가운데 일부에만 나오고 빨간 화면 전체 번쩍임은 쓰지 않아요.";''')
# ---- 인사 기록: 어느 직무든 '동작 미리 보기 15초' ----
rep('''    ${!fOwn && !pend ? `<p class="cr-lock">${nxr > 0 ? `${iga(rankName(nxr))} 되면 직무를 하나 더 고를 수 있어요` : "직무 칸이 다 찼어요"}</p>` : ""}${btn}`;''',
    '''    ${!fOwn && !pend ? `<p class="cr-lock">${nxr > 0 ? `${iga(rankName(nxr))} 되면 직무를 하나 더 고를 수 있어요` : "직무 칸이 다 찼어요"}</p>` : ""}${btn}${FEEL_KIT_OF[focus.id] !== feelMainKitId() ? `<button type="button" class="btn cr-pv" data-act="preview" data-job="${focus.id}"><b>${FEEL_KITS[FEEL_KIT_OF[focus.id]].n} 동작 미리 보기</b><small>15초 동안 전투 화면에서</small></button>` : ""}`;''')
rep('''    } else if (act === "pick") openJobPick();
  });''', '''    } else if (act === "pick") openJobPick();
    else if (act === "preview") jobPreviewStart(id);
  });''')
rep('.cr-use { width: 100%; margin-top: 2px; }',
    '.cr-use { width: 100%; margin-top: 2px; }\n.cr-pv { width: 100%; min-height: 48px; margin-top: 8px; display: flex; flex-direction: column; align-items: center; gap: 2px; border-color: var(--jc, var(--edge)); }\n.cr-pv b { font-size: 15px; color: var(--jc, var(--fg)); }\n.cr-pv small { font-family: var(--body); font-size: 12px; color: var(--muted, #aab); }')
open(P, 'w', encoding='utf-8').write(s)
print('patch_v38 ok', len(s))
