# 해설 카드 1,067개를 구조화 (종류·제목·요약·원어 낱말·펼침 블록·출처)
import json, re
from lxml import html as LH
B = open('/home/claude/renewal/body.html', encoding='utf-8').read()
doc = LH.fromstring(B)
def T(e): return re.sub(r'\s+', ' ', e.text_content()).strip() if e is not None else ''
def terms(el):
    out = []
    for tp in el.xpath('.//span[contains(@class,"term-pair")]'):
        he = tp.xpath('./bdi'); sm = tp.xpath('./small')
        rd = sm[0].xpath('./b') if sm else []; mn = sm[0].xpath('./span') if sm else []
        out.append([T(he[0]) if he else '', T(rd[0]) if rd else '', T(mn[0]) if mn else ''])
    return out
def links(el):
    return [[T(a), a.get('href')] for a in el.xpath('.//a[@href]') if (a.get('href') or '').startswith('http')]
notes = {}
for art in doc.xpath('//article[contains(@class,"word-note-entry")]'):
    nid = art.get('id', '')[len('wordnote-'):]
    for x in art.xpath('.//span[contains(@class,"note-context")]'): x.getparent().remove(x)
    for x in art.xpath('.//p[contains(@class,"note-navigation")]'): x.getparent().remove(x)
    n = {'id': nid, 'k': art.get('data-note-kind'), 'badge': T(art.xpath('./span[contains(@class,"note-kind-badge")]')[0]) if art.xpath('./span[contains(@class,"note-kind-badge")]') else '',
         'loc': T(art.xpath('./p[contains(@class,"word-note-location")]')[0]) if art.xpath('./p[contains(@class,"word-note-location")]') else '',
         'title': T(art.xpath('./h3')[0]) if art.xpath('./h3') else art.get('data-title', ''),
         'brief': T(art.xpath('./p[contains(@class,"reader-brief")]')[0]) if art.xpath('./p[contains(@class,"reader-brief")]') else '',
         'terms': terms(art.xpath('./div[contains(@class,"term-glosses")]')[0]) if art.xpath('./div[contains(@class,"term-glosses")]') else [],
         'blocks': [], 'src': [], 'srcnote': ''}
    # 머리 쪽 기타 p (brief 외)
    extra = [T(p) for p in art.xpath('./p') if not set((p.get('class') or '').split()) & {'word-note-location', 'reader-brief'}]
    if extra: n['blocks'].append({'s': '', 'items': [{'h': '', 'p': [e for e in extra if e], 'src': [], 'terms': [], 'form': ''}]})
    for d in art.xpath('./details'):
        cls = d.get('class') or ''
        summ = T(d.xpath('./summary')[0]) if d.xpath('./summary') else ''
        if 'word-note-sources' in cls:
            n['src'] = links(d); ps = [T(p) for p in d.xpath('./p')]; n['srcnote'] = ' '.join(ps); continue
        items = []; cur = {'h': '', 'p': [], 'src': [], 'terms': [], 'form': ''}
        def flush():
            global cur
        for e in d.iter():
            if e is d or e.tag == 'summary' or (e.getparent() is not None and e.getparent().tag == 'summary'): continue
            tag = e.tag; c = e.get('class') or ''
            if tag == 'h4':
                if cur['p'] or cur['terms'] or cur['h']: items.append(cur)
                cur = {'h': T(e), 'p': [], 'src': [], 'terms': [], 'form': ''}
            elif tag == 'div' and 'term-glosses' in c:
                cur['terms'] += terms(e)
            elif tag == 'p':
                if 'source-line' in c or 'layer-evidence' in c: cur['src'] += links(e)
                elif 'grammar-form' in c: cur['form'] = T(e)
                elif e.xpath('ancestor::div[contains(@class,"term-glosses")]'): pass
                else:
                    t = T(e)
                    if t: cur['p'].append(t)
            elif tag == 'li':
                cur['src'] += links(e)
        if cur['p'] or cur['terms'] or cur['h']: items.append(cur)
        n['blocks'].append({'s': summ, 'items': items})
    notes[nid] = n
json.dump(notes, open('/home/claude/renewal/ex/notes_raw.json', 'w'), ensure_ascii=False)
import collections
print(len(notes), collections.Counter(n['k'] for n in notes.values()))
tot = sum(len(n['brief']) + sum(len(p) for b in n['blocks'] for it in b['items'] for p in it['p']) for n in notes.values())
print('text chars', tot)
print(json.dumps(notes['bg-things-001'], ensure_ascii=False)[:1500])
