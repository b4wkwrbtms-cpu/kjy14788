"""v36: 몸 전체로 휘두르기 · 무기 새 디자인 · 무기마다 이펙트 색 (patch_ui35 다음에)"""
import sys, os
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 35;', 'var GAME_V = 36;')
# 업데이트 안내 (한 번)
rep('if (localStorage.getItem(SAVE_KEY + "-feel35")) return;\n    localStorage.setItem(SAVE_KEY + "-feel35", "1");',
    'if (localStorage.getItem(SAVE_KEY + "-feel36")) return;\n    localStorage.setItem(SAVE_KEY + "-feel36", "1");')
rep('celebrateLater({ ic: "weapon", title: "타격을 새로 만들었어요", sub: "팔과 몸으로 휘두르고, 큰 한 방일수록 더 묵직해요<br>글자가 작으면 <b>설정 › 화면 › 메뉴 글자</b>", tone: "gold", ms: 4200, keep: 1 });',
    'celebrateLater({ ic: "weapon", title: "몸 전체로 휘둘러요", sub: "허리를 숙이고 뒷발을 빼며 내려쳐요<br>무기 30개를 새로 그렸고, 무기마다 이펙트 색이 달라요", tone: "gold", ms: 4200, keep: 1 });')
# ---- 무기 새 디자인: 예전 그리기는 V35 이름으로 남겨 두고(WPN36에 없을 때만 씀) part_wpn36.js가 새로 정의 ----
rep('function wPal(i, t) {', 'function wPalV35(i, t) {')
rep('function fxColor(w) { return w.p.c || w.p.a || w.p.d || "#ffd54a"; }', 'function fxColorV35(w) { return w.p.c || w.p.a || w.p.d || "#ffd54a"; }')
rep('function drawWeapon(ctx, i, lv, px, py, angle, sc, t, still) {\n  const w = WEAPONS[i], map = WSPR[w.s], pal = wPal(i, t);',
    'function drawWeaponV35(ctx, i, lv, px, py, angle, sc, t, still) {\n  const w = WEAPONS[i], map = WSPR[w.s], pal = wPalV35(i, t);')
# 목록 아이콘: 기기 픽셀로 그려 13×26 도트가 뭉개지지 않게 (보이는 크기는 CSS가 정함)
rep('const weaponIcon = (i, lv, size = 40) => iconCanvas((g, s) => drawWeapon(g, i, lv, s / 2, s - 3, 0.6, s / 20, 0, true), size);',
    'const weaponIcon = (i, lv, size = 40) => { const d = Math.max(1, Math.min(3, Math.round((typeof window !== "undefined" && window.devicePixelRatio) || 1))); return iconCanvas((g, s) => drawWeapon(g, i, lv, s / 2, s - 3 * d, 0.6, s / 20, 0, true), size * d); };')
# 이펙트 색: 무기 고유 색이 먼저 (치명타 빨강은 그대로)
rep('function slashPal(style, crit, now) {\n  if (crit) return ["#b3151b", "#ff5a3c", "#ffffff"];',
    'function slashPal(style, crit, now) {\n  if (crit) return ["#b3151b", "#ff5a3c", "#ffffff"];\n  const wv = typeof wpnVfx === "function" ? wpnVfx(style, now) : null; if (wv) return wv;   // v36: 무기마다 이펙트 색')
if os.path.exists('part_wpn36.js'):
    rep('/* ===================== 탭 ===================== */',
        open('part_wpn36.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')
open(P, 'w', encoding='utf-8').write(s)
print('patch_v36 ok', len(s))
