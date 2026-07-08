# Anthropic Cybersecurity Skills 연동 가이드

> 이 팩의 문서 스위트는 **골격**이다. 특정 영역을 전문 수준으로 파야 할 때는
> https://github.com/mukul975/Anthropic-Cybersecurity-Skills 의 스킬 카탈로그(700+)를 플러그인으로 설치해 해당 스킬을 부른다.
> (Claude Code: 플러그인/스킬로 설치하면 `cybersecurity-skills:<이름>` 으로 호출 가능.)

## 이 팩의 문서 ↔ 전문 스킬 매핑 (자주 쓰는 것)

| 이 팩에서 하다가… | …이 스킬을 불러 심화 |
|---|---|
| `THREAT_MODEL_STRIDE.md` 작성 | `performing-threat-modeling-with-owasp-threat-dragon`, `implementing-threat-modeling-with-mitre-attack` |
| `API_SECURITY_CHECKLIST.md` 점검 | `conducting-api-security-testing`, `testing-api-security-with-owasp-top-10`, `testing-for-broken-access-control` |
| `SUPABASE_RLS_POLICIES.sql` / DB 권한 | `implementing-pam-for-database-access`, `auditing-kubernetes-cluster-rbac`(개념 참조) |
| 인증 설계 | `configuring-oauth2-authorization-flow`, `testing-jwt-token-security`, `testing-oauth2-implementation-flaws` |
| 시크릿 관리 | `implementing-secret-scanning-with-gitleaks`, `implementing-secrets-scanning-in-ci-cd` |
| CI 보안 게이트 | `integrating-sast-into-github-actions-pipeline`, `securing-github-actions-workflows`, `building-devsecops-pipeline-with-gitlab-ci` |
| `INCIDENT_RESPONSE_RUNBOOK.md` | `building-incident-response-playbook`, `triaging-security-incident-with-ir-playbook` |
| 침해 의심 조사 | `analyzing-indicators-of-compromise`, `collecting-volatile-evidence-from-compromised-host` |
| AI/LLM 기능 보안 (`AI_DATA_BOUNDARY.md`) | `defending-llms-with-guardrails`, `detecting-indirect-prompt-injection`, `testing-for-system-prompt-leakage`, `auditing-mcp-servers-for-tool-poisoning` |
| 웹 취약점 자가 점검 | `testing-for-xss-vulnerabilities`, `exploiting-idor-vulnerabilities`(방어 관점 학습), `performing-security-headers-audit` |

## 사용 규칙 (하네스 관점)

1. **감사 에이전트가 추천, 메인이 호출 결정**: security-auditor는 리포트에 "이 영역은 스킬 ○○로 심화 권장"을 적을 뿐, 공격성 스킬 실행은 메인+사용자 판단.
2. **공격형 스킬(exploiting-*, performing-*-attack)은 자기 시스템·명시 승인 범위에만** — 침투 테스트 규약을 리포트에 남긴다.
3. 스킬 산출물(체크리스트 결과·스캔 리포트)은 `docs/security/`에 날짜와 함께 보관 — 다음 감사의 기준선.

## advisor tool 패턴 (스킬이 아주 많을 때)

스킬·도구가 수백 개면 전부 컨텍스트에 올리는 대신, Claude API의 **advisor tool** 패턴
(https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool)처럼 "필요한 도구를 검색해서 로드"하는 구조를 쓴다.
Claude Code에서는 ToolSearch/플러그인 지연 로드가 이 역할을 한다 — 하네스 문서에는 **스킬 이름을 직접 박아두면**(위 표처럼) 검색 없이 정확히 호출된다.
