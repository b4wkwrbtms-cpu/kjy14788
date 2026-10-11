# v40 전직 공격 · 무기 색 = 스킬 색 비교 한 장 (pw_v40.js 캡처에서)
from PIL import Image, ImageDraw, ImageFont
FD='gfonts/ofl/dohyeon/DoHyeon-Regular.ttf'; FG='gfonts/ofl/gowundodum/GowunDodum-Regular.ttf'
fH=ImageFont.truetype(FD,32); fR=ImageFont.truetype(FD,24); fS=ImageFont.truetype(FG,18)
box=(280,300,1080,760); sc=0.5
CW=int((box[2]-box[0])*sc); CH=int((box[3]-box[1])*sc)
def cell(pre,k):
    return Image.open(f'feelshots/{pre}_{k:03d}.png').convert('RGB').crop(box).resize((CW,CH),Image.LANCZOS)
rows=[
 ('전직 전 (직무 없음)', (200,206,222), [('v40frookie_20',37,'올려베기: 궤적만'),('v40frookie_20',9,'내려치기: 궤적만'),('v40frookie_20',23,'돌진: 짧은 찌르기')]),
 ('영업 전직 후 (전사)', (255,213,74), [('v40fchain_20',6,'솟구치는 검기'),('v40fchain_20',19,'지면 강타'),('v40fchain_20',33,'관통 검기')]),
 ('무기 모양: 레이저 포인터', (255,90,90), [('v40fchain_16',39,'솟구치는 검기 (빨강)'),('v40fchain_16',11,'지면 강타 (빨강)'),('v40fchain_16',26,'관통 검기 (빨강)')]),
 ('스킬: 계약 성사', (140,210,255), [('v40fdeal_20',30,'블랙카드: 금빛'),('v40deal_16',30,'레이저 포인터: 빨강'),('v40fdeal_9',30,'무선 마우스: 하늘색')]),
]
LW=300; W=LW+3*(CW+10)+10; H=96+len(rows)*(CH+44)+10
sh=Image.new('RGB',(W,H),(14,17,28)); d=ImageDraw.Draw(sh)
def dtext(xy,text,fill,font):
    x,y=xy; parts=text.split('·')
    for i,p in enumerate(parts):
        d.text((x,y),p,fill=fill,font=font); x+=d.textlength(p,font=font)
        if i<len(parts)-1: r=3; cy=y+font.size*0.55; d.ellipse([x+4,cy-r,x+4+2*r,cy+r],fill=fill); x+=2*r+8
dtext((20,16),'v40 · 전직 공격 · 무기 색 = 스킬 색',(255,213,74),fH)
d.text((20,60),'같은 설정(로봇 대리 · 흔들림/번쩍임 끔 · 동작 줄이기 켬)으로 찍은 실제 게임 화면',fill=(200,206,222),font=fS)
for r,(name,col,cells) in enumerate(rows):
    y0=96+r*(CH+44)
    d.text((20,y0+CH//2-16),name,fill=col,font=fR)
    for c,(pre,k,cap) in enumerate(cells):
        x0=LW+10+c*(CW+10); sh.paste(cell(pre,k),(x0,y0)); d.text((x0+6,y0+CH+6),cap,fill=(255,230,150),font=fS)
sh.save('skill_fix_v40.png'); print(sh.size)
