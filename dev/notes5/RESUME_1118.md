# 11-18 저녁 멈춘 자리 (사용자: "여기까지 저장, 말하면 다시 시작")

## 해설 카드 (notes3/out, WRITE_BRIEF_v2 + pk 꾸러미)
- 끝: x129~x140(호세아~미가 72장), x142 일부(0846·0847·0848링크).
- 다시 시작: x141·x142 나머지·x143부터 x273까지. `python3 mkpk.py`로 남은 꾸러미 다시 만든 뒤(이미 쓴 카드는 자동 제외) 한 번에 12묶음씩.
- 프롬프트: "너는 성경 해설 카드 집필자야. /home/claude/renewal/notes5/WRITE_BRIEF_v2.md 를 Read로 끝까지 읽고 … WebSearch는 합쳐 10회 이하. 모든 경로는 절대경로로 써. 맡은 카드 id: …" (plan: notes3/plan_13_66.json, plan_nt.json)
- 원어 절 번호 어긋나는 장은 pk에 orig_note·orig_near가 들어감(요엘 2~3장, 미가 5장 등).

## 설교자 관점 고도화 (UPGRADE_BRIEF_v2, 로컬 자료만)
- 끝: plan_up2 v001~v020 + 걸러 낸 14장(설교 본문·같은 권). 나머지 37장은 예화·인유 수준이라 의도적으로 제외.
- 남은 일 없음(최종 검수 때 DECISIONS.md의 '예화 수준' 경계 카드만 판단).

## 장 층 (CHAPTER_BRIEF → notes6/out, mkapp 11d에서 병합, books 앱 q·one 표시 완료)
- 끝: 1~10권, 13·14·15·18·28·29·31~36권.
- 덜 됨: 30 아모스(4/9장), 11·12·16·17권, 37~66권(19 시편·20 잠언·23 이사야 등 포함) — 다음에 CHAPTER_BRIEF 그룹대로.
- 표본 확인 필요: 일부 작업자가 {"장":{…}}로 감쌌음 → mkapp가 자동으로 풂.

## 최종 단계 (아직)
- DECISIONS.md 사용자 판단 목록 → 사용자에게 보여 주기
- 책 이름 없는 장:절 일괄 보충 스크립트
- mkapp/build → 게임·유엘이·설교 서가 앱 한 번에 배포(books index.html q·one 렌더, sw sbk-app-5는 커밋 대기 중)

## 11-18 밤 사용자 추가 지시 반영
- WRITE_BRIEF_v2에 '11-18 밤' 절 추가: 설교자 순서(장진명·유기성 → 스펄전 → 로이드존스 → 켈러 공개), 본문 오류·문맥·말투·표기 tq 새 형식(k·sure), 검색 14회.
- x153~x160 이전 카드에는 로이드존스 검색이 없었음 → 마지막에 '설교자 보강' 묶음(기존 카드 중 스펄전·로이드존스·켈러 공개 설교가 있는 절만 골라 3단 추가) 필요.
- 본문 교정 단계: 모든 카드 tq + DECISIONS.md + 장 안내 작업자 보고를 모아 → '확실'은 원어 근거와 함께 rev/out 형식으로 반영, '판단 필요'는 사용자에게 개역·이유·다른 읽기로 보여 주고 결정.

## 검색 한도 소진으로 주석·설교자 보강이 필요한 카드 (다음 차례에 재작업)
- x180: nt-42-10-0329, nt-42-10-0331 (주석·설교자 0) / 로이드존스·켈러 미검색: 0325, 0327
- x162: 로이드존스 미검색 (nt-40-22-0153~0160)
- 교훈: 한 차례(사용자 메시지 1번)에 WebSearch 총 200회 공유 → 14회 × 최대 13묶음. 20묶음 동시 금지.

## 11-18 22:30 멈춘 자리 (사용자: 용량 끝나감, 하던 것까지 마무리)
- 로컬 집필(LOCAL_BRIEF.md, 웹 검색 없음): local_plan.json L01~L20 진행 중이었음(12장씩). 끝난 카드는 notes3/out에 있음 → `python3 mkpk.py` 다시 돌리면 남은 것만 꾸러미로 남음. L21~L47 미시작.
- 이어 하기: mkpk.py → 남은 id를 12장씩 묶어 LOCAL_BRIEF로 최대 20명 동시.
- 설교자 보강: reinforce_plan.json 의 left 50장 미시작(사용자가 검색 중단 지시 → 보류).
- 본문 교정: TQ_ALL.json(722건: 확실 21·판단 128·옛 형식 573) → 원어 대조 후 반영, 판단 필요는 사용자에게.
- 켈러 설교집 색인: /home/claude/private/keller (저장소 밖). 세션이 바뀌면 사용자 PDF 3개로 mkidx.py 다시 실행.

## 11-19 해설 카드 완료
- 13~66권 계획 1,628장 전부 작성(notes3/out, 연결 카드 31장 포함). 1~12권 1,067장은 기존.
- 다음: ① 본문 교정 — TQ_ALL.json 1,250건(확실 100·판단 577·옛 형식 573) 원어 대조 후 반영 ② 책 이름 없는 장:절 일괄 보충 ③ 분량 짧은 묶음(N01·N17) 보강 검토, 주석 미열람 카드 보강(선택) ④ mkapp/build → 한 번에 배포.

## 11-19 16:40 본문 교정 반영 끝
- tqfix q10~q29 전부 판정(1,012건): fix 671줄, done 24, keep 531, defer 20. 저장·푸시 완료(v30-wip).
- 빌드: `python3 /home/claude/renewal/tools/mkapp.py` (루트 mkapp.py와 같은 파일로 합침: 2d 교정 반영 + 12b 메모 + 연결 카드 + 11d 장 층). lineage 경로 고침. names/vocab.json은 잃어버려서 개역+본문 낱말로 다시 만듦(커밋함).
- 빌드 결과: tq fixes applied 855, already 94, nomatch 27(모두 같은 자리를 앞선 교정이 이미 고친 중복).
- 환경 준비(작업 공간이 초기화되면): payload.json.gz gunzip → mkapp 실행하면 bout46 생김. 켈러 색인은 /home/claude/private/keller(저장소 밖).
- 사용자 판단 목록: notes5/USER_JUDGE_1119.md (통일안 20 + 절별 131) + notes5/DECISIONS.md. 답이 없으면 지금 본문 유지.
- 남은 것: 카드의 책 이름 없는 장:절 표기 일괄 수정, src URL 5곳, 최종 점검(linkaudit), 배포 1회(곽준영키우기+설교 서가 books-wip 병합, 유엘이키우기 export_yuel.py), 배포 뒤 카드 없는 148장·얇은 책 보강.

## 11-20 04시 56a 배포 끝
- main 1a5893d·8de47b7(곽준영키우기 X_VER 56a, sw yageun-v95, XB 12~65 전부, books-wip 병합 sbk-app-5), yuel-kiugi mz y13. 게임 본체는 건드리지 않고 bible/만 갱신.
- 들어간 것: tqfix q1~q29 반영 855, rev2(2차 전면 검토) 800 + 소제목 3, 낱말 통일 U01~U27 558(tqfix2/BRIEF.md), 유프라테스→유브라데, 해설 보충 253장(notes5/fill_plan.json, 카드 없는 장 0), 밑줄 낱말 보정 97장, 절 주소 책 이름 보충 10,762곳(notes5/fixbare.py), mkapp 99단계(_xclean·_xfill).
- 빌드: python3 tools/mkapp.py (루트 mkapp.py는 같은 내용 복사본). 배포: app/bible의 mz·nt·x·he·smt·*.json을 main/bible로 복사 + X_VER·sw 올림. 유엘이는 같은 복사 + y 번호 3곳.
- 시험: /opt/pw-browsers/chromium-1243/chrome-linux64/chrome, dbg.html(`const $` 뒤 window.__ev) — 읽기 화면·밑줄·해설 열림, JS 오류 0.
- 남은 선택 과제: 사용자 판단 131건(notes5/USER_JUDGE_1119.md, 지금 본문 유지), 새 카드 tq 약 150건 미검증, 요 4장 '예배' 유지, 이와→하와·하가→하갈 확인 대기, 강화 안 한 카드 50장, 독일성서공회 스캔(받으면 비공개로).

## 11-20 06시 후속 3건
- 설교 서가(main a8f4d2f, sbk-app-6): 곽준영키우기 계정 연동 코드 전부 삭제(로그인·기록 맞추기·게임 저장소 읽기). 켈러 세 권 34편은 books/kp.bin(AES-GCM, PBKDF2 60만 회)으로 넣음 — 저장소가 공개라 평문은 올리지 않음. 열쇠말은 대화로만 전달(저장소에 없음, 작업 공간 /home/claude/private/kp_pass.txt). 앱은 열쇠를 localStorage(sbk-kp1)에 두고, 폰 저장이 지워져도 다시 열면 저절로 꽂음.
- 켈러 1·2권(19편·ver2 17편) 팩은 작업 공간·드라이브에 없음. 곽준영키우기 계정 비공개 칸(kjy_private.packs key=keller, 4조각)에만 있고 여기서는 꺼낼 길이 없음(외부 접속 막힘) → 사용자가 팩 파일을 주면 kp.bin에 합쳐 다시 잠금.
- 함께 걷는 길(together-walk, 비공개, 앱 코드는 sites-import 가지): bible-56a 가지에 성경 본문만 56a로 교체(3850f4f). scripts/import-renewal-bible-56a.py, docs/RENEWAL-BIBLE.md 맨 위 기록. 검사 19개 통과(지문 값 갱신). 실제 앱 배포는 그쪽 배포 절차(appgdep) 필요 — 깃허브 푸시만으로는 안 바뀜. K07 풀이 속 '복 받은 사람' 인용은 본문('복 있는 사람')과 어긋난 채 남음(검수된 원고라 손대지 않음).
