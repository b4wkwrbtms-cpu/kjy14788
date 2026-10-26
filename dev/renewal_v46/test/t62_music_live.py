from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); pg=b.new_page(viewport={'width':393,'height':852})
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    pg.mouse.click(200,400); E("audioReady(); audioCtx.resume(); bgmUpdate()"); pg.wait_for_timeout(1500)
    N=E("bgm.song.steps.length"); print('N',N,'BS',E("bgm.song.BS"), 'bpm', E("bgm.song.th.bpm"))
    E(f"bgm.cycle=2; bgm.step={N}-1"); pg.wait_for_timeout(1200)
    print('rest?', E("bgm.restCycle"), 'restEnd', E("bgm.restEnd"), 'leadGain', E("bgm.L.lead.gain.value.toFixed(2)"))
    E("bgm.step = bgm.restEnd"); pg.wait_for_timeout(1200)
    print('silentUntil>0', E("bgm.silentUntil>0"), 'bgmGain→', E("bgmGain.gain.value.toFixed(3)"))
    E("bgm.silentUntil = audioCtx.currentTime - 1"); pg.wait_for_timeout(2500)
    print('resumed: silentUntil', E("bgm.silentUntil"), 'cycle', E("bgm.cycle"), 'rest', E("bgm.restCycle"), 'gain', E("bgmGain.gain.value.toFixed(3)"))
    # focus toggle off while reading
    E("openReader(18,22)"); pg.wait_for_timeout(1200); print('focus on', E("!!focus"))
    E("shTool('sh-fm-off')"); pg.wait_for_timeout(800); print('after off: focus', E("!!focus"), 'theme', E("bgm.theme"))
    E("shTool('sh-fm-on')"); pg.wait_for_timeout(800); print('after on: focus', E("!!focus"))
    print('errs', errs); b.close()
