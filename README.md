# meta_harness — 범용 AI 작업 하네스 스타터킷

> **어떤 AI 모델이 와도 동일한 품질을 내기 위한 작업 규약(하네스)을, 새 프로젝트에 5분 만에 심는 복사형 스타터킷.**
> DRACONIS(math_mon) 등 실전 프로젝트에서 검증된 오케스트레이션·검증·DB·보안 패턴을 범용화했다.
> 특정 모델(Claude Fable/Opus/Sonnet, GPT, Gemini …)에 의존하지 않는다 — 하네스가 품질을 만들고, 모델은 갈아 끼운다.

## 이게 왜 필요한가

AI에게 큰 작업을 맡기면 세션마다, 모델마다 품질이 널뛴다. 원인은 모델이 아니라 **규약의 부재**다:

- 검증 없이 "된 것 같다"로 커밋한다.
- 병렬 작업자(서브에이전트)끼리 같은 파일을 고쳐 충돌한다.
- 지난 세션의 결정을 다음 세션이 뒤집는다.
- "이 정도면 됐지"라는 합리화로 검증 단계를 건너뛴다.

하네스는 이걸 **문서화된 강제 규약 + 테스트로 강제되는 불변식 + 소유 경계**로 막는다.
모델은 교체 가능한 부품이 되고, 품질은 하네스가 보장한다.

## 구조

```
meta_harness/
├─ README.md                  ← 지금 이 파일
├─ HARNESS.md                 ← 하네스 엔지니어링 방법론 (원리 — 왜 이렇게 설계했는가)
├─ CLAUDE.md                  ← ★ 코어(필수): 오케스트레이션·검증 루프·커밋 규약 템플릿
├─ .claude/
│   ├─ settings.json          ← 권한 스켈레톤
│   ├─ agents/
│   │   ├─ README.md          ← 에이전트 팀 협응 규칙 (소유 경계·순차 파일·핸드오프)
│   │   └─ _TEMPLATE.md       ← 서브에이전트 정의 템플릿
│   └─ skills/
│       ├─ _TEMPLATE/SKILL.md ← 스킬 작성 템플릿
│       ├─ verify/SKILL.md    ← 범용 커밋 전 검증 스킬
│       ├─ debug/SKILL.md     ← 체계적 디버깅 (재현→가설→최소수정→회귀)
│       └─ tdd/SKILL.md       ← 테스트 우선 규율 (RED→GREEN→REFACTOR)
├─ docs/
│   ├─ plan-template.md                 ← 작업 계획서 (스펙→작업분해→DoD — 코드 전에 계획 먼저)
│   ├─ master-plan-template.md          ← 다단계 마스터플랜 (Phase 순서 강제·상태판)
│   ├─ agent-brief-template.md          ← ★ 위임 브리프 8요소 (병렬 안전의 핵심)
│   ├─ verification-loop.md             ← 검증 루프 설계 템플릿
│   ├─ automation-gates.md              ← hooks·CI 게이트 예시 (규칙의 자동화 승격)
│   ├─ rationalization-guardrails.md    ← 합리화 방지표 (실패 기록 축적 장치)
│   └─ decisions-log-template.md        ← 불변 결정 로그 (세션 간 결정 뒤집힘 방지)
└─ packs/                     ← ★ 선택 모듈 (필요한 것만 프로젝트에 복사)
    ├─ README.md              ← 팩 카탈로그 + 설치/제거법
    ├─ content-verification/  ← 콘텐츠 저작 → 적대 검증 → 육안 확인 파이프라인
    ├─ db-analytics/          ← 레지스트리 패턴 · 운영/분석 DB 분리 · 이벤트 화이트리스트
    ├─ security-privacy/      ← STRIDE · ASVS L2 · RBAC/ABAC · RLS · 동의 게이트 · 인시던트 러닝북
    └─ code-collab/           ← git worktree 병렬 실험 · 코드리뷰 프로토콜
```

## 5분 퀵스타트

1. **복사**: 이 저장소를 통째로 새 프로젝트 루트에 복사 (또는 clone 후 `.git` 삭제).
   ```
   git clone https://github.com/namijini0403/meta_harness my-project-harness
   ```
2. **코어 채우기**: `CLAUDE.md`를 열어 `{{...}}` 플레이스홀더를 프로젝트 사실로 채운다.
   (프로젝트 한 줄 정의 → 검증 명령 → 불변식 → 커밋 규약. 30분이면 충분.)
3. **팩 선택**: `packs/README.md`를 보고 필요한 팩만 남긴다.
   - 콘텐츠(문항·문서·데이터)를 대량 생산? → `content-verification` 유지
   - DB에 사용자 데이터 저장? → `db-analytics` 유지
   - 개인정보·아동·학교·의료 등 민감 도메인? → `security-privacy` 유지
   - 안 쓰는 팩은 폴더째 삭제. 나중에 필요하면 이 repo에서 다시 복사.
4. **에이전트 경계 정의**: `.claude/agents/README.md`의 소유 경계표를 프로젝트 파일 구조에 맞게 채운다.
5. **첫 세션에서 AI에게**: "CLAUDE.md를 읽고 규약대로 작업해" — 끝.

## 핵심 설계 원칙 (요약 — 원리는 HARNESS.md)

| # | 원칙 | 한 줄 |
|---|---|---|
| 1 | **메인/서브 역할 분리** | 메인(오케스트레이터)=계획·검증·커밋만. 대량 구현은 서브에이전트에 위임. 검증·설계 결정은 절대 위임하지 않는다. |
| 2 | **소유 경계** | 에이전트마다 편집 가능한 파일 경계를 명시. 경계가 겹치지 않으면 병렬, 겹치면 순차. |
| 3 | **공유 파일 순차 규칙** | 여러 작업자가 append하는 파일(레지스트리·인덱스)은 한 번에 한 에이전트만. |
| 4 | **불변식은 테스트로 강제** | 문서의 규칙은 잊히지만 CI가 막는 규칙은 잊혀도 안전하다. 규칙→테스트 전환을 상시 추진. |
| 5 | **작업 단위 = 완성 세트** | "생성기만 만들고 해설은 나중에" 같은 반쪽 커밋 금지. 세트 구성물을 정의하고 전부 갖춰야 커밋. |
| 6 | **합리화 방지표** | 실패할 때마다 "그때 든 유혹 → 실제 벌어진 일 → 규율"을 표에 축적. 하네스는 실패를 먹고 자란다. |
| 7 | **계획 먼저** | 규모 있는 작업은 코드 전에 계획서(스펙→분해→DoD) → 승인 → 실행. 다단계는 마스터플랜(Phase 순서·상태판)으로 승격. |

## 참고 자료

- 하네스 엔지니어링: https://github.com/jha0313/ch4-harness-engineering
- 스킬 저장소 예시: https://github.com/jha0313/skills_repo
- 보안 스킬 (security-privacy 팩 연동): https://github.com/mukul975/Anthropic-Cybersecurity-Skills
- Claude advisor tool: https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool
- 실전 원본: DRACONIS(math_mon) 하네스 — 이 킷의 패턴들이 검증된 곳

## 라이선스

MIT — 자유롭게 복사·수정하되, 프로젝트마다 하네스를 **키워라**(합리화 방지표에 실패를 기록하는 것이 유지보수의 전부다).
