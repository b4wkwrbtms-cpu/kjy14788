# 곽준영 키우기 성경 데이터 → 유엘이 키우기 (11-04부터 다른 세션 결정대로 해설·설교까지 전부 반영: app/bible 통째로 복사)
import shutil, os
SRC = '/home/claude/renewal/app/bible'; DST = '/home/claude/yuel-kiugi/bible'
if os.path.exists(DST): shutil.rmtree(DST)
shutil.copytree(SRC, DST)
print('yuel export: full bible mirror', len(os.listdir(DST)))
