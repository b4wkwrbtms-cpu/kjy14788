# 해설 속 성경 주소 → 관련 구절 → 해설로 → 읽던 본문으로 (390px)
from playwright.sync_api import sync_playwright
errs=[]
def shot(pg,n): pg.screenshot(path=f'/home/claude/renewal/test/{n}.png')
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1200)
    except Exception: print('no attend')
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    print('refHtml', E("refHtml('삼상 1:20에서, 사무엘하 12:31–33, 오후 3:15, 시 23:1, 창 99:1, 요일 4:8')"))
    E("openReader(8,2)"); pg.wait_for_timeout(2500)
    
    nl=pg.locator('a.nl').last; nl.scroll_into_view_if_needed(); pg.wait_for_timeout(300); y0=E("$('rdBody').scrollTop"); nl.click(); pg.wait_for_timeout(900)
    nb=E("document.querySelectorAll('#rdShBody .vref').length"); print('vref in card',nb)
    E("document.querySelectorAll('#rdShBody details').forEach(d=>d.open=true)")
    E("$('rdShBody').scrollTop=500"); pg.wait_for_timeout(200); s0=E("$('rdShBody').scrollTop")
    v=pg.locator('#rdShBody .vref').first; print('click',v.text_content(), v.get_attribute('data-go'))
    v.scroll_into_view_if_needed(); s0=E("$('rdShBody').scrollTop"); v.click(); pg.wait_for_timeout(1200); shot(pg,'30_ref')
    print('ref sheet',E("$('rdShBody').textContent.slice(0,200)"))
    pg.locator('[data-r="sh-prev"]').click(); pg.wait_for_timeout(500)
    print('back to card', E("$('rdShBody').querySelector('h3')&&$('rdShBody').querySelector('h3').textContent"), 'scroll', s0, '->', E("$('rdShBody').scrollTop"))
    pg.locator('.rd-sh-back').click(); pg.wait_for_timeout(500)
    print('sheet hidden',E("$('rdSheet').hidden"),'reader', E("BOOKS[rd.b][0]+' '+(rd.c+1)"), 'scroll',y0,'->',E("$('rdBody').scrollTop"))
    # 신약 카드 아닌 원어 메모 안 주소도
    print('hscroll',E("document.documentElement.scrollWidth"),'errs',errs)
    b.close()
