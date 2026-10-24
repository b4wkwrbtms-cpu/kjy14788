# 해설 카드 고도화 — 작업자 지침 (10-25)

사용자 요청: 설교 원고집(장진명·유기성 51편)이 말씀을 풀어가는 방식을 분석한 것을 토대로 **기존 해설을 보완해서 고도화**한다.

## 먼저 읽기
1. /home/claude/renewal/notes2/BRIEF.md — 전체(말투·형식·tq·6·7절), 특히 **8절 '설교 연구에서 얻은 해설 고도화 원칙'**.
2. /home/claude/renewal/notes2/PROMPT_user.txt — 사용자의 해설 집필 프롬프트.
3. 스킬 지침: /home/claude/skill_brs/bible-renewal-suite/references/modules/ 아래 bible-renewal-editor/GUIDE.md, bible-original-language-audit/GUIDE.md, bible-sermon-source-audit/GUIDE.md
4. 분석 보고(필요한 부분): /home/claude/sermons/analysis/*.md (설교자가 어느 본문을 어떻게 풀었고 무엇이 정확/부정확한지)

## 맡은 카드마다
- 지금 카드: `/home/claude/renewal/{notes2|notes3}/out/{id}.json` (어느 폴더인지는 /home/claude/renewal/notes4/plan_up.json 의 src[id]).
- 이 카드가 걸린 절: plan_up.json 의 touched[id] = ["권:장:절", ...]. 그 절을 다룬 설교 언급: `/home/claude/renewal/app/bible/smv.json` 의 "권:장" → v[절] = [[sid, 번호]] → `/home/claude/sermons/refs/{sid}.json`[번호] (how·quote), 설교 전문 `/home/claude/sermons/full/{sid}.json`.
- 우리 본문 /home/claude/bw/bout/BB/CCC.json, 원어 대조 /home/claude/bw/bin/BB/CCC.txt, 히브리어 /home/claude/renewal/app/bible/he/BB.json(1~12권).

## 할 일
1. **8절 원칙으로 다시 읽고 고친다.** 질문(q)·제목·핵심(core)·본문 해설(body)·더 깊이(deep)를 그 표현에 맞는 기법으로 보강한다 — 본문의 퍼즐에서 나온 질문과 그 답으로 닫기, 반복·되받음 세기, 번역어 오해 풀기, 같은 책 용례, 앞뒤 장면 연결, 구조, 세 층 구분 등. 억지로 모든 기법을 넣지 않는다. 이미 좋은 문장·확인된 내용·출처는 지우지 않는다(틀린 것만 고친다).
2. **설교자 관점 보강**: 이 설교들이 이 카드의 표현·장면을 **실제로 다뤘으면** '설교자·주석가의 관점'에 3단으로 넣는다(설교자의 읽기 → 근거 낱말·흐름 → 본문 의미와 적용의 경계, 3~5문장, 반복 핵심 문장 한 줄 인용 가능). 이름만 스치는 언급(예: 다른 이야기 속 "아브라함처럼")은 넣지 않는다. 설교 주장이 본문·원어와 어긋나면 '다른 해석과 판단 근거'에서 근거와 함께 정중히 밝힌다. 기존 다른 설교자·주석가 관점은 그대로 둔다.
3. src에 설교를 쓴 경우 추가: {"t":"장진명 · 「제목」(군산성결교회 설교 원고집 NN, 수정본) · 다룬 단락 · 전문 확인","u":""} (유기성은 원고집 이름과 강의 번호).
4. memo 맨 앞에 "[10-25 고도화] 적용한 기법: … / 설교 반영: sid… 또는 '해당 없음' / 고친 사실: …". 카드에 `"up":"10-25"` 키를 단다.
5. 웹 검색은 쓰지 않는다(이번 일은 본문·원어 대조·설교 원고로 한다). 새로 필요한 외부 사실은 쓰지 말고 memo에 '추가 연구'로.
6. 성경 주소는 늘 책 이름을 붙인다. 말투는 20대 해요체. 본문(bout)은 절대 고치지 않는다(불일치는 tq에 추가).

## 출력·점검
- 같은 파일에 같은 구조로 다시 쓴다(키 추가만: up). **맡은 id 파일만** 연다/쓴다. 임시 파일은 /home/claude/renewal/notes4/work/{첫 id}/.
- python3로 JSON 열림, body·deep 해요체('-다.'/'-니다.' 끝 0, 인용 안 예외), 책 이름 없는 장:절 0 확인.
- 보고 3줄: 고도화한 카드 수 / 설교 관점을 넣은 카드 수(sid) / 편집 판단이 꼭 필요한 것 한 줄.
