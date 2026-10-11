# v37 직무별 대표 동작 미리보기 한 장 (실제 게임 화면 캡처에서 고름)
from PIL import Image, ImageDraw, ImageFont
FD = 'gfonts/ofl/dohyeon/DoHyeon-Regular.ttf'; FG = 'gfonts/ofl/gowundodum/GowunDodum-Regular.ttf'
fT, fH, fS, fC = ImageFont.truetype(FD, 38), ImageFont.truetype(FD, 30), ImageFont.truetype(FG, 19), ImageFont.truetype(FG, 18)
BOX = (200, 300, 1000, 760); SC = 0.5; CW, CH = int((BOX[2]-BOX[0])*SC), int((BOX[3]-BOX[1])*SC)
LW, PAD, CAP = 300, 10, 30
rows = [
 ('영업 · 전사', '#ffd54a', ['몬스터에 붙어서 몸으로 베기', '(지금까지의 동작)'], [('v37d_jsales', 19, '① 웅크려 예비'), ('v37d_jsales', 22, '② 올려베기'), ('v37d_jsales', 48, '③ 내려치기'), ('v37d_jsales', 78, '④ 마무리 돌진 찌르기')]),
 ('기획 · 거너', '#ff7a9a', ['뒤로 떨어져서 사격', '반동 · 총구 섬광 · 레이저'], [('v37d_jplan', 20, '① 떨어져서 겨눔'), ('v37d_jplan', 22, '② 발사 · 레이저 포인터'), ('v37d_jplan', 25, '③ 반동 → 다시 겨눔'), ('v37d_jplan', 77, '④ 마무리 3연발')]),
 ('개발 · 마법사', '#6fd3ff', ['지팡이 끝 코드 마법진', '마무리는 하늘에서 번개'], [('v37f_jdev', 15, '① 지팡이 들고 모으기'), ('v37f_jdev', 18, '② 시전 · 코드 탄'), ('v37f_jdev', 45, '③ 번개 예고 (발밑 마법진)'), ('v37f_jdev', 47, '④ 하늘에서 번개')]),
 ('인사·총무 · 소환사', '#7fe3a0', ['무기는 등에, 도장 투척', '마무리는 큰 도장이 쾅'], [('v37g_jhr', 24, '① 와인드업'), ('v37g_jhr', 28, '② 도장 투척'), ('v37g_jhr', 82, '③ 손 들어 도장 소환'), ('v37g_jhr', 88, '④ 쾅 · 인 도장 자국')]),
 ('감사 · 저격수 (새 직무)', '#ffa24a', ['무릎 꿇고 조준선 → 한 방', '3발마다 지적! 관통'], [('v37d_jaudit', 32, '① 무릎 꿇고 조준선'), ('v37d_jaudit', 35, '② 한 방 명중'), ('v37d_jaudit', 116, '③ 관통 조준 · 조준경 반짝'), ('v37d_jaudit', 122, '④ 관통 · 지적!')]),
 ('겸직 속성 예시', '#ffffff', ['대표: 기획(거너)', '겸직: 개발 · 인사 → 피해 +40%', '마무리마다 번개·인주 발동'], [('v37f_jplan+dev+hr', 17, '① 대표 직무 거너로 사격'), ('v37f_jplan+dev+hr', 66, '② 마무리에 겸직 속성 발동'), ('v37f_jplan+dev+hr', 68, '③ 번개(파랑)·인주(빨강) 피해'), ('UI', 0, '④ 인사 기록: 대표 직무 · 겸직 +20%')]),
]
W = LW + 4 * (CW + PAD) + PAD; H = 120 + len(rows) * (CH + CAP + PAD) + 20
sheet = Image.new('RGB', (W, H), (14, 17, 28)); d = ImageDraw.Draw(sheet)
ui = Image.open('uishots/job37_card.png').convert('RGB')
def dtext(xy, text, fill, font):   # 도현 글꼴엔 가운뎃점이 없어서 점은 직접 그림
    x, y = xy; parts = text.split('·'); asc = font.getbbox('가')[3]
    for i, part in enumerate(parts):
        d.text((x, y), part, fill=fill, font=font); x += d.textlength(part, font=font)
        if i < len(parts) - 1:
            r = max(2, font.size // 10); cy = y + asc * 0.55; d.ellipse([x + 4, cy - r, x + 4 + 2 * r, cy + r], fill=fill); x += 2 * r + 8
dtext((24, 20), 'v37 직무별 대표 동작 · 실제 게임 화면', (255, 213, 74), fT)
d.text((24, 72), '검사(영업)만 몬스터에 붙고, 원거리 직무는 뒤로 떨어져서 쏴요 · 대표 직무는 직접 고르고, 가진 다른 직무는 겸직 속성(피해 +20%씩 · 마무리마다 발동)', fill=(200, 206, 222), font=fS)
for r, (name, col, sub, cells) in enumerate(rows):
    y0 = 120 + r * (CH + CAP + PAD)
    dtext((24, y0 + 14), name, col, fH)
    for i, line in enumerate(sub): d.text((24, y0 + 64 + i * 28), line, fill=(200, 206, 222), font=fC)
    for c, (src, k, cap) in enumerate(cells):
        x0 = LW + PAD + c * (CW + PAD)
        if src == 'UI':
            u = ui.crop((30, 990, 1044, 1560)); u.thumbnail((CW, CH), Image.LANCZOS)
            bg = Image.new('RGB', (CW, CH), (24, 28, 46)); bg.paste(u, ((CW - u.width) // 2, (CH - u.height) // 2)); im = bg
        else:
            im = Image.open(f'feelshots/{src}_{k:03d}.png').convert('RGB').crop(BOX).resize((CW, CH), Image.LANCZOS)
        sheet.paste(im, (x0, y0)); d.rectangle([x0 - 1, y0 - 1, x0 + CW, y0 + CH], outline=(60, 66, 92))
        d.text((x0 + 6, y0 + CH + 4), cap, fill=(255, 230, 150), font=fC)
sheet.save('preview_v37.png'); print(sheet.size)
