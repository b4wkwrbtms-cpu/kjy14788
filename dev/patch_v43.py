"""v43: 무기 66개(에픽·전설·신화·초월 12개씩, 새 무기 24개를 예전 무기 바로 앞에) · 무기마다 다른 색 · 등급마다 쌓이는 이펙트 ·
연 무기 모양은 퇴사해도 골라 씀 · 옷장·캐릭터도 7등급(새 세트·이펙트·오라·칭호) · 다시 맞춘 밸런스 (patch_v42ui 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:200]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 42;', 'var GAME_V = 43;')

# ---- 무기 66개: 18번부터 [새 무기, 예전 무기] 차례 ----
NEW = [
  # 에픽
  ('사내 방송 확성기', 'pen', '{ a: "#d6403d", b: "#7a1f1d", c: "#f4f6fb", d: "#c9ced8", h: "#444b5c" }', 'ember', '아침 조회 때마다 울리던 그 목소리. 한 번 외치면 층 전체가 일어선다.'),
  ('공유기 안테나 창', 'pen', '{ a: "#eef1f7", b: "#9aa3b8", c: "#3bffd8", d: "#5b6274", h: "#444b5c" }', 'cosmic', '사무실 와이파이를 혼자 책임지는 안테나 셋. 하나라도 꺾이면 모두가 일을 멈춘다.'),
  ('금고 다이얼 철퇴', 'stamp', '{ a: "#5b6274", b: "#2a2e38", c: "#ffd54a", d: "#c9ced8", h: "#444b5c" }', 'gold', '번호를 아는 사람은 회장님과 경리부장뿐. 돌릴 때마다 철컥, 적이 얼어붙는다.'),
  ('임원 명패 도끼', 'club', '{ a: "#ffd54a", b: "#c9a43a", c: "#141414", d: "#fff6cf", h: "#5a3a1e" }', 'gold', '책상 위에 놓이기만 해도 회의실 공기가 바뀌는 금빛 명패.'),
  ('붉은 인주 철퇴', 'stamp', '{ a: "#c8322e", b: "#7a1a10", c: "#ff5a4a", d: "#ffd54a", h: "#3b1a0a" }', 'ember', '도장보다 먼저 눌러야 하는 붉은 인주. 한 번 찍히면 지워지지 않는다.'),
  ('금장 레터 오프너', 'sword', '{ a: "#e6eaf2", b: "#8d97b6", c: "#ffd54a", d: "#c9a43a", h: "#c9a43a" }', 'holy', '회장님 앞으로 온 편지만 여는 칼. 가까이 대기만 해도 봉투가 저절로 열린다는 소문이 있다.'),
  # 전설
  ('얼음 생수통 망치', 'stamp', '{ a: "#6fc8ff", b: "#2b7bb8", c: "#e6f9ff", d: "#3b7bd6", h: "#2a3a5a" }', 'frost', '정수기 위 20리터 생수통이 한겨울 밤 꽁꽁 얼었다. 들고 휘두를 사람은 너뿐.'),
  ('용암 커피포트 철퇴', 'stamp', '{ a: "#2a2e38", b: "#ff5a1a", c: "#ffd54a", d: "#1b1f2a", h: "#3b1a0a" }', 'flame', '야근 사흘째, 커피가 끓다 못해 용암이 되었다. 손잡이만은 아직 차갑다.'),
  ('프레젠터 광선검', 'sword', '{ a: "#f0fff4", b: "#1b1f2a", c: "#3bff6a", d: "#3bff6a", h: "#444b5c" }', 'cosmic', '다음 슬라이드를 넘기던 버튼을 길게 누르자 초록 빛날이 뻗어 나왔다.'),
  ('자정 괘종 망치', 'stamp', '{ a: "#4a2a1a", b: "#7a4a2a", c: "#fff7c2", d: "#ffd54a", h: "#2a1a4a" }', 'cosmic', '자정이 되면 열두 번 울리는 시계. 마지막 종이 울릴 때 야근의 힘이 깨어난다.'),
  ('연봉 협상 저울봉', 'cane', '{ a: "#ffd54a", b: "#c9a43a", c: "#7fe36a", d: "#2f8a3a", h: "#3a2a10" }', 'gold', '한쪽엔 성과, 한쪽엔 금화. 이 저울이 기울면 연봉도 기운다.'),
  ('별자리 조직도 지팡이', 'cane', '{ a: "#2a3a6a", b: "#4a5aa8", c: "#6fd3ff", d: "#ffffff", h: "#1a1030" }', 'cosmic', '본사 조직도를 밤하늘에 옮겨 그린 지팡이. 맨 위 별은 아직 비어 있다.'),
  # 신화
  ('해태 문진 철퇴', 'stamp', '{ a: "#c9963a", b: "#7a5a1a", c: "#d6403d", d: "#fff6cf", h: "#3b2a1a" }', 'gold', '옳고 그름을 가린다는 해태가 결재 서류를 지그시 누른다. 거짓 보고서는 통과 못 한다.'),
  ('백호 펀치 발톱', 'cane', '{ a: "#f4f6fb", b: "#1b1f2a", c: "#c9ced8", d: "#ffffff", h: "#2a2e38" }', 'frost', '서쪽을 지킨다는 흰 호랑이의 발톱. 펀치로 서류에 구멍 셋을 뚫듯 적을 꿰뚫는다.'),
  ('현무 금고 망치', 'stamp', '{ a: "#1f3a34", b: "#3f7a5a", c: "#ffd54a", d: "#3fd6a0", h: "#1a2a26" }', 'cosmic', '거북 등껍질 금고를 검은 뱀이 감싸 지킨다. 회사의 모든 비밀이 이 안에 있다.'),
  ('주작 인주 부채', 'cane', '{ a: "#e8402a", b: "#8a1a0c", c: "#ffd54a", d: "#ffe08a", h: "#3b1a0a" }', 'flame', '남쪽 하늘 붉은 새의 깃으로 만든 부채. 한 번 부치면 서류 더미가 불타오른다.'),
  ('청룡 결재판 언월도', 'sword', '{ a: "#bfe6ff", b: "#2b5ea8", c: "#3bb8ff", d: "#c9ced8", h: "#1b2a4a" }', 'frost', '동쪽의 푸른 용이 결재판에 깃들었다. 반려된 서류는 용의 비늘이 된다.'),
  ('용궁 해저 케이블 삼지창', 'cane', '{ a: "#5fd0d8", b: "#1f6a7a", c: "#ff7a8a", d: "#ffffff", h: "#0f2a3a" }', 'frost', '바다 밑 인터넷 케이블을 용왕이 삼지창으로 묶었다. 대륙 너머까지 닿는 한 방.'),
  # 초월
  ('새벽별 레이저 창', 'pen', '{ a: "#fff2b0", b: "#ffd54a", c: "#ffffff", d: "#fff09a", h: "#8a5a1a" }', 'holy', '출근길 가장 먼저 뜨는 별을 창끝에 묶었다. 어둠을 뚫는 첫 빛.'),
  ('영원 톱니 시계검', 'sword', '{ a: "#ffe8b0", b: "#c9963a", c: "#fff6cf", d: "#7a5a1a", h: "#3a2a10" }', 'gold', '멈추지 않는 톱니가 시간을 잘게 썬다. 이 검 앞에서는 마감도 늦춰진다.'),
  ('성운 클라우드 지팡이', 'cane', '{ a: "#ff8fe0", b: "#9b5cff", c: "#6fd3ff", d: "#ffffff", h: "#1a1030" }', 'cosmic', '회사 서버를 성운 속에 올려 두었다. 지팡이 끝에서 데이터가 별처럼 반짝인다.'),
  ('초신성 프린터 대포', 'stamp', '{ a: "#eef1f7", b: "#9aa3b8", c: "#ffffff", d: "#ffb13b", h: "#2a2e38" }', 'flame', '출력 버튼 한 번에 별이 터진다. 용지 걸림 따위는 없다.'),
  ('무한 루프 뫼비우스 검', 'sword', '{ a: "#e6fffa", b: "#3bb8a0", c: "#ff6bd6", d: "#6fd3ff", h: "#1a2a3a" }', 'cosmic', '앞면이 곧 뒷면인 칼날. 한 번 휘두르면 끝나지 않는 베기가 이어진다.'),
  ('천상 결재 왕홀', 'cane', '{ a: "#fff6d8", b: "#ffd54a", c: "#ff4a5a", d: "#ffffff", h: "#8a5a1a" }', 'holy', '구름 위 최종 결재권자의 왕홀. 이 도장이 찍히면 모든 문이 열린다 — 마지막 문 하나만 빼고.'),
]
assert len(NEW) == 24
a = s.index('const WEAPONS = [\n'); b = s.index('];\nconst LEG_START', a)
lines = s[a + len('const WEAPONS = [\n'):b].split('\n')
ents = []
for l in lines:
    if l.startswith('  { n:'): ents.append([l])
    elif l.startswith('    story:'): ents[-1].append(l)
assert len(ents) == 42, len(ents)
def new_entry(t):
    n, sh, p, fx, story = t
    return [f'  {{ n: "{n}", s: "{sh}", p: {p}, leg: true, fx: "{fx}",', f'    story: "{story}" }},']
GR_NAME = ['에픽', '전설', '신화', '초월']
out = []
STORY_ADD = {18: '회사의 모든 기록이 돌아가는 서버 랙. 팬 소리가 커질수록 공격도 매서워진다.',
             19: '회사 이름이 새겨진 카드. 결재만 나면 무엇이든 살 수 있다 — 영수증만 챙긴다면.'}
for k, txt in STORY_ADD.items():
    if len(ents[k]) == 1 and 'story:' not in ents[k][0]:
        assert ents[k][0].endswith(' },'), ents[k][0]
        ents[k] = [ents[k][0][:-3] + ',', f'    story: "{txt}" }},']
for e in ents[:18]: out += e
for k in range(24):
    if k % 6 == 0: out.append(f'  /* v43 {GR_NAME[k // 6]} 12개: 새 무기 · 예전 무기 차례 */')
    out += new_entry(NEW[k]); out += ents[18 + k]
s = s[:a + len('const WEAPONS = [\n')] + '\n'.join(out) + '\n' + s[b:]

# ---- 무기 힘 · 값: 에픽부터는 두 무기가 예전 한 칸 (예전 무기 +5 힘은 그대로) ----
rep('const wPower = (i, lv) => 50 * Math.pow(2.2, i) * (1 + 0.25 * (Math.min(lv, 5) - 1)) * (i === LAST_W && lv > 5 ? Math.pow(1.12, lv - 5) : 1);\nconst wBuy = i => 60 * Math.pow(3.0, i);\nconst wUp = (i, lv) => wBuy(i) * 0.3 * lv * (lv >= 5 ? Math.pow(1.18, lv - 4) : 1);',
    '''/* v43: 에픽부터 무기가 두 배(12개씩)라 한 칸 = 예전 반 칸. 예전 무기 k는 새 번호 2k−17, 지수 k+0.5 → +5 힘은 예전과 같음.
   강화 한 단계 힘·값도 반 칸에 맞춤 (+5 = x1.35 < 다음 무기 x1.48, 값은 예전 한 칸과 같은 비율) */
var WP43 = { lvK: 0.0875, upK: 0.05 };
function wExp(i) { if (i < 18) return i; const m = i - 18; return 18 + Math.floor(m / 2) + (m % 2 ? 0.5 : 0); }
function wLvK(i) { return i < 18 ? 0.25 : WP43.lvK; }
const wPower = (i, lv) => 50 * Math.pow(2.2, wExp(i)) * (1 + wLvK(i) * (Math.min(lv, 5) - 1)) * (i === LAST_W && lv > 5 ? Math.pow(1.12, lv - 5) : 1);
const wBuy = i => 60 * Math.pow(3.0, wExp(i));
const wUp = (i, lv) => wBuy(i) * (i < 18 ? 0.3 : WP43.upK) * lv * (lv >= 5 ? Math.pow(1.18, lv - 4) : 1);''')

# ---- 무기 모양(스킨): 연 무기는 퇴사해도 골라 씀 ----
rep('const skinIdx = () => (S.skin >= 0 && S.skin <= S.wi) ? S.skin : S.wi;',
    'const skinIdx = () => (S.skin >= 0 && S.skin <= Math.max(S.wi, typeof wUnl === "function" ? wUnl() : S.wi)) ? S.skin : S.wi;')
rep('S.gold -= c; S.wi = n; S.wl = 1; if (S.skin >= 0) S.skin = -1; celebrate({ icon: weaponBig(n, 1), title: wEquipTitle(n),',
    'S.gold -= c; S.wi = n; S.wl = 1; if (S.skin >= 0 && S.skin <= S.wi) S.skin = -1; celebrate({ icon: weaponBig(n, 1), title: wEquipTitle(n),')
# 무기 입자 색 = 그 무기 이펙트 색 (에픽부터 무기마다 다른 색)
rep('''// 성질 입자 (불꽃은 위로, 서리는 아래로)
    for (let s = 0; s < 6; s++) {
      const life = ((t / 700 + s / 6) % 1);
      const col = w.fx === "flame" || w.fx === "ember" ? (s % 2 ? "#ff6b3b" : "#ffd54a")''',
    '''// 성질 입자 (불꽃은 위로, 서리는 아래로) · v43: 에픽부터는 그 무기 스킬 색
    for (let s = 0; s < 6; s++) {
      const life = ((t / 700 + s / 6) % 1);
      const col = D.vfx && gradeOf(i) >= 3 ? (s % 2 ? D.vfx[1] : D.vfx[2]) : w.fx === "flame" || w.fx === "ember" ? (s % 2 ? "#ff6b3b" : "#ffd54a")''')

# ---- 무기 카드 ----
rep('$("wPow").textContent = `${WGRADES[gradeOf(i)].n} ${i % WG_SIZE + 1}/${WG_SIZE} · ${i + 1}번째 무기 · 무기 공격력 ${fmt(wPower(i, S.wl))}`;',
    '{ const gp = gradePos(i); $("wPow").textContent = `${WGRADES[gradeOf(i)].n} ${gp[0]}/${gp[1]} · ${i + 1}번째 무기 · 무기 공격력 ${fmt(wPower(i, S.wl))}`; }')
rep('sub: !over ? `강화 +${S.wl} → +${S.wl + 1} · 공격력 +${Math.round(0.25 / (1 + 0.25 * (S.wl - 1)) * 100)}%`',
    'sub: !over ? `강화 +${S.wl} → +${S.wl + 1} · 공격력 +${Math.round(wLvK(i) / (1 + wLvK(i) * (S.wl - 1)) * 100)}%`')

# ---- 무기 목록: 연 무기는 모양 바꾸기 · 지금 무기 줄에서 모양 되돌리기 ----
rep('secTitle("weapon", "무기 목록", "가진 무기는 모양만 골라 쓸 수 있어요");', 'secTitle("weapon", "무기 목록", "연 무기는 퇴사해도 모양을 골라 쓸 수 있어요");')
rep('''      if (i < S.wi || (i === S.wi && i !== LAST_W && S.wl >= 5 && S.skin >= 0)) { S.skin = (i === S.wi) ? -1 : i; toast(`${w.n} 모양으로 바꿨어요 (성능은 그대로)`); }
      else if (wLocked(i)) weaponUnlockTry(i);
      else if (i === S.wi) $("wBtn").click();
      else if (i === S.wi + 1) $("wBtn").click();''',
'''      const opened = i <= Math.max(S.wi, wUnl());
      if (i === S.wi + 1 && !wLocked(i) && S.wl >= 5 && S.wi !== LAST_W) $("wBtn").click();
      else if (i === S.wi && skinIdx() !== i) { S.skin = -1; toast(`${w.n} 모양으로 돌아왔어요`); }
      else if (i === S.wi) $("wBtn").click();
      else if (opened) { S.skin = i; toast(`${w.n} 모양으로 바꿨어요 (성능은 그대로)`); }
      else if (wLocked(i)) weaponUnlockTry(i);''')
rep('''      const key = [lv, skinIdx() === i, nextOk, lockedLeg, cost && S.gold >= cost, i <= S.wi + 1, lkI ? lkI.short : ""].join();''',
    '''      const opened = !lockedLeg && i <= wUnl(), key = [lv, skinIdx() === i, skinIdx() === S.wi, nextOk, lockedLeg, opened, cost && S.gold >= cost, i <= S.wi + 1, lkI ? lkI.short : ""].join();''')
rep('''r.ic.appendChild(i <= S.wi + 1 && !lockedLeg ? weaponIcon(i, Math.max(1, lv)) : pixIcon("lock", 22));''',
    '''r.ic.appendChild((i <= S.wi + 1 || opened) && !lockedLeg ? weaponIcon(i, Math.max(1, lv || 5)) : pixIcon("lock", 22));''')
rep('''      r.row.classList.toggle("locked", lockedLeg ? !lkI.ok : i > S.wi + 1);''',
    '''      r.row.classList.toggle("locked", lockedLeg ? !lkI.ok : i > S.wi + 1 && !opened);''')
rep('''      else if (i === S.wi) {
        if (S.wl < 5 || i === LAST_W) {''',
    '''      else if (i === S.wi && skinIdx() !== i) { b.className = "buy ghost num"; b.disabled = false; b.innerHTML = `<span class="act">이 모양으로</span><small>되돌리기</small>`; }
      else if (i === S.wi) {
        if (S.wl < 5 || i === LAST_W) {''')
rep('''      else if (lockedLeg) { b.className = "buy num rare" + (lkI.ok ? "" : " ghost");''',
    '''      else if (opened) { b.className = "buy ghost num"; b.disabled = skinIdx() === i; b.innerHTML = skinIdx() === i ? `<span class="act">착용 중</span><small>모양</small>` : `<span class="act">모양 바꾸기</span><small>열린 무기</small>`; }
      else if (lockedLeg) { b.className = "buy num rare" + (lkI.ok ? "" : " ghost");''')

# ---- 안내 문구 ----
rep('["무기 등급", "일반 · 고급 · 희귀 · 에픽 · 전설 · 신화 · 초월, 등급마다 6개씩 42개예요. 고급부터는 무기마다 재료로 한 번 열고(등급 첫 무기는 관문이라 조금 더), 연 무기는 퇴사해도 열린 채예요. 마지막 무기는 5강 뒤 자수정으로 끝없이 돌파해요."]',
    '''["무기 등급", "일반 · 고급 · 희귀는 6개씩, 에픽 · 전설 · 신화 · 초월은 12개씩 모두 66개예요. 고급부터는 무기마다 재료로 한 번 열고(등급 첫 무기는 관문이라 조금 더), 연 무기는 퇴사해도 열린 채라 모양도 골라 써요. 에픽부터는 무기마다 이펙트 색이 다르고, 등급이 오를수록 무기 둘레·타격 이펙트가 한 겹씩 늘어요. 마지막 무기는 5강 뒤 자수정으로 끝없이 돌파해요."],
  ["옷장 등급", "옷장도 무기와 같은 7등급이에요. 사는 옷은 고급·희귀는 광석, 전설·초월 총수 세트는 은괴·자수정으로 사고, 말씀 세트(신화 전신갑주·다윗, 초월 이기는 자)는 말씀·암송·공부·출근 기록이 열쇠, 강화는 만나예요. 캐릭터 이름 색도 등급이에요."]''')
rep('weapon: "보스를 잡아 받은 월급으로 무기와 커피를 강화해요. 무기는 일반부터 초월까지 7등급 42개, 고급부터는 공부·말씀으로 모은 재료로 한 번 열어 두면 퇴사해도 열린 채예요."',
    'weapon: "보스를 잡아 받은 월급으로 무기와 커피를 강화해요. 무기는 일반부터 초월까지 7등급 66개(에픽부터 12개씩), 고급부터는 공부·말씀으로 모은 재료로 한 번 열어 두면 퇴사해도 열린 채예요."')
rep('  silver: "공부 광산 7층마다 · 지하 문서고 이정표 · \'공부 25분\' 업무 · 무기 해금과 전설 정장에 써요",',
    '  silver: "공부 광산 7층마다 · 지하 문서고 이정표 · \'공부 25분\' 업무 · 옷장 도감 · 무기 해금과 전설·초월 옷에 써요",')
rep('if (localStorage.getItem(SAVE_KEY + "-feel42")) return;\n    localStorage.setItem(SAVE_KEY + "-feel42", "1");',
    'if (localStorage.getItem(SAVE_KEY + "-feel43")) return;\n    localStorage.setItem(SAVE_KEY + "-feel43", "1");')
rep('''celebrateLater({ ic: "weapon", title: "무기 7등급 · 밸런스 패치", sub: "일반 → 고급 → 희귀 → 에픽 → 전설 → 신화 → 초월 · 무기 42개<br>무기는 재료로 한 번 열면 퇴사해도 열린 채 · 지하 문서고는 한 방에 부수면 +1초, 100m마다 보상", tone: "rare", ms: 5600, keep: 1 });''',
    '''celebrateLater({ ic: "weapon", title: "무기 66개 · 옷장도 7등급", sub: "에픽 · 전설 · 신화 · 초월 무기가 12개씩 · 무기마다 다른 색 · 등급이 오를수록 이펙트가 한 겹씩<br>연 무기 모양은 퇴사해도 골라 써요 · 옷장에 전설~초월 새 세트 4종 · 이펙트 · 오라 · 칭호 · 캐릭터 3명<br>체력 바는 깎인 자국이 스르르 따라 내려와요<br>보스는 체력이 여러 줄이에요 (x5)", tone: "rare", ms: 6800, keep: 1 });''')

# ---- 옷장: 여러 재료로 사기 · 강화 값 표시 ----
rep('if (!own) L.push(it.cond ? `<span class="wd-key">열쇠</span> ${wardCondText(it)}` : `<span class="wd-key">사기</span> 공부로 캔 광석`);',
    'if (!own) L.push(it.cond ? `<span class="wd-key">열쇠</span> ${wardCondText(it)}` : `<span class="wd-key">사기</span> ${wardBuyWhere(it)}`);')
rep('if (!own && it.cost) b1 = wardBtn({ label: `광석 ${fmtR(it.cost.ore)}`, sub: "사기", ok: (S.ore || 0) >= it.cost.ore, cls: "ore", act: "buy", id: it.id });',
    'if (!own && it.cost) { const cl = wardCostLabel(it.cost); b1 = wardBtn({ label: cl.label, sub: cl.rest ? `${cl.rest} · 사기` : "사기", ok: cl.ok, cls: cl.cls, act: "buy", id: it.id }); }')
rep('b2 = wardBtn({ label: cl.label, sub: `+${e + 1} 강화${cl.silver ? ` · 은괴 ${cl.silver}` : ""}`, ok: cl.ok, cls: cl.cls, xc: "wd-enh", act: "enh", id: it.id });',
    'b2 = wardBtn({ label: cl.label, sub: `+${e + 1} 강화${cl.rest ? ` · ${cl.rest}` : ""}`, ok: cl.ok, cls: cl.cls, xc: "wd-enh", act: "enh", id: it.id });')
rep('if (it.cost) return [1, 0, it.cost.ore, 0];', 'if (it.cost) return [1, 0, wardCostOre(it.cost), 0];')
rep('next.cost ? `다음: ${escapeHtml(next.n)} · 광석 ${fmtR(next.cost.ore)}`', 'next.cost ? `다음: ${escapeHtml(next.n)} · ${wardCostText(next.cost)}`')
rep('it.cost ? `광석 ${fmtR(it.cost.ore)}으로 살 수 있어요`', 'it.cost ? `사기: ${wardCostText(it.cost)}`')

# ---- 캐릭터: 이름 색 = 등급 ----
rep('secTitle("info", "캐릭터", "말씀·공부·층·퇴사 기록으로 열려요");', 'secTitle("info", "캐릭터", "말씀·공부·층·퇴사 기록으로 열려요 · 이름 색이 등급");')
rep('const ok = charUnlocked(c); em.textContent = c.n;', 'const ok = charUnlocked(c); em.textContent = c.n; if (em.style) em.style.color = c.g ? WGRADES[c.g].c : "";')

# ---- 모양 ----
rep('.wgl-f { font-size: 12px; line-height: 1.55; margin: 4px 2px 0; }',
    '.wgl-f { font-size: 12px; line-height: 1.55; margin: 4px 2px 0; }\n'
    '.wdg-r .wgl-t b { color: var(--text, #e9edf6); font-weight: normal; }\n'
    '.wdg-m { grid-column: 1 / -1; font-size: 12px; color: var(--muted); padding: 0 2px; }')

# ---- 체력 바: 매 프레임 직접 (CSS 전환 끔) · 줄 수 표시 ----
rep('.bar > i.trail { position: absolute; left: 0; top: 0; bottom: 0; z-index: 0; background: #fff1a6; transition: width .5s ease-in .2s; }',
    '.bar > i.trail { position: absolute; left: 0; top: 0; bottom: 0; z-index: 0; background: #fff1a6; transition: width .5s ease-in .2s; }\n'
    '.bar > i#hpBar, .bar > i#hpTrail { transition: none !important; }\n'
    '.bar .hp-n { position: absolute; right: 5px; top: 50%; transform: translateY(-52%); z-index: 3; font-size: 11px; line-height: 1; font-style: italic; color: #fff; pointer-events: none; text-shadow: 0 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 -1px 0 #000; }')

# ---- 넣기 (스킬 이름 띠 앞) ----
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
art = open('part_v43art.js', encoding='utf-8').read()
part = open('part_v43.js', encoding='utf-8').read()
s = s.replace(mk, art + '\n' + part + '\n' + mk)

open(P, 'w', encoding='utf-8').write(s)
print('patch_v43 ok', len(s))
