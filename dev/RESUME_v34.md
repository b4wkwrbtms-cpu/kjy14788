# v34 배포 뒤 (2026-10-11) — 메뉴 정리 · 설정 탭 · 친구 초대

## 지금 상태
- main 32e5fa4 (sw yageun-v34), 아티팩트 Vj7oJsR4hsipP7goZsTrhT 버전 33, 기준서 패치 기록 v33·v34 추가 (rev 25).
- 빌드: `./rebuild_v34.sh` (= rebuild_v32.sh + patch_menu.py). 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` → pwa/index.html·sw.js를 저장소로.
- pwa/index.html 머리(head)에 링크 미리보기 og 태그를 넣어 둠 — build_pwa.py가 예전 index.html 머리를 그대로 가져가므로 계속 남음.
- 시험: t_menu1 (hrun.sh, WALL=$((1791603044376 + 60000)), restore/save_v30.json), pw_menu1(화면·조작)·pw_menu2(새 사용자·초대·320px·설치한 앱)·pw_menu3(모든 묶음 둘러보기), qrtest/(gen.js·gen2.js → OpenCV 해독).
- h_ward_base.js 의 T("공부") 등은 이제 머리띠 작은 메뉴 버튼(data-t)을 먼저 찾음 (예전 시험 그대로 돌아감).

## v34에서 만든 것 (part_menu.js · qr_core.js · css_menu.css · patch_menu.py)
- 아래 메뉴 5개: MENU_G = 말씀(bible·mem·study) · 성장(weapon·pet·suit·treasure·retire) · 업무 · 정보 · 설정(set, 새 패널). 안쪽 패널 11개.
- 머리띠 맨 위 작은 메뉴(.th-seg, 묶음마다 하나, 열린 화면 둘 이상일 때만 .grp). tabBtns[id] = 작은 메뉴 버튼(점·잠김·반짝 그대로 씀).
- menuGo(묶음): 다른 묶음이면 마지막 화면(localStorage -sub), 같은 묶음이면 맨 위로. menuDots: 묶음 점 = 안 화면 점 모음.
- 설정 탭: 앱으로 설치(브라우저일 때만, 첫 방문 전 점) · 소리(S.sound 전체 · S.music · S.sfxOff, S.vol {m,s}) · 화면(S.fx · S.rdfs) · 말씀 알림 바로가기 · 친구 초대 · 아이디 로그인(정보 탭에서 옮김) · 기록 백업(옮김) · 버전.
- 소리: sfx·tone·hitSound 는 sfxOn()(전체 켜짐 + 효과음 켜짐)일 때만, 크기는 sfxGain·bgmGain 목표값에 곱함. 위쪽 스피커 = sndQuick(전체 끄기/켜기).
- 초대: APP_URL + "?invite=1". 공유(navigator.share) → 안 되면 문구+링크 복사 → 그것도 안 되면 링크 칸을 보여 줌. QR은 qrMatrix(바이트·M·1~10버전·마스크 벌점).
- menuArrive(): ?invite= 떼고, 새 기록이면 첫 출근 카드 제목 '초대받아 오셨군요!'. 예전 기록이면 '메뉴를 다섯 개로 묶었어요' 안내 한 번(keep).
- GAME_V 34 → 패치 메모(RITE) 3일 열림.
- 예전부터 있던 버그 고침: 강화 도구 줄이 도구 없는 탭에 갔다 오면 비던 것(box._k 지움).

## 다음에 볼 것
- 아이폰 홈 화면 앱에서: 아래 메뉴 5개·작은 메뉴·설정 탭 소리 크기 슬라이더·초대 링크 보내기(공유 시트)·QR이 실제로 잘 되는지.
- 카카오톡으로 링크를 보내면 미리보기(제목·아이콘)가 뜨는지 — 카카오는 미리보기를 한동안 저장해 둠.
- 10-23(v28)·10-24(v29~v31) 패치 판정 시작, 10-25 v34 도입 14일, 10-26 주부터 첫 보상 끄기 주간 가능, 11-01 첫 월간 점검.
- 알림 첫 실전(시험 알림)과 players·sessions 표 RLS 결정은 아직 사용자 대기.
