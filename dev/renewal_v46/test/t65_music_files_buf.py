from playwright.sync_api import sync_playwright
import glob
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); pg=b.new_page(viewport={'width':393,'height':852})
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("selectTab('set', true)"); pg.wait_for_timeout(500); pg.set_input_files('#stFbFile', sorted(glob.glob('/home/claude/bgm_in/*.mp3'))); pg.wait_for_timeout(4000)
    print('stored', E("fb.list && fb.list.length"))
    pg.mouse.click(200,300); E("S.floor=120; S.ore=500; S.best=120; audioReady(); audioCtx.resume(); updateUI(true); bgmUpdate()"); pg.wait_for_timeout(3000)
    print('jingle:', E("fb.track"), E("fb.scene"), 'cur', E("!!fb.cur"), 'gain', E("fb.cur && fb.cur.g.gain.value.toFixed(3)"), 'bufdur', E("fb.cur && fb.cur.src.buffer.duration.toFixed(1)"))
    pg.wait_for_timeout(8000)
    print('zone:', E("fb.track"), E("fb.scene"), 'gain', E("fb.cur && fb.cur.g.gain.value.toFixed(3)"), 'loop', E("fb.cur && fb.cur.src.loop"), 'sr', E("fb.cur && fb.cur.src.buffer.sampleRate"))
    E("openReader(18,22)"); pg.wait_for_timeout(3000)
    print('reading:', E("fb.track"), E("fb.scene"), 'gain', E("fb.cur && fb.cur.g.gain.value.toFixed(3)"), 'cache', E("fbBuf.size"))
    E("closeReader()"); pg.wait_for_timeout(3000); print('back:', E("fb.track"), E("fb.scene"))
    E("selectTab('suit', true)"); pg.wait_for_timeout(3000); print('shop:', E("fb.track"), E("fb.scene"))
    E("S.music=false; bgmUpdate()"); pg.wait_for_timeout(1500); print('music off:', E("fb.track"), 'cur', E("!!fb.cur"))
    E("S.music=true; bgmUpdate()"); pg.wait_for_timeout(3000); print('music on:', E("fb.track"), E("fb.scene"))
    print('errs', errs); b.close()
