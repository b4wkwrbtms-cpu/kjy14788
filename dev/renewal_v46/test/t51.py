# 설교 연결: 느 1장(설교 본문) 장 머리·금색 절·절 누르면 '설교에서 이 말씀' / 요 3:16(주소 없이 인용) / 창 13장 해설 카드 안 설교 / 읽던 자리
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1200)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("openReader(15,0)"); pg.wait_for_timeout(2500)
    print('neh1 box',E("($('rdBody').querySelector('.rd-sm')||{}).textContent"))
    print('gold verses',E("document.querySelectorAll('#rdBody sup.sm').length"))
    pg.screenshot(path='/home/claude/renewal/test/51_neh1_top.png')
    sv=pg.locator('#rdBody sup.sm').nth(3); sv.scroll_into_view_if_needed(); y0=E("$('rdBody').scrollTop"); sv.click(); pg.wait_for_timeout(900)
    pg.screenshot(path='/home/claude/renewal/test/52_neh1_verse.png'); print('verse sheet',E("$('rdShBody').textContent.slice(0,260)"))
    pg.locator('#rdShBody .nt-chip.k-sm').first.click(); pg.wait_for_timeout(700); print('sermon card',E("$('rdShBody').querySelector('h3').textContent"), 'mentions', E("[...document.querySelectorAll('#rdShBody summary')].map(s=>s.textContent)"))
    pg.screenshot(path='/home/claude/renewal/test/53_sermon_card.png')
    pg.locator('[data-r="sh-prev"]').click(); pg.wait_for_timeout(400); pg.locator('.rd-sh-back').click(); pg.wait_for_timeout(400); print('scroll',y0,'->',E("$('rdBody').scrollTop"))
    E("closeReader()"); pg.wait_for_timeout(300); E("openReader(42,2)"); pg.wait_for_timeout(2500)
    s16=pg.locator('#rdBody sup[data-vn="16"]'); print('jn3:16 class',s16.get_attribute('class')); s16.scroll_into_view_if_needed(); s16.click(); pg.wait_for_timeout(800)
    print('jn3:16',E("$('rdShBody').textContent.slice(0,300)")); pg.locator('.rd-sh-back').click(); pg.wait_for_timeout(300)
    E("closeReader()"); pg.wait_for_timeout(300); E("openReader(0,12)"); pg.wait_for_timeout(2500)
    links=E("[...document.querySelectorAll('#rdBody a.nl')].length"); found=False
    for i in range(links):
        a=pg.locator('#rdBody a.nl').nth(i); a.scroll_into_view_if_needed(); a.click(); pg.wait_for_timeout(500)
        if E("!!document.querySelector('#rdShBody .nt-chip.k-sm')"): found=True; print('gen13 card w/ sermon:',E("$('rdShBody').querySelector('h3').textContent")); pg.locator('.rd-sh-back').click(); break
        pg.locator('.rd-sh-back').click(); pg.wait_for_timeout(200)
    print('found',found,'hscroll',E("document.documentElement.scrollWidth"),'errs',errs); b.close()
