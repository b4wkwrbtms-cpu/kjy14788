# 신약 새 카드: 마태복음 5·6장 밑줄 → 카드(헬라어) → 읽던 자리
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1200)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    for bk,ch in [(39,4),(39,5)]:
        E("closeReader()"); pg.wait_for_timeout(300); E(f"openReader({bk},{ch})"); pg.wait_for_timeout(2500)
        print(ch+1,'links',E("[...document.querySelectorAll('#rdBody a.nl')].map(a=>a.textContent+'→'+a.dataset.nt).filter(s=>s.includes('nt-')).slice(0,8)"))
    a=pg.locator('#rdBody a.nl[data-nt^="nt-"]').first; a.scroll_into_view_if_needed(); pg.wait_for_timeout(300); y0=E("$('rdBody').scrollTop"); a.click(); pg.wait_for_timeout(1200)
    pg.screenshot(path='/home/claude/renewal/test/50_mt6_card.png')
    print('card',E("$('rdShBody').textContent.slice(0,160)"))
    pg.locator('.rd-sh-back').click(); pg.wait_for_timeout(400); print('scroll',y0,'->',E("$('rdBody').scrollTop"),'errs',errs); b.close()
