# 보안 문서 스위트 — 목차와 작성 순서

> **문서 목록이 곧 방법론이다**: 아래 순서대로 채우면 위협 식별 → 데이터 파악 → 통제 설계 → 운영 준비가 자연히 완성된다.
> 각 문서는 짧아도 된다 — 빈 제목만 있는 문서가 "아직 안 한 일"을 드러내는 것 자체가 가치.

## 1단계 — 위협·데이터 파악 (설계 전 필수)

| 문서 | 내용 |
|---|---|
| `THREAT_MODEL_STRIDE.md` | 자산 열거 → STRIDE 6축(위장·변조·부인·정보노출·서비스거부·권한상승)으로 위협 도출 → 완화 매핑 |
| `DATA_CLASSIFICATION.md` | 다루는 모든 데이터를 민감도 등급(공개/내부/민감/규제)으로 분류 + 각 등급의 취급 규칙 |
| `DATA_FLOW_DIAGRAM.md` | 데이터가 어디서 나서 어디로 흐르고 어디 저장되는가 — 신뢰 경계 표시 |

## 2단계 — 통제 설계

| 문서 | 내용 |
|---|---|
| `SECURITY_ARCHITECTURE.md` | 인증·인가·암호화·비밀 관리의 전체 그림 |
| `RBAC_ABAC_MATRIX.md` | 역할×리소스×행위 매트릭스 — "누가 무엇을 할 수 있나"의 정본 |
| `SUPABASE_RLS_POLICIES.sql` (또는 DB별) | 행 수준 보안 정책 — `rls-policy-template.sql` 골격 사용 |
| `AI_DATA_BOUNDARY.md` | AI(LLM)에 어떤 데이터를 보내도 되는가 — 프롬프트에 실을 수 있는 데이터 등급 정의 |
| `API_SECURITY_CHECKLIST.md` | 엔드포인트별 인증·인가·입력검증·율제한 체크 (ASVS L2 기준) |

## 3단계 — 법·동의 (개인정보 있으면 필수)

| 문서 | 내용 |
|---|---|
| `PRIVACY_BY_DESIGN.md` | 최소수집·목적제한·가명화 원칙의 구현 방식 |
| `CONSENT_FORM.md` | 동의서 원문 (수집 항목·목적·보존 기간·철회 방법) |
| `PRIVACY_POLICY.md` | 처리방침 공개문 |
| `DATA_RETENTION_AND_DELETION_POLICY.md` | 보존 기간 + 파기 절차 + 철회 시 삭제 범위 |

## 4단계 — 운영 준비

| 문서 | 내용 |
|---|---|
| `INCIDENT_RESPONSE_RUNBOOK.md` | 침해·장애 대응 절차. **말미에 "증상 → 절 매핑 표"** — 사고 중엔 목차 읽을 시간이 없다. 골격 = 이 팩의 `incident-runbook-template.md` |
| `AUDIT_LOG_SCHEMA.sql` | 감사 로그(누가 언제 무엇을) 스키마 |
| `ENVIRONMENT_SEPARATION.md` | dev/prod 분리 · 시크릿 관리(환경변수만, 코드·문서에 값 비노출) |
| `SECURITY_DESIGN_METHODOLOGY.md` | 이 스위트를 어떻게 유지하는가 (변경 시 갱신 의무) |

## 운영 원칙 (CLAUDE.md에 반영할 것)

- **시크릿은 환경변수만** — 코드·커밋·메모리·AI 대화에 값 비노출.
- CI에 보안 게이트: 비밀 스캔 · 타입체크 · SAST · {{RLS 정책 존재 검사}}.
- 감사는 감사 전용 에이전트(`agents/security-auditor.md`)가, 수정은 코드 오너가 — 권한 분리.
- 인시던트 문서는 "증상→절 매핑"이 먼저 (러닝북 패턴).

## 심화·특화가 필요할 때

이 스위트는 골격이다. 특정 영역을 깊게 파야 하면 `cybersecurity-skills-integration.md`의 스킬 카탈로그(위협모델링·RLS·침투테스트·포렌식 등 700+)를 참조해 해당 전문 스킬을 불러 쓴다.
