# meta_harness v2 — 초보도 안전한 AI 개발 하네스 스타터킷

> **코딩·DB·인증·배포에 익숙하지 않은 사람(예: 바이브코딩을 시작하는 교사)이 AI와 함께 앱을 만들 때, 하네스의 존재를 거의 의식하지 않고도 안전하게 개발하게 해주는 복사형 스타터킷.**
> 설계: **thin core + intelligent routing + rich skills + risk-triggered verification.**
> DRACONIS(math_mon) 등 실전 프로젝트에서 검증된 패턴을 범용화했다.

## 무엇이 문제인가

AI는 이제 코드를 잘 짠다. 문제는 코드가 아니라 **초보 사용자가 모르는 위험**이다:

- migration 한 줄이 학생 기록을 전부 날릴 수 있다는 것
- API 키를 코드에 넣고 커밋하면 지워도 남는다는 것
- "배포 명령 성공"과 "실제로 접속되는 것"이 다르다는 것
- AI가 만든 그럴듯한 코드가 틀렸을 수 있고, AI의 "다 됐습니다"가 증거가 아니라는 것
- 지난 세션에서 정한 결정을 다음 세션 AI가 "개선"이랍시고 뒤집는 것

v2 하네스는 이것만 막는다. **평범한 작업에서는 모델의 속도와 자율성을 방해하지 않는다.**

## 어떻게 동작하나 (사용자 관점)

사용자는 그냥 말한다: *"로그인 만들어줘"*, *"학생 기록 저장하고 싶어"*, *"이 앱 배포해줘"*, *"이 오류 고쳐줘"*.

스킬 이름·전문 용어를 알 필요가 없다. **모델이 요청의 위험을 판단해 알맞은 안전 규약(스킬)을 자동 적용한다** (코어 CLAUDE.md §1 라우팅 표). 위험한 순간에만 쉬운 말로 묻는다: *"이걸 바꾸면 기존에 저장된 학생 기록이 사라질 수 있어요. 백업부터 할까요?"*

## 구조

```
meta_harness/
├─ CLAUDE.md                  ← ★ thin core: 대원칙·위험 라우팅 표·불변식·검증 루프 (상시 로드는 이것뿐)
├─ HARNESS.md                 ← 방법론 (왜 이렇게 설계했는가 — §0이 v2 전환 설명)
├─ .claude/skills/            ← ★ 기본 스킬 (필요할 때만 로드 — 항상 설치, 선택 불필요)
│   ├─ init-harness/          ←   설치 일회용: 조사→쉬운 문답→조립→자기 삭제
│   ├─ safe-db/               ←   DB·저장 안전 (백업·가역 마이그레이션·파괴 변경 승인)
│   ├─ auth-basics/           ←   로그인·권한 (관리형 인증·서버 검증·평문 금지)
│   ├─ secrets-basics/        ←   API 키·비밀값 (.env+gitignore를 키 받기 전에)
│   ├─ deploy-check/          ←   배포 (실제 접속·조작 확인해야 완료)
│   ├─ student-privacy/       ←   학생·아동 데이터 (최소 수집·동의·노출 점검)
│   ├─ risk-review/           ←   고위험 작업 독립 검증 (blind reviewer + 예상 못 한 시험)
│   ├─ debug/ tdd/ verify/    ←   디버깅·테스트 우선·커밋 전 게이트
├─ docs/                      ← 템플릿: 계획서·마스터플랜·검증 루프·자동화 게이트·합리화 방지표·결정 로그
├─ scripts/check-placeholders.mjs ← 설치 자가검증
├─ examples/EXAMPLE-CLAUDE.md ← 채움 예시
└─ packs/                     ← 선택 모듈 (필요한 것만): content-verification · db-analytics ·
                                 security-privacy · code-collab · e2e-deploy · design-skills · orchestration
```

## 퀵스타트

1. **복사**: `git clone https://github.com/namijini0403/meta_harness my-project && cd my-project && rm -rf .git` (기존 프로젝트 도입 시 `.claude/`·`docs/`·`packs/`·`CLAUDE.md`만 복사 — 기존 README·CLAUDE.md 덮어쓰기 금지).
2. **첫 세션에서 AI에게**: **"하네스 설치해"** — init-harness 스킬이 프로젝트를 조사해 알 수 있는 것은 스스로 채우고, 코드로 알 수 없는 것(잃으면 안 되는 데이터, 이미 내려진 결정)만 쉬운 말로 물은 뒤, 팩을 정리하고, 검증 명령이 실제 도는지 확인하고, 스스로를 삭제한다.
3. 이후는 그냥 개발한다. 하네스는 위험할 때만 나타난다.

## 핵심 설계 원칙 (근거: HARNESS.md)

| # | 원칙 | 한 줄 |
|---|---|---|
| 1 | **thin core** | 상시 로드는 얇은 CLAUDE.md뿐. 전문 지식은 스킬로 — 필요할 때만 로드(지연 로드). |
| 2 | **위험 비례 개입** | 기계적 수정 = 자율 / 일반 = 기본 게이트 / DB·인증·개인정보·배포 = 강화 / 고위험 완료 = 독립 검증. |
| 3 | **권위 분리** | 사용자 의도 > 불변 결정 > 스펙 > 코드. 코드는 의도의 증거가 아니다 — 충돌은 질문으로. |
| 4 | **완료 = 증거** | 평가 못 한 체크 = 실패. "에러 안 났다" ≠ 성공. 자기보고 불신. |
| 5 | **A=A 회피** | 고위험 변경은 구현자의 추론을 못 본 신선한 검토자가, 예상 못 한 시험으로 검증(risk-review). |
| 6 | **불변식은 테스트로** | 실패 → 합리화 방지표 → 반복되면 불변식 → 가능하면 테스트/훅/CI로 승격. 하네스는 실패를 먹고 자란다. |
| 7 | **토큰 경제** | 대량·기계적 작업은 값싼 서브에이전트 위임(커밋 금지·경계·fail-closed·자기보고 불신 4규약). |

## 다른 AI 도구에서 쓰기

CLAUDE.md·docs/·packs/는 순수 마크다운 — 어떤 모델/도구든 따를 수 있다. `.claude/skills/`는 Claude Code 전용 구조지만 내용은 일반 절차서라, 다른 도구에서는 docs/로 옮겨 "○○ 작업 시 이 문서를 따르라"로 규약 파일(AGENTS.md 등)에서 참조하면 된다.

## 참고

- 실전 원본: DRACONIS(math_mon) — 이 킷의 패턴이 검증된 곳. 개인용(전문가) 하네스는 별도 repo `dev-harness` 참조.
- 흡수한 외부 설계: Dryforge(권위 분리·evidence floor·위험 비례)·Veriloop(blind review·late-bound probe) — 원리만 얇게, 세리모니는 기각.
- 보안 스킬 연동: https://github.com/mukul975/Anthropic-Cybersecurity-Skills

## 라이선스

MIT — 자유롭게 복사·수정하되, 프로젝트마다 하네스를 **키워라** (합리화 방지표에 실패를 기록하는 것이 유지보수의 전부다).
