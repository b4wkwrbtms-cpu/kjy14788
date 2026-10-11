#!/bin/bash
cd /tmp/claude-0/-home-claude/e12f4d5a-63f4-5e5f-b21d-6ae548f599ba/scratchpad
./sweep.sh F_steady '{}' 365 &
CH=1.5 STUDY=15 MEM=4 ACT=4 SESS=9,21 NOTE=0 VAULT=0 ./sweep.sh F_casual '{}' 365 &
CH=7 STUDY=60 MEM=12 ACT=10 SESS=7,10,13,18,22 ./sweep.sh F_heavy '{}' 365 &
STUDY=15 ./sweep.sh F_st15 '{}' 365 &
wait
STUDY=60 ./sweep.sh F_st60 '{}' 365 &
CH=1.5 ./sweep.sh F_ch15 '{}' 365 &
TZ=Asia/Seoul WALL=$((1791690105779 + 3600000)) DAYS=150 OUT=sim_F_user.json QUIET=1 timeout 3000 ./hrun.sh sim_bot.js yageun-knight.html restore/save_v41_cloud.json > sim_F_user.log 2>&1 &
TZ=Asia/Seoul WALL=1791327600000 DAYS=365 OUT=sim_F_base.json QUIET=1 timeout 3000 ./hrun.sh sim_bot.js base_v41.html > sim_F_base.log 2>&1 &
wait
for V in F_steady F_casual F_heavy F_st15 F_st60 F_ch15 F_user F_base; do echo "=== $V"; python3 simrep.py sim_$V.json | grep -E "^d +(1|7|14|30|56) |^d1(00|50) |^d(240|365)|days" | cut -c1-200; done
