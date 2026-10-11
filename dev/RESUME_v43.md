# v43 배포 뒤 (2026-10-11 16:4x) — 무기 66개 · 무기마다 다른 스킬 색 · 등급 이펙트 · 옷장·캐릭터 7등급 · 부드러운 체력 바

## 지금 상태
- main f374fb7 (sw yageun-v43), 아티팩트 버전 42, 기준서 v43 (rev 34, 표 id mg5ee4tmdfd.39283 — 다음 기록은 이 표 뒤에).
- 빌드: `./rebuild_v43.sh` (= rebuild_v42 + patch_v43.py: part_v43art.js 다음 part_v43.js를 '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */' 앞에 넣음). 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` → pwa/index.html·sw.js를 저장소로.
- 사용자 클라우드 기록 사본: restore/save_v41_cloud.json — 저장소·백업에 올리지 말 것(sim_H_user*.json도 이 기록에서 나온 것이라 백업 안 함).

## v43 구조 (part_v43.js)
- 무기: WG_SIZES [6,6,6,12,12,12,12] · WG_START [0,6,12,18,30,42,54], gradeOf/gradeFirst/gradePos(i) 다시 씀. 새 그림 24개는 wpn43.txt → `python3 wpn43.py --js part_v43art.js` (WPN36을 66개 새 순서로: 0~17 그대로, 18부터 [새 k, 예전 18+k]). 미리보기 `--sheet wpn43_sheet.png --new wpn43_new.png`.
- 힘·값: WP43 { lvK 0.0875, upK 0.05 }, wExp(i) = i<18 ? i : 18 + (i−18)/2 (반 칸씩), wPower = 50·2.2^wExp·(1 + wLvK·(lv−1)), wBuy = 60·3^wExp, wUp = wBuy·(i<18 ? 0.3 : upK)·lv·…. 예전 무기 k(18+)의 +5 힘 = 새 2k−17의 +5 힘(±1%).
- 해금 재료 BAL.wt[g] = { gate, a, b } (등급 첫 무기 · 둘째 · 마지막, 사이는 고르게) → wtabBuild() → BAL.wtab 66칸. 지금 값(H): 에픽 gate 8/1 a 4/1 b 13/3, 전설 120/38 · 55/16 · 175/52, 신화 450/165 · 240/86 · 430/158, 초월 700/260 · 420/158 · 660/245 (은괴/자수정).
- 기록 옮기기: WLAY 43, wMap42(k) = k<18 ? k : min(65, 2k−17), merge/freshState 래퍼가 d.wlay !== 43이면 wi·wunl·skin을 옮김.
- 무기 모양: skinIdx() = S.skin이 max(S.wi, wUnl()) 이하면 S.skin, 아니면 S.wi. weaponStep은 S.skin <= S.wi일 때만 모양을 지움.
- 스킬 색: VFX43[i] = [진한, 가운데, 밝은] (18~65, 63 무지개 키보드 빼고 모두 다름) → WPN36[i].vfx·gl/glow 색. wVfxOf(i, t).
- 등급 이펙트: gradeAura(g, i, gr, …, front) — 뒤: 빛(신화 룬 고리 · 초월 후광), 앞: 에픽 도는 알갱이 3 · 전설 불꽃 자락 · 초월 칼끝 별·무지개 알갱이. drawWeapon 래퍼. 타격 gradeHitFx: 에픽+ 불꽃 + gring, 신화+ grays(340ms), 초월+ gnova(520ms). TINT_SKIP에 gring·grays·gnova.
- 옷장: WGRADE[3] '에픽', 초월 {c #fff09a}. FAITH_SETS armor·david·victor. BAL.wd43 (trip 20/6, legShop 30/10, cosmo 90/35, cosmoAura 120/50, galaxyWfx 150/60, enh5 8/3, enh6 12/5). WSETS43 trip·david·victor·cosmo, WITEMS43 44개(세트 26 · wfx 6 · 오라 4 · 칭호 8). wardEnhCost 등급별(초월 말씀 세트 만나 60·1.4^e, 사는 옷 은괴+자수정). wardCostLabel/wardBuy가 여러 재료. WCOND.vault, WCOLL 140·160·180·190.
- 캐릭터: c.g 등급, yoon(최고 600층) · elder(rank 8 전무) · goldkwak(rstreak 200). charProgress가 rank·round를 앎.
- 체력 바(맨 끝): HP_COLS 8색, HPB 상태, hpLinesOf(m) = 문서고 1 · 황금 2 · [1,3,5,8][kind], hpBarTick()을 renderTop 래퍼에서 매 프레임. 지금 체력 τ55ms, 자국 hold 110ms 뒤 max(d·(1−e^(−dt/210)), 한 줄의 35%/초). CSS: #hpBar·#hpTrail transition none !important, .bar .hp-n(x N 글자).
- 안내: -feel43 "무기 66개 · 옷장도 7등급" (체력 바 두 줄 포함).

## 시뮬레이터 (v43)
- `HTML=sim43.html ./sweep43.sh 이름 'BALjson' 일수 [기록]` (sim_bot.js가 BAL 덮은 뒤 wtabBuild()·ward43Costs() 다시 부름, 옷은 재료 아무거나로 삼). run43b.sh = H 4종.
- 결과(H, 꾸준): 전설 16 · 신화 106 · 초월 317일, 150일 689층 이사 45+5, 365일 779층 상무, 정체 최장 전설까지 9일 · 신화 관문 22 · 초월 관문 35 (v42 14·40·70), 옷 159벌. 가볍게 전설 46일 589층. 열심 신화 94 · 초월 302. 사용자 기록 전설 14 · 신화 107 · 150일 700층.

## 시험
- t_v43.js 50개(체력 바 [10] 포함) · t_boot43.js · 회귀 t_v42r 24 · t_v41 25 · t_v40 11 · t_v38 9 · t_job37 26 · t_stand37 10 · t_ui35 7 · t_feel3 16(restore/save.json). t_v42/t_v42r의 fHero.mv = "" → 원래 값으로 되돌리게 고침.
- 캡처: pw_v43.js [prefix page all|icons|battle|ward|grow|chars], pw_v43bt.js, pw_v43w.js, pw_v43hp.js(프레임 몽타주), pw_v43hp2.js(맞은 뒤 시간 기록), pw_v43bt3.js + bc_sheet.py(등급별 전투 비교: 공격·스킬 자동·숫자 끄고 S.gold 0으로 자동 강화 막음 → uishots/v43bc_report.png) — 사용자 기록으로. 서버: pwa 폴더 python http.server 8766.

## 다음에 볼 것
- 사용자 반응: 새 무기 그림·색, 등급 이펙트 양(초월이 너무 번쩍이면 grays/gnova 간격 늘리기), 옷 값(출장 20/6 · 총수 90/35), 체력 자국 속도(hold 110 · τ 210).
- RLS 경고(kjy_private.players/sessions)는 여전히 사용자 결정 대기 — 자동으로 고치지 말 것.


# (아래는 v42 기록) v42 배포 뒤 (2026-10-11 15:0x) — 무기 7등급 · 체계적 밸런스 · 지하 문서고 · 찌르기 고도화

## 지금 상태
- main 2dc264c (sw yageun-v42), 아티팩트 버전 41, 기준서 v42 (rev 33, 표 id mg5ee4tmdfd.36555 — 다음 기록은 이 표 뒤에).
- 빌드: `./rebuild_v42.sh` (= rebuild_v41 + patch_v42.py(part_v42.js·part_v42art.js 삽입) + patch_v42ui.py). 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` → pwa/index.html·sw.js를 저장소로.
- 사용자 클라우드 기록 사본: restore/save_v41_cloud.json — 저장소·백업에 올리지 말 것.

## v42 구조
- 수치는 모두 part_v42.js 맨 위 BAL 표: grow(체력 배율 구간, 350층까지 예전과 같음), wtab(무기 42개 해금 재료), pickMax 30, charmGrow 1.02, treGrow 2, treAme(0 = 보물 차수 관문 없음), reviewMul [1,3,5,8,12], chairOre, chairSilver 1, overAme 5, st25Silver 2 · st60Ame 1 · mem5Ame 1 · planAme 1, vault{t0 30, cap 30, one 1, m 10, hp 0.5, step 100, mile 500(×k²), …}.
- 무기: WGRADES 7 · WG_SIZE 6 · gradeOf · wUnl()/wLocked(i)/wUnlockCost(i)/wUnlockInfo(i)/weaponUnlockTry(i, quiet) · S.wunl(퇴사해도 남음) · 마지막 무기 '돌파'는 weaponStep을 덮어 자수정 overAme(lv). 강화(wi·wl)는 퇴사 때 볼펜으로, 출근 버스가 다시 삼(사용자 결정).
- 예전 기록 옮기기(merge 래퍼): wunl = max(5, d.wunl, d.wi, LEG_START + k(legUnlock 참)), treTier 옮김, S.vault.best 유지.
- 문서고: vaultChestHp(n) = hpBase(1+n)×0.5, 서류함 = 10m, vaultStepN(combo) = 1 + min(4, ⌊combo/5⌋), vaultWait(combo), 이정표 500k²m, vaultStepReward / vaultRecReward / vaultReach, vaultSimRun(dry). kill() 문서고 갈래: 한 방이면 +1초(최대 30).
- 찌르기: warriorFx 래퍼(v40 효과 먼저 + tburst·tboom·texit·두 번째 kwave·불씨·feelFreeze), feelKitFx 래퍼(영업 lunge 차지). TINT_SKIP에 tburst·texit·tboom.
- UI(patch_v42ui.py): 무기 카드 등급 칩·돌파·잠긴 다음 무기 열기, 목록 '열기', '무기 등급' 사다리(.card.wgl .wgl-r, 다음 무기 줄 .wgl-n), 퇴사 게이지 문구, 안내 -feel42.
- 새 무기 그림: wpn42.txt(42개) → `python3 wpn42.py wpn42.txt --js …` → part_v42art.js(WPN36 30~41). 보고용 시트 wpn42_report.py → report_v42_weapons.png.

## 시뮬레이터
- sim_bot.js: 하네스 안에서 봇이 하루씩 논다(말씀 CH장 · 공부 STUDY분 · 암송 MEM · 접속 SESS · 문서고 VAULT · 퇴사 RET/RF). 환경변수 DAYS CH STUDY MEM ACT SESS NOTE VAULT ONMUL RET RF JOBS OUT QUIET BAL(JSON으로 BAL 덮기).
- 실행: `TZ=Asia/Seoul WALL=1791327600000 DAYS=365 OUT=sim_x.json QUIET=1 ./hrun.sh sim_bot.js yageun-knight.html` · 여러 개는 `./sweep.sh 이름 'BALjson' 일수` · 보고 `python3 simrep.py sim_x.json` · 비교표 `python3 simsum.py F_steady F_casual …`.
- 10분 넘는 실행은 setsid nohup로(final_sims.sh). `cd X && cmd &`는 cd까지 백그라운드로 가니 cd를 따로.
- 결과(꾸준 = 말씀 3.3장 · 공부 30분 · 암송 8 · 하루 세 번 6분 · 문서고): 전설 16일 · 신화 107일 · 초월 318일, 150일 679층 이사, 365일 799층 상무. 가볍게(1.5장 · 15분 · 문서고 안 함) 150일 560층 부장, 전설 50일. 열심(7장 · 60분) 신화 90 · 초월 270. 사용자 기록에서: 21~23번 4일, 전설 14일, 신화 102일, 150일 749층. 예전 v41(150일): 849층이지만 무기 21에서 14~100일 막힘, 도장 배율 65,000배.

## 시험
- t_v42.js 39개 · t_boot42.js · 회귀 t_v41 25(오프라인 시험이 자동 스킬 켜진 순간에 흔들려 skillUntil·idolBuff를 먼저 끄게 고침) · t_v40 11 · t_v38 9 · t_job37 26 · t_stand37 10 · t_ui35 7. t_feel3은 restore/save.json으로 16개 통과(클라우드 기록으로는 v41도 같은 2개 실패 — 기록 탓).
- 하네스: `TZ=Asia/Seoul WALL=$((1791690105779 + 3600000)) ./hrun.sh t_v42.js yageun-knight.html restore/save_v41_cloud.json`.
- 캡처: pw_v42ui.js(성장 탭 · 사다리 · 문서고 · 안내) → uishots/v42c_*.png · v42_vault_notice.png, thrust_cmp3.png(v41↔v42 찌르기).

## 다음에 볼 것
- 사용자 반응: 초반 난이도, 문서고 한 판 길이, 찌르기 느낌.
- RLS 경고(kjy_private.players/sessions)는 여전히 사용자 결정 대기 — 자동으로 고치지 말 것.

# (아래는 v41 기록) v41 배포 뒤 (2026-10-11 13:3x) — 말씀 읽기 한 번에 · 공부/말씀 겹침 수정 (큰 밸런스 v42 진행 중)

## 지금 상태
- main de97887 (sw yageun-v41), 아티팩트 버전 40, 기준서 v41 (rev 32, 표 id mg5ee4tmdfd.35226 — 다음 기록은 이 표 뒤에).
- 빌드: `./rebuild_v41.sh` (= rebuild_v40 + patch_v41.py).
- 사용자 클라우드 기록 사본(중요 필드만): restore/save_v41_cloud.json — 저장소에 올리지 말 것. 대리·영업, 층 319(최고 350), 블랙카드 +5, 도장 11,827, 광석 922·은괴 24·자수정 4, 보물 pin19·badge64·review64·wallet14·tumbler24, 퇴사 21번, 출석 10-08부터.

## v41
- part_v41.js: readPausesStudy/readResumesStudy(말씀 타이머가 켜지면 공부 멈춤, 꺼지면 pausedByRead였던 공부 다시 켬), studyStart가 종이 성경 타이머를 기록하고 멈춤, readStartNow(plGo 플랜 장 또는 nextUnread → openReader, 본문 auto 타이머), updateReaderState 래퍼(연 순간부터 '확인까지 N' · 끝+시간이면 checkCurrent 자동), simulateOffline을 withoutTempBuffs로 감쌈.
- patch_v41.py: GAME_V 41 · -feel41 안내 · rtBtn → readStartNow · rtSub 문구 · merge jobs에 audit(5개).
- 출근 버스는 그대로 (사용자 13:22 "그런 거면 그냥 두자").
- 시험: t_v41.js 25개, pw_read41.js(390px 읽기 흐름 사진 uishots/rd41_*).

## 사용자 요청 (12:44 + 13:22) — v42에서 할 것
- 무기 등급 일반·고급·희귀·에픽·전설·신화·초월 (6개씩 42개, 신화·초월 12개 새 그림). 새 등급 들어갈 때만 재료, 위로 갈수록 은괴·자수정 늘어남, 연 등급은 퇴사해도 열림.
- "2번 그렇게 두면 시스템 어떻게 할지 고민해야겠지 · 자수정이나 은괴 수급을 늘려 주든지" → 은괴·자수정 공급처 설계(공부 광산·문서고 미터 보상·보스·업무).
- 지하 문서고: 한 방에 부수면 시간 연장 · 깊이마다 단단해짐 · 미터마다 보상.
- 기준 플레이어: 매일 말씀 몇 장 + 공부 30분 (1시간은 빡셈). 5개월쯤 이사 · 600층 안팎 · 전설 무기.
- "게임 디자인 연구 토대로 피드백하고 시뮬레이션 돌려보고 완료" (game-design 스킬 idle-incremental 기준).
- 찌르기(3연타 마지막 lunge의 관통 검기 kpierce/kwave) 더 타격감 있고 멋있게 — 사용자는 흔들림 0·번쩍임 0 설정.
- 그대로 둘 것: 지금 가진 층·도장·보물·재료.

# (아래는 v40 기록) v40 배포 뒤 (2026-10-11) — 무기 색 = 스킬 색 · 영업 전직 공격(검기)

## 지금 상태
- main 5ad9864 (sw yageun-v40), 아티팩트 버전 39, 기준서 v40 (rev 31, 표 id mg5ee4tmdfd.34244 — 다음 기록은 이 표 뒤에).
- 빌드: `./rebuild_v40.sh` (= rebuild_v39 + patch_v40.py, part_v40.js).

## v40
- 사용자: "무기가 바뀌면 스킬 색깔이 바뀌어야지, 전직하면 전직 공격이 바뀌어야지".
- part_v40.js ① 색 바꾸기: tintSync(t) = feelFxPal(무기 이펙트 색 3단)을 틱마다 읽음, tintMap(c) = 원래 밝기 L로 진한(0)~가운데(0.55)~밝은(0.95) 사이 색, 채도 < 0.18(흰·회·검)은 그대로, 투명도 유지. 전투 ctx 인스턴스에 fillStyle·strokeStyle·shadowColor 접근자와 createRadial/LinearGradient를 덮어 tintOn 동안만 바꿈. drawJobFx에서 jobFx 한 개씩 tintOn = jobTintOn(f) (TINT_SKIP: splat·aseal·seal·contract·meeting·order·ppt·kwave·kquake·kpierce, f.noTint), 코드 탄·도장 꼬리도. drawSprite solid(잔상)·jSparks(직무 불꽃)도 tint. jGold·jobSubProc 안의 jvAdd는 jvNoTint로 noTint(금화·겸직 속성은 제 색).
- ② warriorFx(x, y, crit): 영업 jobStrike(예전 금빛 slash 대신) — rise kwave(위로) · chop kquake(땅 갈라짐+빛 조각+고리)+shards · lunge kpierce(관통 칼날+속도선)+kwave(앞으로) · 그 밖(jab) 작은 kwave. 색은 feelFxPal 그대로(TINT_SKIP).
- patch_v40.py: GAME_V 40 · -feel40 안내 · 아래 스킬 바 rush/night 고리 col·flashCol = 무기 색, rings 그리기 r.col.
- 시험 t_v40 11개. 캡처 pw_v40.js [prefix page chain|deal|dash|rookie skin n] (사용자 설정, 무기 wi 29까지 열고 skin 고름), 비교 한 장 skillsheet40.py → skill_fix_v40.png.
- 주의: 하네스 ctx는 가짜라 덮어쓰기 IIFE가 건너뜀(typeof CanvasRenderingContext2D 없음) — 색은 진짜 브라우저 캡처로 확인.

# (아래는 v39 기록) v39 배포 뒤 (2026-10-11) — 무기 새 그림이 폰에서 보이게

## 지금 상태
- main 2922fe7 (sw yageun-v39), 아티팩트 버전 38, 기준서 v39 (rev 30, 표 id mg5ee4tmdfd.33453 — 다음 기록은 이 표 뒤에).
- 빌드: `./rebuild_v39.sh` (= rebuild_v38 + patch_v39.py).
- 사용자 클라우드 기록(11:23): 본 버전 32·34·35·36·37·38, 대리·영업, 무기 20(블랙카드)+5, 무기 모양(skin) -1, 캐릭터 robo, 옷장 eq: ch_* · wfx w_moon(=cosmic) · aura a_boss · title t_boss, fx { shake 0, flash 0, body 1 } — 흔들림·번쩍임을 사용자가 꺼 둠, 아이폰 동작 줄이기 켬.

## v39
- "무기 리뉴얼 적용이 하나도 안 됐다" → 적용돼 있었지만 폰에서 안 보였음(목록 아이콘 34° 기울여 작게 · 블랙카드 검정·금이 배경·금빛 이펙트에 묻힘).
- part_wpn36.js: wpnRimCol(i, t) = 무기 이펙트 색, drawWeapon 안에서 실루엣(solid) 네 방향 0.42u로 깔아 테두리 빛(전투 0.78 · 정지 그림 0.95). wpnIconDraw(g, i, lv, s, big): 세워서 26칸이 0.87s, 무기 색 빛, big이면 초승달 색 호.
- patch_v39.py: weaponIcon·weaponBig → wpnIconDraw, 성장 카드 wPrev 기기 픽셀(96×dpr) + wpnIconDraw(big), 영업 jobStrike 초승달 색 = feelFxPal()[1], 안내 -feel39.
- 비교 도구: pw_user38.js(사용자 설정으로 한 틱씩, 예전 html은 mkdbg_from.py로 __ev 넣어 pwa/old35u.html로), pw_userwpn.js(성장 탭 전체).

# (아래는 v38 기록) v38 배포 뒤 (2026-10-11) — 몸 동작을 휴대폰 '동작 줄이기'와 떼어 냄 · 직무 동작 미리 보기

## 지금 상태
- main 73a3e31 (sw yageun-v38), 아티팩트 Vj7oJsR4hsipP7goZsTrhT 버전 37, 기준서 패치 기록 v38 추가 (rev 29, 표 id mg5ee4tmdfd.32479 — 다음 기록은 이 표 뒤에).
- 빌드: `./rebuild_v38.sh` (= rebuild_v37 + patch_v38.py). 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` → pwa/index.html·sw.js를 저장소로.
- 사용자 실제 기록(녹화 09:08): 대리 · 영업팀 · 329층 · 20번째 회사 · 펫 여럿 · 노란 헬멧 코스튬 · 검정·금색 칼.

## v38 원인과 수정
- 사용자 아이폰 녹화: 곽준영이 숙이지도 발을 빼지도 않고 팔·무기만 움직임, 치명타에도 배경이 0px 흔들림 → 휴대폰 '동작 줄이기'(prefers-reduced-motion)가 켜져 있음. 예전엔 reduceMotion이면 몸 키·dx·lift를 0으로(팔만), 궤적·직무 이펙트·불꽃·몬스터 밀림도 끔 → v36 몸 동작이 사용자에게 한 번도 안 보였음.
- 이제: reduceMotion은 화면 흔들림·카메라 킥·롤·줌(shakeK)과 공격자 프리즈 흔들림만. 몸 동작은 feelBodyK() = 설정 › 화면 '곽준영 몸 동작'(S.fx.body: 1 기본 · 0.5 약하게 · 0 끄기=팔·무기만, 기본 1). 궤적·발 먼지·몬스터 밀림/찌그러짐(hit·feelImpact·feelTick)도 이 값을 따름. 불꽃·파편·직무 이펙트는 늘, 총구 섬광은 '번쩍임'(flashK) 크기·투명도.
- 동작 미리 보기(part_v38.js): jobPreview {id, until}, jobPreviewId(), jobPreviewStart(id) — 15초 동안 feelKitId()·jobStrike·jobTapFx가 그 직무로(능력치·스킬·겸직은 대표 그대로), 머리 위 '거너 미리 보기 12' 이름표(drawJobAura를 감쌈), 인사 기록 상세에 '○○ 동작 미리 보기' 버튼(지금 동작과 같은 직무면 없음). feelMainKitId() = 미리 보기 빼고 대표 직무 동작.
- 업데이트 안내 -feel38: "곽준영이 몸 전체로 싸워요".
- 시험: t_v38 9개(RM=1 환경 변수로 하네스 matchMedia를 켜서 동작 줄이기도 확인 — h_ward_base.js가 process.env.RM을 읽음), pw_v38ui.js(진짜 브라우저 reducedMotion 'reduce'로 설정 줄·버튼·미리 보기 장면). RM=1이면 t_feel3의 흔들림 두 항목은 원래대로 실패(흔들림은 꺼지는 게 맞음).

# (아래는 v37 기록)

## v37 상태
- main bfdb91b (sw yageun-v37), 아티팩트 Vj7oJsR4hsipP7goZsTrhT 버전 36, 기준서 패치 기록 v37 추가 (rev 28, 표 id mg5ee4tmdfd.30842 — 다음 기록은 이 표 뒤에).
- 빌드: `./rebuild_v37.sh` (= rebuild_v36 흐름 + patch_v37.py). 배포: `rm -f pwa/dbg.html && python3 build_pwa.py` → pwa/index.html·sw.js를 저장소로.
- 사용자 기록(restore/save_v30.json)은 주임(1) · 직무 없음 → 대리(2)가 되어야 첫 직무를 고름. 지금은 전사 동작.

## 사용자 요청(이번 판)
- "각 직업별로 다 달라야 한다. 전사는 저러고 원거리는 총을 쏜다. 두 직업을 합칠 때 어떻게 할지, 법사면 마법을 써야" → 조사 뒤 결정: A안(대표 동작 + 겸직 속성), 저격수 추가(새 직무 감사팀).
- "두 직무 합칠 때 대표동작을 각 직업마다 다 만들고 내가 대표동작을 선택하게. 거너면 거너, 저격수면 저격수에 직무가 추가되면 겸직속성을 입혀서 이펙트랑 속성데미지 추가로 확실히 메리트"
- "검사만 몬스터랑 붙어 있어야 한다. 거너 같은 애들은 떨어져서 원거리에서 공격"

## 만든 것
### 동작 키트 (part_feel.js)
- FEEL_KITS: melee(전사 rise·chop·lunge, 터치 jab) · gun(거너 g_shot·g_shot2·g_burst, g_tap) · magic(마법사 m_cast·m_cast2·m_storm, m_tap) · summon(소환사 s_toss·s_toss2·s_call, s_tap) · snipe(저격수 n_aim·n_aim2·n_pierce, n_tap). FEEL_KIT_OF = { sales: melee, plan: gun, dev: magic, hr: summon, audit: snipe }. 대표 직무(S.job) 없으면 전사.
- FEEL_MOVES에 kit·shot(발 수)·sight(조준선)·circle(마법진)·stamp. 원거리는 keep 길게(거너 30·마법 24·저격 44) → 다음 발까지 겨눈 자세(저격수는 무릎 꿇은 채).
- 자세 조각 AIM·KICK·STAFF·CAST·WIND·THROW·KNEEL·BIGKICK, D = 반동 뒤 다시 겨누는 자세(feelPoseAt).
- feelKitFx: 총구 섬광(거너 1.5·저격 2.3배) · 저격 조준선/조준경 반짝 · 코드 마법진 · 번개 예고 발밑 마법진 · 결재판 고리. feelRelease: 쏘는 순간 카메라 킥 + 종이 탄피.
- heroTip: 지금 그린 무기 끝. 기획 레이저 포인터(jv pointer live)가 반동을 따라 총구에서 나감.
- 소환사: 무기는 등에(0.78배, 세워서), 던지기 전 손에 도장.
- 서는 자리 feelStandStep: FEEL_KITS.stand [곽준영 x, 몬스터 x] — 전사 [0,0] · 거너 [-56,34] · 마법 [-62,36] · 소환 [-50,34] · 저격 [-66,40]. HERO_X·MON_X가 let(HERO_X0 334·MON_X0 474)이고 frame()에서 매 프레임 정함, 바꾸면 ≈0.3초 미끄러짐(움직임 줄이기는 바로). 펫 자리(고정 x)는 그대로 — 고양이가 곽준영 뒷발과 조금 겹침.

### 감사팀 · 겸직 속성 (part_job37.js, 직무 코드 뒤에 들어감)
- JOBS에 audit(정밀 저격형, #ffa24a): 한 발 2배 · 공속 ×0.7 · 치명타 피해 ×1.5 · 3발마다 '지적!' 확정 치명타(auditStrike). 스킬 probe(전수 조사 6발)·censure(징계 확정 8초). 이사 승진에 직무 칸(RANKS 이사 job:true) → 다섯 칸.
- 기본 공격 설명(atk)을 대표 동작에 맞게 바꿈.
- JOB_ATTR(금빛·번개·레이저·인주·정밀), jobSubs() = 가진 직무 − 대표, jobSubMul() = 1 + 0.2×개수 (careerAtk에 곱함).
- jobAttrFx: 매 타격 겸직 색 불꽃. jobSubProc: 3연타 마무리마다 직무별 발동(구체 + 고유 그림), 피해는 직무마다 hit() 따로 — 숫자 색 = 직무 색(hitFloatCol), 이름표 "번개!" 등 세로로.
- 직무 고르기: 이미 대표 직무가 있으면 새 직무는 겸직("감사팀 겸직할게요" → "감사팀 겸직!"), 대표는 그대로. 첫 직무만 대표로 배치.

### patch_v37.py
- GAME_V 37 · -feel37 안내 · part_job37 끼움 · 능력치(감사·겸직) · jobStrike 원점 = feelMuzzle · 마법사 m_storm은 하늘에서 번개(chain + 70ms 코드 탄) · 소환사 s_call은 큰 도장이 위에서 떨어짐(p.big, 맞으면 '인' 도장) · 인사 기록 문구(대표 직무/겸직 +20%/대표 직무로 버튼/대표 동작·겸직 속성 줄) · 겸직 직무 색 점이 전투 화면 둘레를 돎 · HERO_X/MON_X let · frame에 feelStandStep · hit 숫자 색(hitFloatCol).

## 시험
- t_job37 26개(직무마다 그 키트만, 초당 타격 = 공속 ±3% 또는 ±2.5발 — 창 양끝 걸침, 감사 능력치, 겸직 ×1.2/×1.6, 마무리마다 발동, 칸, 감사 터치 n_tap) · t_stand37 10개(서는 자리·총구가 보스 폭에서도 몬스터 밖·미끄러짐) · t_feel1(처치 78/분) · t_feel2 · t_feel3 16 · t_ui35 7 · t_ward1~3·t_menu1·t_fest1·t_meas1·t_wfx36 오류 0.
- pw_pose36.js 직무 캡처: `jX[+Y]`(새 기록·이사·무기 2), `pX[+Y]`(사용자 기록·펫), `rmX`(움직임 줄이기). strip37.py로 프레임 골라 한 장. preview37.py = 사용자에게 보낸 직무별 장면 한 장(preview_v37.png). pw_job37ui.js = 인사 기록 카드·직무 고르기 창 사진 + 감사 겸직 확인.

## 다음에 볼 것
- 아이폰에서: 원거리 직무 거리감(너무 멀거나 가깝지 않은지), 펫(고양이)과 겹침, 겸직 숫자·이름표가 다른 숫자와 겹치는 정도.
- 예전 기록으로 이사 이상(v36에 직무 3개)이면 '새 직무를 고를 수 있어요'로 감사를 고름. 사장이었으면 감사가 자동으로 안 붙고 고르기로 받음.
- 아직 사용자 대기: 알림 첫 실전, players·sessions 표 RLS 결정.
