# 신약 해설 카드 새로 쓰기 — 작업자 지침 (10-24)

## 먼저 읽기 (전부 끝까지)
1. /home/claude/renewal/notes2/BRIEF.md — 말투(20대 해요체)·출력 형식(2절)·tq(5절)·스킬 반영(6절)·검색 한도(7절)는 **그대로 따른다**. 단, 1절의 입력(in/{id}.json)과 4절의 `_target_ref` 대신 아래 '입력'을 쓴다.
2. /home/claude/renewal/notes2/PROMPT_user.txt — 사용자의 해설 집필 프롬프트.
3. 스킬 지침: /home/claude/skill_brs/bible-renewal-suite/references/modules/ 아래 bible-renewal-editor/GUIDE.md, bible-original-language-audit/GUIDE.md, bible-sermon-source-audit/GUIDE.md
4. 수준 맞추기용 예시 카드 하나: /home/claude/renewal/notes2/out/gen-ezer.json

## 입력
- 맡은 카드의 선정 항목: /home/claude/renewal/notes3/nt_selection.json 에서 `id`가 같은 항목 (ref, b, c, v, term, kind, orig, q, why, also). **q는 독자의 질문 초안**이고 why는 고른 이유 메모다. why에 적힌 사실(연대·수치·해석)은 확인되지 않은 메모이므로 그대로 믿지 말고 확인한다.
- 우리 본문: /home/claude/bw/bout/BB/CCC.json (앞뒤 문맥까지 읽는다). 원어 대조: /home/claude/bw/bin/BB/CCC.txt (개역·WEB·헬라어 SBLGNT).
- 신약 본문 기준은 NA28/표준판. 본문의 [ ]는 오래된 사본 일부에 없는 말이다. 사본 문제가 걸린 표현이면 카드에서 사실대로 다룬다.

## 출력 — `/home/claude/renewal/notes3/out/{id}.json` (카드마다 끝나는 즉시 Write)
BRIEF.md 2절 형식 그대로 + 아래 키를 더한다:
- `"term"`: 선정 항목의 term 그대로(앱 밑줄이 이 글자에 걸린다), `"b"`,`"c"`,`"v"`: 선정 항목 그대로, `"also"`: 선정 항목의 also(확인해 보니 같은 뜻으로 쓰인 곳만 남긴다).
- `"k"`: 선정 항목의 kind. 헬라어 표현도 `hebrew` 값을 쓴다(앱 표시가 '원어').
- `expr`: [헬라어(악센트 포함), 한글 발음, 이 구절에서의 뜻]. 인물·지명도 헬라어 이름(구약 인물이면 히브리어도)을 넣는다.
- 이미 out 파일이 있는 카드는 건너뛴다.

## 검색 한도
- WebSearch 모두 합쳐 **18회 이하**(카드당 3회 안팎). 주석은 `biblehub commentaries <영어 책 이름> <장>-<절>`로 그 절 주석 모음 페이지 하나를 찾아 서로 다른 전통 2~3개, 사전은 `biblehub greek <Strong 번호/낱말>` 한 번, 설교는 1회 정도. 막히면 즉시 멈추고 읽은 것만으로 쓰고 memo에 못 본 것(지어내지 않음, 우회 금지).

## 마지막 점검·보고
- python3로 JSON 열림, body·deep 해요체('-다.'/'-니다.' 끝 0, 인용 안 예외), term이 해당 절 본문에 그대로 있는지 확인.
- 보고 3줄: 쓴 카드 수 / 못 쓴 id / 쓴 WebSearch 횟수와 편집 판단이 꼭 필요한 문제 한 줄.

## 주의 (10-24 1회차에서 생긴 일)
- 점검·수정 스크립트는 **맡은 카드 id 파일만** 연다. `nt-40-06-004*` 같은 와일드카드로 out 폴더를 훑지 않는다(다른 작업자 파일을 덮어쓴 일이 있었음). 임시 파일은 /home/claude/renewal/notes3/work/{첫 카드 id}/ 에 둔다.
