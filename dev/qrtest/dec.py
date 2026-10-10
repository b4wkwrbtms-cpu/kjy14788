import json, numpy as np, cv2
mats = json.load(open('mats.json'))
det = cv2.QRCodeDetector()
try:
    wd = cv2.wechat_qrcode_WeChatQRCode()
except Exception as e:
    wd = None
ok = 0
for o in mats:
    if not o['m']: print('NONE', o['t'][:30]); continue
    n = len(o['m']); q = 4; u = 8
    img = np.full(((n + 2*q)*u, (n + 2*q)*u), 255, np.uint8)
    for y, row in enumerate(o['m']):
        for x, c in enumerate(row):
            if c == '1': img[(y+q)*u:(y+q+1)*u, (x+q)*u:(x+q+1)*u] = 0
    txt, pts, _ = det.detectAndDecode(img)
    w = None
    if wd is not None:
        r, _ = wd.detectAndDecode(img); w = r[0] if r else None
    good = (txt == o['t']) or (w == o['t'])
    ok += good
    print('OK ' if good else 'BAD', 'v%d' % ((n-17)//4), repr(txt[:40]), repr((w or '')[:40]))
    if o['t'].endswith('invite=1') and o['v'] == 0: cv2.imwrite('qr_invite.png', img)
print(ok, '/', len(mats))
