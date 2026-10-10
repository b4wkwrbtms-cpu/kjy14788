import re, sys
g=open('yageun-knight.html',encoding='utf-8').read()
old=open('pwa/index.html',encoding='utf-8').read()
head=old[:old.index('<title>')]
head=head.replace('content="width=device-width, initial-scale=1, viewport-fit=cover"','content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"')
head=head.replace(':root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }\n','')
tail='''
<script>
if ("serviceWorker" in navigator) { window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); }); }
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
</script>
</body>
</html>
'''
body=g
open('pwa/index.html','w',encoding='utf-8').write(head+body.rstrip()+'\n'+tail)
sw=open('pwa/sw.js').read(); m=re.search(r'yageun-v(\d+)',sw); n=int(m.group(1))+(0 if '--nobump' in sys.argv else 1)
open('pwa/sw.js','w').write(sw.replace(m.group(0),f'yageun-v{n}')); print('cache v',n)
