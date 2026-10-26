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
rep('.rd-vers { display: flex; flex-wrap: wrap; gap: 6px; }', '.rd-vers { display: flex; flex-wrap: wrap; gap: 6px; }\n' + V45_CSS + V46_CSS)
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
p45 = open(f'{DEV}/part_v45.js', encoding='utf-8').read().replace('var MZ_VER = "45a";', 'var MZ_VER = "46b";')
p46 = open(f'{R0}/part_v46.js', encoding='utf-8').read()
XBN = [x - 1 for x in json.load(open(f'{APP}/bible/xbooks.json')) if x > 12]
assert p46.count('/*XB*/[]') == 1
p46 = p46.replace('/*XB*/[]', json.dumps(XBN))
s = s.replace(mk, p45 + '\n' + p46 + '\n' + mk)
open(f'{APP}/index.html', 'w', encoding='utf-8').write(s)
sw = subprocess.run(['git', '-C', '/home/claude/b4wkwrbtms-cpu/kjy14788', 'show', 'f1e42e3:sw.js'], capture_output=True, text=True, check=True).stdout
assert 'const CACHE = "yageun-v44";' in sw
open(f'{APP}/sw.js', 'w').write(sw.replace('const CACHE = "yageun-v44";', 'const CACHE = "yageun-v57";'))
print('built', len(s))
