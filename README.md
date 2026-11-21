# 곽준영키우기

말씀·암송·공부 연동 방치형 게임 (아이폰 홈 화면 앱).

- 배포: Netlify (빌드 없음, 게시 폴더 = 루트)
- 수정 후 sw.js 의 CACHE 버전을 올려야 아이폰 앱이 새 버전을 받아요.

주소: https://kwakjunyoung-kiugi.netlify.app

## 설교 서가 (books/)

설교 원고집과 우리 성경(20대 말투·개역한글·해설·원어 메모)을 종이책처럼 읽는 별도 앱. 게임과 같은 원고 데이터(bible/sm.json · bible/smt)를 그대로 읽음.
주소: https://b4wkwrbtms-cpu.github.io/kjy14788/books/ — 원고(smt)를 바꾸면 `python3 books/catalog 생성 스크립트`로 books/catalog.json(분량)도 다시 만들 것.
켈러 원고는 저장소에 넣지 않음(팩 파일 또는 계정 비공개 칸에서 받아 폰에만 저장).

## 주보 메이커 (jubo/)

유엘인교회 주일 주보 4쪽을 만들고 점검해 단톡용 이미지·인쇄용 PDF로 내보내는 별도 앱. 게임과 데이터를 공유하지 않음.
주소: https://b4wkwrbtms-cpu.github.io/kjy14788/jubo/ — 수정 후 jubo/sw.js 의 캐시 이름(jubo-v2)을 올릴 것.
