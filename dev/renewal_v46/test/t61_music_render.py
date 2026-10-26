from playwright.sync_api import sync_playwright
import base64, json
errs=[]
SC='/tmp/claude-0/-home-claude/520138e5-6776-5ac9-a635-cb90964eab75/scratchpad/'
RENDER = r'''
(async (kind, zone, sub, dur) => {
  const sr = 32000, oc = new OfflineAudioContext(2, Math.ceil(sr*dur), sr);
  const saved = { ctx: audioCtx, mg: masterGain, bg: bgmGain, sg: sfxGain, nl: noiseLong, pw: pulseWaves, bgm: Object.assign({}, bgm), ir: bgmIR, f: focus };
  audioCtx = oc; masterGain = null; sfxGain = null; bgmGain = null; noiseLong = null; pulseWaves = {}; bgmIR = null; focus = null; bgmSongs = null;
  audioReady(); bgmGain.gain.value = BGM_VOL;
  if (kind === 'zone') {
    const song = buildSong(zone, sub), B = bgmMakeBus();
    const cv = oc.createConvolver(), wet = oc.createGain(); cv.buffer = reverbIR(); wet.gain.value = song.th.rev||0.3; B.main.connect(cv); cv.connect(wet); wet.connect(bgmGain);
    bgm.main = B.main; bgm.L = B.L; bgm.bus = B.main; bgm.song = song; bgm.step = 0; bgm.cycle = 0; bgm.restCycle = false; bgm.silentUntil = 0;
    const th = song.th, spb = 60/th.bpm/4, N = song.steps.length;
    let t = 0.3, i = 0;
    while (t < dur) {
      const k = i % N;
      if (k % song.BS === 0) { const tg = { lead: (Math.floor(k/song.BS)>>3)===1 && (i>=N) ? 0 : 1, arp: 1, pad: 1, bass: 1, drum: 0.8 }; for (const q in tg) B.L[q].gain.setTargetAtTime(tg[q], t, 0.4); }
      song.steps[k].forEach(e => { bgm.bus = B.L[LAYER_OF(e)]; bgmNote(e, t + (k%2 ? (th.swing||0)*spb : 0), spb, th); });
      t += spb; i++;
    }
  } else {
    const _rn = readingNow; readingNow = () => true; S.focusMusic = true;
    focusStart(); focus.out.gain.cancelScheduledValues(0); focus.out.gain.setValueAtTime(BGM_VOL*FOCUS_VOL, 0);
    for (let now = 0; now < dur; now += 0.5) focusTick(now);
    var _restoreRn = () => { readingNow = _rn; };
  }
  const buf = await oc.startRendering();
  if (typeof _restoreRn === 'function') _restoreRn();
  // restore
  audioCtx = saved.ctx; masterGain = saved.mg; bgmGain = saved.bg; sfxGain = saved.sg; noiseLong = saved.nl; pulseWaves = saved.pw; bgmIR = saved.ir; focus = saved.f; bgmSongs = null;
  Object.assign(bgm, saved.bgm);
  // to wav 16-bit
  const n = buf.length, ch = 2, out = new DataView(new ArrayBuffer(44 + n*ch*2));
  const w = (o, s) => { for (let i=0;i<s.length;i++) out.setUint8(o+i, s.charCodeAt(i)); };
  w(0,'RIFF'); out.setUint32(4, 36+n*ch*2, true); w(8,'WAVE'); w(12,'fmt '); out.setUint32(16,16,true); out.setUint16(20,1,true); out.setUint16(22,ch,true); out.setUint32(24,sr,true); out.setUint32(28,sr*ch*2,true); out.setUint16(32,ch*2,true); out.setUint16(34,16,true); w(36,'data'); out.setUint32(40,n*ch*2,true);
  let peak = 0; const L = buf.getChannelData(0), R = buf.getChannelData(1);
  for (let i=0;i<n;i++){ peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
  let p = 44; for (let i=0;i<n;i++){ for (const c of [L,R]) { const v = Math.max(-1, Math.min(1, c[i])); out.setInt16(p, v<0 ? v*32768 : v*32767, true); p += 2; } }
  const b64 = btoa(String.fromCharCode(...new Uint8Array(out.buffer).subarray(0, 1)));
  const bytes = new Uint8Array(out.buffer); let bin = ''; for (let i=0;i<bytes.length;i+=8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i+8192));
  return { b64: btoa(bin), peak };
})
'''
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); pg=b.new_page(viewport={'width':393,'height':852})
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    # all songs build?
    print('songs ok', E("(()=>{let n=0;for(let z=0;z<21;z++)for(let s=0;s<5;s++){const g=buildSong(z,s); if(g.steps.length>0)n++;} return n;})()"))
    # live: start audio, check ticks + focus switching
    pg.mouse.click(200,400); pg.wait_for_timeout(300)
    E("audioReady(); audioCtx.resume(); bgmUpdate()"); pg.wait_for_timeout(2500)
    print('live theme', E("bgm.theme"), 'step', E("bgm.step"), 'layers', E("bgm.L && Object.keys(bgm.L).length"))
    E("openReader(18,22)"); pg.wait_for_timeout(1500)
    print('reading: theme', E("bgm.theme"), 'focus', E("!!focus"), 'key', E("focus && focus.key"))
    E("closeReader()"); pg.wait_for_timeout(1200)
    print('closed: theme', E("bgm.theme"), 'focus', E("!!focus"))
    for kind, zone, sub, dur, name in [('focus',0,0,75,'focus')]:
        r = pg.evaluate("c=>window.__ev(c)", RENDER + f"('{kind}',{zone},{sub},{dur})")
        open(SC+name+'.wav','wb').write(base64.b64decode(r['b64'])); print(name, 'peak', round(r['peak'],3))
    print('errs', errs); b.close()
