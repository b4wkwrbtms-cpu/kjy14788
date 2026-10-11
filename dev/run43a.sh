#!/bin/bash
cd /tmp/claude-0/-home-claude/e12f4d5a-63f4-5e5f-b21d-6ae548f599ba/scratchpad
./sweep43.sh G_steady '{}' 365 &
CH=1.5 STUDY=15 MEM=4 ACT=4 SESS=9,21 NOTE=0 VAULT=0 ./sweep43.sh G_casual '{}' 365 &
CH=7 STUDY=60 MEM=12 ACT=10 SESS=7,10,13,18,22 ./sweep43.sh G_heavy '{}' 365 &
./sweep43.sh G_user '{}' 150 restore/save_v41_cloud.json &
wait
echo done > run43a.done
