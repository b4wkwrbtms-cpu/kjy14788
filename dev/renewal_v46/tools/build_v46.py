import json
"""배포된 v44 index.html 에 v45(20대 말투·계보) → v46(장 안내·대화 이름표·해설·원어 메모·이야기 흐름) 입히기
python3 build_v46.py  →  app/index.html, app/sw.js 갱신"""
import sys, re
R0 = '/home/claude/renewal'; DEV = '/home/claude/b4wkwrbtms-cpu/kjy14788/dev'
APP = f'{R0}/app'
import subprocess
s = subprocess.run(['git', '-C', '/home/claude/b4wkwrbtms-cpu/kjy14788', 'show', 'f1e42e3:index.html'], capture_output=True, text=True, check=True).stdout
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

# ---------- v45 (patch_v45.py 와 같은 내용) ----------
rep('var GAME_V = 44;', 'var GAME_V = 46;')
rep('/* ===================== 성경 읽기 (개역한글, 앱 안에서) =====================',
    '/* ===================== 성경 읽기 (앱 안에서) — v45 part_v45.js: 20대 말투 본문·계보 빨간 밑줄·번역 바꾸기 / v46 part_v46.js: 장 안내·대화 이름표·해설·원어 메모·이야기 흐름 =====================')
V45_CSS = ('.rd-ver { display: flex; gap: 6px; margin: -6px 0 14px; position: sticky; top: -18px; z-index: 2; padding: 6px 0; background: var(--bg); }\n'
    '.rd-ver button { flex: 1; font: inherit; font-size: 13px; line-height: 1.2; padding: 8px 0; border-radius: 10px; border: 1px solid var(--line); background: transparent; color: var(--muted); }\n'
    '.rd-ver button.on { background: var(--manna); border-color: var(--manna); color: var(--manna-ink); font-weight: 700; }\n'
    '.rd-note { font-size: 13px; line-height: 1.5; color: var(--muted); margin: 0 0 12px; }\n'
    '.rd-body p.mz { margin: 0 0 1.05em; }\n'
    '.rd-body p.mz .ln { display: block; margin: 0 0 .42em; }\n'
    '.rd-body p.mz .ln:last-child { margin-bottom: 0; }\n'
    '.rd-body p.mz .ln.sup-t { font-size: .8em; color: var(--muted); letter-spacing: .02em; }\n'
    '.rd-body h4.rd-h { font-size: .86em; font-weight: 800; color: var(--manna); margin: 1.5em 0 .8em; line-height: 1.4; display: flex; align-items: center; gap: 8px; }\n'
    '.rd-body h4.rd-h::after { content: ""; flex: 1; height: 1px; background: var(--line); }\n'
    '.rd-body h4.rd-h:first-of-type { margin-top: .4em; }\n'
    '.rd-body u.lin { color: #ff8a93; text-decoration: underline; text-decoration-color: #ff3b4e; text-decoration-thickness: 2px; text-underline-offset: 3px; }\n')
V46_CSS = '''/* v46 읽기 창 */
.rd-ver .rd-opbtn { flex: 0 0 auto; padding: 8px 14px; }
.rd-ver .rd-opbtn.on { border-color: var(--ore); color: var(--ore); }
.rd-ops { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 0 0 16px; }
.rd-op { text-align: left; font: inherit; padding: 9px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--panel); color: var(--muted); line-height: 1.3; cursor: pointer; }
.rd-op b { display: block; font-size: 14px; color: var(--fg); font-weight: 700; }
.rd-op small { display: block; font-size: 11.5px; margin-top: 2px; }
.rd-op.on { border-color: var(--manna); background: #142a22; }
.rd-op.on b::after { content: " ✓"; color: var(--manna); }
.rd-legend { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px 12px; margin: 2px 0 0; font-size: 12.5px; line-height: 1.4; }
.rd-legend span::before { content: "●"; margin-right: 3px; }
.rd-legend .k-person { color: #8fc0ff; } .rd-legend .k-place { color: #7fe0a6; } .rd-legend .k-hebrew { color: #c9a8ff; } .rd-legend .k-culture { color: #e6b57e; } .rd-legend .lg-lin { color: #ff8a93; }
.rd-cx { border: 1px solid var(--line); border-left: 3px solid var(--manna); border-radius: 10px; padding: 10px 12px; margin: 0 0 18px; background: var(--panel); font-size: 14px; line-height: 1.6; }
.rd-cx small { display: block; font-size: 11.5px; color: var(--muted); }
.rd-cx b { display: block; font-size: 16.5px; margin: 1px 0 4px; color: var(--fg); }
.rd-cx p { margin: 0; color: #c6cfe2; }
.rd-cx p + p { margin-top: 4px; }
.rd-body .sp-lab { display: block; font-size: .7em; line-height: 1.35; color: var(--muted); margin: .7em 0 .15em; letter-spacing: .01em; }
.rd-body .sp-lab b { color: var(--manna); font-weight: 700; }
.rd-body .sp-lab .sp-ar { margin: 0 5px; opacity: .65; }
.rd-body .sp-lab i { font-style: normal; font-size: .92em; border: 1px solid var(--line); border-radius: 6px; padding: 0 5px; margin-left: 5px; }
.rd-body p.mz .sp-lab:first-child { margin-top: 0; }
.rd-body a.nl { color: inherit; text-decoration: underline dotted; text-decoration-color: #7886ab; text-decoration-thickness: 1.5px; text-underline-offset: 4px; cursor: pointer; -webkit-tap-highlight-color: rgba(168,240,198,.18); }
.rd-body.rd-col a.nl.k-person { color: #a9cdff; text-decoration-color: #8fc0ff; }
.rd-body.rd-col a.nl.k-place { color: #9be8b9; text-decoration-color: #7fe0a6; }
.rd-body.rd-col a.nl.k-hebrew { color: #d5bcff; text-decoration-color: #c9a8ff; }
.rd-body.rd-col a.nl.k-culture { color: #ecc390; text-decoration-color: #e6b57e; }
.rd-body a.nl.lin { color: #ff8a93; text-decoration: underline solid; text-decoration-color: #ff3b4e; text-decoration-thickness: 2px; text-underline-offset: 3px; }
.rd-body sup.vn-t { cursor: pointer; padding: 0 2px; border-radius: 4px; }
.rd-body sup.vn-t.has { color: #c9a8ff; }
.rd-body sup.vn-t.has::after { content: "·"; margin-left: 1px; }
.rd-body.rd-wide { line-height: 2.25; }
.rd-fold { border: 1px dashed #3a4870; border-radius: 12px; padding: 12px; margin: 6px 0 18px; background: #121a2c; font-size: 14px; line-height: 1.6; }
.rd-fold-top { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
.rd-fold-cat { color: var(--ore); }
.rd-fold-t { display: block; font-size: 16px; margin: 3px 0 6px; }
.rd-fold-l p { margin: 0 0 4px; color: #c6cfe2; }
.rd-fold-l b { font-size: 11.5px; color: var(--muted); margin-right: 6px; font-weight: 700; }
.rd-fold-note { display: block; font-size: 11.5px; color: var(--muted); margin: 6px 0 10px; }
.rd-fold-btn { width: 100%; }
.rd-fold-close { display: block; width: 100%; font: inherit; font-size: 12.5px; color: var(--muted); background: transparent; border: 1px dashed var(--line); border-radius: 10px; padding: 6px 8px; margin: 4px 0 12px; cursor: pointer; }
.rd-allnt { margin: 22px 0 4px; border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; background: var(--panel); font-size: 14px; }
.rd-allnt summary { cursor: pointer; color: var(--fg); font-weight: 700; }
.nt-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.nt-chip { font: inherit; font-size: 13px; line-height: 1.2; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--line); background: var(--panel-2); color: var(--fg); cursor: pointer; }
.nt-chip::before { content: "●"; font-size: 9px; margin-right: 5px; vertical-align: 2px; }
.nt-chip.k-person::before { color: #8fc0ff; } .nt-chip.k-place::before { color: #7fe0a6; } .nt-chip.k-hebrew::before { color: #c9a8ff; } .nt-chip.k-culture::before { color: #e6b57e; }
.rd-sheet { position: fixed; inset: 0; z-index: 60; display: flex; flex-direction: column; justify-content: flex-end; }
.rd-sheet[hidden] { display: none !important; }
.rd-sh-bg { position: absolute; inset: 0; background: rgba(4, 7, 15, .64); }
.rd-sh-card { position: relative; max-height: 84vh; display: flex; flex-direction: column; background: var(--bg); border-top: 1px solid var(--line); border-radius: 18px 18px 0 0; padding: 16px 16px calc(12px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -12px 32px rgba(0, 0, 0, .45); }
.rd-sh-body { overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; font-size: 15.5px; line-height: 1.72; padding: 0 2px 8px; word-break: keep-all; -webkit-user-select: text; user-select: text; }
.rd-sh-back { margin-top: 8px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.rd-sh-back small { font-family: var(--body); font-size: 12px; color: var(--muted); }
.rd-sh-body h3 { font-family: var(--display); font-weight: 400; font-size: 22px; margin: 4px 0 6px; }
.rd-sh-body h4 { font-size: 14.5px; margin: 14px 0 4px; color: var(--manna); }
.rd-sh-body p { margin: 0 0 8px; }
.nt-head { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted); }
.nt-badge { font-size: 12px; border-radius: 6px; padding: 1px 7px; border: 1px solid var(--line); color: var(--fg); }
.nt-badge.k-person { border-color: #8fc0ff; color: #a9cdff; } .nt-badge.k-place { border-color: #7fe0a6; color: #9be8b9; } .nt-badge.k-hebrew { border-color: #c9a8ff; color: #d5bcff; } .nt-badge.k-culture { border-color: #e6b57e; color: #ecc390; }
.nt-brief { font-size: 16px; color: var(--fg); }
.tms { display: flex; flex-direction: column; gap: 6px; margin: 6px 0 10px; }
.tm { display: flex; align-items: center; gap: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 8px 12px; }
.tm bdi { font-family: "SBL Hebrew", "Ezra SIL", "Noto Serif Hebrew", "Times New Roman", serif; font-size: 22px; line-height: 1.3; color: var(--fg); flex-shrink: 0; }
.tm small { display: flex; flex-direction: column; font-size: 13px; line-height: 1.35; color: var(--muted); min-width: 0; }
.tm small b { color: var(--fg); font-size: 14px; }
.nt-bl { border-top: 1px solid var(--line); padding: 8px 0 2px; }
.nt-bl summary { cursor: pointer; font-weight: 700; color: var(--fg); padding: 2px 0 6px; }
.nt-form { font-size: 13px; color: var(--ore); }
.nt-src, .nt-cap { font-size: 12.5px; color: var(--muted); }
.nt-src a, .nt-srcs a { color: var(--ore); }
.nt-srcs { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; }
.he-verse { font-family: "SBL Hebrew", "Ezra SIL", "Noto Serif Hebrew", "Times New Roman", serif; font-size: 24px; line-height: 1.9; margin: 10px 0 4px; color: var(--fg); }
.vm { border-top: 1px dashed var(--line); padding-top: 8px; margin-top: 8px; }
.vref { font: inherit; color: var(--ore); background: none; border: 0; padding: 0; margin: 0; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 3px; cursor: pointer; white-space: nowrap; }
.rd-sh-prev { margin: 0 0 10px; font-size: 13.5px; padding: 6px 12px; }
.rd-sm { border: 1px solid var(--line); border-left: 3px solid #f0c674; border-radius: 12px; padding: 10px 12px; margin: 0 0 14px; }
.rd-sm small { display: block; color: var(--muted); font-size: 12.5px; margin-bottom: 6px; }
.nt-chip.k-sm::before { color: #f0c674; } .nt-badge.k-sm { border-color: #f0c674; color: #f5d48f; }
.sm-ol { margin: 0 0 8px; padding-left: 20px; } .sm-ol li { margin: 2px 0; }
.sm-q { font-size: 14px; color: var(--muted); border-left: 2px solid #f0c674; padding-left: 10px; }
.rd-body sup.sm { color: #f0c674; font-weight: 700; } .rd-body sup.sm::after { content: '•'; color: #f0c674; margin-left: 1px; }
.sm-dot { color: #f0c674; font-size: 11px; } .sm-m .nt-chip { margin-bottom: 4px; }
.sm-full { width: 100%; margin: 6px 0 10px; }
.sm-p { margin: 0 0 12px; line-height: 1.85; }
.sm-qb { margin: 8px 0 14px; padding: 8px 12px; border-left: 3px solid #f0c674; background: var(--panel); border-radius: 8px; font-size: 15px; line-height: 1.75; }
.sm-ml { display: flex; flex-wrap: wrap; gap: 4px 10px; margin: -6px 0 12px; font-size: 13px; }
.sm-pre { white-space: pre; overflow-x: auto; font-size: 11.5px; line-height: 1.5; background: var(--panel); padding: 8px; border-radius: 8px; }
.rf-v { font-size: 16.5px; line-height: 1.8; } .rf-v sup { color: var(--muted); font-size: .7em; margin-right: 2px; }
'''

# ---------- 10-26 사용자: 공부 타이머(점수) 빼고, 설교 원고를 읽으면 얻게 ----------
rep('var MENU_SUB = { bible: "읽기" };', 'var MENU_SUB = { bible: "읽기", study: "설교" };')
rep('study: ["공부한 시간만큼 광산을 파요",', 'study: ["설교 원고(장진명·유기성)를 읽은 시간만큼 광산을 파요",')
rep("""  const card = el("div", "card hero-card");
  card.innerHTML = `<input type="text" id="subj" maxlength="20" placeholder="무엇을 공부하나요? (예: 헬라어, 조직신학)">""", """  const card = el("div", "card hero-card");
  smCardBuild(card); if (0) card.innerHTML = `<input type="text" id="subj" maxlength="20" placeholder="무엇을 공부하나요? (예: 헬라어, 조직신학)">""")
rep("""  addCustom("study", card, () => {
    const St = S.study, since = St.running ? Date.now() - St.lastConfirm : 0;
    $("stClock").textContent = mm(St.sessionMs + since);
    $("stSub").textContent = St.running""", """  if (0) addCustom("study", card, () => {
    const St = S.study, since = St.running ? Date.now() - St.lastConfirm : 0;
    $("stClock").textContent = mm(St.sessionMs + since);
    $("stSub").textContent = St.running""")
rep("""  $("subj").addEventListener("input", e => { S.study.subject = e.target.value.trim(); });
  $("stStart").addEventListener("click", () => { studyStart(); updateUI(true); save(); });
  $("stOk").addEventListener("click", () => { studyConfirm(); updateUI(true); save(); });
  $("stPause").addEventListener("click", () => { studyPause(); updateUI(true); save(); });
  $("stStop").addEventListener("click", () => { studyStop(); updateUI(true); save(); });
""", "")
rep('<div class="stat"><span>오늘 공부</span><b class="num" id="mToday"></b></div><div class="stat"><span>공부 연속</span>', '<div class="stat"><span>오늘 읽기</span><b class="num" id="mToday"></b></div><div class="stat"><span>읽기 연속</span>')
rep('하루 ${STUDY_CAP}분까지, 10분 이상 공부한 날이 이어지면 연속 보너스(주일은 쉬어 가요).', '하루 ${STUDY_CAP}분까지, 설교를 10분 이상 읽은 날이 이어지면 연속 보너스(주일은 쉬어 가요). 설교 한 편을 끝까지 읽으면 처음엔 광석 60·도장 1, 다른 날 다시 읽으면 광석 15.')
V46_CSS += """.sm-li { display: block; width: 100%; text-align: left; font: inherit; padding: 9px 10px; margin: 0 0 6px; border-radius: 10px; border: 1px solid var(--line); background: var(--panel); color: var(--fg); line-height: 1.3; cursor: pointer; }
.sm-li b { display: block; font-size: 14px; font-weight: 700; }
.sm-li small { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.sm-li.done { border-color: var(--ore, #6fd3ff); }
.sm-li.done b::before { content: "✓ "; color: var(--ore, #6fd3ff); }
"""


# ---------- 10-26 사용자: 긴 글(설교 전문·해설) 가독성 — 본문용 명조, 큰 글자, 넉넉한 행간, 종이 모드, 읽은 만큼 표시 ----------
rep('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Gowun+Dodum&display=swap">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Gowun+Dodum&family=Gowun+Batang:wght@400;700&display=swap">')
V46_CSS += """/* 긴 글 읽기 모양 (10-27, 아이폰 14 Pro 기준 393pt) — 읽기 창 안에서만 쓰는 색·글꼴 변수 */
@font-face { font-family: "MaruBuri"; font-weight: 400; font-display: swap; src: url(fonts/maruburi-r.woff) format("woff"); }
@font-face { font-family: "MaruBuri"; font-weight: 600 700; font-display: swap; src: url(fonts/maruburi-sb.woff) format("woff"); }
@font-face { font-family: "NSDonghwa"; font-display: swap; src: url(fonts/donghwa.woff) format("woff"); }
@font-face { font-family: "NSKkot"; font-display: swap; src: url(fonts/kkot.woff) format("woff"); }
@font-face { font-family: "NSDahaeng"; font-display: swap; src: url(fonts/dahaeng.woff) format("woff"); }
@font-face { font-family: "NSSeongsil"; font-display: swap; src: url(fonts/seongsil.woff) format("woff"); }
@font-face { font-family: "NSMirae"; font-display: swap; src: url(fonts/mirae.woff) format("woff"); }
.rd-sheet, .reader { --rfg: #d8d5cc; --rmut: #8c9099; --rbg: #15171d; --rline: #262a33; --rq: #d8b86a; --rqbg: rgba(216, 184, 106, .07); --rbtn: #1d2027; --rhi: #e9e6de; --rtop: #171a21; }
.rd-sheet.night, .reader.night { --rfg: #c9c6bf; --rmut: #7d8088; --rbg: #000; --rline: #1c1e24; --rq: #c9ab62; --rqbg: rgba(201, 171, 98, .08); --rbtn: #121317; --rhi: #e2dfd7; --rtop: #070708; }
.rd-sheet.paper, .reader.paper { --rfg: #2b2926; --rmut: #716b62; --rbg: #f4eee3; --rline: #ddd4c4; --rq: #7f601c; --rqbg: rgba(127, 96, 28, .07); --rbtn: #ebe4d6; --rhi: #1d1b18; --rtop: #ece5d8; }
.rd-sheet.cream, .reader.cream { --rfg: #2d2b28; --rmut: #76706a; --rbg: #faf7f0; --rline: #e6dfd1; --rq: #8a6b25; --rqbg: rgba(138, 107, 37, .07); --rbtn: #f0ebe0; --rhi: #1f1d1a; --rtop: #f3eee4; }
.rd-sheet .rd-sh-card { background: var(--rbg); color: var(--rfg); max-height: 92vh; max-height: 92dvh; padding: 0 0 calc(10px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--rline); border-radius: 18px 18px 0 0; }
.rd-sheet.full .rd-sh-card { max-height: none; height: 100vh; height: 100dvh; border-radius: 0; border-top: 0; padding-top: env(safe-area-inset-top, 0px); }
.rd-sheet.full .rd-sh-bg { background: var(--rbg); }
.rd-sheet.paper .rd-sh-bg { background: rgba(24, 20, 12, .5); }
.rd-sh-top { display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 4px 8px 2px 4px; }
.rd-sh-top button { font: inherit; font-size: 15px; line-height: 1; min-height: 40px; padding: 0 12px; border: 0; border-radius: 10px; background: transparent; color: var(--rmut); cursor: pointer; }
.rd-sh-top .rd-sh-x { font-size: 16px; }
.rd-sh-top .rd-sh-aa { font-family: "MaruBuri", serif; font-weight: 600; letter-spacing: .02em; border: 1px solid var(--rline); min-width: 46px; }
.rd-sh-top button:active { color: var(--rhi); }
.rd-sh-tt { flex: 1; min-width: 0; text-align: center; font-size: 13px; line-height: 1.25; color: var(--rmut); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rd-sh-tt[data-left]::after { content: attr(data-left); display: block; font-size: 11.5px; color: var(--rq); }
.rd-sh-prog { height: 2px; background: var(--rline); margin: 0 0 2px; }
.rd-sh-prog i { display: block; height: 100%; width: 0; background: var(--rq); transition: width .12s linear; }
.rd-sh-opts { margin: 6px 12px 4px; padding: 6px 12px; border: 1px solid var(--rline); border-radius: 12px; background: var(--rbtn); font-family: var(--body); }
.rd-sh-or { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 44px; font-size: 14px; color: var(--rmut); }
.rd-sh-or + .rd-sh-or { border-top: 1px solid var(--rline); }
.rd-sh-seg { display: flex; align-items: center; gap: 4px; }
.rd-sh-seg button { font: inherit; font-size: 14px; line-height: 1; min-height: 36px; min-width: 52px; padding: 0 12px; border-radius: 9px; border: 1px solid var(--rline); background: transparent; color: var(--rmut); cursor: pointer; }
.rd-sh-seg button.on { background: var(--rq); border-color: var(--rq); color: #1b1608; font-weight: 700; }
.rd-sh-seg b { min-width: 30px; text-align: center; color: var(--rfg); font-size: 15px; }
.rd-sh-body { flex: 1; font-family: "MaruBuri", "Apple SD Gothic Neo", "Nanum Myeongjo", serif; font-weight: 400; font-size: var(--shfs, 18px); line-height: 1.9; letter-spacing: 0; color: var(--rfg); padding: 6px 20px 24px; max-width: 640px; width: 100%; margin: 0 auto; box-sizing: border-box; text-align: left; word-break: keep-all; overflow-wrap: anywhere; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.rd-sheet.f-sans .rd-sh-body { font-family: "Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", "Noto Sans KR", sans-serif; line-height: 1.8; letter-spacing: -.01em; }
.rd-sheet.f-batang .rd-sh-body { font-family: "Gowun Batang", "MaruBuri", serif; font-size: calc(var(--shfs, 18px) * 1.04); line-height: 1.9; }
.rd-sheet.f-dodum .rd-sh-body { font-family: "Gowun Dodum", "Apple SD Gothic Neo", sans-serif; font-size: calc(var(--shfs, 18px) * 1.03); line-height: 1.85; letter-spacing: 0; }
.rd-sheet.f-donghwa .rd-sh-body { font-family: "NSDonghwa", "Gowun Dodum", sans-serif; font-size: calc(var(--shfs, 18px) * 1.1); line-height: 1.8; }
.rd-sheet.f-kkot .rd-sh-body { font-family: "NSKkot", "Gowun Dodum", sans-serif; font-size: calc(var(--shfs, 18px) * 1.1); line-height: 1.8; }
.rd-sheet.f-dahaeng .rd-sh-body { font-family: "NSDahaeng", "Gowun Dodum", sans-serif; font-size: calc(var(--shfs, 18px) * 1.12); line-height: 1.8; }
.rd-sheet.f-seongsil .rd-sh-body { font-family: "NSSeongsil", "Gowun Dodum", sans-serif; font-size: calc(var(--shfs, 18px) * 1.06); line-height: 1.8; }
.rd-sheet.f-mirae .rd-sh-body { font-family: "NSMirae", "Gowun Dodum", sans-serif; font-size: calc(var(--shfs, 18px) * 1.06); line-height: 1.8; }
.rd-sheet.f-batang .rd-sh-body h3, .rd-sheet.f-batang .rd-sh-body h4, .rd-sheet.f-donghwa .rd-sh-body h3, .rd-sheet.f-kkot .rd-sh-body h3, .rd-sheet.f-dahaeng .rd-sh-body h3 { font-weight: 700; }
.rd-sh-fonts { flex-wrap: wrap; justify-content: flex-end; max-width: 72%; }
.rd-sh-fonts button { min-width: 0; padding: 0 10px; font-size: 15px; }
.rd-sh-or:has(.rd-sh-fonts) { align-items: flex-start; padding: 8px 0; }
.rd-sh-or:has(.rd-sh-fonts) > span { padding-top: 10px; }
.rd-sheet.wide .rd-sh-body { line-height: 2.15; }
.rd-sheet.wide .rd-sh-body p, .rd-sheet.wide .rd-sh-body .sm-p { margin-bottom: 1.35em; }
.rd-sh-body h3 { font-family: inherit; font-weight: 600; font-size: 1.32em; line-height: 1.4; margin: 10px 0 4px; color: var(--rhi); letter-spacing: -.01em; }
.rd-sh-body h4 { font-family: inherit; font-weight: 600; font-size: 1.08em; line-height: 1.5; margin: 2em 0 .55em; color: var(--rq); }
.rd-sh-body h4::before { content: ""; display: block; width: 28px; height: 2px; background: var(--rq); margin: 0 0 .5em; opacity: .7; }
.rd-sh-body p { margin: 0 0 1em; }
.rd-sh-body .muted, .rd-sh-body .nt-cap, .rd-sh-body .nt-src, .rd-sh-body .sm-meta { color: var(--rmut); }
.rd-sh-body .nt-cap { font-size: .78em; line-height: 1.6; }
.rd-sh-body .sm-meta { font-size: .78em; margin: 0 0 1.6em; line-height: 1.6; }
.rd-sh-body .sm-p { margin: 0 0 1.1em; }
.rd-sh-body .sm-qb { margin: .4em 0 1.3em; padding: .55em .95em; border-left: 3px solid var(--rq); background: var(--rqbg); border-radius: 0 10px 10px 0; font-size: .93em; line-height: 1.85; color: var(--rfg); }
.rd-sh-body .nt-form { color: var(--rq); font-size: .82em; }
.rd-sh-body .sm-ml { margin: -.6em 0 1.2em; gap: 6px 8px; }
.rd-sh-body .sm-ml .vref { font-family: var(--body); font-size: 12.5px; padding: 6px 9px; min-height: 32px; border-radius: 8px; background: var(--rbtn); border: 1px solid var(--rline); color: var(--rmut); }
.rd-sh-body .nt-bl { border-top-color: var(--rline); }
.rd-sh-body .nt-bl summary { color: var(--rhi); }
.rd-sh-body .vm { border-top-color: var(--rline); }
.rd-sh-body .nt-brief { color: var(--rhi); }
.rd-sh-body .sm-pre { font-size: .7em; color: var(--rmut); background: var(--rbtn); }
.rd-sh-body .rd-sh-prev { font-family: var(--body); margin: 0 0 10px; }
.rd-sheet.paper .rd-sh-body .nt-badge, .rd-sheet.paper .rd-sh-body .nt-chip, .rd-sheet.paper .rd-sh-body .vref:not(.sm-mc) { filter: saturate(.85) brightness(.75); }
.rd-sheet .rd-sh-back { margin: 6px 16px 0; width: auto; background: var(--rbtn); color: var(--rfg); border-color: var(--rline); }
.rd-sheet .rd-sh-back small { color: var(--rmut); }
.rd-sheet.full .rd-sh-back { display: none; }
.rd-sheet.tight .rd-sh-body { line-height: 1.7; }
.rd-sheet.tight .rd-sh-body p, .rd-sheet.tight .rd-sh-body .sm-p { margin-bottom: .75em; }
/* 종이 결: 아주 옅은 노이즈를 위에 한 겹 (종이·크림은 곱하기, 어두운 바탕은 소프트라이트) */
.rd-sheet.grain .rd-sh-card::before, .reader.grain::before { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 5; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.45 0 0 0 0 0.35 0 0 0 0.9 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>"); background-size: 180px 180px; opacity: .05; mix-blend-mode: soft-light; }
.rd-sheet.grain.paper .rd-sh-card::before, .rd-sheet.grain.cream .rd-sh-card::before, .reader.grain.paper::before, .reader.grain.cream::before { opacity: .55; mix-blend-mode: multiply; }
.rd-sheet .rd-sh-card { overflow: hidden; }
/* 성경 읽기 창 — 같은 변수·글꼴·바탕 */
.reader { background: var(--rbg); color: var(--rfg); }
.reader .rd-top { background: var(--rtop); border-bottom-color: var(--rline); }
.reader .rd-title b { color: var(--rhi); } .reader .rd-title small { color: var(--rmut); }
.reader .rd-x, .reader .rd-fs button, .reader .rd-top .rd-aa { background: var(--rbtn); color: var(--rfg); border: 1px solid var(--rline); }
.reader .rd-top .rd-aa { font-family: "MaruBuri", serif; font-weight: 600; font-size: 15px; border-radius: 8px; padding: 7px 10px; min-height: 36px; cursor: pointer; }
.reader .rd-top .rd-fs { display: none; }
.reader .rd-sh-opts { margin: 8px 14px 0; flex: none; max-height: 52vh; overflow-y: auto; }
.reader .rd-bot { background: var(--rtop); border-top: 1px solid var(--rline); }
.reader .rd-state { color: var(--rmut); }
.reader.paper .rd-bot .btn, .reader.cream .rd-bot .btn { background: var(--rbtn); color: var(--rfg); border-color: var(--rline); box-shadow: none; }
.reader.paper .rd-bot .btn.manna, .reader.cream .rd-bot .btn.manna { background: var(--rq); color: #fff; border-color: var(--rq); }
.reader .rd-ver { background: var(--rbg); }
.reader .rd-ver button { border-color: var(--rline); color: var(--rmut); }
.reader .rd-ver button.on { background: var(--rq); border-color: var(--rq); color: #1b1608; }
.reader.paper .rd-ver button.on, .reader.cream .rd-ver button.on { color: #fff; }
.reader .rd-body { font-family: "MaruBuri", "Apple SD Gothic Neo", "Nanum Myeongjo", serif; font-size: var(--rdfs, 18px); line-height: 1.9; color: var(--rfg); padding: 14px 20px 36px; max-width: 640px; width: 100%; margin: 0 auto; box-sizing: border-box; text-align: left; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; letter-spacing: 0; }
.reader.f-sans .rd-body { font-family: "Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", "Noto Sans KR", sans-serif; line-height: 1.8; letter-spacing: -.01em; }
.reader.f-batang .rd-body { font-family: "Gowun Batang", "MaruBuri", serif; font-size: calc(var(--rdfs, 18px) * 1.04); }
.reader.f-dodum .rd-body { font-family: "Gowun Dodum", "Apple SD Gothic Neo", sans-serif; font-size: calc(var(--rdfs, 18px) * 1.03); line-height: 1.85; }
.reader.f-donghwa .rd-body { font-family: "NSDonghwa", "Gowun Dodum", sans-serif; font-size: calc(var(--rdfs, 18px) * 1.1); line-height: 1.8; }
.reader.f-kkot .rd-body { font-family: "NSKkot", "Gowun Dodum", sans-serif; font-size: calc(var(--rdfs, 18px) * 1.1); line-height: 1.8; }
.reader.f-dahaeng .rd-body { font-family: "NSDahaeng", "Gowun Dodum", sans-serif; font-size: calc(var(--rdfs, 18px) * 1.12); line-height: 1.8; }
.reader.f-seongsil .rd-body { font-family: "NSSeongsil", "Gowun Dodum", sans-serif; font-size: calc(var(--rdfs, 18px) * 1.06); line-height: 1.8; }
.reader.f-mirae .rd-body { font-family: "NSMirae", "Gowun Dodum", sans-serif; font-size: calc(var(--rdfs, 18px) * 1.06); line-height: 1.8; }
.reader.wide .rd-body { line-height: 2.2; } .reader.tight .rd-body { line-height: 1.68; }
.reader .rd-body p.mz { margin: 0 0 1em; }
.reader .rd-body p.mz .ln { margin: 0 0 .18em; }
.reader.wide .rd-body p.mz { margin-bottom: 1.3em; } .reader.wide .rd-body p.mz .ln { margin-bottom: .35em; }
.reader.tight .rd-body p.mz { margin-bottom: .7em; } .reader.tight .rd-body p.mz .ln { margin-bottom: .08em; }
.reader .rd-body sup { font-family: inherit; font-size: .58em; font-weight: 600; color: var(--rmut); margin-right: 4px; vertical-align: .5em; }
.reader .rd-body sup.sm { color: var(--rq); } .reader .rd-body sup.sm::after { color: var(--rq); }
.reader .rd-body sup.vn-t.has { color: var(--rq); opacity: .85; }
.reader .rd-body h4.rd-h { display: block; font-family: inherit; font-weight: 600; font-size: 1.04em; line-height: 1.5; color: var(--rq); margin: 1.9em 0 .6em; }
.reader .rd-body h4.rd-h::after { display: none; }
.reader .rd-body h4.rd-h::before { content: ""; display: block; width: 28px; height: 2px; background: var(--rq); margin: 0 0 .5em; opacity: .7; }
.reader .rd-body h4.rd-h:first-of-type { margin-top: .6em; }
.reader .rd-body .sp-lab { color: var(--rmut); } .reader .rd-body .sp-lab b { color: var(--rq); } .reader .rd-body .sp-lab i { border-color: var(--rline); }
.reader .rd-body p.mz .ln.sup-t { color: var(--rmut); }
.reader .rd-body .rd-note, .reader .rd-body .muted { color: var(--rmut); }
.reader .rd-body .rd-sm { border-color: var(--rq); background: var(--rqbg); }
.reader .rd-body .rd-op { border-color: var(--rline); background: var(--rbtn); color: var(--rmut); } .reader .rd-body .rd-op b { color: var(--rfg); }
.reader.paper .rd-body a.nl, .reader.cream .rd-body a.nl { text-decoration-color: #9a8c6a; }
.reader.paper .rd-body.rd-col a.nl.k-person, .reader.cream .rd-body.rd-col a.nl.k-person { color: #2b5aa6; text-decoration-color: #2b5aa6; }
.reader.paper .rd-body.rd-col a.nl.k-place, .reader.cream .rd-body.rd-col a.nl.k-place { color: #1f7a4d; text-decoration-color: #1f7a4d; }
.reader.paper .rd-body.rd-col a.nl.k-hebrew, .reader.cream .rd-body.rd-col a.nl.k-hebrew { color: #6a3fb5; text-decoration-color: #6a3fb5; }
.reader.paper .rd-body.rd-col a.nl.k-culture, .reader.cream .rd-body.rd-col a.nl.k-culture { color: #a0561a; text-decoration-color: #a0561a; }
.reader.paper .rd-body .nt-chip, .reader.cream .rd-body .nt-chip { filter: saturate(.8) brightness(.72); }
/* 판 안의 고르기 상자 */
.rd-sh-sel { font: inherit; font-size: 14px; padding: 8px 10px; border-radius: 9px; border: 1px solid var(--rline); background: var(--rbtn); color: var(--rfg); max-width: 220px; }
.rd-sh-note { font-size: 12px; color: var(--rmut); margin: 6px 0 4px; line-height: 1.5; }
.fb-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.fb-ctl { display: flex; align-items: center; gap: 6px; flex: none; }
.fb-sel { font: inherit; font-size: 13px; padding: 6px 6px; border-radius: 8px; border: 1px solid var(--line); background: var(--panel-2); color: var(--fg); max-width: 140px; }
@media (prefers-reduced-motion: reduce) { .rd-sh-prog i { transition: none; } }
"""


# ---------- 10-27 사용자: "공부 설정 설교로 바꿨는데 연결된 건 그대로" → 화면 글 전부 '공부' → '설교 읽기'로 (타이머 공부는 없어졌음) ----------
STUDY_WORDS = [
    ('["study", "공부"]', '["study", "설교"]'),
    ("공부를 시작하면 캐기 시작해요", "설교를 읽기 시작하면 캐기 시작해요"),
    ("공부 탭 타이머로 광산을 파면", "설교 탭에서 원고를 읽어 광산을 파면"),
    ("공부 탭 타이머로 광산을 파요", "설교 탭에서 원고를 읽어 광산을 파요"),
    ("공부 탭 광산", "설교 탭 광산"),
    ("공부로 캔 광석", "설교를 읽어 캔 광석"),
    ("공부한 시간만큼", "설교를 읽은 시간만큼"),
    ("공부를 며칠 이어 하면", "설교 읽기를 며칠 이어 하면"),
    ("공부하다가 받은 선물이에요", "설교를 읽다가 받은 선물이에요"),
    ("말씀 읽고 공부하며 오르는", "말씀 읽고 설교 읽으며 오르는"),
    ("공부하며 오르는", "설교 읽으며 오르는"),
    ("말씀 읽는 동안 공부 시간은 잠깐 멈춰요 · 다 읽으면 다시 켜져요", "말씀 읽는 동안 설교 읽기 시간은 잠깐 멈춰요"),
    ("공부 타이머를 다시 켰어요", "설교 읽기 시간을 다시 재요"),
    ("주일엔 공부 연속이 쉬어 가요", "주일엔 설교 읽기 연속이 쉬어 가요"),
    ("주일 공부 쉼", "주일 설교 쉼"),
    ("공부 누적", "설교 읽기 누적"),
    ("공부 연속", "설교 읽기 연속"),
    ("공부 광산", "설교 광산"),
    ("공부 광석", "설교 광석"),
    ("공부 약 ", "설교 읽기 약 "),
    ("공부 25분", "설교 읽기 25분"), ("공부 60분", "설교 읽기 60분"), ("공부 10분", "설교 읽기 10분"), ("공부 50분", "설교 읽기 50분"), ("공부 30분", "설교 읽기 30분"),
    ("공부 중 ${", "설교 읽는 중 ${"),
    ("`공부 ${", "`설교 ${"), (">공부 ${", ">설교 ${"), ("공부 <b>", "설교 <b>"), ('chip("공부"', 'chip("설교"'),
    ("확인된 공부·암송 유지", "확인된 설교 읽기·암송 유지"),
    ("말씀·암송·공부", "말씀·암송·설교"), ("말씀·공부·암송", "말씀·설교·암송"), ("읽기·암송·공부", "읽기·암송·설교"),
    ("암송·말씀·공부", "암송·말씀·설교"), ("말씀·묵상·암송·공부", "말씀·묵상·암송·설교"), ("공부·말씀", "설교·말씀"), ("공부·암송", "설교·암송"), ("말씀·공부", "말씀·설교"),
    ("공부는 잠깐 멈추고", "설교 읽기는 잠깐 멈추고"),
    ("공부로 캐는 광석", "설교를 읽어 캐는 광석"), ("공부 새내기", "설교 새내기"), ("공부 5시간을 채웠습니다", "설교 읽기 5시간을 채웠습니다"), ("공부 200시간을 채웠습니다", "설교 읽기 200시간을 채웠습니다"),
    ("공부로 광석 150을 캐도", "설교를 읽어 광석 150을 캐도"), ("공부 탭 집중 25분마다 1장", "설교 탭에서 25분 읽을 때마다 1장"),
    ("· 공부 ${grp.s}", "· 설교 ${grp.s}"), ("· 공부 ${studyText(", "· 설교 ${studyText("),
    ('var HB_NAME = { bible: "말씀", study: "공부", mem: "암송" };', 'var HB_NAME = { bible: "말씀", study: "설교", mem: "암송" };'),
    ('{ n: "공부", v: Math.floor(st)', '{ n: "설교", v: Math.floor(st)'),
    ('["확인된 공부", ', '["확인된 설교 읽기", '),
    ("14일 동안 하루도 빠짐없이 공부했습니다", "14일 동안 하루도 빠짐없이 설교를 읽었습니다"), ("(스 7:10) · 공부 100시간", "(스 7:10) · 설교 읽기 100시간"),
    ("오늘도 말씀 한 장, 공부 한 판!", "오늘도 말씀 한 장, 설교 한 편!"),
    ("<small>말씀 읽기 · 공부 · 층 올리기</small>", "<small>말씀 읽기 · 설교 읽기 · 층 올리기</small>"),
    ("· 공부 탭에서 캐요", "· 설교 탭에서 캐요"), ("시간의 두루마리 +${n} (공부 탭)", "시간의 두루마리 +${n} (설교 탭)"),
    ("탭 차례로 열기: 공부 3층", "탭 차례로 열기: 설교 3층"),
    ('study: "공부 타이머를 켜면 설교를 읽은 시간만큼 광산을 파서 광석·은괴·자수정을 캐요. 25분마다 집중 확인.', 'study: "설교 원고를 열어 읽으면 그 시간만큼 광산을 파서 광석·은괴·자수정을 캐요. 끝까지 읽으면 광석 보너스.'),
]
for o, n in STUDY_WORDS: s = s.replace(o, n)

rep('.rd-vers { display: flex; flex-wrap: wrap; gap: 6px; }', '.rd-vers { display: flex; flex-wrap: wrap; gap: 6px; }\n' + V45_CSS + V46_CSS)
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
p45 = open(f'{DEV}/part_v45.js', encoding='utf-8').read().replace('var MZ_VER = "45a";', 'var MZ_VER = "46b";')
p46 = open(f'{R0}/part_v46.js', encoding='utf-8').read()
XBN = [x - 1 for x in json.load(open(f'{APP}/bible/xbooks.json')) if x > 12]
assert p46.count('/*XB*/[]') == 1
p46 = p46.replace('/*XB*/[]', json.dumps(XBN))
p47m = open(f'{R0}/music_v47.js', encoding='utf-8').read() + '\n' + open(f'{R0}/music_files_v47.js', encoding='utf-8').read()
s = s.replace(mk, p45 + '\n' + p46 + '\n' + p47m + '\n' + mk)
open(f'{APP}/index.html', 'w', encoding='utf-8').write(s)
sw = subprocess.run(['git', '-C', '/home/claude/b4wkwrbtms-cpu/kjy14788', 'show', 'f1e42e3:sw.js'], capture_output=True, text=True, check=True).stdout
assert 'const CACHE = "yageun-v44";' in sw
sw = sw.replace('const CACHE = "yageun-v44";', 'const CACHE = "yageun-v68";')
assert 'url.pathname.includes("/bible/")' in sw
sw = sw.replace('url.pathname.includes("/bible/")', '(url.pathname.includes("/bible/") || url.pathname.includes("/fonts/"))')  # 글꼴도 한 번 받으면 오프라인
open(f'{APP}/sw.js', 'w').write(sw)
print('built', len(s))
