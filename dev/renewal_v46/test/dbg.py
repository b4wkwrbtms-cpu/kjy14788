from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('console', lambda m: print('CON',m.type,m.text[:200]))
    pg.on('pageerror', lambda e: print('ERR',str(e)[:300]))
    pg.goto('http://localhost:8766/index.html'); pg.wait_for_timeout(3000)
    print(pg.evaluate("[typeof S, typeof openReader, typeof $, document.scripts.length, location.href]"))
    b.close()
