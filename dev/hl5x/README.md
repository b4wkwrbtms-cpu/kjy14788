# 영웅서기5 자료 꺼내기 도구 (게임 파일·꺼낸 자료는 저장소에 넣지 않음 — 사용자 폰/작업 공간에만)
- core: heroes-lore-3-web wie-web/hl5-core + extra.c(guest_malloc 내보내기) → clang wasm32 빌드(build.sh 플래그 그대로) = hl5x.wasm
- dump.js: 에뮬레이터로 게임 자체 StaticUtil::LoadRes(경로)를 불러 DES+LZMA 풀린 파일을 꺼냄 (1,313개: sp/img0~6·cif·ext·pal, imgcom, par, mon/*_ai, csv)
- mgr.py: 그림 묶음 = u32 개수, [u32 크기][형식 u8(20=4비트,24=8비트)][색 수 u8][w u16][h u16][RGB565 팔레트][색 번호], 투명색 0xf81f
- cif.py: SPRITE_DATA::LoadSprData 그대로 — [n][묶음 번호 n개][동작 M] 동작마다 [방향 F] 방향마다 [프레임 L] 프레임마다 [조각 P] 조각 4/9바이트(flag 0) 또는 5/10바이트(flag 1, 주인공)
- compose.py: 몬스터·이펙트 조각 = [플래그(0x20 좌우·0x40 상하·0x80 확장)][그림][x s8][y s8](+[가로/25][세로/25][회전°][알파][합성]), 왼쪽 위 기준.
  주인공 조각 = [플래그|칸][그림][x 12비트][y 12비트](+5바이트), 칸 k 묶음 = img{k}/{imgs[k]:03d}.mgr (기본 장비)
- 남은 것: 합성 모드(0x1c 더하기 추정), .ext(프레임 시간·판정), csv/enemy_*.dat(이름·cif·묶음·팔레트), 파티클(par), 몬스터 묶음 폴더·팔레트 매핑(SPRITE_IMAGE::LoadSprImg는 호출자가 경로 표·팔레트 표를 채움)

## 11-14 추가 (코드만)
- comp2.py — 검증된 조립기(모든 조각 가운데 기준 `anchor='allc'`, 회전 = 바이트×2°, 합성 = mode>>2).
- roster.py — 몬스터 목록(enemy_0.dat 이름·등급 + enemy_g.dat cif·묶음·팔레트), .pal 색 바꿈.
- oracle1.js / oracle2.js — 에뮬레이터 안에서 게임 자체의 DrawEffect·DrawSprite로 그려 우리 조립과 대조.
- lut.js — 합성 방식 표 분류. sheet2.py / zoom.py / effsheet.py — 동작 표·확대·공통 이펙트 표.
- 게임에 넣은 읽기 코드는 dev/renewal_v46/hl5_v49.js (폰에서 zip을 골라 폰 안에서만 꺼내 씀).
