"""아이디 로그인 패치 (patch_att, patch_plan 다음에)"""
import sys, json, os
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:120]); sys.exit(1)
    s = s.replace(old, new)
part = open('part_cloud_tpl.js', encoding='utf-8').read()
if os.path.exists('cloud_cfg.json'):
    cfg = json.load(open('cloud_cfg.json'))
    part = part.replace('__CLOUD_URL__', cfg['url']).replace('__CLOUD_KEY__', cfg['key'])
    print('cloud config:', cfg['url'])
rep('</style>', open('css_cloud.css', encoding='utf-8').read() + '</style>', 1)
rep('/* ---------- 정보 탭 ---------- */\n(() => {\n  const card = el("div", "card hero-card");',
    part + '\n/* ---------- 정보 탭 ---------- */\n(() => {\n  buildAcctCard();\n  const card = el("div", "card hero-card");')
rep('  if (data && data.S) S = merge(data.S); else load();', '  if (data && data.S) S = merge(data.S); else load();\n  cloud.base = S.t;')
rep('  backReady = true; attWatch = dayKey(); setTimeout(backMaybeOpen, 350);', '  backReady = true; attWatch = dayKey(); setTimeout(backMaybeOpen, 350);\n  setTimeout(() => cloudSync("start", cloud.base), 800);')
rep('document.addEventListener("visibilitychange", () => { if (document.hidden) { hiddenAt = Date.now(); save(); } else { studyTick(); onResume(); updateUI(true); } });',
    'document.addEventListener("visibilitychange", () => { if (document.hidden) { hiddenAt = Date.now(); save(); cloudPush(false, true); } else { const t0 = hiddenAt; studyTick(); onResume(); updateUI(true); if (t0) cloudSync("resume", t0); } });')
# 백업을 불러오면 로그인한 계정에도 바로 올림
rep("toast(`기록을 불러왔어요. ${S.floor}층부터 이어서!`); setTimeout(backMaybeOpen, 900);",
    "toast(`기록을 불러왔어요. ${S.floor}층부터 이어서!`); setTimeout(backMaybeOpen, 900); if (acctGet()) cloudPush(true);")
open(P, 'w', encoding='utf-8').write(s)
print('cloud patched', len(s))
