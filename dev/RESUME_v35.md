# v35 배포 뒤 (2026-10-11) — 손맛·연출 다시 세우기(기둥 8) · 화면 손보기(기둥 9)

## 지금 상태
- main ec71c88 (sw yageun-v35), 아티팩트 Vj7oJsR4hsipP7goZsTrhT 버전 34, 기준서 패치 기록 v35 추가 (rev 26).
- 빌드: `./rebuild_v35.sh` (= rebuild_v34.sh + patch_feel.py + patch_ui35.py). 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` → pwa/index.html·sw.js를 저장소로.
- mkdbg.py: 공격 시계가 고정 틱(`atkTimer += FEEL_DT;`)으로 옮겨져서 그 줄에 __noAtk를 검.
- 게임 디자인 스킬(zip을 scratchpad/gds_skill에 풀어 씀; 이제 플러그인 game-design:game-design으로도 보임). 주 장르 action-combat, 보조 fighting §1·§3·§4, 코드 CP-01·04·12·13, 수치 02 FEEL 표, 점검 03 FEEL·CODE·UX.

## v35에서 만든 것
### 타격 (part_feel.js · patch_feel.py)
- 몸 리그: rigBody(앞팔 지우고 윗몸 기울이기·무릎) + rigArm(어깨→팔꿈치→손 도트) → drawHeroRig. 휘두르는 동안 무기·팔·궤적은 몬스터보다 앞(feelFront).
- 기술 프레임 데이터 FEEL_MOVES(rise·chop·lunge·jab) → FEEL_FD(공속 단계 1·0.85·0.7). 판정 프레임 = 접촉.
- 상태 기계 FeelMachine + FH_IDLE·FH_WIND·FH_ACT·FH_REC. 예비동작 끝에서 몬스터가 칼끝 닿는 곳에 오고 타격 시각이 될 때까지 칼을 든 채 기다림(feelStrikeReady, 최대 40f).
- 1/60초 고정 틱 feelRun/feelTick (step()의 예전 anim·atkTimer 블록 대신). atkTimer는 몬스터가 살아 있을 때만 쌓이고 pend(쌓인 타격)로 넘김. 처치 뒤 남은 타격은 1개까지만 넘김(feelCarry, 예전 처치 속도와 같게).
- 터치 feelTap: 입력 프레임에 피해, 쌓인 자동 타격도 같은 접촉에. 동작 버퍼 9f(히트스톱 동안은 안 줄어듦).
- hit() 안 feelHit: 곽준영(hero·tap·jhero) 타격과 묶음 안 분신 타격은 여기서 → feelImpact(레시피 FEEL_RECIPE). 펫은 예전 길.
- 히트스톱 feelFreeze(공격자·피격자, 합산 대신 큰 값). 전역 hitStop은 보스 착지(90ms)만 남음. kill()은 feelKill(6f / 큰 보스 12f + 트라우마 + 땅 흔적 + 파편). 처치 히트스톱 동안 spawnWait·날아가기 멈춤.
- 흔들림 feelView: shakeAmt(스킬 등 예전 요청)는 트라우마 바닥값으로 바꿔 받음. feelSetT가 camApply·layerTransform에 회전(최대 2°)을 더함.
- 숫자: addFloat가 모양(feelDmgLook)·움직임(pop)·라벨(치명타!)을 고정, 묶음은 ×n(feelMult), 화면에 6개까지. 큰 치명은 0.6초에 한 번(FEEL_BIGCRIT), 일반 몬스터 처치 때는 치명 장식 생략, 임팩트 프레임은 보스급 큰 한 방·큰 보스 처치만.
- 직무 스킬 '실적 대시'의 전역 멈춤 40/110ms → feelFreeze 2/7f.

### 화면 (part_ui35.js · css_ui35.css · patch_ui35.py)
- 누르는 곳 44px(.th-seg·.btn·.pl-brow·설정 스위치·슬라이더·장 번호·.seg), 촘촘한 목록 40px, ×1·×10·최대 36px+위아래 넓힘, 전투 단추 줄 ::after로 52px. 320px 이하는 전투 단추 줄 두 줄. 강화 도구 줄 줄바꿈.
- 글자 12px 바닥(도감 이름·잠긴 기술·레벨 배지·작은 버튼 설명 등), .buy:disabled 글자 #a3aec9.
- btnInner: ok === false 이고 가격이면 '얼마 부족'(uiShort; 이 게임 표기는 A=천, B=백만 …). 무기 단추 4곳은 ok를 넘기게 고침.
- 축하 카드: celebMore(남은 개수·'모두 넘기기' #celebAll).
- 설정 › 화면 › 메뉴 글자(1·1.15·1.3) = S.fx.ui → #panels·#tabHead에 CSS zoom. fxMerge가 ui를 받게 고침.
- 업데이트 안내 한 번(feelArrive, localStorage -feel35).

## 시험
- t_feel1(처치 속도·멈춤 비율), t_feel2(초당 타격 = 공속, 프레임레이트별), t_feel3(규칙 16개), t_ui35(7개), t_feel_old(v34 계측). hrun.sh, WALL=$((1791603044376 + 60000)), restore/save_v30.json.
- pw_feel1.js [prefix] dbg.html [fast,slow,tap,boss,rm,tapd] → feelshots/ + feelsheet.py로 장면 묶음. pw_feel2.js(큰 보스 처치), pw_ui_tiny.js(작은 글자·버튼), pw_overflow.js(폭×글자 배율 가로 넘침), pw_actbar.js, pw_ui35.js(묶음별 사진, 글자 배율), pw_perf35*.js.
- 결과: 초당 타격 99~101%(v34 71~83%), 처치 75→78/분, 규칙·UI 시험 전부 통과, 예전 하네스·브라우저 메뉴 시험 오류 0, 가로 넘침 없음.

## 다음에 볼 것
- 아이폰에서: 휘두르기가 몸으로 보이는지, 큰 보스 처치 멈춤(12f)·흔들림이 과하지 않은지, 회전 흔들림(최대 2°)이 도트에 어색하지 않은지(FEEL_SHAKE.rollK로 조절).
- 패치 메모(새 버전 3일)에 '어지럽다·칼만 돈다·글자 작다' 메모가 오는지. 10-25 v35 판정.
- 아직 고정 틱 밖: 동료·스킬·입자는 가변 시간(이번 범위 밖). 보스 착지 90ms 전역 멈춤은 연출이라 그대로.
- 알림 첫 실전(시험 알림)과 players·sessions 표 RLS 결정은 아직 사용자 대기.
