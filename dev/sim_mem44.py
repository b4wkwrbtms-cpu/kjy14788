# v44 암송 일정 시뮬레이션: 100구절(5구절 × 20묶음), 하루 새 묶음 1개(앞 묶음을 한 번씩 통과해야 열림)
# 정책
#   A   = 지금 간격(1·2·4·7·15·30·60일), 회전 없음, 하루 상한 없음
#   B   = 새 간격(1·3·7·14·30·60일) + 2바퀴부터 하루 한 묶음 점검(바퀴마다 모든 구절 한 번 이상), 상한 없음
#   C   = 새 간격만(회전 없음)
#   B10 / B15 = B + 하루 복습 상한 10 / 15 (새 구절 5는 따로, 급한 것부터)
#   D   = 고정 순환: 어제 묶음 5 + 가장 오래 안 본 묶음 5 (+ 새 묶음 또는 바퀴 묶음 5)
# 기억 모형(단순 모형, 일반 관행 수준): 안정도 S(일) = 기억이 90%로 떨어지는 시간, R(t) = 0.9^(t/S)
#   처음 외운 날 S = 0.5, 통과하면 S ← S·(1.5 + 1.5·min(1, t/S)), 틀리면 S ← max(0.5, 0.4·S) 뒤 그 자리에서 다시 외워 통과
# python3 sim_mem44.py [runs] [adherence] [policies...]
import random, sys, statistics as st

RUNS = int(sys.argv[1]) if len(sys.argv) > 1 else 300
ADH = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
POL = sys.argv[3:] or ['A10', 'A', 'B', 'C', 'B15', 'B20', 'D']
DAYS = 120
INT_A = [0, 1, 2, 4, 7, 15, 30, 60]
INT_B = [0, 1, 3, 7, 14, 30, 60, 60]

def run(policy, seed):
    rnd = random.Random(seed)
    INT = INT_A if policy in ('A', 'A10') else INT_B
    rot = policy in ('B', 'B10', 'B15', 'B20', 'D')
    cap = {'B10': 10, 'B15': 15, 'B20': 20}.get(policy, 999)
    per = 2 if policy == 'A10' else 1   # A10 = 지금 게임 그대로(하루 10구절 = 두 묶음)
    N = 200 if policy == 'A10' else 100; NG = N // 5
    learned = [False] * N; s = [0] * N; due = [0] * N; S = [0.0] * N; last = [0] * N; rd = [0] * N
    sets = per; set_day = 0
    rnd_no = 1; rg = 1; rg_day = 0
    gl = [0] * (NG + 1)                     # 묶음을 마지막으로 본 날 (D)
    tests = []; secs = []; gaps = [0] * N; snap = {}
    def recall(i, d): return 0.9 ** ((d - last[i]) / S[i]) if learned[i] else 0
    def check(i, d):
        t_n = 0; sec = 0
        if not learned[i]:
            t_n += 1; sec += 90 + 40
            if rnd.random() > 0.85: t_n += 1; sec += 60
            learned[i] = True; S[i] = 0.5; s[i] = 1; due[i] = d + INT[1]; last[i] = d; rd[i] = rnd_no
            return t_n, sec
        gaps[i] = max(gaps[i], d - last[i])
        R = recall(i, d); t = d - last[i]
        t_n += 1; sec += 40
        if rnd.random() < R:
            S[i] = S[i] * (1.5 + 1.5 * min(1.0, t / S[i])); s[i] = min(7, s[i] + 1)
        else:
            t_n += 1; sec += 60
            S[i] = max(0.5, 0.4 * S[i]); s[i] = max(0, s[i] - 1); s[i] = min(7, s[i] + 1)
        due[i] = d + INT[s[i]]; last[i] = d; rd[i] = rnd_no
        return t_n, sec
    for d in range(1, DAYS + 1):
        played = rnd.random() < ADH or d == 1
        n = 0; sec = 0
        if played:
            if sets < NG and set_day != d and d > 1 and all(learned[i] for i in range(5 * (sets - per), 5 * sets)):
                sets = min(NG, sets + per); set_day = d
            if rnd_no == 1 and all(learned):
                rnd_no = 2; rg = 1; rg_day = d
            elif rot and rnd_no >= 2 and rg_day != d and all(rd[i] >= rnd_no for i in range(5 * (rg - 1), 5 * rg)):
                rg += 1; rg_day = d
                if rg > 20: rnd_no += 1; rg = 1
            todo = []
            if policy == 'D':
                cur = sets if rnd_no == 1 else rg
                yest = [g for g in range(1, 21) if gl[g] == d - 1 and g != cur]
                older = sorted([g for g in range(1, 21) if gl[g] and g != cur and g not in yest], key=lambda g: gl[g])
                pick = yest[:1] + older[:1]
                for g in pick:
                    todo += list(range(5 * (g - 1), 5 * g)); gl[g] = d
                todo += [i for i in range(5 * (cur - 1), 5 * cur) if i not in todo and (not learned[i] or rnd_no >= 2)]
                gl[cur] = d
            else:
                rev = sorted([i for i in range(N) if learned[i] and due[i] <= d], key=lambda i: (s[i], due[i], i))
                if rot and rnd_no >= 2: rev += [i for i in range(5 * (rg - 1), 5 * rg) if rd[i] < rnd_no and i not in rev]
                todo += rev[:cap]
                todo += [i for i in range(5 * sets) if not learned[i] and i not in todo]
            for i in todo:
                a, b = check(i, d); n += a; sec += b
        tests.append(n); secs.append(sec)
        if d in (20, 40, 60, 120):
            snap[d] = [recall(i, d) if learned[i] else None for i in range(N)]
    return tests, secs, snap, gaps, rnd_no

def summarize(policy):
    T = []; SEC = []; SN = {k: [] for k in (20, 40, 60, 120)}; G = []; RN = []
    for k in range(RUNS):
        t, sc, sn, g, r = run(policy, 1000 + k)
        T.append(t); SEC.append(sc); G.append(max(g)); RN.append(r)
        for d in sn: SN[d].append(sn[d])
    out = {}
    for a, b in ((1, 20), (21, 40), (41, 60), (61, 120)):
        out[f'{a}-{b}'] = (round(st.mean(st.mean(t[a - 1:b]) for t in T), 1), round(st.mean(max(t[a - 1:b]) for t in T), 1), round(st.mean(st.mean(x[a - 1:b]) for x in SEC) / 60, 1))
    for d in (20, 40, 60, 120):
        q = []
        for a, b in ((0, 25), (25, 75), (75, 100)):
            vals = [x for sn in SN[d] for x in sn[a:b] if x is not None]
            q.append(round(100 * st.mean(vals), 1) if vals else None)
        q.append(round(100 * st.mean(sum(1 for x in sn if x is not None and x < 0.7) for sn in SN[d]), 1))
        out[f'R@{d}'] = q
    out['gap'] = round(st.mean(G), 1); out['rnd'] = round(st.mean(RN), 2)
    return out

print(f'runs {RUNS} adherence {ADH} · 하루 시험 수(평균, 최대, 분) · R@일 = [앞 1~5묶음, 6~15, 16~20 평균 기억 %, 70% 아래로 잊어 가는 구절 수]')
for p in POL:
    print(p, summarize(p))
