#!/bin/bash
# 사용: ./hrun.sh tail.js html save.json
cd /tmp/claude-0/-home-claude/e12f4d5a-63f4-5e5f-b21d-6ae548f599ba/scratchpad
cat h_ward_base.js "$1" > _run_$$.js
node _run_$$.js "$2" "$3"; rc=$?
rm -f _run_$$.js; exit $rc
