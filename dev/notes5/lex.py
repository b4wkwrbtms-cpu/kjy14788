#!/usr/bin/env python3
"""원어 사전·고유명사 찾기 (STEPBible-Data, Tyndale House, CC BY 4.0 — 웹 검색 대신 먼저 쓴다)
사용: python3 /home/claude/bw/lex/lex.py H0430        Strong 번호(히브리어 H, 헬라어 G; 4자리 0 채움 자동)
      python3 /home/claude/bw/lex/lex.py H0430 full   + 전체 LSJ(헬라어만) 항목
      python3 /home/claude/bw/lex/lex.py name Hosea    고유명사(TIPNR: 인물·지명, 족보·모든 주소)
출처 표기: "STEPBible TBESH(축약 BDB) H0430" / "STEPBible TBESG(Abbott-Smith) G0026" / "STEPBible TIPNR"
"""
import sys, re, glob
L = '/home/claude/data_src/STEPBible-Data/Lexicons/'
P = glob.glob('/home/claude/data_src/STEPBible-Data/Proper Nouns/*TIPNR*.txt')[0]
def norm(k):
    m = re.match(r'([HGhg])0*(\d+)([A-Za-z]?)', k); return f'{m.group(1).upper()}{int(m.group(2)):04d}{m.group(3)}' if m else k
a = sys.argv[1:]
if not a: print(__doc__); sys.exit()
if a[0] == 'name':
    q = ' '.join(a[1:]).lower(); txt = re.split(r'\n\$=+ ?(?:PERSON\(s\)|PLACE|OTHER)[^\n]*\n', open(P, encoding='utf-8').read())
    hits = [b for b in txt if b.split('@', 1)[0].strip().lower() == q][:6] or [b for b in txt if q in b.split('\n', 1)[0].lower()][:4]
    for b in hits: print('$' + b.strip()[:3000]); print('-' * 40)
    if not hits: print('없음')
    sys.exit()
k = norm(a[0]); f = glob.glob(L + ('*TBESH*' if k[0] == 'H' else '*TBESG*'))[0]
for line in open(f, encoding='utf-8'):
    if line.startswith(k + '\t') or line.startswith(k[:5] + '\t') or (len(k) == 5 and re.match(k + r'[A-Z]?\t', line)):
        p = line.rstrip('\n').split('\t'); print(' | '.join(x for x in p[:7] if x)); print('  뜻:', re.sub(r'<[^>]+>', ' ', p[7] if len(p) > 7 else '')[:2500]); print()
if len(a) > 1 and a[1] == 'full' and k[0] == 'G':
    for f in glob.glob(L + '*TFLSJ*'):
        for line in open(f, encoding='utf-8'):
            if line.startswith(k): print(re.sub(r'<[^>]+>', ' ', line)[:6000]); break
