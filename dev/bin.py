# 작업용 원천 글 (사람이 읽기 쉬운 짧은 형태): bsrc/BB/CCC.json → bin/BB/CCC.txt
# 절마다  [절] 개역: …  /  WEB: …  /  원어: … (히브리어 모음·강세 부호와 헬라어 악센트는 뺌 — 글자 수 줄이기)
# python3 bin.py
import json, os, unicodedata, re
BOOKS = ["창세기","출애굽기","레위기","민수기","신명기","여호수아","사사기","룻기","사무엘상","사무엘하","열왕기상","열왕기하","역대상","역대하","에스라","느헤미야","에스더","욥기","시편","잠언",
         "전도서","아가","이사야","예레미야","예레미야애가","에스겔","다니엘","호세아","요엘","아모스","오바댜","요나","미가","나훔","하박국","스바냐","학개","스가랴","말라기",
         "마태복음","마가복음","누가복음","요한복음","사도행전","로마서","고린도전서","고린도후서","갈라디아서","에베소서","빌립보서","골로새서","데살로니가전서","데살로니가후서","디모데전서","디모데후서","디도서","빌레몬서","히브리서","야고보서",
         "베드로전서","베드로후서","요한일서","요한이서","요한삼서","유다서","요한계시록"]
def strip_marks(t):
    t = unicodedata.normalize('NFD', t)
    t = ''.join(ch for ch in t if unicodedata.category(ch) != 'Mn')
    return unicodedata.normalize('NFC', t)
tot = 0
for b in range(1, 67):
    d = f'bsrc/{b:02d}'
    os.makedirs(f'bin/{b:02d}', exist_ok=True)
    for f in sorted(os.listdir(d)):
        j = json.load(open(f'{d}/{f}', encoding='utf-8'))
        lines = [f'# {BOOKS[b-1]} {j["c"]}장 · {len(j["krv"])}절 · 문단 시작(WEB): {",".join(map(str, j["web_p"]))}']
        for i, k in enumerate(j['krv']):
            o = strip_marks(j['org'][i]) if j['org'][i] else '(원어 사본에 없는 절 — 개역한글대로 옮김)'
            lines.append(f'[{i+1}] 개역: {k}\n    WEB: {j["web"][i] or "-"}\n    원어: {o}')
        s = '\n'.join(lines) + '\n'
        open(f'bin/{b:02d}/{f[:-5]}.txt', 'w', encoding='utf-8').write(s); tot += len(s)
print('chars', tot)
