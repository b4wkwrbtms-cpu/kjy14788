import sys, struct, json
out = {}
for fn in sys.argv[1:]:
    b = open(fn, 'rb').read(); n = struct.unpack_from('<H', b, 0)[0]; o = 2; rs = []
    for r in range(n):
        ln = struct.unpack_from('<H', b, o)[0]; body = b[o+2:o+2+ln]; o += 2 + ln
        L = body[0]; name = body[1:1+L].decode('cp949', 'replace'); p = 1 + L
        nums = body[p:p+48]
        # description: last length-prefixed string
        k = p
        desc = ''
        for k in range(p, len(body)):
            L2 = body[k]
            if L2 > 10 and k + 1 + L2 == len(body):
                desc = body[k+1:].decode('cp949', 'replace'); break
        rs.append({'name': name, 'hex': body[p:k].hex(' '), 'desc': desc})
    out[fn.split('/')[-1]] = rs
    print(fn, n, o == len(b))
json.dump(out, open(sys.argv[0].replace('skp2.py', 'skills.json'), 'w'), ensure_ascii=False, indent=0)
