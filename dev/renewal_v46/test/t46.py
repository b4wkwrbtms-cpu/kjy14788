from playwright.sync_api import sync_playwright
errs=[]
def shot(pg,n): pg.screenshot(path=f'/home/claude/renewal/test/{n}.png')
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1500)
    except Exception as e: print('no attend')
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    def scroll(y): E(f"$('rdBody').scrollTop={y}"); pg.wait_for_timeout(300)
    E("openReader(8,2)"); pg.wait_for_timeout(2500)
    # dialogue labels
    y=E("(()=>{const e=document.querySelector('.sp-lab');return e?e.getBoundingClientRect().top+$('rdBody').scrollTop-200:0})()"); scroll(y); shot(pg,'02_sam3_dialog')
    print('sp-lab sample',E("[...document.querySelectorAll('.sp-lab')].slice(0,6).map(e=>e.textContent)"))
    # note link
    nl=pg.locator('a.nl').first; print('nl',nl.get_attribute('data-nt'),nl.text_content())
    nl.scroll_into_view_if_needed(); nl.click(); pg.wait_for_timeout(700); shot(pg,'03_note_sheet')
    pg.locator('button[data-r="sh-x"],.rd-sh-card [data-r="sh-x"]').last.click(); pg.wait_for_timeout(500)
    # verse memo
    sv=pg.locator('sup[data-vn="10"]'); sv.scroll_into_view_if_needed(); sv.click(); pg.wait_for_timeout(1500); shot(pg,'04_verse_memo')
    pg.locator('button[data-r="sh-x"],.rd-sh-card [data-r="sh-x"]').last.click(); pg.wait_for_timeout(500)
    # chapter end notes
    scroll(99999); shot(pg,'05_sam3_end')
    # options
    scroll(0); pg.locator('[data-r="ops"]').click(); pg.wait_for_timeout(400); shot(pg,'06_opts')
    pg.locator('[data-r="op"][data-k="col"]').click(); pg.wait_for_timeout(300)
    pg.locator('[data-r="op"][data-k="flow"]').click(); pg.wait_for_timeout(300)
    print('opts',E("JSON.stringify(rdOpt())"))
    pg.locator('[data-r="ops"]').click(); pg.wait_for_timeout(300)
    y=E("(()=>{const e=document.querySelector('a.nl');return e?e.getBoundingClientRect().top+$('rdBody').scrollTop-300:0})()"); scroll(y); shot(pg,'07_color')
    # Genesis 5 flow folds
    E("closeReader()"); pg.wait_for_timeout(300); E("openReader(0,4)"); pg.wait_for_timeout(2500); shot(pg,'08_gen5_fold')
    print('gen5 check before',E("checkCurrent()"), E("document.querySelectorAll('.rd-fold').length"))
    scroll(99999); shot(pg,'09_gen5_end')
    btn=pg.locator('[data-r="fold-all"]'); print('foldall',btn.count())
    if btn.count(): btn.first.click(); pg.wait_for_timeout(500)
    scroll(0); shot(pg,'10_gen5_open')
    # Genesis 22 large font
    E("closeReader()"); E("openReader(0,21)"); pg.wait_for_timeout(2500)
    try:
        for i in range(3): pg.get_by_role('button',name='가+').click(timeout=1000); pg.wait_for_timeout(200)
    except Exception as e: print('font',e)
    scroll(600); shot(pg,'11_gen22_big')
    # scroll memory
    scroll(1500); E("closeReader()"); pg.wait_for_timeout(300); E("openReader(0,21)"); pg.wait_for_timeout(2000)
    print('restored scroll',E("$('rdBody').scrollTop"))
    # beyond book 12 (no x data)
    E("closeReader()"); E("openReader(18,22)"); pg.wait_for_timeout(2500); shot(pg,'12_ps23')
    b.close()
print('errs',errs)
