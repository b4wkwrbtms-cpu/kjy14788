# 설교 전문: 느 1장 → 설교 카드 → 전문 읽기 → 전문 속 주소/↳ 칩 → 관련 구절(+설교 풀이) → 돌아가기 2단계 → 읽던 자리
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1200)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    print('refKo',E("refHtml('요한복음 3장 16절에, 요한복음 15장 4-6절, 시편 23편, 느헤미야 1장 1절부터 11절, 12장 오후 3시')"))
    E("openReader(15,0)"); pg.wait_for_timeout(2500); y0=E("$('rdBody').scrollTop=400")
    pg.locator('.rd-sm .nt-chip').first.click(); pg.wait_for_timeout(700)
    pg.locator('#rdShBody [data-smt]').first.click(); pg.wait_for_timeout(1500)
    print('full', E("$('rdShBody').querySelectorAll('.sm-p').length"), 'quotes', E("$('rdShBody').querySelectorAll('.sm-qb').length"), 'chips', E("$('rdShBody').querySelectorAll('.sm-mc').length"), 'vrefs', E("$('rdShBody').querySelectorAll('.vref').length"))
    pg.screenshot(path='/home/claude/renewal/test/54_full.png')
    c=pg.locator('#rdShBody .sm-mc').nth(2); c.scroll_into_view_if_needed(); pg.wait_for_timeout(200); s0=E("$('rdShBody').scrollTop"); print('chip',c.text_content()); c.click(); pg.wait_for_timeout(1200)
    pg.screenshot(path='/home/claude/renewal/test/55_full_verse.png')
    print('verse view', E("$('rdShBody').textContent.slice(0,300)"))
    pg.locator('[data-r="sh-prev"]').click(); pg.wait_for_timeout(400); print('back to full', E("($('rdShBody').querySelector('.nt-badge')||{}).textContent"), s0, '->', E("$('rdShBody').scrollTop"))
    pg.locator('[data-r="sh-prev"]').click(); pg.wait_for_timeout(400); print('back to card', E("($('rdShBody').querySelector('.nt-badge')||{}).textContent"))
    pg.locator('.rd-sh-back').click(); pg.wait_for_timeout(400); print('reader scroll', E("$('rdBody').scrollTop"))
    for sid in ['ykj-2-03','jjm-ep-05','ykj-4-05']:
        n=E(f"loadSmt('{sid}').then(d=>d&&d.paras.length)"); print(sid,'paras',n)
    print('hscroll',E("document.documentElement.scrollWidth"),'errs',errs); b.close()
