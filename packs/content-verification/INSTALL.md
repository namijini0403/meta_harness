# content-verification 팩 — 설치/제거

**대상**: 콘텐츠(문항·문서·데이터·코드 산출물)를 대량 생산하고 품질을 기계+육안으로 보증해야 하는 프로젝트.
**원리**: 저작 스킬(완성 세트 강제) ↔ 감사 스킬(읽기전용 스캐너) 짝 구조 + 3중 검증. HARNESS.md §5·§6.

## 설치

1. `skills/author-pipeline/` → 프로젝트 `.claude/skills/author-<도메인>/` 으로 복사, 플레이스홀더 채우기.
2. `skills/audit-content/` → 프로젝트 `.claude/skills/audit-<도메인>/` 으로 복사.
3. `pipeline-template.md` → 프로젝트 `docs/` 로 복사해 CLAUDE.md §1(반복 파이프라인)을 설계.
4. CLAUDE.md **§1(반복 파이프라인) 자리의 플레이스홀더를 아래 내용으로 교체** (새 절을 추가하면 번호가 겹친다):

```markdown
## 1. 콘텐츠 파이프라인
1. 청사진 작성(메인): docs/{{청사진}}.md — {{단위 정의}}
2. 충돌 사전 확인(메인): {{레지스트리/id}} 기존 항목 grep, 중복 시 청사진 수정
3. 구현 에이전트 N개 가동: 브리프 8요소(docs/agent-brief-template.md) + 완성 세트 기준. 공유 파일 순차.
4. 통합 검증(메인): §3 전체 → 육안 → 커밋
```

## 제거

- 복사한 스킬 2개 삭제 + CLAUDE.md §1 해당 절 삭제. (감사 스캐너를 CI에 편입했다면 그것은 남겨도 무방 — 독립 테스트다.)

## 내용물

| 파일 | 용도 |
|---|---|
| `pipeline-template.md` | 반복 대량 저작 파이프라인 설계 (청사진→에이전트→통합) |
| `skills/author-pipeline/SKILL.md` | 저작 스킬 템플릿 — 완성 세트·통제 어휘·3중 검증 내장 |
| `skills/author-pipeline/verifiers/independent-solver.md` | 독립 재계산(적대 검증) 작성 가이드 |
| `skills/audit-content/SKILL.md` | 감사 스킬 템플릿 — 읽기전용·스캐너 목록·리포트 형식 |
| `skills/audit-content/scanners/01-vocab-subset.example.mjs` | **실행 가능한 참조 스캐너** — 통제 어휘 대조. CONFIG 채우고 `.example` 떼면 동작, 이 형태로 스캐너를 축적 |
