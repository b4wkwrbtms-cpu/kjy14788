#!/usr/bin/env python3
"""새 해설 카드 자동 점검: python3 qa.py [id접두어...]  (인자 없으면 pk/에 있는 카드 전부)
- JSON 형식, 필수 키, 해요체(합니다/이다 끝맺음), term이 우리 본문 절에 있는지, 링크 카드 대상 존재, 켈러 흔적."""
import json, os, re, sys, glob
R = "/home/claude/renewal"
OUT = R + "/notes3/out"
BOUT = "/home/claude/bw/bout"
need = ["id", "k", "ref", "b", "c", "v", "term", "q", "title", "core", "body", "deep", "src"]
ids = [os.path.basename(p)[:-5] for p in glob.glob(R + "/notes5/pk/*.json")]
if len(sys.argv) > 1:
    ids = [i for i in ids if any(i.startswith(a) for a in sys.argv[1:])]
allout = set(os.path.basename(p)[:-5] for p in glob.glob(OUT + "/*.json"))
for d in ("notes2", "notes4"):
    allout |= set(os.path.basename(p)[:-5] for p in glob.glob(R + f"/{d}/out/*.json"))
verse_cache = {}
def verse(b, c, v):
    k = (b, c)
    if k not in verse_cache:
        p = f"{BOUT}/{b:02d}/{c:03d}.json"
        try: verse_cache[k] = json.load(open(p))
        except Exception: verse_cache[k] = None
    d = verse_cache[k]
    if d is None: return None
    L = d.get("v") if isinstance(d, dict) else d
    x = L[v - 1] if isinstance(L, list) and 0 < v <= len(L) else None
    if isinstance(x, dict): x = x.get("t") or x.get("text") or json.dumps(x, ensure_ascii=False)
    if isinstance(x, list): x = " ".join(map(str, x))
    return x
bad_end = re.compile(r"(합니다|습니다|이다|한다|된다|있다|없다)[.」”]?$")
done = missing = 0; probs = []
for i in sorted(ids):
    p = f"{OUT}/{i}.json"
    if not os.path.exists(p): missing += 1; continue
    done += 1
    try: o = json.load(open(p))
    except Exception as e: probs.append((i, "JSON 오류 " + str(e)[:60])); continue
    if "link" in o:
        if o["link"] not in allout: probs.append((i, "링크 대상 없음 " + o["link"]))
        continue
    miss = [k for k in need if k not in o]
    if miss: probs.append((i, "키 없음 " + ",".join(miss)))
    txt = " ".join(o.get("body", [])) + " " + " ".join(
        (d.get("t") if isinstance(d.get("t"), str) else " ".join(d.get("t", []))) for d in o.get("deep", []) if isinstance(d, dict))
    sents = re.split(r"(?<=[.?!])\s+", txt)
    hard = [s for s in sents if bad_end.search(s.strip().rstrip(".")) ]
    if len(hard) > 2: probs.append((i, f"해요체 아님 {len(hard)}문장: " + hard[0][-30:]))
    if re.search(r"켈러|Keller", json.dumps(o.get("body", []) + o.get("deep", []), ensure_ascii=False)):
        probs.append((i, "켈러 언급 — 공개 카드 금지 확인"))
    t = verse(o.get("b", 0), o.get("c", 0), o.get("v", 0))
    term = (o.get("term") or "").replace(" ", "")
    if t and term and term[:2] not in str(t).replace(" ", ""):
        probs.append((i, f"term '{o.get('term')}' 절에 안 보임"))
print(f"완료 {done} / 대상 {len(ids)} (미작성 {missing})")
for i, m in probs: print(" -", i, m)
