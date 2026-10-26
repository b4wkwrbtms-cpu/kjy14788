/* ===================== 배경음악 v47 (10-27) — 한 식구 같은 사운드트랙 + 읽을 때 집중곡 =====================
   사용자: "배경노래가 다 개별로야 … 다시 만들어. 성경·원고 읽을 때는 공부에 방해 안 되는 음악을 따로."
   근거(읽은 자료):
   - Thompson·Schellenberg·Letnic 2012: 빠르고(150bpm) 큰(72dB) 음악만 독해를 떨어뜨림. 느리거나 작으면 무음과 차이 없음.
   - Perham·Sykora 2012(무관음 효과): 소리의 '변화 상태'(또렷이 나뉘는 음 사건)가 방해의 핵심. 뭉개진·고른 소리는 덜 방해.
   - 게임 음악 설계(gamedeveloper 'Rethinking the audio loop', arXiv 2512.12834, 1907.01154): 같은 루프를 3번 넘게 들으면 피로 →
     구간 바꿔 돌리기·멜로디 쉬기·침묵 넣기·층(레이어) 끄고 켜기. 한 조성·한 빠르기 안에서 레이어를 섞어야 어울림.
   - Sid Meier(game-design 스킬 U-CORE-17): 톤·음악의 일관성. 구역마다 딴 곡이 아니라 한 주제(모티프)의 변주.
   - DFKI(엔드리스 러너): 빠르기가 일정할 때 스트레스가 가장 낮음.
   구현: 모든 구역 곡이 같은 4마디 '곽준영 모티프'를 그 구역의 조성·빠르기·악기로 변주(A A' B A''). 3바퀴 뒤 '쉼'(반주만 → 20~40초 침묵).
   레이어(멜로디·아르페지오·패드·베이스·드럼)는 게임 상태(대기·전투·보스)에 따라 섞음. 읽기 창이 열리면 집중곡으로 넘어감.
*/
const MOTIF4 = [[0, 2, 0], [2, 2, 2], [4, 4, 4], [8, 2, 7], [10, 2, 4], [12, 4, 2]];     // 도 레 미 — 도' 솔 미 (4/4, 16스텝)
const MOTIF4_ANS = [[0, 2, 4], [2, 2, 2], [4, 4, 1], [8, 8, 0]];
const MOTIF3 = [[0, 4, 0], [4, 2, 2], [6, 2, 4], [8, 4, 7]];                               // 3/4, 12스텝
const MOTIF3_ANS = [[0, 4, 4], [4, 4, 2], [8, 4, 0]];
/* 구역 21곳: 바닥 조성 F에서 5도권으로 이웃 구역과 가깝게. 빠르기는 96→126 사이에서 천천히. 어두운 선법은 위험 구역 셋만. */
const BGM_Z = [
  { n: "로비", k: 65, mode: "major", bpm: 104, meter: 4, lead: "flute", arp: "harp8", bass: "R.......5...R...", bassI: "pizz", dr: "town", rev: 0.3, bell: true },
  { n: "사무동", k: 62, mode: "dorian", bpm: 106, meter: 4, swing: 0.18, lead: "reed", arp: "pad", seventh: true, bass: "R...3...5...3...", bassI: "upright", dr: "swing", rev: 0.25 },
  { n: "탕비실", k: 67, mode: "major", bpm: 100, meter: 3, lead: "bell", arp: "waltz", bass: "R...........", bassI: "pizz", dr: "waltz", rev: 0.35, bell: true },
  { n: "회의실", k: 60, mode: "minor", bpm: 96, meter: 4, lead: "flute", arp: "pad", bass: "R.......5.......", bassI: "upright", dr: "soft", rev: 0.4, vib: true },
  { n: "서버실", k: 62, mode: "phryg", bpm: 118, meter: 4, lead: "chip", arp: "harp16", arpI: "bell", bass: "R.R.R.R.R.R.R.R.", bassI: "synth", dr: "tick", rev: 0.2 },
  { n: "자료실", k: 67, mode: "lydian", bpm: 98, meter: 4, lead: "flute", arp: "harp16", bass: "R...............", bassI: "upright", dr: "soft", rev: 0.5, vib: true, bell: true },
  { n: "구내식당", k: 65, mode: "major", bpm: 116, meter: 4, swing: 0.15, lead: "reed", arp: "alberti", arpI: "pizz", bass: "R...5...R...5...", bassI: "tuba", dr: "bounce", rev: 0.2 },
  { n: "사내 헬스장", k: 64, mode: "minor", bpm: 120, meter: 4, lead: "brass", arp: "pad", bass: "R.R.R.R.R.R.R.R.", bassI: "synth", dr: "tribal", rev: 0.2 },
  { n: "인사팀", k: 60, mode: "dorian", bpm: 104, meter: 4, lead: "flute", arp: "harp8", bass: "R..R..R.R..R..R.", bassI: "pizz", dr: "town", rev: 0.3 },
  { n: "재무팀", k: 58, mode: "mixo", bpm: 110, meter: 4, lead: "brass", arp: "pad", bass: "R...5...R...5...", bassI: "tuba", dr: "march", rev: 0.25 },
  { n: "옥상 정원", k: 63, mode: "major", bpm: 102, meter: 3, lead: "flute", arp: "harp3", bass: "R...........", bassI: "upright", dr: "waltzT", rev: 0.35, bell: true },
  { n: "헬기장", k: 58, mode: "mixo", bpm: 122, meter: 4, lead: "brass", arp: "harp8", bass: "R.R.R.R.R.R.R.R.", bassI: "synth", dr: "epic", rev: 0.25 },
  { n: "구름 위", k: 65, mode: "lydian", bpm: 96, meter: 3, lead: "bell", arp: "harp3", bass: "R...........", bassI: "upright", dr: "waltz", rev: 0.55, seventh: true },
  { n: "성층권", k: 62, mode: "minor", bpm: 98, meter: 4, lead: "flute", arp: "harp16", arpI: "bell", bass: "R.......R.......", bassI: "upright", dr: "soft", rev: 0.55, vib: true },
  { n: "달 지사", k: 67, mode: "dorian", bpm: 92, meter: 3, lead: "bell", arp: "pad", bass: "R...........", bassI: "upright", dr: "none", rev: 0.6 },
  { n: "화성 공장", k: 62, mode: "phryg", bpm: 118, meter: 4, lead: "brass", arp: "harp8", arpI: "marimba", bass: "R.R.RR.RR.R.RR.R", bassI: "synth", dr: "tribal", rev: 0.2 },
  { n: "우주 정거장", k: 60, mode: "lydian", bpm: 112, meter: 4, lead: "chip", arp: "harp16", arpI: "bell", bass: "R..R..R.R..R..R.", bassI: "synth", dr: "bounce", rev: 0.3 },
  { n: "은하 물류센터", k: 65, mode: "major", bpm: 120, meter: 4, lead: "brass", arp: "harp16", bass: "R.R.R.R.R.R.R.R.", bassI: "pizz", dr: "epic", rev: 0.35, bell: true },
  { n: "블랙홀 재무팀", k: 58, mode: "minor", bpm: 104, meter: 4, lead: "flute", arp: "pad", bass: "R...R...R...R...", bassI: "tuba", dr: "march", rev: 0.45, vib: true },
  { n: "시공간 이사회", k: 60, mode: "harm", bpm: 126, meter: 4, lead: "brass", arp: "harp16", bass: "R.R.R.R.R.R.R.R.", bassI: "pizz", dr: "epic", rev: 0.35, bell: true },
  { n: "지하 문서고", k: 67, mode: "dorian", bpm: 124, meter: 4, lead: "pizz", arp: "harp16", arpI: "marimba", bass: "R.R.R.R.R.R.R.R.", bassI: "pizz", dr: "tick", rev: 0.2 },
];
const SUB_KEY2 = [0, 7, 5, -2, 2];   // 10층마다 가까운 조(5도·4도)로만 옮김
function buildSong(ti, sub = 0) {
  bgmSongs = bgmSongs || new Map();
  const id = 1000 + ti * 10 + sub; if (bgmSongs.has(id)) return bgmSongs.get(id);
  const base = BGM_Z[ti % BGM_Z.length], R = rng(4242 + ti * 7919 + sub * 104729);
  const minorish = ["minor", "dorian", "phryg", "harm"].includes(base.mode), PROGS = minorish ? PROG_MIN : PROG_MAJ;
  const pick = a => a[Math.floor(R() * a.length)];
  let key = base.k + SUB_KEY2[sub % 5]; while (key > 69) key -= 12; while (key < 57) key += 12;
  const th = Object.assign({}, base, { key, prog: [pick(PROGS), pick(PROGS)] });
  const sc = MODES[th.mode], BS = th.meter * 4, BARS = 32;
  const deg = d => th.key + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  const steps = Array.from({ length: BS * BARS }, () => []);
  const roots = []; for (let b = 0; b < BARS; b++) roots.push(th.prog[(b >> 3) === 2 ? 1 : 0][b % 4] - 1);
  const M = th.meter === 3 ? MOTIF3 : MOTIF4, MA = th.meter === 3 ? MOTIF3_ANS : MOTIF4_ANS;
  const H = th.meter === 3 ? HOOK3 : HOOK4, A = th.meter === 3 ? ANS3 : ANS4;
  const hookB = pick(H), ansB = pick(A);
  const inv = tpl => tpl.map(([s, l, d]) => [s, l, 4 - d]);                 // 모티프 뒤집기(위험 구역 B 앞 한 마디)
  // 32마디: A(모티프) A'(모티프, 끝 올림) B(구역 고유 훅) A''(모티프 + 종)
  const plan = [];
  for (let r = 0; r < 2; r++) plan.push([M, 0], [MA, 0], [M, 0], [MA, 0, r ? "lift" : "half"], [M, 0], [MA, 0], [M, 0, "lift"], [MA, 0, "home"]);
  plan.push([hookB, 2], [ansB, 2], [hookB, 2], [ansB, 2, "half"], [minorish ? inv(M) : hookB, 3, "lift"], [ansB, 2], [M, 2, "lift"], [MA, 0, "turn"]);
  plan.push([M, 0], [MA, 0], [M, 4], [MA, 4, "half"], [M, 0], [MA, 0], [M, 0, "lift"], [MA, 0, "home"]);
  let prev = deg(4) + 12;
  plan.forEach(([tpl, shift, end], b) => {
    const root = roots[b];
    tpl.forEach(([s, len, d], k) => {
      const lastNote = k === tpl.length - 1;
      let dd = root + d + shift;
      if (lastNote && end === "lift") dd += 2;
      let m = deg(dd) + 12;
      if (lastNote && (end === "home" || end === "half" || end === "turn")) {
        const target = deg(end === "home" ? 0 : 4) + 12, cands = [];
        [root, root + 2, root + 4].forEach(x => [-12, 0, 12].forEach(o => cands.push(deg(x) + 12 + o)));
        m = cands.reduce((a2, c) => Math.abs(c - target) < Math.abs(a2 - target) ? c : a2, cands[0]);
      }
      while (m - prev > 9) m -= 12; while (prev - m > 9) m += 12;
      while (m > th.key + 26) m -= 12; while (m < th.key + 7) m += 12;
      prev = m;
      const L = lastNote && (end === "home" || end === "half") ? BS - s : len;
      steps[b * BS + s].push({ i: "lead", m, d: L, sec: b >> 3 });
      if (th.bell && b >= 24 && len >= 4) steps[b * BS + s].push({ i: "bell2", m: m + (sc.includes((m - th.key + 4 + 120) % 12) ? 4 : 3), d: 2, sec: 3 });
      else if (th.bell && s % 8 === 0 && R() < 0.4) steps[b * BS + s].push({ i: "bell2", m: m + 12, d: 2, sec: b >> 3 });
    });
  });
  for (let b = 0; b < BARS; b++) {
    const root = roots[b], at = b * BS, triad = [root, root + 2, root + 4], sec = b >> 3;
    for (let s = 0; s < BS; s++) { const c = th.bass[s]; if (!c || c === ".") continue; const o = c === "5" ? 4 : c === "3" ? 2 : c === "8" ? 7 : 0; steps[at + s].push({ i: "bass", m: deg(root + o) - 24, d: 2, sec }); }
    if (th.arp === "pad") { (th.seventh ? [...triad, root + 6] : triad).forEach(d => steps[at].push({ i: "pad", m: deg(d), d: BS, sec })); }
    else if (th.arp === "waltz") { [4, 8].forEach(s => triad.forEach(d => steps[at + s].push({ i: "arp", m: deg(d), d: 2, sec }))); }
    else if (th.arp !== "none") {
      const seq = th.arp === "alberti" ? [0, 2, 1, 2] : th.arp === "harp16" ? [0, 1, 2, 3, 4, 3, 2, 1] : [0, 1, 2, 3, 2, 1];
      const every = th.arp === "harp16" ? 1 : 2, tones = [triad[0], triad[1], triad[2], root + 7, root + 9];
      for (let s = 0, k = 0; s < BS; s += every, k++) steps[at + s].push({ i: "arp", m: deg(tones[seq[k % seq.length]]), d: every * 2, sec });
      if (th.seventh || th.arp === "harp8") steps[at].push({ i: "pad", m: deg(root + 4), d: BS, sec });
    }
    const dp = DR[th.dr] || DR.none;
    for (let s = 0; s < BS; s++) {
      if ((dp.k || "")[s] === "x") steps[at + s].push({ i: "kick", sec });
      if ((dp.s || "")[s] === "x" || (b % 8 === 7 && s >= BS - 4 && dp.s)) steps[at + s].push({ i: "snare", sec });
      if ((dp.h || "")[s] === "x") steps[at + s].push({ i: "hat", sec });
      if ((dp.t || "")[s] === "x") steps[at + s].push({ i: "tamb", sec });
      if ((dp.m || "")[s] === "x") steps[at + s].push({ i: "timp", m: deg(root) - 24, sec });
    }
  }
  const song = { steps, th, BS, BARS }; bgmSongs.set(id, song); return song;
}
/* ---------- 레이어 섞기: 어떤 소리를 얼마나 ---------- */
const LAYER_OF = e => e.i === "lead" ? "lead" : e.i === "arp" || e.i === "bell2" ? "arp" : e.i === "pad" ? "pad" : e.i === "bass" ? "bass" : "drum";
function bgmLayerTarget() {
  const combat = mode === "tower" && mon && !mon.dying, boss = combat && mon.kind >= 2, fever = !!(S.active && S.active.rage > 0);
  const cyc = bgm.cycle || 0, bar = Math.floor((bgm.step % (bgm.song ? bgm.song.steps.length : 1)) / (bgm.song ? bgm.song.BS : 16)), sec = bar >> 3;
  const rest = bgm.restCycle;                                  // 쉼 바퀴: 반주만 조용히
  const leadOff = rest || (cyc % 3 === 1 && sec !== 2);        // 두 번째 바퀴는 B만 멜로디 (멜로디 쉬기)
  return {
    lead: leadOff ? 0 : 1,
    arp: rest ? 0.6 : 1,
    pad: 1,
    bass: rest ? 0.7 : 1,
    drum: rest ? 0 : !combat ? 0.35 : boss || fever ? 1 : 0.75,
  };
}
function bgmMakeBus() {
  const main = audioCtx.createGain(); main.gain.value = 1; main.connect(bgmGain);
  const L = {}; ["lead", "arp", "pad", "bass", "drum"].forEach(k => { const g = audioCtx.createGain(); g.gain.value = 1; g.connect(main); L[k] = g; });
  return { main, L };
}
function bgmTick() {
  if (!audioCtx || !bgm.song || audioCtx.state !== "running" || !bgm.L) return;
  const th = bgm.song.th, spb = 60 / th.bpm / 4, N = bgm.song.steps.length, boss = mode === "tower" && mon && mon.kind >= 2 && !mon.dying;
  while (bgm.nextT < audioCtx.currentTime + 0.15) {
    const i = bgm.step % N, t = bgm.nextT + (i % 2 ? (th.swing || 0) * spb : 0);
    if (i === 0 && bgm.step > 0 && !bgm.restCycle) {                         // 한 바퀴 끝: 세 바퀴 돌았으면 8마디 쉼 → 침묵 20~40초
      bgm.cycle = (bgm.cycle || 0) + 1;
      if (bgm.cycle >= 3) { bgm.restCycle = true; bgm.restEnd = bgm.step + 8 * bgm.song.BS; }
    }
    if (bgm.restCycle && bgm.step >= bgm.restEnd && !bgm.silentUntil) { bgm.silentUntil = audioCtx.currentTime + 20 + Math.random() * 20; bgmGain.gain.setTargetAtTime(0, t, 1.5); }
    if (i % bgm.song.BS === 0) {                                              // 마디마다 레이어 목표치
      const tg = bgmLayerTarget(); for (const k in tg) bgm.L[k].gain.setTargetAtTime(tg[k], t, 0.4);
      if (bgm.silentUntil && audioCtx.currentTime >= bgm.silentUntil) { bgm.silentUntil = 0; bgm.restCycle = false; bgm.cycle = 0; bgm.step = 0; bgmGain.gain.setTargetAtTime(BGM_VOL * sndVol("m"), t, 1.2); }
    }
    if (!bgm.silentUntil) {
      try {
        bgm.song.steps[i].forEach(e => { bgm.bus = bgm.L[LAYER_OF(e)]; bgmNote(e, t, spb, th); });
        bgm.bus = bgm.L.drum;
        if (boss && !bgm.restCycle) { if (i % 4 === 0) bgmNote({ i: "kick" }, t, spb, th); if (i % 8 === 0) bgmNote({ i: "timp", m: th.key - 24 }, t, spb, th); }
      } catch (e) {}
      bgm.bus = bgm.main;
    }
    bgm.step++; bgm.nextT += spb;
  }
}
/* ---------- 집중곡: 읽기 창(성경·해설·설교 전문)이 열려 있는 동안 ----------
   원칙: 느리고(박자 없음) 작게(게임 곡의 절반 이하), 또렷한 음 사건을 최소로(긴 어택·릴리즈, 저역 필터), 한 조성 유지, 아주 느린 변화.
   소리: 낮은 드론(근음+5도) · 느리게 바뀌는 패드 화음(24~40초) · 가끔 오음계 한 음(9~20초) · 가는 비 같은 잡음 깔개 · 아주 드문 종. */
const FOCUS_VOL = 0.65;
let focus = null;
function focusStart() {
  if (focus || !audioCtx) return;
  const t0 = audioCtx.currentTime, keys = [65, 67, 62, 60], key = keys[Math.floor(Math.random() * keys.length)];
  const out = audioCtx.createGain(); out.gain.setValueAtTime(0.0001, t0); out.gain.setTargetAtTime(BGM_VOL * FOCUS_VOL * sndVol("m"), t0, 2.5);
  const lp = audioCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1900; lp.Q.value = 0.3; lp.connect(out); out.connect(masterGain);
  try { const cv = audioCtx.createConvolver(), wet = audioCtx.createGain(); cv.buffer = reverbIR(); wet.gain.value = 0.5; lp.connect(cv); cv.connect(wet); wet.connect(out); } catch (e) {}
  const node = (type, f, g0, det) => { const o = audioCtx.createOscillator(); o.type = type; o.frequency.value = f; if (det) o.detune.value = det; const g = audioCtx.createGain(); g.gain.value = g0; o.connect(g); g.connect(lp); o.start(); return { o, g }; };
  // 드론: 근음·5도, 살짝 어긋난 두 겹 + 아주 느린 숨(0.06Hz)
  const dr = [node("triangle", midiHz(key - 24), 0.09, -4), node("sine", midiHz(key - 24), 0.065, 5), node("triangle", midiHz(key - 17), 0.045, 3)];
  const lfo = audioCtx.createOscillator(), lg = audioCtx.createGain(); lfo.frequency.value = 0.06; lg.gain.value = 0.015; lfo.connect(lg); dr.forEach(d => lg.connect(d.g.gain)); lfo.start();
  // 비 깔개: 저역 잡음, 아주 작게, 필터가 천천히 흔들림
  const ns = audioCtx.createBufferSource(); ns.buffer = noiseLong; ns.loop = true; const nf = audioCtx.createBiquadFilter(); nf.type = "lowpass"; nf.frequency.value = 700; nf.Q.value = 0.2;
  const ng = audioCtx.createGain(); ng.gain.value = 0.012; ns.connect(nf); nf.connect(ng); ng.connect(lp); ns.start();
  const nlfo = audioCtx.createOscillator(), nlg = audioCtx.createGain(); nlfo.frequency.value = 0.03; nlg.gain.value = 250; nlfo.connect(nlg); nlg.connect(nf.frequency); nlfo.start();
  focus = { key, out, lp, dr, lfo, ns, nlfo, voices: [], nextChord: t0 + 1.5, nextNote: t0 + 8, nextBell: t0 + 50, chordI: 0 };
}
const FOCUS_PROG = [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [0, 7, 11, 14], [2, 5, 9, 12], [0, 4, 7, 12]];   // I△7 vi IV I(sus) ii I — 한 조성 안에서만
const PENT = [0, 2, 4, 7, 9];
function focusTick(nowOverride) {
  if (!focus || !audioCtx || (nowOverride == null && audioCtx.state !== "running")) return;
  const now = nowOverride != null ? nowOverride : audioCtx.currentTime, F = focus;
  const play = (f, t, atk, hold, rel, vol, type, det) => { const o = audioCtx.createOscillator(); o.type = type || "sine"; o.frequency.value = f; if (det) o.detune.value = det;
    const g = audioCtx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.setValueAtTime(vol, t + atk + hold); g.gain.linearRampToValueAtTime(0.0001, t + atk + hold + rel);
    o.connect(g); g.connect(F.lp); o.start(t); o.stop(t + atk + hold + rel + 0.1); };
  if (now + 2 >= F.nextChord) {                                       // 패드 화음: 6초 들어와 20~30초 머물고 10초 사라짐
    const ch = FOCUS_PROG[F.chordI % FOCUS_PROG.length]; F.chordI++;
    const hold = 18 + Math.random() * 12;
    ch.forEach((iv, k) => { play(midiHz(F.key - 12 + iv), F.nextChord, 6, hold, 10, 0.04 - k * 0.005, k % 2 ? "triangle" : "sine", (k - 1.5) * 4); });
    F.nextChord += 6 + hold + 4;
  }
  if (now + 2 >= F.nextNote) {                                        // 오음계 한 음: 1.5초 들어와 4초 머물고 6초 사라짐 (또렷한 '사건'이 되지 않게)
    const iv = PENT[Math.floor(Math.random() * PENT.length)] + (Math.random() < 0.3 ? 12 : 0);
    play(midiHz(F.key + iv), F.nextNote, 1.6, 3 + Math.random() * 3, 6, 0.03, "sine", 0);
    F.nextNote += 9 + Math.random() * 11;
  }
  if (now + 2 >= F.nextBell) {                                        // 아주 드문 종 (45~100초)
    const iv = PENT[Math.floor(Math.random() * 3)] + 12;
    play(midiHz(F.key + iv), F.nextBell, 0.01, 0.1, 3.5, 0.016, "sine", 0); play(midiHz(F.key + iv) * 2.76, F.nextBell, 0.01, 0.05, 1.2, 0.004, "sine", 0);
    F.nextBell += 45 + Math.random() * 55;
  }
}
function focusStop() {
  if (!focus) return; const F = focus; focus = null; const now = audioCtx.currentTime;
  F.out.gain.setTargetAtTime(0.0001, now, 0.8);
  setTimeout(() => { try { F.dr.forEach(d => d.o.stop()); F.lfo.stop(); F.ns.stop(); F.nlfo.stop(); F.out.disconnect(); } catch (e) {} }, 4000);
}
const focusOn = () => S.focusMusic !== false;
function readingNow() { const r = $("reader"); return !!(r && !r.hidden); }
/* ---------- 무엇을 틀지 ---------- */
function bgmUpdate() {
  if (!audioCtx) return; if (!masterGain && !audioReady()) return;
  const on = musicOn() && !document.hidden;
  const wantFocus = on && readingNow() && focusOn();
  if (wantFocus) { if (!focus) focusStart(); } else if (focus) focusStop();
  const w = bgmWant(), want = on && !readingNow() ? w[0] * 10 + w[1] : -1;
  if (want === bgm.theme) return;
  const now = audioCtx.currentTime, old = bgm.main;
  bgmGain.gain.cancelScheduledValues(now); bgmGain.gain.setTargetAtTime(0, now, want < 0 ? 0.6 : 0.12);
  bgm.theme = want; bgm.song = null; bgm.bus = null; bgm.echo = null; bgm.L = null; bgm.main = null; bgm.cycle = 0; bgm.restCycle = false; bgm.silentUntil = 0;
  if (old) setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 2500);
  if (want < 0) return;
  const song = buildSong(Math.floor(want / 10), want % 10), B = bgmMakeBus();
  try { const cv2 = audioCtx.createConvolver(), wet = audioCtx.createGain(); cv2.buffer = reverbIR(); wet.gain.value = song.th.rev || 0.3; B.main.connect(cv2); cv2.connect(wet); wet.connect(bgmGain); } catch (e) {}
  if (song.th.rev >= 0.45) { const d = audioCtx.createDelay(1), fb = audioCtx.createGain(), w2 = audioCtx.createGain(); d.delayTime.value = 60 / song.th.bpm * 0.75; fb.gain.value = 0.3; w2.gain.value = 0.35; d.connect(fb); fb.connect(d); d.connect(w2); w2.connect(B.main); bgm.echo = d; }
  bgm.main = B.main; bgm.L = B.L; bgm.bus = B.main; bgm.song = song; bgm.step = 0; bgm.nextT = now + 0.55;
  bgmGain.gain.setTargetAtTime(BGM_VOL * sndVol("m"), now + 0.5, 0.35);
}
setInterval(() => { try { focusTick(); } catch (e) {} }, 500);
