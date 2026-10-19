import json
from playwright.sync_api import sync_playwright
errs=[]
def shot(pg,n): pg.screenshot(path=f'/home/claude/renewal/test/{n}.png')
x41=json.load(open('/home/claude/renewal/app/bible/x/41.json')); c0=list(x41)[0]; v0=list(x41[c0]['vn'])[0]
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1500)
    except Exception: print('no attend')
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("openReader(8,2)"); pg.wait_for_timeout(2500)
    nl=pg.locator('a.nl').first; print('nl',nl.get_attribute('data-nt'),nl.text_content())
    nl.scroll_into_view_if_needed(); nl.click(); pg.wait_for_timeout(800); shot(pg,'20_newcard')
    print('card summaries',E("[...document.querySelectorAll('.rd-sh-body summary')].map(e=>e.textContent)"), 'len', E("document.querySelector('.rd-sh-body').textContent.length"))
    pg.locator('.rd-sh-card [data-r="sh-x"]').last.click(); pg.wait_for_timeout(400)
    for bk,ch,name in [(12,9,'21_1chr10'),(18,22,'22_ps23'),(39,4,'23_mt5'),(65,21,'24_rev22')]:
        E("closeReader()"); pg.wait_for_timeout(300); E(f"openReader({bk},{ch})"); pg.wait_for_timeout(2200); shot(pg,name)
        print(name,'lines',E("document.querySelectorAll('#rdBody .rd-v, #rdBody p').length"), E("$('rdBody').textContent.slice(0,80)"))
    E("closeReader()"); pg.wait_for_timeout(300); E(f"openReader(40,{int(c0)-1})"); pg.wait_for_timeout(2500)
    sv=pg.locator(f'sup[data-vn="{v0}"]'); print('mk memo sup',sv.count(), 'tappable sups', E("document.querySelectorAll('sup.vn-t').length"))
    sv.scroll_into_view_if_needed(); sv.click(); pg.wait_for_timeout(1200); shot(pg,'25_mk_var')
    print('sheet',E("document.querySelector('.rd-sh-body').textContent.slice(0,300)"))
    print('hscroll',E("document.documentElement.scrollWidth"))
    print('errs',errs)
    b.close()
