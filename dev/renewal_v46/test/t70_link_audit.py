# 11-03 링크 원어 검증: 창 4:14 "저를 만나는 사람"에 만나(음식) 카드가 없고, 출 16:31에는 있는지 + 해설 카드가 열리는지
from playwright.sync_api import sync_playwright
errs=[]
SC='/tmp/claude-0/-home-claude/520138e5-6776-5ac9-a635-cb90964eab75/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':393,'height':852}, device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("openReader(0,3)"); pg.wait_for_timeout(2500)
    v14=pg.locator('#rdBody [data-v="14"], #rdBody .vs:nth-child(14)').first
    links=E("[...document.querySelectorAll('#rdBody a.nl')].map(a=>a.textContent).filter(t=>t.includes('만나'))")
    print('창4 만나 links', links)
    E("closeReader()"); pg.wait_for_timeout(500); E("openReader(1,15)"); pg.wait_for_timeout(2500)
    links=E("[...document.querySelectorAll('#rdBody a.nl')].map(a=>a.textContent).filter(t=>t.includes('만나'))")
    print('출16 만나 links', links)
    a=pg.locator('#rdBody a.nl', has_text='만나').first; a.scroll_into_view_if_needed(); a.click(); pg.wait_for_timeout(1200); pg.screenshot(path=SC+'l1_manna_card.png')
    print('card title', E("(document.querySelector('#rdSheet .sh-title, #rdSheet h3, #rdSheet .rd-sh-t')||{}).textContent"))
    print('errs', errs); b.close()
