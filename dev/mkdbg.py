s=open('pwa/index.html',encoding='utf-8').read()
anchor='const $ = id => document.getElementById(id);'
assert s.count(anchor)==1
hook=anchor+'''
window.__bgComposite = (floor, vault, fore) => { bgCache.clear(); const t0 = performance.now(); const set = buildBgSet(floor, vault); const ms = performance.now() - t0; if (!set) return null; const c = document.createElement("canvas"); c.width = 640; c.height = 360; const g = c.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(set.far, 0, 0, 640, 360); g.drawImage(set.mid, 0, 0, 640, 360); g.drawImage(set.back, 0, 0); g.textAlign = "center"; g.textBaseline = "middle"; set.texts.forEach(([s, x, y, col, px]) => { g.font = px + 'px "Do Hyeon", sans-serif'; g.fillStyle = col; g.fillText(s, x, y); }); if (fore !== false) g.drawImage(set.fore, 0, 0, 640, 360); window.__lastMs = ms; return c.toDataURL(); };
window.__bgOld = (floor, vault) => buildBg(floor, vault).toDataURL();
window.__setF = f => { S.floor = f; S.maxFloor = Math.max(S.maxFloor || 1, f); S.k = 1; spawn(); };
window.__ev = c => eval(c);
window.__startVault = () => { S.day.vaultUsed = 0; startVault(); };
window.__bgInfo = () => ({ key: bgKey, kind: bgSet && bgSet.kind, cache: [...bgCache.keys()] });
'''
out=s.replace(anchor,hook)
for a in ('atkTimer += dt;','catTimer += dt;','cactusTimer += dt;'):
    assert out.count(a)==1, a
    out=out.replace(a, a.replace('+= dt;','+= window.__noAtk ? 0 : dt;'))
fa='function addFloat(x, y, text, color, size = 26, pop = false, style = "") {'
assert out.count(fa)==1
out=out.replace(fa, fa+' if (window.__noFloat) return;')
open('pwa/dbg.html','w',encoding='utf-8').write(out)
