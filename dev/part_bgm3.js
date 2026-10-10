/* ---------- 멜로디 만들기 v3: 귀에 붙는 '훅'을 반복·변형 (10층마다 새 곡) ----------
   훅 = 한 마디짜리 리듬+음형. 숫자는 그 마디 화음의 근음에서 몇 음계 위인지 (0 근음, 2 3음, 4 5음, 7 옥타브) */
const HOOK4 = [
  [[0, 2, 4], [2, 2, 2], [4, 4, 0], [8, 2, 1], [10, 2, 2], [12, 4, 4]],
  [[0, 3, 0], [3, 1, 1], [4, 2, 2], [6, 2, 4], [8, 6, 5], [14, 2, 4]],
  [[0, 2, 7], [2, 2, 6], [4, 2, 4], [6, 2, 2], [8, 4, 4], [12, 4, 1]],
  [[0, 4, 2], [4, 2, 2], [6, 2, 4], [8, 2, 5], [10, 2, 4], [12, 4, 2]],
  [[0, 2, 0], [2, 2, 2], [4, 2, 4], [6, 2, 7], [8, 8, 6]],
  [[0, 3, 4], [3, 3, 4], [6, 2, 5], [8, 3, 4], [11, 3, 2], [14, 2, 0]],
  [[0, 2, 4], [2, 2, 4], [4, 2, 5], [6, 2, 4], [8, 2, 2], [10, 2, 0], [12, 4, 1]],
  [[0, 6, 4], [6, 2, 2], [8, 2, 1], [10, 2, 2], [12, 4, 4]],
  [[0, 2, 2], [2, 2, 1], [4, 2, 0], [6, 2, 1], [8, 4, 2], [12, 2, 4], [14, 2, 2]],
  [[0, 4, 0], [4, 4, 5], [8, 2, 4], [10, 2, 2], [12, 4, 4]],
  [[0, 2, 4], [2, 2, 7], [4, 2, 4], [6, 2, 7], [8, 2, 6], [10, 2, 4], [12, 4, 2]],
  [[0, 3, 4], [4, 2, 4], [6, 2, 5], [8, 3, 7], [12, 4, 6]],
];
const ANS4 = [
  [[0, 2, 2], [2, 2, 1], [4, 4, 0], [8, 4, 1], [12, 4, 2]],
  [[0, 4, 4], [4, 2, 2], [6, 2, 1], [8, 8, 0]],
  [[0, 2, 5], [2, 2, 4], [4, 2, 2], [6, 2, 4], [8, 8, 2]],
  [[0, 6, 1], [6, 2, 2], [8, 4, 4], [12, 4, 2]],
];
const HOOK3 = [
  [[0, 4, 4], [4, 4, 2], [8, 4, 0]],
  [[0, 6, 4], [6, 2, 5], [8, 2, 4], [10, 2, 2]],
  [[0, 2, 0], [2, 2, 2], [4, 4, 4], [8, 4, 7]],
  [[0, 4, 7], [4, 2, 6], [6, 2, 4], [8, 4, 2]],
  [[0, 8, 4], [8, 2, 2], [10, 2, 4]],
  [[0, 4, 2], [4, 4, 4], [8, 2, 5], [10, 2, 4]],
  [[0, 2, 4], [2, 2, 5], [4, 2, 4], [6, 2, 2], [8, 4, 0]],
];
const ANS3 = [[[0, 4, 2], [4, 4, 1], [8, 4, 0]], [[0, 6, 1], [6, 6, 0]], [[0, 4, 4], [4, 4, 2], [8, 4, 1]]];
const PROG_MAJ = [[1, 5, 6, 4], [6, 4, 1, 5], [1, 6, 4, 5], [4, 5, 3, 6], [1, 4, 6, 5], [1, 5, 4, 5], [4, 5, 6, 1], [1, 3, 4, 5], [2, 5, 1, 6], [1, 4, 2, 5]];
const PROG_MIN = [[1, 6, 3, 7], [1, 4, 7, 3], [6, 7, 1, 1], [1, 7, 6, 7], [1, 6, 4, 5], [4, 5, 1, 6], [1, 3, 7, 6], [6, 4, 1, 5]];
const SUB_KEY = [0, 5, -2, 3, 7], SUB_BPM = [0, 4, -4, 6, -2];
function buildSong(ti, sub = 0) {
  bgmSongs = bgmSongs || new Map();
  const id = ti * 10 + sub; if (bgmSongs.has(id)) return bgmSongs.get(id);
  const base = BGM_THEMES[ti], R = rng(1337 + ti * 7919 + sub * 104729);
  const minorish = ["minor", "dorian", "phryg", "harm"].includes(base.mode), PROGS = minorish ? PROG_MIN : PROG_MAJ;
  const pick = a => a[Math.floor(R() * a.length)];
  let key = base.key + SUB_KEY[sub % 5]; while (key > 69) key -= 12; while (key < 57) key += 12;
  const th = Object.assign({}, base, { key, bpm: base.bpm + SUB_BPM[sub % 5], prog: sub === 0 ? base.prog : [pick(PROGS), pick(PROGS)] });
  const sc = MODES[th.mode], BS = th.meter * 4, BARS = 16;
  const deg = d => th.key + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  const steps = Array.from({ length: BS * BARS }, () => []);
  const roots = []; for (let b = 0; b < BARS; b++) roots.push(th.prog[b < 8 ? 0 : 1][b % 4] - 1);
  const H = th.meter === 3 ? HOOK3 : HOOK4, A = th.meter === 3 ? ANS3 : ANS4;
  const hookA = pick(H), ansA = pick(A); let hookB = pick(H); if (hookB === hookA) hookB = H[(H.indexOf(hookA) + 3) % H.length]; const ansB = pick(A);
  // 마디 계획: [훅, 화음 근음 기준 음높이 보정, 끝음 처리]
  const plan = [
    [hookA, 0], [ansA, 0], [hookA, 0], [ansA, 0, "half"],
    [hookA, 0], [ansA, 0], [hookA, 0, "lift"], [ansA, 0, "home"],
    [hookB, 2], [ansB, 2], [hookB, 2], [ansB, 2, "half"],
    [hookB, 3, "lift"], [ansB, 2], [hookA, 2, "lift"], [ansA, 0, "turn"],
  ];
  let prev = deg(4) + 12;
  plan.forEach(([tpl, shift, end], b) => {
    const root = roots[b];
    tpl.forEach(([s, len, d], k) => {
      const lastNote = k === tpl.length - 1;
      let dd = root + d + shift;
      if (lastNote && end === "lift") dd += 2;
      let m = deg(dd) + 12;
      if (lastNote && (end === "home" || end === "half" || end === "turn")) {   // 마디 끝음은 그 화음의 구성음 중 으뜸음/딸림음에 가장 가까운 음
        const target = deg(end === "home" ? 0 : 4) + 12, cands = [];
        [root, root + 2, root + 4].forEach(x => [-12, 0, 12].forEach(o => cands.push(deg(x) + 12 + o)));
        m = cands.reduce((a2, c) => Math.abs(c - target) < Math.abs(a2 - target) ? c : a2, cands[0]);
      }
      while (m - prev > 9) m -= 12; while (prev - m > 9) m += 12;       // 이전 음과 가깝게 (큰 도약 줄이기)
      while (m > th.key + 26) m -= 12; while (m < th.key + 7) m += 12;  // 멜로디 음역 유지
      prev = m;
      const L = lastNote && (end === "home" || end === "half") ? BS - s : len;
      steps[b * BS + s].push({ i: "lead", m, d: L });
      // 후렴(B)에서는 종소리가 3도 위 화음, A에서는 강박에 옥타브 메아리
      if (th.bell && b >= 8 && len >= 4) steps[b * BS + s].push({ i: "bell2", m: m + (sc.includes((m - th.key + 4 + 120) % 12) ? 4 : 3), d: 2 });
      else if (th.bell && s % 8 === 0 && R() < 0.5) steps[b * BS + s].push({ i: "bell2", m: m + 12, d: 2 });
    });
  });
  for (let b = 0; b < BARS; b++) {
    const root = roots[b], at = b * BS, triad = [root, root + 2, root + 4];
    for (let s = 0; s < BS; s++) { const c = th.bass[s]; if (!c || c === ".") continue; const o = c === "5" ? 4 : c === "3" ? 2 : c === "8" ? 7 : 0; steps[at + s].push({ i: "bass", m: deg(root + o) - 24, d: 2 }); }
    if (th.arp === "pad") { (th.seventh ? [...triad, root + 6] : triad).forEach(d => steps[at].push({ i: "pad", m: deg(d), d: BS })); }
    else if (th.arp === "waltz") { [4, 8].forEach(s => triad.forEach(d => steps[at + s].push({ i: "arp", m: deg(d), d: 2 }))); }
    else if (th.arp !== "none") {
      const seq = th.arp === "alberti" ? [0, 2, 1, 2] : th.arp === "harp16" ? [0, 1, 2, 3, 4, 3, 2, 1] : [0, 1, 2, 3, 2, 1];
      const every = th.arp === "harp16" ? 1 : 2, tones = [triad[0], triad[1], triad[2], root + 7, root + 9];
      for (let s = 0, k = 0; s < BS; s += every, k++) steps[at + s].push({ i: "arp", m: deg(tones[seq[k % seq.length]]), d: every * 2 });
      if (th.seventh || th.arp === "harp8") steps[at].push({ i: "pad", m: deg(root + 4), d: BS });
    }
    const dp = DR[th.dr] || DR.none;
    for (let s = 0; s < BS; s++) {
      if ((dp.k || "")[s] === "x") steps[at + s].push({ i: "kick" });
      if ((dp.s || "")[s] === "x" || (b % 8 === 7 && s >= BS - 4 && dp.s)) steps[at + s].push({ i: "snare" });
      if ((dp.h || "")[s] === "x") steps[at + s].push({ i: "hat" });
      if ((dp.t || "")[s] === "x") steps[at + s].push({ i: "tamb" });
      if ((dp.m || "")[s] === "x") steps[at + s].push({ i: "timp", m: deg(root) - 24 });
    }
  }
  const song = { steps, th, BS }; bgmSongs.set(id, song); return song;
}
// 몇 번째 곡인지: 구역(50층) × 10층 단위 / 지하 문서고
const bgmWant = () => mode === "vault" ? [20, 0] : [zoneNo(shownFloor()) % 20, Math.floor(((shownFloor() - 1) % ZONE_LEN) / 10)];
