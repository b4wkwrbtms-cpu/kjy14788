from playwright.sync_api import sync_playwright
errs=[]
SC='/tmp/claude-0/-home-claude/520138e5-6776-5ac9-a635-cb90964eab75/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':393,'height':852}, device_scale_factor=3)
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(1200)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    E("S.floor=9; S.study.total=1; updateUI(true)"); pg.wait_for_timeout(500); E("selectTab('study', true)"); pg.wait_for_timeout(2000)
    pg.locator('#smList .sm-li').first.click(); pg.wait_for_timeout(2500)
    pg.screenshot(path=SC+'r1_dark.png')
    pg.locator('[data-r="sh-aa"]').click(); pg.wait_for_timeout(400)
    pg.screenshot(path=SC+'r2_aa.png')
    pg.locator('[data-r="sh-bg-paper"]').click(); pg.locator('[data-r="sh-aa"]').click(); pg.wait_for_timeout(300)
    E("$('rdShBody').scrollTop = 2600"); pg.wait_for_timeout(1800)
    pg.screenshot(path=SC+'r3_paper_mid.png')
    print('pos saved', E("JSON.stringify(S.smPos)"), 'left', E("$('rdShTt').getAttribute('data-left')"))
    # close & reopen → resume
    pg.locator('button.rd-sh-x').click(); pg.wait_for_timeout(800)
    print('closed; smRead', E("smRead"))
    E("openSmt('jjm-gs-01')"); pg.wait_for_timeout(2000)
    print('resumed scrollTop', E("$('rdShBody').scrollTop"))
    pg.locator('[data-r="sh-aa"]').click(); pg.locator('[data-r="sh-bg-night"]').click(); pg.locator('[data-r="sh-font-sans"]').click(); pg.locator('[data-r="sh-aa"]').click(); pg.wait_for_timeout(300)
    pg.screenshot(path=SC+'r4_night_sans.png')
    E("closeReader()"); pg.wait_for_timeout(500)
    # note card (non-full)
    E("S.shBg='dark'; openReader(18,22)"); pg.wait_for_timeout(2500)
    a=pg.locator('#rdBody a.nl[data-nt^="ot-"]').first; a.scroll_into_view_if_needed(); a.click(); pg.wait_for_timeout(1200)
    pg.screenshot(path=SC+'r5_note.png')
    print('errs', errs); b.close()
