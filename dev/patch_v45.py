"""v45: 성경 읽기 창 — 20대 말투(말씀 웹소설체) 본문 · 소제목 · 계보 이름 빨간 밑줄 · [20대 말투 | 개역한글] 바꾸기 (patch_v44 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:200]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 44;', 'var GAME_V = 45;')
rep('/* ===================== 성경 읽기 (개역한글, 앱 안에서) =====================',
    '/* ===================== 성경 읽기 (앱 안에서) — v45부터 part_v45.js가 20대 말투 본문 · 계보 빨간 밑줄 · 번역 바꾸기를 더함 =====================')

# ---- 모양 ----
rep('.rd-vers { display: flex; flex-wrap: wrap; gap: 6px; }',
    '.rd-vers { display: flex; flex-wrap: wrap; gap: 6px; }\n'
    '.rd-ver { display: flex; gap: 6px; margin: -6px 0 14px; position: sticky; top: -18px; z-index: 2; padding: 6px 0; background: var(--bg); }\n'
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
    '.rd-body u.lin { color: #ff8a93; text-decoration: underline; text-decoration-color: #ff3b4e; text-decoration-thickness: 2px; text-underline-offset: 3px; }')

# ---- 넣기 (스킬 이름 띠 앞) ----
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
part = open('part_v45.js', encoding='utf-8').read()
s = s.replace(mk, part + '\n' + mk)

open(P, 'w', encoding='utf-8').write(s)
print('patch_v45 ok', len(s))
