import json, sys
d = json.load(open(sys.argv[1]))
days = [1,2,3,5,7,10,14,21,28,42,56,70,84,100,120,150,180,240,300,365]
gate_day = {}
for s in d['log']:
    g = s.get('wgate', 0)
    for k in range(1, g + 1):
        gate_day.setdefault(k, s['d'])
for s in d['log']:
    if s['d'] in days:
        print(f"d{s['d']:>3} best {s['best']:>4} run {s['mf']:>4} w {s['wi']:>2}+{s['wl']} {s.get('gname',''):2} gate {s.get('wgate',0)} rank {s['rank']} ret {s['ret']:>3} stamp {s['stamp']:>9} ore {s['ore']:>6} sv {s['silver']:>4} ame {s['ame']:>4} manna {s['manna']:>5} dps 1e{s['dps']:<5} gm 1e{s['gm']:<4} sm {s['sm']:<8} tre {s['tre'].get('badge',0)}/{s['tre'].get('wallet',0)}/{s['tre'].get('review',0)} ward {s['ward']:>3} pick {s['pick']:>3} vault {s.get('vday',0)}/{s.get('vbest',0)} chap {s['chap']} st {s['studyH']}")
print("grade days:", gate_day)
wd = {}
for s2 in d['log']:
    u = s2.get('wunl', 0)
    for i in (11, 17, 23, 24, 29, 30, 35, 36, 41):
        if u >= i: wd.setdefault(i, s2['d'])
print("weapon unlock days:", wd)
L = d.get('led', {})
tot = {}
for src, v in L.items():
    for k, x in v.items(): tot.setdefault(k, {})[src] = round(x)
for k in ('stamp','ore','silver','ame','manna'):
    if k in tot: print(k, sorted(tot[k].items(), key=lambda z: -z[1]))
