# 11-03 밸런스 47h: 활동 도장(actStamp) 상한·게이지, 오프라인 48시간 1/4, 승진 요구치, 무기 재료표
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':393,'height':852})
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8766/dbg.html'); pg.wait_for_timeout(2500)
    try: pg.get_by_text('출근 도장 찍기').click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    E=lambda c: pg.evaluate("c=>window.__ev(c)", c)
    print('rank floors', E("RANKS.map(r=>r.req&&r.req.floor)"), 'grow', E("JSON.stringify(BAL.grow)"))
    print('wt epic/legend/myth', E("JSON.stringify([BAL.wt[3].gate,BAL.wt[4].a,BAL.wt[5].gate])"))
    print('actStamp before 50층', E("S.bestFloor=10; S.maxFloor=10; actStamp(1,0.02)"))
    E("S.bestFloor=500; S.maxFloor=500; rollDay(); S.day.actSt=0; S.actTot=0")
    sc=E("actScale()"); a=E("actStamp(1,0.02)"); b2=E("actStamp(1,0.3)"); c=E("actStamp(1,0.3)")
    print('scale',sc,'chapter',a,'sermon',b2,'again(capped)',c,'day used',E("S.day.actSt"),'cap',int(sc*0.15))
    print('retireRatio', E("retireRatio().toFixed(3)"), 'actTot', E("S.actTot"))
    print('errs',errs); b.close()
