# v30 옷장 개편 — 이어서 하기 (2026-10-10 멈춤)

## 지금 상태
- 1단계 v28, 2단계 v29: 배포 끝 (main d9ac934, sw yageun-v29).
- 3단계 v30 옷장: 만들고 시험까지 끝, **배포만 남음**.
  - 기준서: 참고문헌 284개로 보강(260–284), 기둥 7에 'v30 옷장 보강' 7줄 추가 (doc 5e0a1cd5-…, rev 18).
  - 새 파일: part_ward_data.js(122벌 데이터), part_ward.js(옷장 코드), css_ward.css, patch_ward.py, rebuild_v30.sh.
  - part_grow.js 수정: 옷장 탭 열림 조건(말씀 5장), 안내·경제 문구.
  - 시험 통과: 하네스(t_ward1·2·3, t_cmp — 옛 저장 4종 모두 능력치 같거나 오름, 오류 0), Playwright(wardshots/), fps 34~39(효과 없음 40).

## 시작하면 할 일 (순서)
1. `./rebuild_v30.sh` → 전투 화면 효과 밝기(gain 1.8/1.6) 한 번 눈으로 확인 (`node pw_ward_fps.js`, wardshots/w12*_zoom.png).
2. 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` (sw → yageun-v30) → pwa/index.html·sw.js를 저장소로 복사 → 커밋·푸시 → Pages 확인.
3. 아티팩트 미리보기 갱신: S/yageun-knight.html → https://claude.ai/artifact/Vj7oJsR4hsipP7goZsTrhT
4. 기준서 패치 기록에 v30 표 추가 (v29 표 mg5ee4tmdfd.17796 다음): 가설·통과 기준·측정 기간·BCT.
5. 다음: 4단계 v31 (절기 순례 패스, 11/29 대림절 전).

## 시험 저장
- restore/save_v30.json = 2026-10-10 12:30 클라우드 저장 (WALL=$((1791603044376 + 60000))).
- 실행: `WALL=... ./hrun.sh t_ward3.js yageun-knight.html restore/save_v30.json`
