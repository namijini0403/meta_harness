# db-analytics 팩 — 설치/제거

**대상**: DB에 사용자 데이터를 저장하거나, 학습분석·행동 이벤트를 수집하는 프로젝트.
**원리**: 운영/분석 물리 분리 + 레지스트리 패턴 + 화이트리스트 다중 동기화 + 동의 전 no-op.
실전 검증: DRACONIS 분석 DB(Supabase 2개 프로젝트 분리, 이벤트 24종 화이트리스트, KT/CLA 연구 파이프라인).

## 설치

1. `db-design-principles.md` → 프로젝트 `docs/db/` 로 복사, 프로젝트 사실 채우기.
2. `analytics-schema-template.sql` → 프로젝트 `server/sql/` 로 복사, 도메인 테이블 추가.
3. `event-whitelist-protocol.md` → 프로젝트 `docs/db/` 로 복사, 동기화 3곳의 실제 경로 기입.
4. CLAUDE.md에 §6(데이터·개인정보 불변 결정) 절 활성화 — 코어 템플릿에 이미 초안 있음, 플레이스홀더만 채우기.

## 제거

- 복사한 문서·SQL 삭제 + CLAUDE.md §6 삭제. (이미 운영 중인 DB가 있다면 스키마는 남는다 — 이 팩은 규약이지 런타임이 아니다.)

## 내용물

| 파일 | 용도 |
|---|---|
| `db-design-principles.md` | 운영/분석 분리 · 레지스트리 패턴 · 가명화 · no-op 안전장치 원칙 |
| `analytics-schema-template.sql` | 앱/이벤트타입 레지스트리 + 이벤트 테이블 DDL 골격 (버전관리·주석 규약 포함) |
| `event-whitelist-protocol.md` | 새 이벤트 추가 시 3곳 동기화 절차 + 에이전트 단독 소유 규칙 |
