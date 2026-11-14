# 켈러 원고 두 묶음 → 설교별 JSON (글자는 손대지 않고 구조만 뽑음)
# python3 -I kparse.py SRC_DIR OUT_DIR
# 블록 종류: p 문단 · q 봉독/인용 · h2 작은 제목 · sp 화자 표시 · qq 질문 · em 원고에서 굵게 한 줄 · li 목록 한 줄
import sys, os, re, json, glob
import docx

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
NOTE_RE = re.compile(r'^\s*\**\s*\[?주\s?(\d+)\]?\s*[.·]?\s*(.*)$')
SPK = {'질문', '팀 켈러', '사회자', '켈러', '청중', '진행자'}


def clean_md(t):
    t = t.replace('\\', '') if '\\' in t else t
    return t.strip()


def strip_bold(t):
    return re.sub(r'\*\*(.+?)\*\*', r'\1', t)


def notes_from(appx):
    """부록 블록에서 '주 n' 항목을 모음 → {n: {h, t}}"""
    notes = {}
    cur = None
    for sec in appx:
        for b in sec['b']:
            t = strip_bold(b['t'])
            m = NOTE_RE.match(t)
            if m and (b['k'] == 'h2' or len(t) > 0):
                n = int(m.group(1)); rest = m.group(2).strip()
                if b['k'] == 'h2':
                    cur = notes.setdefault(n, {'h': rest, 't': ''})
                    continue
                # 'title. text' 한 문단 형식
                mm = re.match(r'^(.{1,60}?)[.。]\s+(.*)$', rest)
                h, body = (mm.group(1), mm.group(2)) if mm else ('', rest)
                notes[n] = {'h': h, 't': body}; cur = None
                continue
            if cur is not None and b['k'] in ('p', 'li', 'q'):
                cur['t'] = (cur['t'] + '\n' + t).strip() if cur['t'] else t
            elif b['k'] == 'h2':
                cur = None
        cur = None
    return notes


def parse_md(path, no):
    L = open(path, encoding='utf-8').read().split('\n')
    title = en = ''; meta = {}; guide = []; secs = []; appx = []
    mode = 'head'; cur = None; buf = []
    def flush():
        nonlocal buf
        if buf and cur is not None:
            txt = ' '.join(x.strip() for x in buf).strip()
            if txt: cur['b'].append({'k': 'q' if buf[0].lstrip().startswith('>') else 'p', 't': txt})
        buf = []
    is_one = no == 1
    for raw in L:
        line = raw.rstrip()
        if line.startswith('# '):
            flush(); h = line[2:].strip()
            if not title and not is_one:
                title = re.sub(r'^팀 켈러 제\d+편\s*·\s*', '', h); mode = 'meta'; continue
            if is_one and h.startswith('팀 켈러 원고 전체 구성'): mode = 'head'; continue
            if is_one and h.startswith('제1편'):
                title = re.sub(r'^제1편\s*·\s*', '', h); mode = 'body'; cur = None; continue
            if h.endswith('전문'): mode = 'body'; cur = None; continue
            mode = 'appx'; cur = {'h': h, 'b': []}; appx.append(cur); continue
        if line.startswith('## ') or line.startswith('### '):
            flush(); h = line.lstrip('#').strip()
            if is_one and mode in ('head', 'guide', 'skip'):
                mode = 'guide' if '읽기 안내' in h else 'skip'; continue
            if mode in ('meta', 'guide', 'toc', 'head'):
                mode = 'guide' if h == '읽기 안내' or h.endswith('읽기 안내') else ('toc' if h == '차례' else ('guide' if is_one and mode != 'body' else mode))
                if is_one and h.startswith('3. 제1편 읽기 안내'): mode = 'guide'
                elif is_one and mode == 'guide' and not h.endswith('읽기 안내'): mode = 'skip'
                continue
            if mode == 'body':
                if line.startswith('### '): cur['b'].append({'k': 'h2', 't': h}); continue
                cur = {'h': h, 'b': []}; secs.append(cur); continue
            if mode == 'appx':
                cur = {'h': h, 'b': []}; appx.append(cur); continue
            continue
        s = line.strip()
        if mode == 'meta':
            if not s: continue
            m = re.match(r'^\*\*(.+)\*\*$', s)
            if m and not en: en = m.group(1).strip(); continue
            m = re.match(r'^([^:：]{1,16})\s*[:：]\s*(.+)$', s)
            if m: meta[m.group(1).strip()] = m.group(2).strip()
            continue
        if mode == 'guide':
            if s: guide.append(strip_bold(clean_md(s)))
            continue
        if mode in ('toc', 'skip', 'head'): continue
        if s == '---': continue
        if cur is None and is_one and mode == 'body' and re.match(r'^\*\*팀 켈러 ·', s):
            parts = [x.strip() for x in s.strip('*').split('·')]
            if len(parts) >= 3: en = parts[1]; meta['본문'] = parts[2]
            continue
        if cur is None:
            if mode == 'body' and s: cur = {'h': '', 'b': []}; secs.append(cur)
            else: continue
        if not s:
            flush(); continue
        if s.startswith('>'):
            if buf and not buf[0].lstrip().startswith('>'): flush()
            t = s.lstrip('>').strip()
            if t: buf.append('>' + t if not buf else t)
            continue
        if buf and buf[0].lstrip().startswith('>'): flush()
        if s.startswith('- ') or re.match(r'^\d+\.\s', s) and mode == 'appx':
            flush(); cur['b'].append({'k': 'li', 't': strip_bold(clean_md(s[2:] if s.startswith('- ') else s))}); continue
        m = re.match(r'^\*\*(.+)\*\*$', s)
        if m and mode == 'body' and is_one and not secs:
            parts = [x.strip() for x in m.group(1).split('·')]
            if len(parts) >= 3: en = parts[1]; meta['본문'] = parts[2]
            continue
        if m and mode == 'body':
            flush(); t = m.group(1).strip()
            cur['b'].append({'k': 'sp' if t.rstrip(':：') in SPK else 'em', 't': t.rstrip(':：') if t.rstrip(':：') in SPK else t}); continue
        buf.append(clean_md(s))
    flush()
    for sec in secs:
        for b in sec['b']:
            if b['k'] == 'q': b['t'] = b['t'].lstrip('>').strip()
            b['t'] = clean_md(b['t'])
            if b['k'] == 'p':
                m = re.match(r'^\*\*(.{1,12}?)[:：]?\*\*\s*(.*)$', b['t'])
                if m and m.group(1).strip() in SPK:
                    b['sp'] = m.group(1).strip(); b['t'] = m.group(2)
                b['t'] = strip_bold(b['t'])
    meta = {k: strip_bold(v) for k, v in meta.items()}
    return {'title': title, 'en': strip_bold(en), 'sub': '', 'meta': meta, 'guide': guide, 'secs': secs, 'appx': appx}


def parse_docx(path):
    d = docx.Document(path)
    cover = d.tables[0].rows[0].cells[0].text.split('\n') if d.tables else []
    cover = [c.strip() for c in cover if c.strip()]
    # 표지: 팀 켈러 설교 원고 / TIM KELLER / NN / 한국어 제목(여러 줄) / 영어 제목(여러 줄) / 부제 / …
    ko, enl, sub = [], [], ''
    stage = 0
    for c in cover[2:]:
        if stage == 0:
            if re.match(r'^[A-Za-z]', c): stage = 1
            else: ko.append(c); continue
        if stage == 1:
            if re.match(r'^[A-Za-z0-9 ,.:;\'’&?!-]+$', c): enl.append(c); continue
            stage = 2; sub = c; break
    title = ' '.join(ko); en = ' '.join(enl)
    guide = []; secs = []; appx = []; mode = 'front'; cur = None
    APPX_H1 = ('교정', '자료 확인', '이번 통합', '확인한 자료', '편별 진행')
    for p in d.paragraphs:
        st = p.style.name; t = p.text.strip()
        if st == 'Front':
            if t == '읽기 안내': mode = 'guide'
            elif t == '차례': mode = 'toc'
            else: mode = 'appx'; cur = {'h': t, 'b': []}; appx.append(cur)
            continue
        if st == 'Heading 1':
            if any(t.startswith(a) for a in APPX_H1):
                mode = 'appx'; cur = {'h': t, 'b': []}; appx.append(cur); continue
            if mode in ('front', 'guide', 'toc', 'body'):
                mode = 'body'; cur = {'h': t, 'b': []}; secs.append(cur); continue
            cur = {'h': t, 'b': []}; appx.append(cur); continue
        if not t: continue
        if mode == 'guide':
            if st in ('Guide', 'Normal', 'SmallK'): guide.append(t)
            continue
        if mode in ('toc', 'front'): continue
        if cur is None: continue
        if st == 'Heading 2' or st == 'Heading 3': k = 'h2'
        elif st == 'QuoteK': k = 'q'
        elif st == 'SpeakerK': k = 'sp'
        elif st == 'QuestionK': k = 'qq'
        elif st == 'Note': k = 'note' if mode == 'body' else 'p'
        else:
            bold = bool(p.runs) and all((r.bold or not r.text.strip()) for r in p.runs)
            if bold and t in SPK: k = 'sp'
            elif bold and len(t) < 90 and mode == 'body': k = 'em'
            else: k = 'p'
        cur['b'].append({'k': k, 't': t})
    return {'title': title, 'en': en, 'sub': sub, 'meta': {}, 'guide': guide, 'secs': secs, 'appx': appx}


MAN = {}
for mf in glob.glob(os.path.join(os.path.dirname(SRC.rstrip('/')), 'in', '*', '*', 'MANIFEST.json')):
    for c in json.load(open(mf))['chapters']: MAN[c['n']] = c
out = []
for f in sorted(glob.glob(os.path.join(SRC, 'K1_*.md'))):
    no = int(re.search(r'K1_(\d+)', f).group(1)); r = parse_md(f, no)
    r.update(id='k1-%02d' % no, col=1, no=no); out.append(r)
for f in sorted(glob.glob(os.path.join(SRC, 'TK*_review.docx'))):
    no = int(re.search(r'TK(\d+)', f).group(1)); r = parse_docx(f)
    m = MAN.get(no)
    if m:
        joined = r['title'].replace(' ', ''); tt = m['title'].replace(' ', '')
        r['sub'] = r['sub'] if not joined.startswith(tt) or joined == tt else r['title'][len(r['title']) - (len(joined) - len(tt)) - (r['title'].count(' ') - m['title'].count(' ')) :].strip()
        if re.sub(r'\s','',r['sub']) == re.sub(r'\s','',m['scripture']) and re.search(r'\d', m['scripture']): r['sub'] = ''
        r['title'] = m['title']; r['en'] = m['english']; r['meta'] = {'본문': m['scripture']}
    r.update(id='k2-%02d' % no, col=2, no=no); out.append(r)
for r in out:
    r['ref'] = next((v for k, v in r['meta'].items() if '본문' in k), '')
    r['notes'] = notes_from(r['appx'])
    used = set(int(x) for s in r['secs'] for b in s['b'] for x in re.findall(r'\[주\s?(\d+)\]', b['t']))
    r['chk'] = {'secs': len(r['secs']), 'blocks': sum(len(s['b']) for s in r['secs']),
                'chars': sum(len(re.sub(r'\s', '', b['t'])) for s in r['secs'] for b in s['b']),
                'notes': len(r['notes']), 'marks': len(used), 'missing_notes': sorted(used - set(r['notes']))}
    json.dump(r, open(os.path.join(OUT, r['id'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(r['id'], '|', r['title'][:24], '|', r['en'][:30], '|', r['meta'].get('본문', ''), '|', r['chk'])
