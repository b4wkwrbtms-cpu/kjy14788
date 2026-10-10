"""v35 기둥 9: 누르기 크기·글자 크기·대비·모자란 값 글자·축하 모두 넘기기·메뉴 글자 크기 설정 (patch_feel 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('</style>', open('css_ui35.css', encoding='utf-8').read() + '</style>', 1)
rep('/* ===================== 탭 ===================== */',
    open('part_ui35.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')

# ---- 못 사는 값: 빨강 + '얼마 부족' ----
rep('    return (b.sub ? `<small>${curHTML(b.sub)}</small>` : "") + `<span class="cost">${cost}</span>`;',
    '    const short = b.ok === false ? uiShort(m ? m[1] : "원", m ? m[2] : won[1]) : "";   // v35: 색 + 글자 (U-UX-12)\n'
    '    if (short && b.sub && String(b.sub).length > 5) return `<small>${curHTML(b.sub)}</small><span class="cost">${cost}</span><small class="short low">${short}</small>`;   // 긴 설명은 남기고 아래에\n'
    '    return (short ? `<small class="short">${short}</small>` : b.sub ? `<small>${curHTML(b.sub)}</small>` : "") + `<span class="cost">${cost}</span>`;')

# 무기 단추는 ok 없이 따로 disabled를 정함 → 살 수 있는지 함께 넘김
rep('btnInner({ label: `${fmt(c)}원`, sub: S.wl < 5 ?', 'btnInner({ ok: S.gold >= c, label: `${fmt(c)}원`, sub: S.wl < 5 ?')
rep('btnInner({ label: `${fmt(c)}원`, sub: `새 무기 ${nw.n}', 'btnInner({ ok: S.gold >= c, label: `${fmt(c)}원`, sub: `새 무기 ${nw.n}')
rep('b.innerHTML = btnInner({ label: `${fmt(cost)}원`, sub: S.wl < 5 ? "강화" : "초월" })', 'b.innerHTML = btnInner({ ok: S.gold >= cost, label: `${fmt(cost)}원`, sub: S.wl < 5 ? "강화" : "초월" })')
rep('b.innerHTML = btnInner({ label: `${fmt(cost)}원`, sub: "구매" })', 'b.innerHTML = btnInner({ ok: S.gold >= cost, label: `${fmt(cost)}원`, sub: "구매" })')

# ---- 축하 카드: 남은 개수·모두 넘기기 ----
rep('<span class="celeb-tap">눌러서 닫기</span>', '<span class="celeb-tap" id="celebTap">눌러서 닫기</span><button type="button" class="celeb-all" id="celebAll" hidden></button>')
rep('  if (!celebOn) celebNext();\n', '  if (!celebOn) celebNext(); else celebMore();\n')
rep('  celebT = setTimeout(celebNext, o.ms || 2100);\n', '  celebT = setTimeout(celebNext, o.ms || 2100);\n  celebMore();\n')

# ---- 설정 › 화면: 메뉴 글자 크기 ----
rep('''  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stScrIc"></span><div><b>화면</b><small>흔들림 · 번쩍임 · 말씀 본문 글자 크기</small></div></div>`
    + seg("shake", "화면 흔들림") + seg("flash", "번쩍임")''',
    '''  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stScrIc"></span><div><b>화면</b><small>흔들림 · 번쩍임 · 글자 크기</small></div></div>`
    + seg("shake", "화면 흔들림") + seg("flash", "번쩍임") + uiSegRow()''')
rep('k = [f.shake, f.flash, fs].join("|")', 'k = [f.shake, f.flash, fs, uiZoom()].join("|")')
rep('String(+b.dataset.v === +f[b.dataset.fx])', 'String(+b.dataset.v === (b.dataset.fx === "ui" ? uiZoom() : +f[b.dataset.fx]))')
rep('if (b.dataset.fx) fxSet()[b.dataset.fx] = +b.dataset.v;', 'if (b.dataset.fx) { fxSet()[b.dataset.fx] = +b.dataset.v; if (b.dataset.fx === "ui") uiZoomApply(); }')
rep('  menuArrive();\n', '  menuArrive(); uiZoomApply(); feelArrive();\n')
# 저장: 화면 설정 정리(fxMerge)가 모르는 값은 버리므로 메뉴 글자 크기도 받게
rep('if ([0, 0.5, 1].indexOf(+f.flash) >= 0) o.flash = +f.flash; }', 'if ([0, 0.5, 1].indexOf(+f.flash) >= 0) o.flash = +f.flash; if ([1.15, 1.3].indexOf(+f.ui) >= 0) o.ui = +f.ui; }')

open(P, 'w', encoding='utf-8').write(s)
print('patch_ui35 ok', len(s))
