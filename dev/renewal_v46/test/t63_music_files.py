from playwright.sync_api import sync_playwright
import glob
errs=[]
files=sorted(glob.glob('/home/claude/bgm_in/*.mp3'))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); pg=b.new_page(viewport={'width':393,'height':852})
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("selectTab('set', true)"); pg.wait_for_timeout(800)
    print('card?', E("!!$('stFbFile')"), 'sub', E("$('stFbSub').textContent"))
    pg.set_input_files('#stFbFile', files); pg.wait_for_timeout(4000)
    print('stored', E("fb.list && fb.list.length"), 'sub', E("$('stFbSub').textContent"))
    print('list sample', E("$('stFbList').textContent.slice(0,200)"))
    pg.mouse.click(200,300); E("audioReady(); audioCtx.resume(); bgmUpdate()"); pg.wait_for_timeout(2500)
    print('playing', E("fb.track"), 'scene', E("fb.scene"), 'paused', E("fb.el[fb.cur] && fb.el[fb.cur].paused"), 'ct', E("fb.el[fb.cur] && fb.el[fb.cur].currentTime.toFixed(1)"), 'proc theme', E("bgm.theme"), 'focus', E("!!focus"))
    E("fb.el[fb.cur].currentTime = 8.5"); pg.wait_for_timeout(2500)
    print('after jingle:', E("fb.track"), E("fb.scene"), 'ct', E("fb.el[fb.cur].currentTime.toFixed(1)"), 'gain', E("fb.g[fb.cur].gain.value.toFixed(3)"))
    E("openReader(18,22)"); pg.wait_for_timeout(2500)
    print('reading:', E("fb.track"), E("fb.scene"), 'gain', E("fb.g[fb.cur].gain.value.toFixed(3)"), 'other paused', E("fb.el[1-fb.cur].paused"))
    E("closeReader()"); pg.wait_for_timeout(2500)
    print('back:', E("fb.track"), E("fb.scene"))
    E("selectTab('suit', true)"); pg.wait_for_timeout(2500); print('shop:', E("fb.track"), E("fb.scene"))
    E("selectTab('set', true)"); E("S.bgmFiles=false; fb.k=''; bgmUpdate()"); pg.wait_for_timeout(2500); print('files off → proc theme', E("bgm.theme"), 'fb cur', E("fb.cur"))
    pg.reload(); pg.wait_for_timeout(3000); E("selectTab('set', true)"); pg.wait_for_timeout(800); print('after reload stored', E("fb.list && fb.list.length"))
    print('errs', errs); b.close()
