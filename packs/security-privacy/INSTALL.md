# security-privacy 팩 — 설치/제거

**대상**: 개인정보·아동·학교·의료 등 민감 도메인, 또는 외부 공개 서비스.
**원리**: 설계 문서 스위트(만들 것 목록이 곧 방법론) + 감사 전용 에이전트(수정 권한 분리) + 코드로 강제되는 안전장치.
실전 검증: DRACONIS 보안 스위트(STRIDE·ASVS L2·RLS·동의 게이트·인시던트 러닝북 — 학교 아동 데이터 운영 중).

## 설치

1. `security-doc-suite.md` → 프로젝트 `docs/security/README.md` 로 복사 — 이 목차대로 문서를 채워가는 것이 곧 보안 설계 프로세스다.
2. `agents/security-auditor.md` → 프로젝트 `.claude/agents/` 로 복사, 프로젝트 경로 채우기. agents/README.md 경계표에 "docs/security/** 소유, 코드는 감사만" 행 추가.
3. `rls-policy-template.sql` → 프로젝트 `server/sql/` 또는 `docs/security/` 로 복사.
4. `consent-gate-design.md` → 수집 기능이 있으면 `docs/security/` 로 복사 (db-analytics 팩과 병용 권장).
5. CLAUDE.md §0에 인시던트 필독 경로 한 줄 추가:
   `⚠️ 장애·침해 의심 시 필독: docs/security/INCIDENT_RESPONSE_RUNBOOK.md (증상→절 매핑 표부터)`

## 제거

- 복사한 문서·에이전트 삭제 + CLAUDE.md 해당 줄 삭제. (운영 중인 RLS 정책·CI 보안 게이트는 런타임이므로 별도 판단.)

## 내용물

| 파일 | 용도 |
|---|---|
| `security-doc-suite.md` | 보안 문서 스위트 목차 + 작성 순서 (STRIDE → 분류 → 통제 → 운영) |
| `agents/security-auditor.md` | 감사 전용 에이전트 정의 (수문장 패턴 — 지적하되 수정은 오너에게) |
| `rls-policy-template.sql` | RLS 기본 거부 + 역할별 정책 골격 |
| `consent-gate-design.md` | 동의 전 수집 차단(no-op) 설계 |
| `cybersecurity-skills-integration.md` | Anthropic Cybersecurity Skills(mukul975) 연동 — 어떤 스킬을 언제 부르나 |
