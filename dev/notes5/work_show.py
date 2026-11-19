import json,sys
p=json.load(open(f'/home/claude/renewal/notes5/pk/{sys.argv[1]}.json'))
for k in ['context','krv_bin','orig_note','orig_near','lexicon','sermons_on_this_chapter','note']:
    print('##',k); print(json.dumps(p.get(k),ensure_ascii=False,indent=0)[:int(sys.argv[2]) if len(sys.argv)>2 else 3500])
print('## orig_words', json.dumps(p['orig_words'],ensure_ascii=False)[:2500])
