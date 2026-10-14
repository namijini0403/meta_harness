# 큰 빌드 파이프라인(ready→go) ↔ meta_harness 결합 규약 (bridge)

> 이 문서는 편입 스킬(`.claude/skills/ready`·`go`·`migration` — 외부 Dryforge 원문)을 **고치지 않고** meta_harness 코어와 맞물리게 하는 계약이다.
> 스킬을 실행할 때 모델은 이 규약을 함께 따른다. 스킬의 일반 규칙과 이 규약이 어긋나면 **이 규약이 이긴다** (스킬은 범용, 코어는 이 프로젝트의 실제 하네스다).

## 0. 한 줄 요약

dryforge는 **"무엇을 만들지"를 코드 짜기 전에 확정하는 앞문(ready)**과 **그것을 증거로 구현하는 실행기(go)**다.
meta_harness에 붙이면: **큰·다단계 빌드**에서 ready→go를 쓰고, 그 안의 **DB·인증·비밀값·배포·학생 데이터·고위험 완료** 지점은 전부 meta_harness의 기본 스킬로 처리한다. 작은 작업엔 쓰지 않는다 — 코어 §0 "평범한 작업은 빠르게".

## 1. 왜 "두꺼운 파이프라인"이 "thin core"와 충돌하지 않나

코어 §0/§1의 원칙은 **위험 비례 개입**이다: 기계적 = 자율 / 일반 = 기본 게이트 / DB·인증·배포 = 강화 / 고위험 완료 = 독립 검증.
**ready→go는 이 축의 최상단이다.** "앱을 통째로"·"새 서브시스템"·"모호한 대형 요청"은 가장 blast radius가 큰 작업이고, 그 위험은 *코드가 아니라 의도의 불확정*에서 온다. 그래서 강화 개입 = **먼저 의도를 확정(ready)**이다. thin core를 어기는 게 아니라 risk-routing을 큰 작업까지 끝까지 적용하는 것이다.

→ 그러므로 **파이프라인을 작은 작업에 쓰면 그 자체가 위반이다**(강한 모델 판단력 하향 평준화 = HARNESS.md §0이 폐기한 v1의 실패).

## 2. 절대 규칙: 코어는 건드리지 않는다 — 파이프라인은 **delta 모드로만** 돈다

dryforge `go`/`migration`의 **first cycle(첫 주기)** 분기는 CLAUDE.md/AGENTS.md와 `docs/`를 **새로 생성·재작성**한다. meta_harness 프로젝트에는 **이미 하네스가 있다**(코어 CLAUDE.md + docs/). 이 분기가 돌면 thin core를 날린다.

**방어:** 킷 설치(init-harness) 시 `.dryforge/status.json`에 `{ "initialized": true }`를 미리 써 둔다. 이 마커가 있으면 ready/go는 항상 **delta**로 동작한다 — 기존 하네스를 *읽기만* 하고 재생성하지 않는다. 즉:

- `go`의 "first cycle → CLAUDE.md 생성/재작성" 가지는 **절대 발동하지 않는다**.
- `ready`는 코어 CLAUDE.md + docs/를 **프로젝트 컨텍스트(delta)**로 로드하고, 이미 답이 있는 것은 다시 묻지 않는다.
- 혹시라도 모델이 first-cycle 생성을 하려 하면 **멈추고 사용자에게 보고** — meta_harness의 thin core는 재생성 대상이 아니다.

## 3. 어느 스킬을 언제 (meta_harness 관점)

| 상황 | 쓸 것 |
|---|---|
| meta_harness 갓 복사 → 킷 세팅 | **init-harness** (dryforge `migration` 아님). init-harness가 코어·docs 채우고, `.dryforge/status.json` 마커를 만든 뒤, 자기 삭제한다. |
| 큰/다단계/모호한 신규 빌드 | **ready → go** (delta). 사용자 승인 3-doc 뒤 구현. |
| 작은 작업·버그 1건·문구·스타일 | 파이프라인 쓰지 말 것. 코어 §1 라우팅 그대로. |
| **기존 비(非)meta 코드베이스**를 들여옴 | 선택지 둘: (a) init-harness로 meta 코어를 얹는다(권장, 가벼움). (b) 더 두꺼운 dryforge `docs/` 레이어가 필요하면 `migration` — 단, 기존 CLAUDE.md가 meta 코어면 **백업만 하고 덮어쓰지 말 것**, docs/는 §5 매핑을 따른다. |

## 4. 실행 중 안전 = meta_harness 기본 스킬 (dryforge의 범용 검증을 **구체화**)

ready의 ELICIT와 go의 구현 중, 작업이 아래를 건드리면 dryforge의 일반 지침 대신 **코어 §1 표의 스킬을 발동**한다. dryforge의 "verification gate"는 meta에서 이 스킬들로 실현된다.

| 파이프라인이 만났을 때 | 발동할 meta 스킬 | 근거 |
|---|---|---|
| DB·테이블·저장 구조 생성/변경, migration 작성 | `safe-db` | 백업·가역 마이그레이션·파괴 변경은 §2 승인 |
| 로그인·회원·권한·"○○만 보게" | `auth-basics` | 관리형 인증·서버측 검사 |
| API 키·토큰·비밀값 등장 | `secrets-basics` | .env+gitignore를 키 받기 **전에** |
| 배포·"접속되게" (= go의 runtime smoke) | `deploy-check` | 실제 URL 접속·조작 확인이 완료 |
| 학생·아동 식별 정보 / 외부 전송 | `student-privacy` | 최소 수집·동의·노출·전송 경계 |
| 새 계산·규칙·상태전이 구현 | `tdd` | RED 확인 후 구현 |

여러 개 겹치면 전부 적용(예: "학생 성적 저장" = safe-db + student-privacy). 이것들은 파이프라인 밖의 일반 작업에서도 그대로 발동된다 — 파이프라인은 이 라우팅을 *끄지 않는다*.

## 5. 게이트·권위·기록의 단일 정본 (두 시스템이 겹치는 곳 = meta가 정본)

| 개념 | dryforge 쪽 | meta_harness 쪽 (= **정본**) |
|---|---|---|
| 증거 바닥(evidence floor) | "captured exit codes, self-report 불신" | 코어 §3 검증 루프 — go의 integration/completion gate는 **코어 §3의 명령**을 쓴다 ("에러 안 났다"≠성공) |
| 독립 검증(A=A 회피) | fresh subagent / 3-doc-gate / final review | `risk-review` 스킬(신선한 검토자 + late-bound probe). RISKY 작업의 독립 검증은 risk-review로 수행 |
| 되돌리기 어려운 작업 | 암묵 | 코어 §2 — **사용자 승인 먼저**(무엇·잘못되면·대안). 파이프라인 중에도 §2는 살아있다 |
| 권위 순서 | spec > plan > code | 코어 §0 — **사용자 의도 > 불변 결정 > 스펙 > 코드**. 충돌은 자가해소 말고 질문 |
| 불변 결정 기록 | `docs/tracking/decisions/NNNN-*.md` (ADR) | **`docs/decisions-log.md`** (코어 §4 정본). 파이프라인이 내린 사용자 결정은 **여기**에 기록 — 병렬 ADR 트리를 새로 만들지 말 것 |
| 완료 조건 | completion gate + runtime smoke | 코어 §3 게이트 + (배포 시) deploy-check. "평가 못 한 체크 = 실패" |

**런타임 스모크**(go completion gate): 배포/서버가 있으면 deploy-check로, 없으면 코어 §3 명령으로 충족한다.

## 6. `.dryforge/` 의 위상 — 하네스가 아니라 작업 스크래치패드

- `.dryforge/`(3-doc·NNN 아카이브·status.json·worktrees·backup)는 **한 작업의 임시 산출물**이다. **프로젝트의 지속 기억은 여전히 meta 코어 CLAUDE.md + docs/**다.
- `.dryforge/`는 **`.gitignore`에 넣는다**(go/migration가 함). 3-doc(handoff/spec/plan)은 작업이 끝나면 `.dryforge/NNN/`로 아카이브된다 — 커밋 대상 아님.
- 다단계 마스터플랜이 필요하면 meta `docs/master-plan-template.md`를 정본으로, `.dryforge/` 3-doc은 그 한 Phase의 실행 묶음으로 본다.

## 7. orchestration 팩과의 관계 (소프트 — 둘 다 넣지 말 것)

go의 wave 기반 병렬 실행(worktree 격리·merge gate·integration gate)은 orchestration 팩의 "8요소 브리프·소유 경계·순차 파일"을 **포함하는 상위 구현**이다. 큰 빌드 파이프라인(코어 ready→go)이 있으면 보통 orchestration 팩은 **불필요**하다. 수동 병렬(파이프라인 밖)만 필요하면 orchestration 팩을, 큰 빌드를 파이프라인으로 돌리면 go를 쓴다. 둘을 동시에 설치하면 병렬 규약이 두 곳에 생기니 하나만.

## 8. 사용자 UX (초보 우선 — 코어 §0 유지)

- ready/go/migration 스킬은 `disable-model-invocation: true` — **모델이 멋대로 발동하지 않는다**. 큰 작업이면 모델이 **쉬운 말로 권한다**: *"꽤 큰 작업이네요. 바로 만들기 전에, 뭘 만들지 같이 정리하고 확인받고 시작할까요?"* → 사용자가 동의하면 ready를 연다.
- 스킬 내부 용어(wave·worktree·3-doc·gate·delta…)는 **사용자에게 노출 금지**(스킬 자체 규칙이기도 함). 결과·질문·막힘만, 사용자 언어로.
- dryforge 스킬은 이미 **사용자 언어로 네이티브 응답**하도록 설계됐다 — 한국어 사용자에겐 한국어로 동작한다. 별도 번역 불필요.
