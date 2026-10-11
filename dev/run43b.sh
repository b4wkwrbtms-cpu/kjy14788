#!/bin/bash
cd /tmp/claude-0/-home-claude/e12f4d5a-63f4-5e5f-b21d-6ae548f599ba/scratchpad
B='{"wt":[null,{"gate":{"ore":120},"a":{"ore":60},"b":{"ore":100}},{"gate":{"ore":300,"silver":4},"a":{"ore":160,"silver":3},"b":{"ore":240,"silver":5}},{"gate":{"silver":8,"ame":1},"a":{"silver":4,"ame":1},"b":{"silver":13,"ame":3}},{"gate":{"silver":120,"ame":38},"a":{"silver":55,"ame":16},"b":{"silver":175,"ame":52}},{"gate":{"silver":450,"ame":165},"a":{"silver":240,"ame":86},"b":{"silver":430,"ame":158}},{"gate":{"silver":700,"ame":260},"a":{"silver":420,"ame":158},"b":{"silver":660,"ame":245}}]}'
./sweep43.sh H_steady "$B" 365 &
CH=1.5 STUDY=15 MEM=4 ACT=4 SESS=9,21 NOTE=0 VAULT=0 ./sweep43.sh H_casual "$B" 365 &
CH=7 STUDY=60 MEM=12 ACT=10 SESS=7,10,13,18,22 ./sweep43.sh H_heavy "$B" 365 &
./sweep43.sh H_user "$B" 150 restore/save_v41_cloud.json &
wait
echo done > run43b.done
