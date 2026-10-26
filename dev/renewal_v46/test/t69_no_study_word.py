from playwright.sync_api import sync_playwright
import re
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':393,'height':852})
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("S.floor=120; S.study.total=270; S.bible.total=60; updateUI(true)"); pg.wait_for_timeout(500)
    for tab in ['weapon','bible','mem','study','pet','suit','treasure','daily','info','retire','set']:
        E(f"selectTab('{tab}', true)"); pg.wait_for_timeout(600)
        txt=E(f"panels['{tab}'].textContent")
        hits=set(m.group(0) for m in re.finditer('.{0,18}공부.{0,18}', txt))
        if hits: print(tab, list(hits)[:8])
    b.close()
