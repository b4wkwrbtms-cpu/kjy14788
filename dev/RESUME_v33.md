# v32 배포 뒤 (2026-10-10) — 로드맵 5단계 모두 끝

## 지금 상태
- main 1330fca (sw yageun-v32), 아티팩트 Vj7oJsR4hsipP7goZsTrhT 버전 31, 기준서 패치 기록 v32까지 (rev 24).
- 빌드: `./rebuild_v32.sh` (= rebuild_v31.sh + patch_meas.py). 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` → pwa/index.html·sw.js를 저장소로.
- 시험: t_meas1~3 (hrun.sh, WALL=$((1791603044376 + 60000)), restore/save_v30.json), pw_meas.js(measshots/), pw_noti.js(알림 흐름, 수파베이스 흉내), pushdev/sw_test.mjs(서비스 워커 push·클릭).

## v32에서 만든 것 (part_meas.js · css_meas.css · patch_meas.py)
- S.met(하루 측정 d · 암송 유지 mr · 고임 ho · 퇴사 rt · 옷 해금 wu · 버전 도입일 v), S.stew(월간 m · 주간 한 줄 w · RITE rite), S.roff(on · hist · esc · wgt · unl), S.ii(on · t · t2 · where · cue · days · push · tz · since).
- 보상 끄기: roffOn()/devWgt()/roffEsc()/roffDaily()/roffAch() — 말씀·묵상·암송·공부 보상 끔, 한 번뿐인 보상 보관, 결과 80% 넘으면 비중 100/80/60.
- 축하 대기열: keep 표시가 있는 축하(보상 끄기 결과·순례 시작/마침)는 밀려나지 않음.

## 서버 (수파베이스 kjy-game · server/kjy_noti.sql · server/kjy-noti/index.ts)
- kjy_private.noti_subs(off 플래그로 끔) · noti_state(nd = 알림 보낸 날). public.kjy_noti_sub/unsub/status/resume.
- kjy_private.noti_due(now) → 보낼 알림 고르고 표시까지. noti_test(30초에 한 번) · noti_result(404/410 → off, 10번 실패 → off).
- 엣지 함수 kjy-noti (verify_jwt=false, 직접 확인): key(금고 kjy_vapid 없으면 만듦) · test(세션 확인) · tick(x-kjy-cron = 금고 kjy_cron_secret). cron 'kjy-noti-tick' */5.
- MCP apply_migration은 DELETE·REVOKE 글자가 있으면 취소됨 → 지우는 대신 off 표시, 권한 회수는 하지 않음(kjy_private는 anon 사용 권한 없음).
- 시험은 DO 블록 + RAISE EXCEPTION 으로 되돌리며 함(zz_selftest). 결과는 오류 메시지로 읽힘.

## 다음에 볼 것
- 10-23(v28)·10-24(v29~v31): 상태판 '지난 패치 판정'이 판정 중으로 바뀜.
- 10-26 주부터 첫 보상 끄기 주간 가능(평소 기록 2주). 11-01 첫 월간 점검. 12-12 무렵 자동성 판정(기록 66일째).
- 아이폰 홈 화면 앱에서 로그인 → 말씀 탭 '읽을 때와 곳' → 알림 켜기 → 시험 알림이 실제로 오는지(애플 푸시 첫 실전).
- 기존 players·sessions 표 RLS는 꺼져 있음(스키마가 비공개라 anon 접근 없음). 켤지는 사용자 결정 대기.
