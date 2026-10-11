# 성경 개편 원천 묶음 만들기: 장마다 개역한글(게임 데이터) + WEB(영어, 퍼블릭 도메인) + 원어(WLC 히브리어·SBLGNT 헬라어)를
# 개역한글 절 번호(KJV 체계)에 맞춰 나란히 → bsrc/BB/CCC.json
# 원천: /home/claude/kjy14788/bible/krv/NN.json · src_bible/web/json · src_bible/morphhb/wlc(+VerseMap.xml) · src_bible/sblgnt
# python3 bsrc.py
import json, os, re, glob, sys
import xml.etree.ElementTree as ET
SB = 'src_bible'
KRV = '/home/claude/kjy14788/bible/krv'
OUT = 'bsrc'
WEBN = ['genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','ruth','1samuel','2samuel','1kings','2kings','1chronicles','2chronicles','ezra','nehemiah','esther','job','psalms','proverbs','ecclesiastes','songofsolomon','isaiah','jeremiah','lamentations','ezekiel','daniel','hosea','joel','amos','obadiah','jonah','micah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi',
        'matthew','mark','luke','john','acts','romans','1corinthians','2corinthians','galatians','ephesians','philippians','colossians','1thessalonians','2thessalonians','1timothy','2timothy','titus','philemon','hebrews','james','1peter','2peter','1john','2john','3john','jude','revelation']
WLCN = ['Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1Sam','2Sam','1Kgs','2Kgs','1Chr','2Chr','Ezra','Neh','Esth','Job','Ps','Prov','Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos','Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal']
NS = '{http://www.bibletechnologies.net/2003/OSIS/namespace}'
CANT = re.compile('[֑-ֽ֯׀׃׆]')   # 강세·악센트 기호는 빼고 모음은 둠

def krv_book(b):
    return json.load(open(f'{KRV}/{b:02d}.json', encoding='utf-8'))

def web_book(b):
    d = json.load(open(f'{SB}/web/json/{WEBN[b-1]}.json', encoding='utf-8'))
    txt, pst = {}, set(); newp = False
    for x in d:
        t = x['type']
        if t in ('paragraph start', 'stanza start'): newp = True
        if t in ('paragraph text', 'line text'):
            k = (x['chapterNumber'], x['verseNumber'])
            if newp and k not in txt: pst.add(k)
            newp = False
            txt[k] = (txt.get(k, '') + ' ' + x['value'].strip()).strip()
    return txt, pst

def vmap():
    m = {}
    root = ET.parse(f'{SB}/morphhb/wlc/VerseMap.xml').getroot()
    for v in root.iter():
        if v.tag.endswith('verse') and v.get('wlc'):
            m.setdefault(v.get('wlc'), []).append(v.get('kjv'))
    return m
VMAP = None

def heb_book(b):
    global VMAP
    if VMAP is None: VMAP = vmap()
    name = WLCN[b-1]; out = {}
    root = ET.parse(f'{SB}/morphhb/wlc/{name}.xml').getroot()
    for v in root.iter(NS + 'verse'):
        oid = v.get('osisID')
        if not oid: continue
        words = []
        for w in v.iter():
            if w.tag in (NS + 'w',):
                words.append(CANT.sub('', (w.text or '').replace('/', '')))
        text = ' '.join(x for x in words if x)
        for k in VMAP.get(oid, [oid]):
            _, c, vv = k.split('.')[:3]
            key = (int(re.sub(r'\D.*', '', c)), int(re.sub(r'\D.*', '', vv)))
            out[key] = (out.get(key, '') + ' ' + text).strip()
    return out

def grk_book(b):
    f = sorted(glob.glob(f'{SB}/sblgnt/{b + 21}-*-morphgnt.txt'))
    assert f, b
    out = {}
    for line in open(f[0], encoding='utf-8'):
        p = line.split()
        if len(p) < 4: continue
        bcv = p[0]; c, v = int(bcv[2:4]), int(bcv[4:6])
        out[(c, v)] = (out.get((c, v), '') + ' ' + p[3]).strip()
    return out

def main():
    tot = 0; miss_org = 0; miss_web = 0
    for b in range(1, 67):
        krv = krv_book(b); web, pst = web_book(b)
        org = heb_book(b) if b <= 39 else grk_book(b)
        os.makedirs(f'{OUT}/{b:02d}', exist_ok=True)
        for ci, ch in enumerate(krv, 1):
            W = [web.get((ci, vi), '') for vi in range(1, len(ch) + 1)]
            O = [org.get((ci, vi), '') for vi in range(1, len(ch) + 1)]
            miss_web += sum(1 for x in W if not x); miss_org += sum(1 for x in O if not x); tot += len(ch)
            json.dump({'b': b, 'c': ci, 'krv': ch, 'web': W, 'org': O, 'web_p': [vi for vi in range(1, len(ch) + 1) if (ci, vi) in pst]},
                      open(f'{OUT}/{b:02d}/{ci:03d}.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print('verses', tot, 'missing web', miss_web, 'missing orig', miss_org)

if __name__ == '__main__':
    main()
