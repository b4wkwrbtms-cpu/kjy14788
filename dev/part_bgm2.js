/* ---------- 배경음악: 밝은 판타지 마을풍 창작곡 (플루트·하프·종소리·피치카토·현악, 일부 왈츠), 구역마다 다른 곡 ---------- */
const MODES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixo: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phryg: [0, 1, 3, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11] };
// 드럼 패턴 (k 킥, s 브러시 스네어, h 셰이커, t 탬버린, m 팀파니)
const DR = {
  town: { k: "x.......x.......", s: "....x.......x...", h: "..x...x...x...x.", t: "" },
  bounce: { k: "x...x...x...x...", s: "....x.......x...", h: "x.x.x.x.x.x.x.x.", t: "....x.......x..." },
  swing: { k: "x.....x.x.......", s: "....x.......x...", h: "x..x.xx..x.xx..x", t: "" },
  soft: { k: "x...............", s: "", h: "..x...x...x...x.", t: "" },
  march: { k: "x...x...x...x...", s: "....x.x.....x.xx", h: "", t: "x.......x.......", m: "x.......x......." },
  tribal: { k: "x..x..x.x..x..x.", s: "....x.......x...", h: "x.x.x.x.x.x.x.x.", t: "", m: "x.....x.....x..." },
  tick: { k: "x...x...x...x...", s: "....x.......x...", h: "xxxxxxxxxxxxxxxx", t: "" },
  epic: { k: "x.....x.x.......", s: "....x.......x.x.", h: "x.x.x.x.x.x.x.x.", t: "", m: "x...............x" },
  none: { k: "", s: "", h: "", t: "" },
  waltz: { k: "x...........", s: "", h: "....x...x...", t: "" },
  waltzT: { k: "x...........", s: "", h: "..x...x...x.", t: "....x...x..." },
};
// 구역별 곡: 조성·선법·빠르기·박자·화음 진행(A/B)·멜로디 악기·반주·베이스·드럼·울림
const BGM_THEMES = [
  { n: "로비", key: 65, mode: "major", bpm: 118, meter: 4, prog: [[1, 5, 6, 4], [2, 5, 1, 6]], lead: "flute", arp: "harp8", bass: "R.......5...R...", bassI: "pizz", dr: "town", rev: 0.3, bell: true },
  { n: "사무동", key: 62, mode: "dorian", bpm: 112, meter: 4, swing: 0.2, prog: [[1, 4, 1, 4], [6, 2, 5, 1]], lead: "reed", arp: "pad", seventh: true, bass: "R...3...5...3...", bassI: "upright", dr: "swing", rev: 0.25 },
  { n: "탕비실", key: 67, mode: "major", bpm: 104, meter: 3, prog: [[1, 4, 5, 1], [6, 2, 5, 1]], lead: "bell", arp: "waltz", bass: "R...........", bassI: "pizz", dr: "waltz", rev: 0.35 },
  { n: "회의실", key: 57, mode: "minor", bpm: 84, meter: 4, prog: [[1, 6, 4, 5], [1, 7, 6, 5]], lead: "flute", arp: "pad", bass: "R.......5.......", bassI: "upright", dr: "soft", rev: 0.4, vib: true },
  { n: "서버실", key: 64, mode: "phryg", bpm: 128, meter: 4, prog: [[1, 2, 1, 7], [1, 2, 3, 2]], lead: "chip", arp: "harp16", arpI: "bell", bass: "R.R.R.R.R.R.R.R.", bassI: "synth", dr: "tick", rev: 0.2 },
  { n: "자료실", key: 67, mode: "lydian", bpm: 88, meter: 4, prog: [[1, 2, 1, 7], [4, 2, 5, 1]], lead: "flute", arp: "harp16", bass: "R...............", bassI: "upright", dr: "soft", rev: 0.5, vib: true, bell: true },
  { n: "구내식당", key: 70, mode: "major", bpm: 132, meter: 4, swing: 0.15, prog: [[1, 4, 5, 1], [6, 2, 5, 1]], lead: "reed", arp: "alberti", arpI: "pizz", bass: "R...5...R...5...", bassI: "tuba", dr: "bounce", rev: 0.2 },
  { n: "사내 헬스장", key: 64, mode: "minor", bpm: 140, meter: 4, prog: [[1, 6, 7, 1], [4, 5, 6, 7]], lead: "brass", arp: "pad", bass: "R.R.R.R.R.R.R.R.", bassI: "synth", dr: "tribal", rev: 0.2 },
  { n: "인사팀", key: 60, mode: "minor", bpm: 100, meter: 4, prog: [[1, 7, 6, 5], [4, 5, 1, 1]], lead: "flute", arp: "harp8", bass: "R..R..R.R..R..R.", bassI: "pizz", dr: "town", rev: 0.3 },
  { n: "재무팀", key: 58, mode: "major", bpm: 112, meter: 4, prog: [[1, 4, 5, 1], [6, 3, 4, 5]], lead: "brass", arp: "pad", bass: "R...5...R...5...", bassI: "tuba", dr: "march", rev: 0.25 },
  { n: "옥상 정원", key: 62, mode: "major", bpm: 108, meter: 3, prog: [[1, 4, 1, 5], [4, 1, 5, 1]], lead: "flute", arp: "harp3", bass: "R...........", bassI: "upright", dr: "waltzT", rev: 0.35, bell: true },
  { n: "헬기장", key: 57, mode: "mixo", bpm: 138, meter: 4, prog: [[1, 7, 4, 1], [1, 7, 6, 7]], lead: "brass", arp: "harp8", bass: "R.R.R.R.R.R.R.R.", bassI: "synth", dr: "epic", rev: 0.25 },
  { n: "구름 위", key: 65, mode: "lydian", bpm: 92, meter: 3, prog: [[1, 2, 1, 2], [4, 5, 6, 5]], lead: "bell", arp: "harp3", bass: "R...........", bassI: "upright", dr: "waltz", rev: 0.55, seventh: true },
  { n: "성층권", key: 59, mode: "minor", bpm: 90, meter: 4, prog: [[1, 6, 7, 1], [4, 6, 7, 5]], lead: "flute", arp: "harp16", arpI: "bell", bass: "R.......R.......", bassI: "upright", dr: "soft", rev: 0.55, vib: true },
  { n: "달 지사", key: 64, mode: "minor", bpm: 80, meter: 3, prog: [[1, 6, 1, 7], [4, 6, 5, 5]], lead: "bell", arp: "pad", bass: "R...........", bassI: "upright", dr: "none", rev: 0.6 },
  { n: "화성 공장", key: 62, mode: "phryg", bpm: 124, meter: 4, prog: [[1, 1, 2, 1], [6, 7, 2, 1]], lead: "brass", arp: "harp8", arpI: "marimba", bass: "R.R.RR.RR.R.RR.R", bassI: "synth", dr: "tribal", rev: 0.2 },
  { n: "우주 정거장", key: 60, mode: "lydian", bpm: 120, meter: 4, prog: [[1, 2, 5, 1], [6, 2, 5, 5]], lead: "chip", arp: "harp16", arpI: "bell", bass: "R..R..R.R..R..R.", bassI: "synth", dr: "bounce", rev: 0.3 },
  { n: "은하 물류센터", key: 63, mode: "major", bpm: 132, meter: 4, prog: [[1, 5, 6, 4], [2, 5, 1, 1]], lead: "brass", arp: "harp16", bass: "R.R.R.R.R.R.R.R.", bassI: "pizz", dr: "epic", rev: 0.35, bell: true },
  { n: "블랙홀 재무팀", key: 61, mode: "phryg", bpm: 104, meter: 4, prog: [[1, 2, 1, 6], [1, 2, 7, 1]], lead: "flute", arp: "pad", bass: "R...R...R...R...", bassI: "tuba", dr: "march", rev: 0.45, vib: true },
  { n: "시공간 이사회", key: 57, mode: "harm", bpm: 140, meter: 4, prog: [[1, 6, 4, 5], [1, 4, 5, 5]], lead: "brass", arp: "harp16", bass: "R.R.R.R.R.R.R.R.", bassI: "pizz", dr: "epic", rev: 0.35, bell: true },
  { n: "지하 문서고", key: 67, mode: "dorian", bpm: 156, meter: 4, prog: [[1, 7, 1, 7], [4, 5, 1, 7]], lead: "pizz", arp: "harp16", arpI: "marimba", bass: "R.R.R.R.R.R.R.R.", bassI: "pizz", dr: "tick", rev: 0.2 },
];
const LYR4 = ["x...x...x.x.x...", "x.......x...x...", "x.x.x...x.......", "x.....x.x...x...", "x...x.x.x.......", "x.......x.x.x.x."];
const LYR3 = ["x.....x...x.", "x...x...x...", "x.....x.x.x.", "x...........", "x.x.x.x.....", "x.....x....."];
var bgmSongs, bgmIR;
let bgm = { theme: -1, song: null, step: 0, nextT: 0, bus: null, echo: null };
function buildSong(ti) {
  bgmSongs = bgmSongs || new Map();
  if (bgmSongs.has(ti)) return bgmSongs.get(ti);
  const th = BGM_THEMES[ti], R = rng(4242 + ti * 7919), sc = MODES[th.mode], BS = th.meter * 4, BARS = 16;
  const deg = d => th.key + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  const steps = Array.from({ length: BS * BARS }, () => []);
  const roots = []; for (let b = 0; b < BARS; b++) roots.push(th.prog[b < 8 ? 0 : 1][b % 4] - 1);
  const rset = th.meter === 3 ? LYR3 : LYR4;
  // 노래하듯 이어지는 2마디 동기 두 개 → A(1~8마디)·B(9~16마디)에서 반복하며 변형
  const motif = (lift) => {
    const rh = [rset[Math.floor(R() * rset.length)], rset[Math.floor(R() * rset.length)]], notes = [];
    let off = [2, 4, 7][Math.floor(R() * 3)] + lift;
    rh.forEach((r, bar) => { for (let s = 0; s < BS; s++) if (r[s] === "x") {
      if (s % 4 === 0) { const ct = [0, 2, 4, 7, 9]; off = ct.reduce((a, c) => Math.abs(c - off) < Math.abs(a - off) ? c : a, 0); }
      else off += R() < 0.55 ? 1 : -1;
      if (R() < 0.12) off += R() < 0.5 ? 2 : -2;
      off = Math.max(-1, Math.min(11, off)); notes.push({ s: bar * BS + s, off });
    } });
    notes.forEach((n, i) => n.len = Math.min(BS, ((notes[i + 1] ? notes[i + 1].s : 2 * BS) - n.s)));
    return notes;
  };
  const mA = motif(0), mB = motif(2);
  for (let pair = 0; pair < BARS / 2; pair++) {
    const m = pair < 4 ? mA : mB, varied = pair % 2 === 1;
    m.forEach((n, i) => {
      const bar = pair * 2 + Math.floor(n.s / BS), root = roots[bar];
      let off = n.off;
      if (varied && i >= m.length - 2) off = i === m.length - 1 ? (pair === 7 || pair === 3 ? 0 : off) : off + 1;
      const st = pair * 2 * BS + n.s, last = (pair === 7 || pair === 3) && i === m.length - 1;
      steps[st].push({ i: "lead", m: deg(root + off) + 12, d: last ? BS : n.len });
      if (th.bell && st % 4 === 0 && R() < 0.6) steps[st].push({ i: "bell2", m: deg(root + off) + 24, d: 2 });
    });
  }
  for (let b = 0; b < BARS; b++) {
    const root = roots[b], base = b * BS, triad = [root, root + 2, root + 4];
    for (let s = 0; s < BS; s++) { const c = th.bass[s]; if (!c || c === ".") continue; const o = c === "5" ? 4 : c === "3" ? 2 : c === "8" ? 7 : 0; steps[base + s].push({ i: "bass", m: deg(root + o) - 24, d: 2 }); }
    if (th.arp === "pad") { (th.seventh ? [...triad, root + 6] : triad).forEach(d => steps[base].push({ i: "pad", m: deg(d), d: BS })); }
    else if (th.arp === "waltz") { [4, 8].forEach(s => triad.forEach(d => steps[base + s].push({ i: "arp", m: deg(d), d: 2 }))); }
    else if (th.arp !== "none") {
      const seq = th.arp === "alberti" ? [0, 2, 1, 2] : th.arp === "harp16" ? [0, 1, 2, 3, 4, 3, 2, 1] : [0, 1, 2, 3, 2, 1];
      const every = th.arp === "harp16" ? 1 : 2, tones = [triad[0], triad[1], triad[2], root + 7, root + 9];
      for (let s = 0, k = 0; s < BS; s += every, k++) steps[base + s].push({ i: "arp", m: deg(tones[seq[k % seq.length]]), d: every * 2 });
      if (th.seventh || th.arp === "harp8") steps[base].push({ i: "pad", m: deg(root + 4), d: BS });
    }
    const dp = DR[th.dr] || DR.none;
    for (let s = 0; s < BS; s++) {
      if ((dp.k || "")[s] === "x") steps[base + s].push({ i: "kick" });
      if ((dp.s || "")[s] === "x" || (b % 8 === 7 && s >= BS - 4 && dp.s)) steps[base + s].push({ i: "snare" });
      if ((dp.h || "")[s] === "x") steps[base + s].push({ i: "hat" });
      if ((dp.t || "")[s] === "x") steps[base + s].push({ i: "tamb" });
      if ((dp.m || "")[s] === "x") steps[base + s].push({ i: "timp", m: deg(root) - 24 });
    }
  }
  const song = { steps, th, BS }; bgmSongs.set(ti, song); return song;
}
function osc(type, f, t, end, dest, det = 0) {
  const o = audioCtx.createOscillator();
  if (type === "pulse25" || type === "pulse12") o.setPeriodicWave(pulseWave(type === "pulse12" ? 0.125 : 0.25)); else o.type = type;
  o.frequency.setValueAtTime(f, t); if (det) o.detune.value = det;
  o.connect(dest); o.start(t); o.stop(end); return o;
}
function env(t, atk, peak, hold, rel) { // 엔벌로프 게인 노드
  const g = audioCtx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + atk);
  if (hold > 0) g.gain.setTargetAtTime(peak * 0.7, t + atk, hold); g.gain.setTargetAtTime(0.0001, t + rel, 0.05); return g;
}
function bgmNote(e, t, spb, th) {
  const bus = bgm.bus; if (!bus) return;
  const f = e.m != null ? midiHz(e.m) : 0, dur = (e.d || 1) * spb;
  switch (e.i) {
    case "kick": { const g = env(t, 0.004, 0.32, 0, 0.16); const o = osc("sine", 110, t, t + 0.25, g); o.frequency.exponentialRampToValueAtTime(48, t + 0.12); g.connect(bus); return; }
    case "snare": noiseHit(t, 0.15, "lowpass", 3200, 0.1, 0, bus); return;
    case "hat": noiseHit(t, 0.04, "highpass", 6500, 0.045, 0, bus); return;
    case "tamb": noiseHit(t, 0.09, "highpass", 8500, 0.06, 0, bus); noiseHit(t + 0.02, 0.06, "bandpass", 9500, 0.03, 0, bus); return;
    case "timp": { const g = env(t, 0.006, 0.22, 0.2, 0.55); const o = osc("sine", f * 2, t, t + 0.9, g); o.frequency.exponentialRampToValueAtTime(f * 1.8, t + 0.5); g.connect(bus); noiseHit(t, 0.08, "lowpass", 600, 0.08, 0, bus); return; }
  }
  let inst = e.i === "lead" ? th.lead : e.i === "arp" ? (th.arpI || "harp") : e.i === "bass" ? (th.bassI || "pizz") + "Bass" : e.i === "bell2" ? "bell" : "strings";
  const out = e.i === "lead" && bgm.echo ? bgm.echo : bus, end = t + dur + 1.4;
  const lead = e.i === "lead", v = lead ? 1 : e.i === "bell2" ? 0.45 : e.i === "arp" ? 0.55 : 1;
  const link = g => { g.connect(bus); if (out !== bus) g.connect(out); };
  switch (inst) {
    case "flute": { const g = env(t, 0.035, 0.1 * v, 0.25, t + dur * 0.92); const o1 = osc("sine", f, t, end, g); const g2 = audioCtx.createGain(); g2.gain.value = 0.25; const o2 = osc("triangle", f, t, end, g2); g2.connect(g);
      if (th.vib || dur > 0.35) { const l = audioCtx.createOscillator(), lg = audioCtx.createGain(); l.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(10, t + 0.25); l.connect(lg); lg.connect(o1.detune); lg.connect(o2.detune); l.start(t); l.stop(end); }
      noiseHit(t, 0.05, "bandpass", f * 2, 0.012 * v, 0, g); link(g); return; }
    case "bell": { const g = audioCtx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09 * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      osc("sine", f, t, t + 1.4, g); const h = audioCtx.createGain(); h.gain.value = 0.3; osc("sine", f * 2.76, t, t + 0.6, h); h.connect(g); const h2 = audioCtx.createGain(); h2.gain.value = 0.12; osc("sine", f * 5.4, t, t + 0.3, h2); h2.connect(g); link(g); return; }
    case "pizz": { const g = audioCtx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.13 * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); osc("triangle", f, t, t + 0.35, g); link(g); return; }
    case "harp": { const g = audioCtx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.075 * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0); osc("triangle", f, t, t + 1.05, g); const h = audioCtx.createGain(); h.gain.value = 0.18; osc("sine", f * 2, t, t + 0.5, h); h.connect(g); link(g); return; }
    case "marimba": { const g = audioCtx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1 * v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); osc("sine", f, t, t + 0.45, g); const h = audioCtx.createGain(); h.gain.value = 0.15; osc("sine", f * 4, t, t + 0.12, h); h.connect(g); link(g); return; }
    case "brass": { const g = env(t, 0.05, 0.075 * v, 0.3, t + dur * 0.9), lp = audioCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(2600, t + 0.06); lp.frequency.setTargetAtTime(1300, t + 0.1, 0.2);
      osc("sawtooth", f, t, end, lp, -4); osc("sawtooth", f, t, end, lp, 5); lp.connect(g); link(g); return; }
    case "reed": { const g = env(t, 0.03, 0.05 * v, 0.3, t + dur * 0.92), lp = audioCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400; osc("pulse25", f, t, end, lp, -6); osc("pulse25", f, t, end, lp, 6); lp.connect(g); link(g); return; }
    case "chip": { const g = env(t, 0.006, 0.06 * v, 0.12, t + dur * 0.85); osc("pulse25", f, t, end, g); link(g); return; }
    case "strings": { const g = env(t, 0.22, 0.026, 0, t + dur), lp = audioCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500; osc("sawtooth", f, t, t + dur + 0.6, lp, -8); osc("sawtooth", f, t, t + dur + 0.6, lp, 8); lp.connect(g); g.connect(bus); return; }
    case "pizzBass": case "uprightBass": { const g = audioCtx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(inst === "pizzBass" ? 0.2 : 0.17, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + (inst === "pizzBass" ? 0.35 : 0.6)); osc("triangle", f, t, t + 0.7, g); osc("sine", f, t, t + 0.7, g); g.connect(bus); return; }
    case "tubaBass": { const g = env(t, 0.02, 0.15, 0.1, t + dur * 0.7), lp = audioCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520; osc("square", f, t, t + dur + 0.3, lp); lp.connect(g); g.connect(bus); return; }
    case "synthBass": { const g = env(t, 0.005, 0.1, 0.08, t + dur * 0.8), lp = audioCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900; osc("square", f, t, t + dur + 0.3, lp); lp.connect(g); g.connect(bus); return; }
  }
}
function reverbIR() {
  if (bgmIR) return bgmIR;
  const len = Math.floor(audioCtx.sampleRate * 1.9); bgmIR = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = bgmIR.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  return bgmIR;
}
function bgmTick() {
  if (!audioCtx || !bgm.song || audioCtx.state !== "running") return;
  const th = bgm.song.th, spb = 60 / th.bpm / 4, N = bgm.song.steps.length, boss = mode === "tower" && mon && mon.kind >= 2 && !mon.dying;
  while (bgm.nextT < audioCtx.currentTime + 0.15) {
    const i = bgm.step % N, t = bgm.nextT + (i % 2 ? (th.swing || 0) * spb : 0);
    try {
      bgm.song.steps[i].forEach(e => bgmNote(e, t, spb, th));
      if (boss) { if (i % 4 === 0) bgmNote({ i: "kick" }, t, spb, th); if (i % 8 === 0) bgmNote({ i: "timp", m: th.key - 24 }, t, spb, th); }
    } catch (e) {}
    bgm.step++; bgm.nextT += spb;
  }
}
function bgmUpdate() {
  if (!audioCtx) return; if (!masterGain && !audioReady()) return;
  const want = musicOn() && !document.hidden ? (mode === "vault" ? 20 : zoneNo(shownFloor()) % 20) : -1;
  if (want === bgm.theme) return;
  const now = audioCtx.currentTime, old = bgm.bus;
  bgmGain.gain.cancelScheduledValues(now); bgmGain.gain.setTargetAtTime(0, now, 0.12);
  bgm.theme = want; bgm.song = null; bgm.bus = null; bgm.echo = null;
  if (old) setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 900);
  if (want < 0) return;
  const song = buildSong(want), bus = audioCtx.createGain(); bus.gain.value = 1; bus.connect(bgmGain);
  try { const cv2 = audioCtx.createConvolver(), wet = audioCtx.createGain(); cv2.buffer = reverbIR(); wet.gain.value = song.th.rev || 0.3; bus.connect(cv2); cv2.connect(wet); wet.connect(bgmGain); } catch (e) {}
  if (song.th.rev >= 0.45) { const d = audioCtx.createDelay(1), fb = audioCtx.createGain(), w2 = audioCtx.createGain(); d.delayTime.value = 60 / song.th.bpm * 0.75; fb.gain.value = 0.3; w2.gain.value = 0.35; d.connect(fb); fb.connect(d); d.connect(w2); w2.connect(bus); bgm.echo = d; }
  bgm.bus = bus; bgm.song = song; bgm.step = 0; bgm.nextT = now + 0.55;
  bgmGain.gain.setTargetAtTime(BGM_VOL, now + 0.5, 0.35);
}
setInterval(bgmTick, 30);
