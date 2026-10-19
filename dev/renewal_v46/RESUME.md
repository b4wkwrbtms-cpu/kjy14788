# RESUME — 읽기 창 v46 (말씀 리뉴얼 독서판 장점 + 우리 20대 말투) · 10-17

## 사용자 결정
- 본문: 우리 v45 20대 말투 유지 + 그쪽 '원어·의미' 교정만 골라 반영 (이름 표기 교정은 되돌리고 메모로 — 개역한글 인명·지명 유지).
- 기능: 다 넣되 앱에 맞게(책별 나눠 받기, 끄고 켜기).

## 10-19 13시 50분 (46d, wip에만 · main 미반영): 해설 카드 837장(6차 + 7차 일부)으로 nt 갱신, X_VER 46d. main 반영은 사용자 확인 뒤.

## 상태: **10-19 14시 main에 반영·배포함 (46c)** — 본문 66권 전부 + 새 해설 카드 730장(6차까지) + 신약 사본 메모. main 커밋 4c64b7b(+b3b041e), 실제 앱 주소는 GitHub Pages https://b4wkwrbtms-cpu.github.io/kjy14788/ (main 푸시 = 자동 배포; Netlify 사이트는 10-08 이후 안 씀), 이전 main(v44)은 브랜치 backup-v44-main.
- 46c: 46b에서 nt(해설 카드)만 610→730장으로 갱신, X_VER 46b→46c (mz·x·he·lin은 46b와 바이트 단위로 같음을 확인). ex/tone_out.json(안내·접기 글 해요체 438곳)이 저장소에 빠져 있어 46b 결과물에서 복원해 넣음.
- 다른 세션에서 다시 빌드할 때: /home/claude/renewal ← dev/renewal_v46 심링크, /home/claude/bw/bout ← dev/bout, /home/claude/bw/verify ← dev/verify, /home/claude/b4wkwrbtms-cpu/kjy14788 ← main 체크아웃(+ 그 안에 dev → wip의 dev 링크; **main에 커밋되지 않게 빌드 뒤 지울 것** — 10-19에 한 번 딸려 들어가 b3b041e로 지움), payload.json은 gz 풀기, part_v46.js는 R0 바로 아래에 둠. Playwright 브라우저는 /opt/pw-browsers/chromium-1194/chrome-linux/chrome (node playwright, executablePath).

## (이전) 상태: 10-19 다시 빌드(46b) — 본문 66권 전부 + 새 해설 카드 610장 + 신약 사본 메모.
- 10-19: mkapp.py가 /home/claude/bw/bout(원어 대조 끝난 본문)를 씀. 그쪽 교정은 바꾸기 전 본문이 그대로일 때만 덮음. 새 카드(notes2/out)는 본문 해설·더 깊이 읽기 두 칸으로 바꿔 넣음. 신약 x 파일은 vn(사본 차이)만, 어느 권이 있는지는 bible/xbooks.json → build가 XB에 박아 넣음.
- 원어 교정 24묶음 전부 끝: 5,330절 검토 → 교정 147(이름 20개는 되돌림) · 원어 메모 1,398절.
- 해설 카드 1,067개 해요체 통일·반복 정리 끝.
- 결과물: `app/` (index.html v46, sw.js yageun-v46, bible/mz·x·nt·he·lin.json). bible/krv는 main 그대로라 뺐음.
- 만드는 법: `tools/mkapp.py`(데이터) → `tools/build_v46.py`(main index.html + part_v45 + part_v46). 경로는 /home/claude/renewal 기준이라 옮기면 고쳐야 함.
- 검증(390px, Playwright `test/t46*.py`): 대화 이름표, 해설 창(← 읽던 본문으로), 절 번호 → 히브리어+원어 메모, 보기 설정 6가지, 색 구분, 족보 접기(펼쳐야 체크), 위치 기억, 큰 글자, 1~12권 밖(시편)도 정상, JS 오류 0.
  - 테스트 팁: 게임 코드가 IIFE라 전역이 안 보임 → dbg.html(`const $ = …` 뒤에 `window.__ev = c => eval(c);`) 만들어 씀. 첫 화면 출근부 모달은 '출근 도장 찍기' 눌러 닫기.
- 검증 중 고친 것: 대사 줄 class `q`가 게임 기존 `.q{font-size:16px}`와 겹쳐 큰 글자에서 대사만 작았음 → `sq`. 같은 제목 접기 카드 두 번째는 '(이어서)'만.

## 범위·한계
- 이름표·해설 밑줄·접기·원어 메모는 창세기~열왕기하(1~12권)만. 13권부터는 본문만(신약은 사본 차이 메모가 있는 절만 절 번호를 눌러 볼 수 있음).
- 개역한글 보기에서는 이름표·밑줄 없음(20대 말투 줄 기준으로 붙였기 때문).

## 다음
1. [끝 10-19] main 반영·배포.
2. 해설 7차 n121~n177 이어서 → 끝나면 mkapp(nt만 바뀜) → X_VER 46d → main 반영.
3. v45 남은 671장 이어 쓰기, 작가 연구(조사만) 이어서, 연구 결과로 bguide 보완.
