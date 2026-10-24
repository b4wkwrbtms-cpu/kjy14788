# 13~66권 인물·지명 연결: 역대상·마태복음에서 밑줄 → 카드 → 관련 구절 → 읽던 자리
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1200)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    for bk,ch,name in [(12,17,'40_1chr18'),(39,0,'41_mt1'),(23,38,'42_jer39')]:
        E("closeReader()"); pg.wait_for_timeout(300); E(f"openReader({bk},{ch})"); pg.wait_for_timeout(2500)
        n=E("document.querySelectorAll('#rdBody a.nl').length"); print(name,'links',n, E("[...document.querySelectorAll('#rdBody a.nl')].slice(0,6).map(a=>a.textContent+'→'+a.dataset.nt)"))
        if n:
            a=pg.locator('#rdBody a.nl').last; a.scroll_into_view_if_needed(); pg.wait_for_timeout(300); y0=E("$('rdBody').scrollTop"); a.click(); pg.wait_for_timeout(1200)
            pg.screenshot(path=f'/home/claude/renewal/test/{name}.png')
            print('  card',E("($('rdShBody').querySelector('h3')||{}).textContent"))
            pg.locator('.rd-sh-back').click(); pg.wait_for_timeout(400); print('  scroll',y0,'->',E("$('rdBody').scrollTop"))
    print('errs',errs); b.close()
