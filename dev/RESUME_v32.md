# 5단계 v32 측정 — "시작"하면 바로 (2026-10-10 대기)

## 지금 상태
- v28·v29·v30·v31 배포 끝 (main cc4dddb, sw yageun-v31, 아티팩트 버전 30, 기준서 패치 기록 v31까지 rev 23).
- 빌드: `./rebuild_v31.sh` (patch_fest.py까지). v32는 rebuild_v32.sh = rebuild_v31.sh + 새 패치.
- 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` (sw → yageun-v32) → pwa/index.html·sw.js를 저장소로 → 커밋·푸시 → Pages 확인 → 아티팩트(Vj7oJsR4hsipP7goZsTrhT) 갱신 → 기준서 패치 기록(v31 표 다음).

## v31에서 만든 것 (part_fest.js · css_fest.css · patch_fest.py)
- 첫걸음 꾸러미(S.firsts.start), 절기 순례(S.fest: sid·dev·lv·cf·cd·tok·ov·b·wk·hist), 시간의 두루마리(S.scroll), 묵상 2배(S.dbl), 달란트 항아리(S.jar), 첫 완독·첫 암송 2배·66권 도감(S.firsts.bk·br·bc·mem).
- 교회력: festYear(y) — 주현 1/6+27, 사순 부활-46~부활-1, 부활 +41, 성령강림 +49~+76, 추수감사 = 11월 셋째 주일까지 6주, 대림 = 12/3 이전 주일부터 4주.
- 옷장: 절기 세트 2종(harvest·advent) 12벌, 칭호 12개(t_first, 묶음 완독 5, 절기 6) → 146벌. 조건 종류 start·bk·fest (part_ward.js wardCondOk/Prog/Text).
- 시험: t_fest1~4 (hrun.sh, WALL=$((1791603044376 + 60000)), restore/save_v30.json), pw_fest.js (festshots/).

## v32 범위 (기준서 로드맵 5단계 '측정')
1. 말씀 상태판: 주간 말씀일수·암송 통과·공부 시간 추이 (지난 8주), v28~v31 수용 기준 자동 판정.
2. 월간 청지기 점검: 한 달 돌아보기(무엇이 도움이 됐나, 다음 달 한 가지) — 보상 없이 기록만.
3. 보상 끄기 주간: 게임 보상 없이 말씀·암송만 하는 주를 고를 수 있게 (내적 동기 확인, 쉼은 손해 아님).
4. 실행 의도 + 웹 푸시: "언제·어디서 읽을지" 정하고 그 시간에 알림 (iOS 홈 화면 PWA 16.4+ 웹 푸시, 동의 후에만).
- 확인할 것: 기준서 기둥 9(측정)·10(윤리), 금지 목록, att.log·habit.td·S.fest.hist 로 낼 수 있는 지표.
