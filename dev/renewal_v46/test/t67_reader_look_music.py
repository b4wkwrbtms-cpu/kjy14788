from playwright.sync_api import sync_playwright
import glob
errs=[]
SC='/tmp/claude-0/-home-claude/520138e5-6776-5ac9-a635-cb90964eab75/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); pg=b.new_page(viewport={'width':393,'height':852}, device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("selectTab('set', true)"); pg.wait_for_timeout(500); pg.set_input_files('#stFbFile', sorted(glob.glob('/home/claude/bgm_in/*.mp3'))); pg.wait_for_timeout(4000)
    print('stored', E("fb.list && fb.list.length"), 'selects', E("document.querySelectorAll('select.fb-sel').length"))
    # remap: Elfwood -> read
    pg.select_option('select[data-map="elfwood"]', 'read'); pg.wait_for_timeout(500); print('map', E("JSON.stringify(S.bgmMap)"), 'elfwood scene', E("fbSceneKey('elfwood')"))
    pg.mouse.click(200,300); E("S.floor=120; S.ore=500; audioReady(); audioCtx.resume(); fb.jingled=true; updateUI(true); bgmUpdate()"); pg.wait_for_timeout(2500)
    print('zone:', E("fb.track"), 'sfx gain', E("sfxGain.gain.value.toFixed(2)"))
    E("openReader(42,14)"); pg.wait_for_timeout(2500)
    print('reading: track', E("fb.track"), E("fb.scene"), 'sfx', E("sfxGain.gain.value.toFixed(2)"), 'readMode', E("readMode()"), 'aa?', E("!!document.querySelector('.rd-top .rd-aa')"), 'opts?', E("!!$('rdOpts')"))
    pg.screenshot(path=SC+'c1_dark.png')
    pg.locator('.rd-top .rd-aa').click(); pg.wait_for_timeout(400); pg.screenshot(path=SC+'c2_opts.png')
    print('music options', E("$('rdOpts').querySelector('select').options.length"))
    pg.locator('#rdOpts [data-r="sh-bg-paper"]').click(); pg.locator('#rdOpts [data-r="fs+"]').click(); pg.wait_for_timeout(300)
    pg.select_option('#rdOpts select[data-r="sh-rm"]', 'synth'); pg.wait_for_timeout(1500)
    print('synth chosen: fb.track', E("fb.track"), 'focus', E("!!focus"), 'rdfs', E("S.rdfs"))
    pg.locator('.rd-top .rd-aa').click(); pg.wait_for_timeout(300); pg.screenshot(path=SC+'c3_paper.png')
    E("$('rdBody').scrollTop=700"); pg.wait_for_timeout(300); pg.screenshot(path=SC+'c4_paper_mid.png')
    pg.locator('.rd-top .rd-aa').click(); pg.select_option('#rdOpts select[data-r="sh-rm"]', 'aquarium'); pg.locator('#rdOpts [data-r="sh-bg-cream"]').click(); pg.locator('#rdOpts [data-r="sh-lh-t"]').click(); pg.locator('.rd-top .rd-aa').click(); pg.wait_for_timeout(2500)
    print('aquarium chosen: fb.track', E("fb.track"), 'focus', E("!!focus"))
    pg.screenshot(path=SC+'c5_cream_tight.png')
    E("closeReader()"); pg.wait_for_timeout(2500); print('closed: track', E("fb.track"), 'sfx', E("sfxGain.gain.value.toFixed(2)"))
    # sheet still works + shares look
    E("openReader(18,22)"); pg.wait_for_timeout(2000); a=pg.locator('#rdBody a.nl[data-nt^="ot-"]').first; a.scroll_into_view_if_needed(); a.click(); pg.wait_for_timeout(1000); pg.screenshot(path=SC+'c6_sheet_cream.png')
    print('errs', errs); b.close()
