import json, sys
names = sys.argv[1:]
G = ['일반','고급','희귀','에픽','전설','신화','초월']
RANKS = None
def load(n):
    return json.load(open(f'sim_{n}.json'))
def at(log, day):
    c = [x for x in log if x['d'] <= day]
    return c[-1] if c else None
print(f"{'profile':10} {'d14':>5} {'d56':>5} {'d100':>5} {'d150':>5} {'d240':>5} {'d365':>5} | 전설 신화 초월 | rank@150 rank@365 | wi@150")
for n in names:
    try: d = load(n)
    except Exception as e: print(n, 'ERR', e); continue
    log = d['log']
    def best(day):
        x = at(log, day); return x['best'] if x else '-'
    first = {}
    for x in log:
        g = G.index(x['gname']) if x.get('gname') in G else None
        if g is not None:
            for k in range(g+1):
                first.setdefault(k, x['d'])
    def gd(k): return first.get(k, '-')
    a150 = at(log,150) or {}; a365 = at(log,365) or {}
    print(f"{n:10} {best(14):>5} {best(56):>5} {best(100):>5} {best(150):>5} {best(240):>5} {best(365):>5} | {gd(4):>4} {gd(5):>4} {gd(6):>4} | {a150.get('rank','-'):>8} {a365.get('rank','-'):>8} | {a150.get('wi','-')}+{a150.get('wl','-')}")
