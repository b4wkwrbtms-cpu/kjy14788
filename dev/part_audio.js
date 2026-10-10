/* ===================== 소리: 효과음 + 50층마다 바뀌는 배경음악 (모두 즉석 합성, 파일 없음) ===================== */
var sfxGain = null, bgmGain = null, masterGain = null, noiseLong = null, pulseWaves = {};
const BGM_VOL = 0.3;
const musicOn = () => S.sound && S.music !== false;
function audioReady() {
  ensureAudio(); if (!audioCtx) return false;
  if (!masterGain) {
    masterGain = audioCtx.createGain(); masterGain.gain.value = 1; masterGain.connect(audioCtx.destination);
    sfxGain = audioCtx.createGain(); sfxGain.gain.value = 0.9; sfxGain.connect(masterGain);
    bgmGain = audioCtx.createGain(); bgmGain.gain.value = 0; bgmGain.connect(masterGain);
    const n = audioCtx.sampleRate * 0.6; noiseLong = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
    const d = noiseLong.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    // 아이폰 무음 스위치를 켜 둬도 게임 소리가 나도록 (게임 안 '소리' 버튼으로 끌 수 있음)
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
  }
  return true;
}
const sfxOut = () => sfxGain || audioCtx.destination;
function pulseWave(duty) {
  if (pulseWaves[duty]) return pulseWaves[duty];
  const N = 32, re = new Float32Array(N), im = new Float32Array(N);
  for (let n = 1; n < N; n++) { re[n] = 2 / (n * Math.PI) * Math.sin(2 * Math.PI * n * duty); im[n] = 2 / (n * Math.PI) * (1 - Math.cos(2 * Math.PI * n * duty)); }
  return (pulseWaves[duty] = audioCtx.createPeriodicWave(re, im));
}
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- 효과음 ---------- */
const sfxLast = {};
const SFX_GAP = { tick: 60, swing: 90, pop: 60, pew: 50, coin: 30, sparkle: 120, zap: 120 };
function noiseHit(t, dur, type, freq, vol, freq2, out) {
  const src = audioCtx.createBufferSource(); src.buffer = noiseLong;
  const f = audioCtx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (freq2) f.frequency.exponentialRampToValueAtTime(freq2, t + dur);
  const g = audioCtx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(out || sfxOut()); src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
}
function sfx(name) {
  if (!S.sound || !audioCtx || !masterGain || document.hidden) return;
  const now = performance.now(); if (now - (sfxLast[name] || 0) < (SFX_GAP[name] || 40)) return; sfxLast[name] = now;
  const t = audioCtx.currentTime;
  try {
    switch (name) {
      case "tick": tone(1900, 0.03, "square", 0.018); break;
      case "swing": noiseHit(t, 0.11, "bandpass", 900, 0.09, 3800); break;
      case "crit": tone(1500, 0.14, "sawtooth", 0.045, 0, 3000); noiseHit(t, 0.16, "highpass", 3000, 0.12); tone(98, 0.22, "square", 0.06, 0, 49); break;
      case "pop": tone(420, 0.09, "square", 0.045, 0, 900); noiseHit(t, 0.06, "lowpass", 1800, 0.08); break;
      case "upgrade": [784, 988, 1319].forEach((f, i) => tone(f, 0.12, "triangle", 0.07, i * 0.06)); break;
      case "bigup": [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.16, "square", 0.045, i * 0.055)); tone(2093, 0.5, "triangle", 0.05, 0.33); break;
      case "buy": tone(1568, 0.08, "square", 0.045); tone(2093, 0.28, "square", 0.045, 0.08); noiseHit(t + 0.08, 0.12, "highpass", 5000, 0.05); break;
      case "chapter": tone(1047, 0.7, "sine", 0.08); tone(1568, 0.9, "sine", 0.05, 0.06); tone(2093, 1.0, "sine", 0.035, 0.12); break;
      case "uncheck": tone(620, 0.1, "triangle", 0.05, 0, 380); break;
      case "pass": [784, 988, 1175].forEach((f, i) => tone(f, 0.1, "square", 0.045, i * 0.08)); [1568, 1976, 2349].forEach(f => tone(f, 0.5, "triangle", 0.035, 0.26)); break;
      case "fail": tone(233, 0.28, "sawtooth", 0.05, 0, 175); tone(220, 0.34, "sawtooth", 0.045, 0.12, 147); break;
      case "buff": tone(330, 0.4, "sawtooth", 0.04, 0, 1320); noiseHit(t, 0.35, "bandpass", 600, 0.05, 4000); break;
      case "zap": noiseHit(t, 0.18, "bandpass", 3200, 0.12, 900); tone(1250, 0.16, "square", 0.035, 0, 260); break;
      case "pew": tone(1600, 0.07, "square", 0.025, 0, 520); break;
      case "whoosh": noiseHit(t, 0.16, "bandpass", 500, 0.07, 2200); break;
      case "sparkle": tone(2637, 0.14, "triangle", 0.03); tone(3136, 0.16, "triangle", 0.03, 0.07); tone(3951, 0.2, "triangle", 0.025, 0.14); break;
      case "sizzle": noiseHit(t, 0.35, "highpass", 4000, 0.06); tone(180, 0.2, "sawtooth", 0.03, 0, 90); break;
      case "retire": [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "square", 0.045, i * 0.12)); [1047, 1319, 1568].forEach(f => tone(f, 1.0, "triangle", 0.04, 0.5)); break;
    }
  } catch (e) {}
}
/* 상태 변화로 효과음 내기: 강화·구매·말씀 체크·암송 결과·버프 */
let sfxSnap = null, lastMemRes = null;
function sfxWatch() {
  if (!S) return;
  const snap = { w: S.wi * 100 + S.wl, pets: Object.values(S.pets || {}).reduce((a, b) => a + b, 0), cos: JSON.stringify(S.cos || {}).length + JSON.stringify(S.look || {}).length,
    tre: JSON.stringify(S.tre || S.treasures || {}).length, chap: S.bible.total, ret: S.retires, buff: ["haste", "gold2", "rage"].filter(b => S.active[b] > 0).length };
  if (sfxSnap) {
    if (snap.ret > sfxSnap.ret) sfx("retire");
    else if (snap.w > sfxSnap.w) sfx(S.wl === 1 || S.wl === 5 ? "bigup" : "upgrade");
    if (snap.pets > sfxSnap.pets || snap.cos > sfxSnap.cos || snap.tre > sfxSnap.tre) sfx("buy");
    if (snap.chap > sfxSnap.chap) sfx("chapter"); else if (snap.chap < sfxSnap.chap) sfx("uncheck");
    if (snap.buff > sfxSnap.buff) sfx("buff");
  }
  sfxSnap = snap;
  const res = typeof memSess !== "undefined" && memSess && memSess.result;
  if (res && res !== lastMemRes) sfx(res.pass ? "pass" : "fail");
  lastMemRes = res || null;
}

/* ---------- 배경음악 ---------- */
const MODES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixo: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phryg: [0, 1, 3, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11] };
const DR = {
  four: { k: "x...x...x...x...", s: "....x.......x...", h: "..x...x...x...x." },
  pop: { k: "x.......x.x.....", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
  busy: { k: "x..x..x.x..x..x.", s: "....x.......x...", h: "xxxxxxxxxxxxxxxx" },
  half: { k: "x...............", s: "........x.......", h: "x...x...x...x..." },
  soft: { k: "x.......x.......", s: "", h: "..x...x...x...x." },
  march: { k: "x...x...x...x...", s: "....x.x.....x.xx", h: "x.x.x.x.x.x.x.x." },
  techno: { k: "x...x...x...x...", s: "....x.......x..x", h: "xxxxxxxxxxxxxxxx" },
  swing: { k: "x.....x.x.....x.", s: "....x.......x...", h: "x..x.xx..x.xx..x" },
  none: { k: "", s: "", h: "" },
};
// 구역별 곡 설정: 조성, 선법, 빠르기, 화음 진행(A/B), 멜로디·반주 악기, 베이스, 아르페지오, 드럼
const BGM_THEMES = [
  { n: "로비", key: 60, mode: "major", bpm: 112, prog: [[1, 5, 6, 4], [4, 5, 3, 6]], lead: "pulse25", arp: "up8", bass: "R...R...R...R.5.", dr: "pop" },
  { n: "사무동", key: 62, mode: "dorian", bpm: 124, prog: [[1, 4, 1, 5], [6, 4, 1, 5]], lead: "square", arp: "up16", bass: "R.R...R.R.5...5.", dr: "four" },
  { n: "탕비실", key: 65, mode: "major", bpm: 96, swing: 0.22, prog: [[2, 5, 1, 6], [4, 3, 2, 5]], lead: "triangle", arp: "alberti", bass: "R...3...5...3...", dr: "swing" },
  { n: "회의실", key: 57, mode: "minor", bpm: 86, prog: [[1, 6, 4, 5], [1, 7, 6, 5]], lead: "pulse12", arp: "pad", bass: "R.......5.......", dr: "half" },
  { n: "서버실", key: 52, mode: "phryg", bpm: 138, prog: [[1, 2, 1, 7], [1, 2, 3, 2]], lead: "saw", arp: "up16", bass: "RRRRRRRRRRRRRRRR", dr: "techno" },
  { n: "자료실", key: 55, mode: "lydian", bpm: 92, prog: [[1, 2, 1, 7], [4, 2, 5, 1]], lead: "triangle", arp: "updown16", bass: "R.......R.......", dr: "soft", echo: true },
  { n: "구내식당", key: 58, mode: "major", bpm: 132, swing: 0.18, prog: [[1, 4, 5, 1], [6, 2, 5, 1]], lead: "square", arp: "alberti", bass: "R...5...R...5...", dr: "pop" },
  { n: "사내 헬스장", key: 64, mode: "major", bpm: 150, prog: [[1, 5, 6, 4], [4, 5, 6, 5]], lead: "pulse25", arp: "up16", bass: "R.R.R.R.R.R.R.R.", dr: "busy" },
  { n: "인사팀", key: 60, mode: "minor", bpm: 104, prog: [[1, 7, 6, 5], [4, 5, 1, 1]], lead: "square", arp: "up8", bass: "R..R..R.R..R..R.", dr: "pop" },
  { n: "재무팀", key: 55, mode: "minor", bpm: 116, prog: [[1, 4, 5, 1], [6, 3, 4, 5]], lead: "pulse25", arp: "alberti", bass: "R...5...R...5...", dr: "march" },
  { n: "옥상 정원", key: 62, mode: "major", bpm: 100, prog: [[1, 4, 1, 5], [4, 1, 5, 1]], lead: "triangle", arp: "updown16", bass: "R...R...5...R...", dr: "soft" },
  { n: "헬기장", key: 57, mode: "mixo", bpm: 140, prog: [[1, 7, 4, 1], [1, 7, 6, 7]], lead: "saw", arp: "up8", bass: "R.R.R.R.R.R.R.R.", dr: "busy" },
  { n: "구름 위", key: 65, mode: "lydian", bpm: 84, prog: [[1, 2, 1, 2], [4, 5, 6, 5]], lead: "sine", arp: "pad", bass: "R...............", dr: "none", echo: true, vib: true },
  { n: "성층권", key: 59, mode: "minor", bpm: 96, prog: [[1, 6, 7, 1], [4, 6, 7, 5]], lead: "triangle", arp: "updown16", bass: "R.......R.......", dr: "soft", echo: true },
  { n: "달 지사", key: 52, mode: "minor", bpm: 76, prog: [[1, 6, 1, 7], [4, 6, 5, 5]], lead: "sine", arp: "pad", bass: "R...............", dr: "half", echo: true, vib: true },
  { n: "화성 공장", key: 50, mode: "phryg", bpm: 128, prog: [[1, 1, 2, 1], [6, 7, 2, 1]], lead: "saw", arp: "none", bass: "R.R.RR.RR.R.RR.R", dr: "busy" },
  { n: "우주 정거장", key: 60, mode: "lydian", bpm: 120, prog: [[1, 2, 5, 1], [6, 2, 5, 5]], lead: "pulse25", arp: "up16", bass: "R..R..R.R..R..R.", dr: "four" },
  { n: "은하 물류센터", key: 63, mode: "major", bpm: 134, prog: [[1, 5, 6, 4], [2, 5, 1, 1]], lead: "square", arp: "up16", bass: "R.R.R.R.R.R.R.R.", dr: "pop" },
  { n: "블랙홀 재무팀", key: 49, mode: "phryg", bpm: 108, prog: [[1, 2, 1, 6], [1, 2, 7, 1]], lead: "saw", arp: "pad", bass: "R...R...R...R...", dr: "half" },
  { n: "시공간 이사회", key: 57, mode: "harm", bpm: 144, prog: [[1, 6, 4, 5], [1, 4, 5, 5]], lead: "square", arp: "up16", bass: "R.R.R.R.R.R.R.R.", dr: "busy" },
  { n: "지하 문서고", key: 55, mode: "dorian", bpm: 160, prog: [[1, 7, 1, 7], [4, 5, 1, 7]], lead: "pulse12", arp: "up16", bass: "RRRRRRRRRRRRRRRR", dr: "techno" },
];
const LEAD_RHY = ["x...x...x.x.x...", "x.x.x...x...x...", "x..x..x.x.......", "x.......x...x.x.", "x.xxx...x.x.x...", "x...x.x...x.x.x.", "xx..x...xx..x..."];
var bgmSongs;
let bgm = { theme: -1, song: null, step: 0, nextT: 0, bus: null, echo: null };
function buildSong(ti) {
  bgmSongs = bgmSongs || new Map();
  if (bgmSongs.has(ti)) return bgmSongs.get(ti);
  const th = BGM_THEMES[ti], R = rng(4242 + ti * 7919), sc = MODES[th.mode];
  const deg = d => th.key + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  const steps = Array.from({ length: 256 }, () => []);
  const roots = []; for (let b = 0; b < 16; b++) roots.push(th.prog[b < 8 ? 0 : 1][b % 4] - 1);
  // 2마디짜리 동기(motif) 두 개를 만들어 A(1~8마디)·B(9~16마디)에서 반복·변형
  const motif = () => {
    const rA = LEAD_RHY[Math.floor(R() * LEAD_RHY.length)], rB = LEAD_RHY[Math.floor(R() * LEAD_RHY.length)], notes = [];
    let off = [0, 2, 4][Math.floor(R() * 3)];
    [rA, rB].forEach((rh, bar) => { for (let s = 0; s < 16; s++) if (rh[s] === "x") {
      if (s % 4 === 0) { const ct = [0, 2, 4, 7]; off = ct.reduce((a, c) => Math.abs(c - off) < Math.abs(a - off) ? c : a, 0) + (R() < 0.3 ? 2 : 0); }
      else off += R() < 0.5 ? 1 : -1;
      off = Math.max(-2, Math.min(9, off)); notes.push({ s: bar * 16 + s, off });
    } });
    notes.forEach((n, i) => n.len = Math.min(6, ((notes[i + 1] ? notes[i + 1].s : 32) - n.s)));
    return notes;
  };
  const mA = motif(), mB = motif();
  for (let pair = 0; pair < 8; pair++) {
    const m = pair < 4 ? mA : mB, varied = pair % 2 === 1;
    m.forEach((n, i) => {
      const bar = pair * 2 + Math.floor(n.s / 16), root = roots[bar];
      let off = n.off;
      if (varied && i >= m.length - 2) off += (i === m.length - 1 ? 0 : 1) - (pair === 7 ? off % 7 : 0);
      const st = pair * 32 + n.s;
      steps[st].push({ i: "lead", m: deg(root + off) + 12, d: (pair === 7 && i === m.length - 1) ? 8 : n.len });
    });
  }
  for (let b = 0; b < 16; b++) {
    const root = roots[b], base = b * 16, triad = [root, root + 2, root + 4];
    // 베이스
    for (let s = 0; s < 16; s++) { const c = th.bass[s]; if (c === ".") continue; const o = c === "5" ? 4 : c === "3" ? 2 : c === "8" ? 7 : 0; steps[base + s].push({ i: "bass", m: deg(root + o) - 24, d: c === "R" && th.bass[s + 1] === "R" ? 1 : 2 }); }
    // 반주
    if (th.arp === "pad") triad.forEach(d => steps[base].push({ i: "pad", m: deg(d), d: 16 }));
    else if (th.arp !== "none") {
      const seq = th.arp === "alberti" ? [0, 2, 1, 2] : th.arp === "updown16" ? [0, 1, 2, 3, 2, 1] : [0, 1, 2, 3];
      const every = th.arp === "up8" || th.arp === "alberti" ? 2 : 1, tones = [triad[0], triad[1], triad[2], root + 7];
      for (let s = 0, k = 0; s < 16; s += every, k++) steps[base + s].push({ i: "arp", m: deg(tones[seq[k % seq.length]]), d: every });
    }
    // 드럼 (8마디마다 마지막 마디에 필인)
    const dp = DR[th.dr];
    for (let s = 0; s < 16; s++) {
      if (dp.k[s] === "x") steps[base + s].push({ i: "kick" });
      if (dp.s[s] === "x" || (b % 8 === 7 && s >= 12 && th.dr !== "none" && th.dr !== "soft")) steps[base + s].push({ i: "snare" });
      if (dp.h[s] === "x") steps[base + s].push({ i: "hat" });
    }
  }
  const song = { steps, th }; bgmSongs.set(ti, song); return song;
}
function bgmNote(e, t, spb, th) {
  const bus = bgm.bus; if (!bus) return;
  if (e.i === "kick") { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.25); return; }
  if (e.i === "snare") { noiseHit(t, 0.13, "bandpass", 1900, 0.22, 0, bus); const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = "triangle"; o.frequency.value = 190; g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.1); return; }
  if (e.i === "hat") { noiseHit(t, 0.035, "highpass", 7500, 0.07, 0, bus); return; }
  const dur = e.d * spb, wave = e.i === "lead" ? th.lead : e.i === "bass" ? (th.lead === "saw" ? "square" : "triangle") : e.i === "pad" ? "sine" : "triangle";
  const vol = { lead: 0.13, bass: 0.16, arp: 0.055, pad: 0.05 }[e.i];
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  if (wave.startsWith("pulse")) o.setPeriodicWave(pulseWave(wave === "pulse12" ? 0.125 : 0.25)); else o.type = wave === "saw" ? "sawtooth" : wave;
  o.frequency.setValueAtTime(midiHz(e.m), t);
  let node = o;
  if (wave === "saw") { const f = audioCtx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 2200; o.connect(f); node = f; }
  if (e.i === "lead" && th.vib) { const l = audioCtx.createOscillator(), lg = audioCtx.createGain(); l.frequency.value = 5.5; lg.gain.value = 9; l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + dur + 0.3); }
  const atk = e.i === "pad" ? 0.12 : 0.006;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); g.gain.setTargetAtTime(vol * 0.6, t + atk + 0.02, 0.08); g.gain.setTargetAtTime(0.0001, t + Math.max(atk + 0.03, dur * 0.9), 0.04);
  node.connect(g); g.connect(e.i === "lead" && bgm.echo ? bgm.echo : bus); if (e.i === "lead" && bgm.echo) g.connect(bus);
  o.start(t); o.stop(t + dur + 0.3);
}
function bgmTick() {
  if (!audioCtx || !bgm.song || audioCtx.state !== "running") return;
  const th = bgm.song.th, spb = 60 / th.bpm / 4, boss = mode === "tower" && mon && mon.kind >= 2 && !mon.dying;
  while (bgm.nextT < audioCtx.currentTime + 0.15) {
    const i = bgm.step % 256, t = bgm.nextT + (i % 2 ? (th.swing || 0) * spb : 0);
    try {
      bgm.song.steps[i].forEach(e => bgmNote(e, t, spb, th));
      if (boss) { if (i % 4 === 0) bgmNote({ i: "kick" }, t, spb, th); if (i % 2 === 1) bgmNote({ i: "hat" }, t, spb, th); }
    } catch (e) {}
    bgm.step++; bgm.nextT += spb;
  }
}
function bgmUpdate() {
  if (!audioCtx || !masterGain) return;
  const want = musicOn() && !document.hidden ? (mode === "vault" ? 20 : zoneNo(shownFloor()) % 20) : -1;
  if (want === bgm.theme) return;
  const now = audioCtx.currentTime, old = bgm.bus;
  bgmGain.gain.cancelScheduledValues(now); bgmGain.gain.setTargetAtTime(0, now, 0.12);
  bgm.theme = want; bgm.song = null; bgm.bus = null; bgm.echo = null;
  if (old) setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 900);
  if (want < 0) return;
  const song = buildSong(want), bus = audioCtx.createGain(); bus.gain.value = 1; bus.connect(bgmGain);
  if (song.th.echo) { const d = audioCtx.createDelay(1), fb = audioCtx.createGain(), wet = audioCtx.createGain(); d.delayTime.value = 60 / song.th.bpm * 0.75; fb.gain.value = 0.33; wet.gain.value = 0.4; d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(bus); bgm.echo = d; }
  bgm.bus = bus; bgm.song = song; bgm.step = 0; bgm.nextT = now + 0.55;
  bgmGain.gain.setTargetAtTime(BGM_VOL, now + 0.5, 0.35);
}
setInterval(bgmTick, 30);
document.addEventListener("pointerdown", () => { if (S.sound && audioReady()) bgmUpdate(); }, { passive: true });
document.addEventListener("click", e => { const b = e.target && e.target.closest && e.target.closest("button"); if (b && !b.disabled) sfx("tick"); }, true);
document.addEventListener("visibilitychange", () => { if (!audioCtx) return; try { if (document.hidden) audioCtx.suspend(); else audioCtx.resume(); } catch (e) {} });
