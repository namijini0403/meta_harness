# code-collab 팩 — 설치/제거

**대상**: ① 소유 경계로 못 푸는 병렬(같은 파일을 여러 갈래로 실험)이 필요한 프로젝트 ② 코드리뷰를 작업 흐름에 넣고 싶은 프로젝트.
**참고**: 이 킷의 기본 병렬 전략은 **소유 경계**(agents/README.md)다 — 경계로 충분하면 이 팩은 불필요. worktree는 경계가 안 통할 때의 보조 수단.

## 설치

1. `worktree-parallel.md` → 프로젝트 `docs/` 로 복사.
2. `code-review-protocol.md` → 프로젝트 `docs/` 로 복사. 리뷰어를 에이전트로 두려면 `.claude/agents/`에 read-only 리뷰어 정의 추가 (security-auditor 패턴 재사용: 소유 파일 없음·리포트만).
3. CLAUDE.md §0에 한 줄 추가: `브랜치 마무리·병합 전 코드리뷰 = docs/code-review-protocol.md`

## 제거

- 복사한 문서 2개 삭제 + CLAUDE.md 해당 줄 삭제.

## 내용물

| 파일 | 용도 |
|---|---|
| `worktree-parallel.md` | git worktree로 같은 파일을 병렬 실험하는 절차 (격리·정리 규약) |
| `code-review-protocol.md` | 리뷰 요청/수신 프로토콜 — 리뷰어 독립성·리포트 형식·수신 시 규율 |
