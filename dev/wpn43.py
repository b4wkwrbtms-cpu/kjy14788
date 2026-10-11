# v43 무기 24개 도구: wpn43.txt → 검사 · part_v43art.js(새 순서 66개로 WPN36 재배열) · 미리보기
# python3 wpn43.py [--js part_v43art.js] [--sheet wpn43_sheet.png] [--new wpn43_new.png]
import sys, json, re
sys.path.insert(0, '.')
from wpn42 import parse, check, render, hexrgb
from PIL import Image, ImageDraw, ImageFont

NEW = parse('wpn43.txt')
OLD = parse('wpn42.txt')           # 예전 42개 (예전 순서)
assert len(NEW) == 24 and len(OLD) == 42, (len(NEW), len(OLD))
bad = check(NEW)
print('new', len(NEW), 'problems', len(bad))
for b in bad: print('  ', b)
if bad: sys.exit(1)

# 새 순서: 0~17 그대로, 18부터는 [새 k, 예전 18+k] 쌍
def order():
    out = list(OLD[:18])
    for k in range(24):
        out.append(NEW[k]); out.append(OLD[18 + k])
    return out
ALL = order()
assert len(ALL) == 66
for j, it in enumerate(ALL[18:], 18):
    if (j - 18) % 2 == 0: assert it['n'] == j + 1, (j, it['n'], it['key'])

NAMES_NEW = ["사내 방송 확성기", "공유기 안테나 창", "금고 다이얼 철퇴", "임원 명패 도끼", "붉은 인주 철퇴", "금장 레터 오프너",
             "얼음 생수통 망치", "용암 커피포트 철퇴", "프레젠터 광선검", "자정 괘종 망치", "연봉 협상 저울봉", "별자리 조직도 지팡이",
             "해태 문진 철퇴", "백호 펀치 발톱", "현무 금고 망치", "주작 인주 부채", "청룡 결재판 언월도", "용궁 해저 케이블 삼지창",
             "새벽별 레이저 창", "영원 톱니 시계검", "성운 클라우드 지팡이", "초신성 프린터 대포", "무한 루프 뫼비우스 검", "천상 결재 왕홀"]
old_names = [x['n'] for x in json.load(open('wpn_names.json'))]
names66 = old_names[:18]
for k in range(24): names66 += [NAMES_NEW[k], old_names[18 + k]]

if '--js' in sys.argv:
    out = sys.argv[sys.argv.index('--js') + 1]
    data = [{'s': it['key'], 'm': it['rows'], 'p': it['pal'], 'vfx': it['vfx'], 'glow': it['glow']} for it in NEW]
    js = '''/* ===================== v43 무기 그림 24개: 에픽·전설·신화·초월마다 6개씩, 예전 무기 바로 앞에 끼움 → WPN36을 새 순서(66개)로 =====================
   만든 곳: wpn43.txt → wpn43.py. 예전 42개는 v36·v42 그림 그대로, 18번부터 [새 무기, 예전 무기] 차례. */
(function () {
  const NEW = ''' + json.dumps(data, ensure_ascii=False) + ''';
  NEW.forEach(D => {
    const g = D.m[WPN36_GRIP]; let a = -1, b = -1;
    for (let x = 0; x < g.length; x++) if (g[x] !== ".") { if (a < 0) a = x; b = x; }
    D.cx = (a + b) / 2;
    const cells = []; D.m.forEach((r, y) => { if (y > WPN36_GRIP - 6) return; for (let x = 0; x < r.length; x++) if (r[x] !== ".") cells.push([x, y]); });
    D.sp = [0.12, 0.55, 0.33, 0.8].map(f => cells[Math.floor(f * (cells.length - 1))] || [D.cx, 4]);
    if (D.glow) {
      let n = 0, sx = 0, sy = 0, x0 = 99, x1 = -1, y0 = 99, y1 = -1;
      D.m.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (D.glow.chars.indexOf(r[x]) >= 0) { n++; sx += x; sy += y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } });
      if (n) D.gl = { x: sx / n, y: sy / n, r: Math.max(x1 - x0, y1 - y0) / 2 + 4, c: D.glow.col };
    }
  });
  const OLD = WPN36.slice(0, 42);
  if (OLD.length !== 42 || WEAPONS.length !== 66) return;
  const ALL = OLD.slice(0, 18);
  for (let k = 0; k < 24; k++) { ALL.push(NEW[k]); ALL.push(OLD[18 + k]); }
  WPN36.length = 0; ALL.forEach(D => WPN36.push(D));
})();
'''
    open(out, 'w', encoding='utf-8').write(js)
    print('wrote', out, len(js))
    json.dump([{'n': n} for n in names66], open('wpn_names43.json', 'w'), ensure_ascii=False)

GR = [('일반', '#b9c1d6', 0, 6), ('고급', '#7fe3a0', 6, 6), ('희귀', '#6fd3ff', 12, 6), ('에픽', '#c9a6ff', 18, 12),
      ('전설', '#ffb13b', 30, 12), ('신화', '#ff6b6b', 42, 12), ('초월', '#fff09a', 54, 12)]
fN = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 14)
fT = ImageFont.truetype('gfonts/ofl/dohyeon/DoHyeon-Regular.ttf', 24)

if '--sheet' in sys.argv:          # 66개 전체: 등급마다 한 줄(12칸), 새 무기는 금색 번호
    out = sys.argv[sys.argv.index('--sheet') + 1]
    cell = 5; cw, ch = 118, (26 + 2) * cell + 46
    W = 90 + cw * 12; H = 16 + ch * len(GR)
    sh = Image.new('RGB', (W, H), (18, 21, 34)); d = ImageDraw.Draw(sh)
    for r, (gn, gc, a, n) in enumerate(GR):
        y0 = 8 + r * ch
        d.text((12, y0 + ch / 2 - 14), gn, fill=hexrgb(gc), font=fT)
        for k in range(n):
            j = a + k; it = ALL[j]; x0 = 90 + k * cw
            im = render(it, cell); sh.paste(im, (x0 + (cw - im.width) // 2, y0 + 2), im)
            new = j >= 18 and (j - 18) % 2 == 0
            nm = names66[j]
            nm = nm if d.textlength(nm, font=fN) < cw - 6 else nm[:7] + '…'
            col = (255, 214, 90) if new else (200, 206, 222)
            d.text((x0 + 4, y0 + ch - 40), f"{j + 1}{' 새' if new else ''}", fill=col, font=fN)
            d.text((x0 + 4, y0 + ch - 22), nm, fill=col, font=fN)
    sh.save(out); print('sheet', out, sh.size)

if '--new' in sys.argv:            # 새 24개만 크게 (보고용): 등급마다 6개
    out = sys.argv[sys.argv.index('--new') + 1]
    cell = 7; cw, chh = 196, 290
    Wd = cw * 6 + 40; y = 24
    sheet = Image.new('RGB', (Wd, 40 + 4 * (chh + 70)), (18, 21, 34)); d = ImageDraw.Draw(sheet)
    fN2 = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 19)
    fS = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 16)
    for gi, (gn, gc, a, n) in enumerate(GR[3:]):
        c = hexrgb(gc); tw = d.textlength(gn, font=fT)
        d.rounded_rectangle([20, y, 20 + tw + 36, y + 46], radius=23, outline=c, width=3, fill=(30, 33, 50))
        d.text((38, y + 9), gn, fill=c, font=fT)
        d.text((20 + tw + 56, y + 14), f"{a + 1}~{a + n}번 중 새 무기 6개 · 예전 무기 사이사이에", fill=(170, 178, 200), font=fS)
        y += 62
        for k in range(6):
            j = a + 2 * k; it = ALL[j]; x0 = 20 + k * cw
            d.rounded_rectangle([x0 + 4, y, x0 + cw - 4, y + chh - 8], radius=16, fill=(26, 30, 46), outline=tuple(int(v * 0.45) for v in c), width=2)
            im = render(it, cell); sheet.paste(im, (x0 + (cw - im.width) // 2, y + 6), im)
            nm = names66[j]; words = nm.split(' '); best = None
            for cut in range(1, len(words)):
                p, q = ' '.join(words[:cut]), ' '.join(words[cut:]); m = max(d.textlength(p, font=fN2), d.textlength(q, font=fN2))
                if best is None or m < best[0]: best = (m, p, q)
            lines = [nm] if (d.textlength(nm, font=fN2) < cw - 24 or not best) else [best[1], best[2]]
            ty = y + chh - 8 - 14 - 26 * len(lines)
            for ln in lines:
                lw = d.textlength(ln, font=fN2); d.text((x0 + (cw - lw) / 2, ty), ln, fill=(236, 239, 248), font=fN2); ty += 26
            d.text((x0 + 14, y + 10), str(j + 1), fill=c, font=fS)
        y += chh + 8
    sheet = sheet.crop((0, 0, Wd, y + 8)); sheet.save(out); print('new', out, sheet.size)
