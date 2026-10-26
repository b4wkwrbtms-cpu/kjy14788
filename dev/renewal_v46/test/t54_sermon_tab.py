from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1200)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("S.floor=9; S.study.total=1; updateUI(true)"); pg.wait_for_timeout(500); E("selectTab('study', true)"); pg.wait_for_timeout(2000)
    print('tab label', E("menuLabel('study')"), '| items', E("document.querySelectorAll('#smList .sm-li').length"), '| subj input?', E("!!$('subj')"), '| stStart?', E("!!$('stStart')"))
    print('head', E("$('thSub').textContent"))
    pg.locator('#smList .sm-li').first.click(); pg.wait_for_timeout(2500)
    print('reader open', E("!$('reader').hidden"), '| sheet', E("!$('rdSheet').hidden"), '| smread', E("JSON.stringify(smRead && smRead.sid)"), '| running', E("S.study.running"), '| subject', E("S.study.subject"))
    print('text head', E("$('rdShBody').textContent.slice(0,120)"))
    # scroll to bottom; fake time
    E("smRead.t0 -= 25*60000"); E("$('rdShBody').scrollTop = $('rdShBody').scrollHeight"); pg.wait_for_timeout(1500)
    print('done', E("JSON.stringify(S.smDone)"), '| ore', E("S.ore"))
    E("S.study.lastConfirm -= 26*60000"); pg.wait_for_timeout(1500)
    print('today min', E("S.study.today"), 'depth', E("S.study.depth"))
    pg.locator('.rd-sh-back').click(); pg.wait_for_timeout(1500)
    print('after close smRead', E("smRead"), 'running', E("S.study.running"))
    E("closeReader()"); pg.wait_for_timeout(800)
    print('list done count', E("document.querySelectorAll('#smList .sm-li.done').length"))
    print('errs', errs); b.close()
