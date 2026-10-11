"""v39: 무기 새 그림이 폰에서 보이게 — 무기 색 테두리 빛(전투) · 세워서 크게 그린 아이콘 · 영업 베기 색 = 무기 색 (patch_v38 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 38;', 'var GAME_V = 39;')
rep('if (localStorage.getItem(SAVE_KEY + "-feel38")) return;\n    localStorage.setItem(SAVE_KEY + "-feel38", "1");',
    'if (localStorage.getItem(SAVE_KEY + "-feel39")) return;\n    localStorage.setItem(SAVE_KEY + "-feel39", "1");')
rep('celebrateLater({ ic: "weapon", title: "곽준영이 몸 전체로 싸워요", sub: "휴대폰 \'동작 줄이기\'가 켜져 있으면 몸 동작까지 꺼졌었어요 · 이제 그 설정은 화면 흔들림만 줄여요<br>정보 › 인사 기록에서 직무를 눌러 <b>동작 미리 보기</b>로 다섯 직무 동작을 볼 수 있어요", tone: "gold", ms: 5200, keep: 1 });',
    'celebrateLater({ ic: "weapon", title: "무기 새 그림이 잘 보여요", sub: "무기 목록·카드에서 무기를 세워서 크게, 그 무기 색 빛을 둘렀어요<br>전투에서도 무기 둘레가 그 무기 색으로 빛나고, 무기 모양을 바꾸면 베기 색도 바뀌어요", tone: "gold", ms: 5200, keep: 1 });')
# 아이콘: 세워서 크게 + 무기 색 빛
rep('const weaponIcon = (i, lv, size = 40) => { const d = Math.max(1, Math.min(3, Math.round((typeof window !== "undefined" && window.devicePixelRatio) || 1))); return iconCanvas((g, s) => drawWeapon(g, i, lv, s / 2, s - 3 * d, 0.6, s / 20, 0, true), size * d); };',
    'const weaponIcon = (i, lv, size = 40) => { const d = Math.max(1, Math.min(3, Math.round((typeof window !== "undefined" && window.devicePixelRatio) || 1))); return iconCanvas((g, s) => wpnIconDraw(g, i, lv, s, false), size * d); };')
rep('function weaponBig(i, lv, css = 88) { const d = Math.max(1, Math.min(3, Math.round((typeof window !== "undefined" && window.devicePixelRatio) || 1))), s = Math.round(css * d); const c = iconCanvas(g => drawWeapon(g, i, lv, s / 2, s - 3 * d, 0.6, s / 20, 0, true), s);',
    'function weaponBig(i, lv, css = 88) { const d = Math.max(1, Math.min(3, Math.round((typeof window !== "undefined" && window.devicePixelRatio) || 1))), s = Math.round(css * d); const c = iconCanvas(g => wpnIconDraw(g, i, lv, s, true), s);')
# 성장 › 무기 카드 그림: 기기 픽셀로 · 세워서 · 초승달 색
rep('''      const c = $("wPrev").getContext("2d"); c.imageSmoothingEnabled = false; c.clearRect(0, 0, 96, 96);
      drawWeapon(c, skinIdx(), skinIdx() === i ? S.wl : 5, 48, 92, 0.5, 4.6, 0, true);''',
    '''      const cv0 = $("wPrev"), d = Math.max(1, Math.min(3, Math.round((typeof window !== "undefined" && window.devicePixelRatio) || 1))), sz = 96 * d;
      if (cv0.width !== sz) { cv0.width = sz; cv0.height = sz; }
      const c = cv0.getContext("2d"); c.imageSmoothingEnabled = false; c.clearRect(0, 0, sz, sz);
      wpnIconDraw(c, skinIdx(), skinIdx() === i ? S.wl : 5, sz, true);''')
# 영업 기본 공격의 금빛 초승달도 들고 있는 무기 색 (무기 모양을 바꾸면 베기 색이 바뀜)
rep('    jvAdd("slash", { x: x - 4, y, r: crit ? 48 : 34, ang: up ? -0.45 : 0.5, col: "#ffd54a", dur: crit ? 240 : 170, th: crit ? 15 : 9, span: 1.25, drift: 8 });',
    '    jvAdd("slash", { x: x - 4, y, r: crit ? 48 : 34, ang: up ? -0.45 : 0.5, col: typeof feelFxPal === "function" ? feelFxPal(performance.now())[1] : "#ffd54a", dur: crit ? 240 : 170, th: crit ? 15 : 9, span: 1.25, drift: 8 });')
open(P, 'w', encoding='utf-8').write(s)
print('patch_v39 ok', len(s))
