#!/bin/bash
# 사용: [HTML=sim43.html] ./sweep43.sh 이름 'BAL json' [일수] [save]  → sim_이름.json
cd /tmp/claude-0/-home-claude/e12f4d5a-63f4-5e5f-b21d-6ae548f599ba/scratchpad
H=${HTML:-sim43.html}
if [ -n "$4" ]; then W=$((1791690105779 + 3600000)); else W=1791327600000; fi
TZ=Asia/Seoul WALL=$W DAYS=${3:-365} OUT=sim_$1.json QUIET=1 BAL="$2" timeout 3000 ./hrun.sh sim_bot.js $H $4 > sim_$1.log 2>&1
