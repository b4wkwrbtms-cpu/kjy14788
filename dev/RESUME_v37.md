# v37 배포 뒤 (2026-10-11) — 직무별 대표 동작 · 감사팀(저격수) · 겸직 속성 · 원거리 직무는 떨어져서

## 지금 상태
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
