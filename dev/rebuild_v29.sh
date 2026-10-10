#!/bin/bash
set -e
cd /tmp/claude-0/-home-claude/e12f4d5a-63f4-5e5f-b21d-6ae548f599ba/scratchpad
python3 -c "
s=open('part_plan_tpl.js',encoding='utf-8').read(); w=open('chw.txt').read().strip()
open('part_plan.js','w',encoding='utf-8').write(s.replace('__CHW__', w))"
cp v60b_pre_att.html yageun-knight.html
python3 patch_att.py
python3 patch_plan.py
python3 patch_cloud.py
python3 patch_career.py
python3 patch_habit.py
python3 patch_grow.py
python3 build_pwa.py --nobump
python3 mkdbg.py
