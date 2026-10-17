from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844})
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2000)
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("S.rdfs=24; openReader(8,2)"); pg.wait_for_timeout(2000)
    print(E("""(()=>{const q=document.querySelector('.ln.sq');const n=document.querySelector('.ln:not(.sq)');const r=[];for(let e=q;e&&e.id!='rdBody';e=e.parentElement)r.push(e.tagName+'.'+e.className+':'+getComputedStyle(e).fontSize);return [r, getComputedStyle(n).fontSize, $('rdBody').style.fontSize]})()"""))
    b.close()
