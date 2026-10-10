# v36 배포 뒤 (2026-10-11) — 몸 전체로 휘두르기 · 무기 30개 새 디자인 · 무기마다 이펙트 색

## 지금 상태
- main 1ec582a (sw yageun-v36), 아티팩트 Vj7oJsR4hsipP7goZsTrhT 버전 35, 기준서 패치 기록 v36 추가 (rev 27, 표 id mg5ee4tmdfd.29160 — 다음 기록은 이 표 뒤에).
- 빌드: `./rebuild_v36.sh` (= rebuild_v35.sh + patch_v36.py). 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` → pwa/index.html·sw.js를 저장소로.
- patch_v36.py: GAME_V 36 · 업데이트 안내(-feel36) · 예전 drawWeapon/wPal/fxColor를 V35 이름으로 바꾸고 part_wpn36.js가 새로 정의 · weaponIcon 기기 픽셀 · slashPal 맨 앞에 wpnVfx(무기 색).

## 사용자 피드백(이번 판)
- "팔만 움직인다, 휘두를 때 몸도 숙이고 발도 뒤로 빼야 역동적" + 참고 영상(김봉식 전투 2개)
- "더 숙이고 뒷발은 더 빼라" → "그렇다고 다리를 찢으면 안 된다, 뒤꿈치를 들든지 해서 역동성을"
- "무기가 손 앞으로 와야지, 몸 뒤로 가고 팔만 들면 어떡하냐" (예비 자세에서 몸을 젖히며 칼이 몸 뒤로 숨던 것)
- "무기 종류도 차별화·다양화·멋있게, 무기 바뀌면 이펙트 색도 바뀌게" + 참고 영상(무기 목록 220여 개·무기 쇼츠)

## 만든 것
### 몸 리그 (part_feel.js — 원본 실험은 rig36.js, proto36.js/py)
- rigBody(look, q): 머리(0~11줄+모자·긴 머리)·몸통(12~18 시어)·허리띠(19)·두 다리(엉덩이→무릎→발목, 칸마다 t·u로 원래 다리 줄·칸 색)·신발(발목 따라, 뒤꿈치 들기)·땅 소품(19~23줄 0~3칸 그대로). 회전 없이 칸 단위라 얼굴 도트 안 깨짐. RIG_PADX 9.
- q(정수): bx·hip·lean·tq(0~3, 15→14→16줄 접기)·hx·hy·fF·fB·kF·kB·hl(뒤꿈치 0~2). rigQ로 반올림. 어깨 = 접힌 몸통 높이 비례.
- 자세 표 FEEL_KEYS: LOW = { bx 1, hip 0, lean 5, tq 2, hx 2, hy 1, fF 4, fB -3, kF 1, hl 1 } (친 자세), UP = 꼿꼿이 무기를 머리 위로(예비). chop A 무기 곧게 위 → B(lean 6) → C. lunge B/C bx 2·lean 6·fF 5·fB -4·hl 2. rise A 웅크려 칼끝 앞 바닥 → 숙인 채 올려벰. jab 숙여 찌르기.
- 박자 FEEL_MOVES: 예비 4~6f(rise 6·chop 7·lunge 9 startup), keep 18f(탄력 홀드: 캔슬 뒤에도 다음 기술까지 C 유지), ret 뒤 제자리. fd.keepEnd·total 추가.
- feelBegin: 각도(sh·fa·wa)를 첫 목표 쪽으로 2π 맞춤. 공격 중 무기는 몸 앞(back 레이어는 쉴 때만). 앞 레이어는 fd.total까지.
- feelStepDust: 내려치는 순간 뒷발 자리 먼지. 그림자 폭은 벌린 발에 맞춤.
- reduceMotion: 몸 키(RIG_BODY_KEYS)·dx·lift 0 → 팔·무기만.

### 궤적 (feelSmear)
- 예비 끝~맞는 순간 큰 초승달(prof: 시작 뾰족→끝 두껍게), 버티는 동안 시작 쪽부터 줄며 FEEL_SMEAR_LIFE 12f, 점 두 개. 찌르기·돌진은 짧은 직선. 색 feelFxPal → slashPal → wpnVfx.

### 무기 (part_wpn36.js — 설계 원본 wpn36.txt, 도구 wpn36.py)
- 13×26칸, 손 22줄, 한 칸 = sc×15.5/22.5 (예전 길이 그대로, 전투에서 ≈3.44px). cx(손잡이 가운데)·gl(빛 가운데·반지름)·sp(반짝임 자리) 미리 계산.
- 원형: 창(볼펜·만년필) · 칼(형광펜·자·카드·블랙카드 카타나·사직서) · 대검(키보드) · 망치(스테이플러·도장·서버) · 도끼(노트북·모니터) · 낫(커브드 모니터) · 도리깨(게이밍 마우스) · 철퇴(마우스·소화기·모래시계) · 장대(대걸레·골프채) · 광선검(레이저) · 쌍날(젓가락) · 지팡이(지휘봉·은하).
- vfx [진한, 가운데, 밝은] 무기마다. wpnVfx(style, now): 곽준영 무기 이펙트면 무기 색(RGB 키보드는 색이 돎). 옷장 무기 이펙트는 둘레 장식·소리로만 (사용자 기록이 w_flame을 보이게 해 둬서 이렇게 해야 무기 색이 보임 — 바꾸고 싶다면 wpnVfx 맨 앞에 wardWfxShown() 검사만 되살리면 됨).
- 불꽃(feelImpact sparks)도 무기 색. 목록 아이콘은 기기 픽셀(size×dpr)로 그리고 CSS가 40px로 보여 줌.

## 시험
- t_feel1(처치 78/분, v35와 같음) · t_feel2(초당 타격 99~101%) · t_feel3(16개) · t_ui35(7개) · t_ward1~3·t_menu1·t_fest1·t_meas1 오류 0. t_wfx36(사용자 기록의 무기 이펙트·색).
- pw_pose36.js [prefix] dbg.html [slow,fast,tap,rm,w0,f12…]: 게임 rAF를 멈추고 frame(t)를 16.667ms씩 직접 불러 정확히 1틱씩 찍음(예전 pw_feel1은 몇 틱씩 건너뜀). pick36.py: 무기별 예비·맞는 순간·홀드 한 장. pw_wpnsheet36.js: 무기 30개 한 장(예전·새·이펙트 색). pw_wpn36.js: 성장›무기 화면. pw_perf36.js: 곽준영 그리기 ≈0.16ms/프레임.

## 다음에 볼 것
- 아이폰에서: 숙이는 정도·뒤꿈치가 보이는지, 초승달이 몬스터를 너무 가리지 않는지(FEEL_SMEAR_LIFE·ribbon 두께), 무기마다 색이 잘 구별되는지.
- 무기 디자인 고칠 것은 번호로 받기(wpn36.txt 고치고 `python3 wpn36.py wpn36_prev.png --js wpn36_data.js` 다음 part_wpn36.js 다시 만들기 — 만드는 스크립트는 이 문서 아래 '무기 데이터 다시 넣기').
- 무기 수를 늘리려면 WEAPONS·wPower·wBuy·LEG_START·LAST_W(마지막 무기 초월)와 저장 S.wi 순서를 함께 봐야 함 (이번엔 30개 그대로).
- 아직 사용자 대기: 알림 첫 실전, players·sessions 표 RLS 결정.

## 무기 데이터 다시 넣기
wpn36.txt 고친 뒤: `python3 wpn36.py wpn36_prev.png --js wpn36_data.js` → part_wpn36.js 앞부분의 `var WPN36 = [...]` 한 줄을 wpn36_data.js 내용으로 바꿈 → `./rebuild_v36.sh`.
