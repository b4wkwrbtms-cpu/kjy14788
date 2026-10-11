#!/bin/bash
# 사용: ./sweep.sh 이름 'BAL json' [일수]  → sim_이름.json
cd /tmp/claude-0/-home-claude/e12f4d5a-63f4-5e5f-b21d-6ae548f599ba/scratchpad
TZ=Asia/Seoul WALL=1791327600000 DAYS=${3:-240} OUT=sim_$1.json QUIET=1 BAL="$2" timeout 3000 ./hrun.sh sim_bot.js yageun-knight.html > sim_$1.log 2>&1
