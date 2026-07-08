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
│   │   └─ README.md          ← 에이전트 팀 협응 규칙 (소유 경계·순차 파일·핸드오프)
│   └─ skills/
│       ├─ init-harness/SKILL.md ← ★ 첫 세션용: 조사·문답으로 하네스 조립 (일회용, 완료 후 삭제)
│       ├─ verify/SKILL.md    ← 범용 커밋 전 검증 스킬
│       ├─ debug/SKILL.md     ← 체계적 디버깅 (재현→가설→최소수정→회귀)
│       └─ tdd/SKILL.md       ← 테스트 우선 규율 (RED→GREEN→REFACTOR)
├─ examples/
│   └─ EXAMPLE-CLAUDE.md      ← 채움 예시 (가상 프로젝트로 본 완성형 CLAUDE.md)
├─ scripts/
│   └─ check-placeholders.mjs ← 설치 자가검증: 미기입 {{...}} 잔존 검사 (CI 편입 가능)
├─ docs/
│   ├─ plan-template.md                 ← 작업 계획서 (스펙→작업분해→DoD — 코드 전에 계획 먼저)
│   ├─ master-plan-template.md          ← 다단계 마스터플랜 (Phase 순서 강제·상태판)
│   ├─ agent-brief-template.md          ← ★ 위임 브리프 8요소 (병렬 안전의 핵심)
│   ├─ verification-loop.md             ← 검증 루프 설계 템플릿
│   ├─ automation-gates.md              ← hooks·CI 게이트 예시 (규칙의 자동화 승격)
│   ├─ rationalization-guardrails.md    ← 합리화 방지표 (실패 기록 축적 장치)
│   ├─ decisions-log-template.md        ← 불변 결정 로그 (세션 간 결정 뒤집힘 방지)
│   └─ templates/                       ← 에이전트·스킬 정의 템플릿 (복사해 쓰는 원본 — .claude/ 밖에 두는 이유: 플레이스홀더 상태로 활성 디렉터리에 있으면 무효 정의로 로드될 수 있음)
└─ packs/                     ← ★ 선택 모듈 (필요한 것만 프로젝트에 복사)
    ├─ README.md              ← 팩 카탈로그 + 설치/제거법
    ├─ content-verification/  ← 콘텐츠 저작 → 적대 검증 → 육안 확인 파이프라인
    ├─ db-analytics/          ← 레지스트리 패턴 · 운영/분석 DB 분리 · 이벤트 화이트리스트
    ├─ security-privacy/      ← STRIDE · ASVS L2 · RBAC/ABAC · RLS · 동의 게이트 · 인시던트 러닝북
    ├─ code-collab/           ← git worktree 병렬 실험 · 코드리뷰 프로토콜
    ├─ e2e-deploy/            ← Playwright E2E(설치→작동) · AI 브라우저 검증 · 배포 검증 루프(폴링·롤백 실험)
    └─ design-skills/         ← MengTo/Skills 큐레이션(감사 완료) — 디자인 코어·워크플로·스타일 카탈로그 62종+라우터
```

## 퀵스타트 (골격 배치 5분 / 기입은 프로젝트 규모에 따라 30분~)

1. **복사**:
   - **새 프로젝트**: clone 후 `.git` 삭제 → 그대로 프로젝트 루트로 사용.
     ```
     git clone https://github.com/namijini0403/meta_harness my-project && cd my-project && rm -rf .git
     ```
   - **기존 프로젝트에 도입(레트로핏)**: `.claude/`·`docs/`·`packs/`·`CLAUDE.md`만 복사. **기존 README·CLAUDE.md를 덮어쓰지 말 것** — 기존 CLAUDE.md가 있으면 킷의 절 구조와 대조해 빠진 절만 병합.
2. **AI에게 설치를 맡긴다**: 첫 세션에서 **"하네스 설치해"** — `init-harness` 스킬이 프로젝트를 조사하고, 문답으로 플레이스홀더를 채우고, 안 쓰는 팩을 정리하고, 검증 명령이 실제 도는지 확인한 뒤 스스로를 삭제한다.
   (수동으로 하려면: `CLAUDE.md`의 `{{...}}`를 채우고 — 채움 예시는 `examples/EXAMPLE-CLAUDE.md` — 필요한 팩만 남긴다. ⚠️ **남긴 팩은 각 팩의 `INSTALL.md` 절차(스킬을 `.claude/skills/`로 복사·문서 이동·CLAUDE.md 절 기입)까지 실행해야 활성화된다** — 폴더만 남기면 죽은 폴더다. 그리고 `.claude/agents/README.md` 경계표를 채우고, `docs/decisions-log-template.md`를 `docs/decisions-log.md`로 복사한다.)
3. **설치 자가검증**: `node scripts/check-placeholders.mjs` → 잔존 0건 확인, CLAUDE.md §3의 검증 명령을 실제 1회 실행해 전부 도는지 확인. (init-harness 스킬을 썼다면 자동 수행됨.)
4. **설치 후 정리**: 킷의 README.md는 프로젝트 소개로 교체, `LICENSE`는 삭제하거나 자기 프로젝트 라이선스로 교체, HARNESS.md는 `docs/`로 이동하거나 삭제(원본은 이 repo), 안 쓰는 팩 폴더 삭제.
5. **이후 세션에서 AI에게**: "CLAUDE.md를 읽고 규약대로 작업해" — 끝.

## 다른 AI 도구에서 쓰기 (이식성의 실제 범위)

- **모델 독립**: CLAUDE.md·docs/·packs/의 규약은 순수 마크다운 — 어떤 모델/도구든 읽고 따를 수 있다.
- **도구 종속**: `.claude/`(agents·skills·settings)는 Claude Code 전용 구조다. 다른 도구에서는 —
  - CLAUDE.md → `AGENTS.md` 등 그 도구의 규약 파일로 이름만 바꿔 사용.
  - `.claude/skills/*/SKILL.md` → 내용은 일반 절차서다. 그 도구의 프롬프트/명령 체계로 옮기거나 docs/로 이동해 "○○ 작업 시 이 문서를 따르라"로 CLAUDE.md(AGENTS.md)에서 참조.
  - `.claude/agents/README.md`의 경계표·브리프 8요소는 도구 무관 — 어떤 멀티에이전트 체계에서든 그대로 유효.

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
