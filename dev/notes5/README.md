# 로컬 원어 사전·고유명사 (웹 검색보다 먼저)
- `python3 /home/claude/bw/lex/lex.py H0430` → TBESH(축약 BDB) 항목: 표제어·발음·형태·영어 뜻·설명
- `python3 /home/claude/bw/lex/lex.py G0026 full` → TBESG(Abbott-Smith) + 전체 LSJ
- `python3 /home/claude/bw/lex/lex.py name Hosea` → TIPNR 인물·지명(부모·자녀·지역·첫 언급·모든 주소·요약)
- Strong 번호는 절별 원어 자료 /home/claude/bw/orig/BB/CCC.json 의 둘째 칸(구약 OSHB lemma, 예 "b/7225") 또는 헬라어 lemma로 찾는다(헬라어는 lemma → `grep -P "\tἀγάπη\t" ...TBESG*` 로도 됨).
- 출처: STEPBible.org / Tyndale House Cambridge, CC BY 4.0. src에 "STEPBible TBESH H0430" 처럼 적는다.
