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
    def to(sel,off=150):
        y=E(f"(()=>{{const e=document.querySelector('{sel}');return e?e.getBoundingClientRect().top+$('rdBody').scrollTop-{off}:-1}})()"); E(f"$('rdBody').scrollTop={y}"); pg.wait_for_timeout(400); return y
    E("setOpt('flow',true)"); E("openReader(0,4)"); pg.wait_for_timeout(2500)
    print(to('.rd-fold')); shot(pg,'13_fold1')
    print(E("[...document.querySelectorAll('.rd-fold')].map(e=>e.innerText.slice(0,80))"))
    pg.locator('[data-r="fold-open"]').first.click(); pg.wait_for_timeout(500); to('.rd-fold'); shot(pg,'14_fold1_open')
    E("closeReader()"); E("openReader(8,2)"); pg.wait_for_timeout(2500)
    s=pg.locator('sup[data-vn="13"]'); s.scroll_into_view_if_needed(); s.click(); pg.wait_for_timeout(1500); shot(pg,'15_memo13')
    E("rdSheetClose()")
    for i in range(3): pg.locator('[data-r="fs+"]').click(); pg.wait_for_timeout(200)
    to('.sp-lab',300); shot(pg,'16_big')
    for i in range(3): pg.locator('[data-r="fs-"]').click()
    b.close()
print('errs',errs)
