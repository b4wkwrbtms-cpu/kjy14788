#!/bin/bash
# 성경 자료 빌드 → 곽준영키우기(main)·유엘이키우기 배포. 사용: deploy_bible.sh 새X_VER "커밋 설명"
set -e
VER="$1"; MSG="$2"
cd /home/claude/renewal && python3 tools/mkapp.py 2>&1 | grep -E "3차|옛 밑줄|다른 책|Traceback|Error" 
cd /home/claude/kjy14788 && git pull -q origin main
for d in mz nt x he smt; do cp -r /home/claude/renewal/app/bible/$d/. bible/$d/; done; cp /home/claude/renewal/app/bible/*.json bible/
OLD=$(grep -o 'var X_VER = "[^"]*"' index.html | head -1 | sed 's/.*"\(.*\)"/\1/')
sed -i "s/var X_VER = \"$OLD\";/var X_VER = \"$VER\";/" index.html
N=$(grep -o 'yageun-v[0-9]*' sw.js | head -1 | sed 's/yageun-v//'); sed -i "s/yageun-v$N/yageun-v$((N+1))/" sw.js
git add -A && git commit -qm "$VER: $MSG, sw yageun-v$((N+1))

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F8jn36rJ2Yy86BxJJDZ5Eb" && git push -q origin main && git log --oneline -1 | cut -c1-60
cd /home/claude/yuel-kiugi && git pull -q origin main
for d in mz nt x he smt; do cp -r /home/claude/renewal/app/bible/$d/. bible/$d/; done; cp /home/claude/renewal/app/bible/*.json bible/
Y=$(grep -o 'MZ_VER = "y[0-9]*"' bible_mz.js | sed 's/.*y\([0-9]*\)"/\1/'); Z=$((Y+1))
sed -i "s/MZ_VER = \"y$Y\"/MZ_VER = \"y$Z\"/" bible_mz.js; sed -i "s/bible_mz.js?v=y$Y/bible_mz.js?v=y$Z/" index.html; sed -i "s/yuel-mz-y$Y/yuel-mz-y$Z/" sw.js
git add -A && git commit -qm "말씀 읽기 $VER 동기화: $MSG, mz y$Z

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F8jn36rJ2Yy86BxJJDZ5Eb" && git -c push.negotiate=true push -q origin HEAD && git log --oneline -1 | cut -c1-60
cd /home/claude/wip && git add -A dev && git commit -qm "$VER 배포본: $MSG

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F8jn36rJ2Yy86BxJJDZ5Eb" && git push -q origin v30-wip && echo wip-saved
