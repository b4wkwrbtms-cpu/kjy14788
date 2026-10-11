# v40 배포 뒤 (2026-10-11) — 무기 색 = 스킬 색 · 영업 전직 공격(검기)

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
