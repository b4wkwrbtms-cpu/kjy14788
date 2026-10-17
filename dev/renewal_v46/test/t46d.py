from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2000)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1200)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("openReader(8,2)"); pg.wait_for_timeout(2000)
    pg.locator('[data-r="v-krv"]').click(); pg.wait_for_timeout(800)
    print('krv labels',E("document.querySelectorAll('.sp-lab').length"),'links',E("document.querySelectorAll('a.nl').length"))
    E("$('rdBody').scrollTop=500"); pg.wait_for_timeout(300); pg.screenshot(path='17_krv.png')
    pg.locator('[data-r="v-mz"]').click(); pg.wait_for_timeout(500)
    E("closeReader()"); E("setOpt('flow',true)"); E("openReader(0,4)"); pg.wait_for_timeout(2000)
    E("rd.t0 = Date.now() - 600000; rd.bottom = true")
    print('closed folds',E("foldsClosed()"),'check',E("checkCurrent()"))
    pg.locator('[data-r="fold-all"]').click(); pg.wait_for_timeout(400)
    E("rd.bottom = true")
    print('closed folds',E("foldsClosed()"),'check',E("checkCurrent()"))
    print('rd keys',E("Object.keys(rd).join(',')"))
    b.close()
print('errs',errs)
