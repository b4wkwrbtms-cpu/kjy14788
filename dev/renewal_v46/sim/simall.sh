#!/bin/bash
cd /tmp/claude-0/-home-claude/520138e5-6776-5ac9-a635-cb90964eab75/scratchpad
H=/home/claude/renewal/app/index.html
(TZ=Asia/Seoul DAYS=150 QUIET=1 OUT=F_steady.json node sim_run.js $H > F_steady.log 2>&1) &
(TZ=Asia/Seoul DAYS=150 CH=1.5 STUDY=15 MEM=3 VAULT=0 QUIET=1 OUT=F_casual.json node sim_run.js $H > F_casual.log 2>&1) &
(TZ=Asia/Seoul DAYS=150 CH=7 STUDY=60 MEM=10 QUIET=1 OUT=F_hard.json node sim_run.js $H > F_hard.log 2>&1) &
(TZ=Asia/Seoul DAYS=365 QUIET=1 OUT=F_steady365.json node sim_run.js $H > F_steady365.log 2>&1) &
wait
echo ALLDONE > simall.done
