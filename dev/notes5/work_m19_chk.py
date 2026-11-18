import json,re,sys
BOOKS="창세기|출애굽기|레위기|민수기|신명기|여호수아|사사기|룻기|사무엘상|사무엘하|열왕기상|열왕기하|역대상|역대하|에스라|느헤미야|에스더|욥기|시편|잠언|전도서|아가|이사야|예레미야|예레미야애가|에스겔|다니엘|호세아|요엘|아모스|오바댜|요나|미가|나훔|하박국|스바냐|학개|스가랴|말라기|마태복음|마가복음|누가복음|요한복음|사도행전|로마서|고린도전서|고린도후서|갈라디아서|에베소서|빌립보서|골로새서|데살로니가전서|데살로니가후서|디모데전서|디모데후서|디도서|빌레몬서|히브리서|야고보서|베드로전서|베드로후서|요한1서|요한2서|요한3서|유다서|요한계시록"
def texts(d):
    out=[]
    out+=d['body']
    for x in d['deep']: out+=x['p']
    return out
def main():
  for cid in sys.argv[1:]:
      d=json.load(open(f'/home/claude/renewal/notes3/out/{cid}.json'))
      ok=True
      # term in verse
      ctx=json.load(open(f'/home/claude/bw/bout/{d["b"]:02d}/{d["c"]:03d}.json'))['v'][d['v']-1]
      if d['term'] not in ctx.replace('\n',' ') and d['term'] not in ctx: print(cid,'TERM NOT IN VERSE'); ok=False
      bad=0
      for t in texts(d)+[d['core']]:
          s=re.sub(r'[“”"][^“”"]*[“”"]','',t)
          s=re.sub(r'‘[^’]*’','',s)
          for sent in re.split(r'(?<=[.!?])\s+',s):
              sent=sent.strip()
              if re.search(r'(다|니다)[.!?]$',sent): print(cid,'ENDING:',sent[-50:]); bad+=1
          # refs without book
          for m in re.finditer(r'(?<![\d:–-])(\d{1,3}):(\d{1,3})',t):
              pre=t[max(0,m.start()-8):m.start()]
              if not re.search(r'('+BOOKS+r')\s*$',pre) and not re.search(r'(–|,|;|·)\s*$',pre) :
                  print(cid,'REF?',t[max(0,m.start()-12):m.end()+3])
      print(cid,'OK' if ok and not bad else 'CHECK', len(json.dumps(d,ensure_ascii=False)))

if __name__=='__main__': main()
