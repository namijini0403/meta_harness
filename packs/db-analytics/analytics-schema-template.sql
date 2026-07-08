-- =============================================================================
-- {{프로젝트}} 분석 DB 스키마 골격 (레지스트리 패턴)
-- 대상: 분석 전용 DB 인스턴스 (운영 DB와 프로젝트·접속 키 완전 분리)
-- 주의: 실행 전 동의(법적 근거) 완료 확인 — db-design-principles.md §2
-- 규약: 모든 테이블·컬럼에 COMMENT (다음 세션의 AI가 스키마만 읽고 의도를 복원할 수 있게)
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS analytics;
SET search_path TO analytics, public;

-- ---------------------------------------------------------------------------
-- 1. 앱 레지스트리 — 멀티앱/모듈 확장 대비 식별자 중앙 관리
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics.app_registry (
    app_id       TEXT        PRIMARY KEY,          -- 소문자 영문 식별자
    display_name TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deprecated   BOOLEAN     NOT NULL DEFAULT false -- 신규 수집 차단용 (행 삭제 금지)
);
COMMENT ON TABLE analytics.app_registry IS '앱 식별자 레지스트리 — 이벤트의 app_id 정본';

-- ---------------------------------------------------------------------------
-- 2. 이벤트 유형 레지스트리 — 스키마 변경을 version으로 추적 (기존 행 수정 금지)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics.event_type_registry (
    event_type   TEXT        NOT NULL,
    version      SMALLINT    NOT NULL DEFAULT 1,   -- payload 스키마 변경 시 +1
    description  TEXT,
    schema_json  JSONB,                             -- payload 필드 명세 (해석 근거 보존)
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deprecated   BOOLEAN     NOT NULL DEFAULT false,
    PRIMARY KEY (event_type, version)
);
COMMENT ON TABLE analytics.event_type_registry IS '이벤트 유형 버전 레지스트리 — 서버 화이트리스트·클라 타입과 3곳 동기화 (event-whitelist-protocol.md)';

-- ---------------------------------------------------------------------------
-- 3. 이벤트 본체 — append 전용. 자유 텍스트·식별정보 저장 금지 (가명 id만)
--    대량 수집 시 created_at 기준 파티셔닝 검토
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics.events (
    event_id     BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    app_id       TEXT        NOT NULL,              -- app_registry와 일치 (FK는 성능상 선택)
    event_type   TEXT        NOT NULL,
    type_version SMALLINT    NOT NULL DEFAULT 1,    -- 수집 당시 registry version
    pseudo_uid   TEXT        NOT NULL,              -- 가명 사용자 id (운영 id 직접 저장 금지)
    session_id   TEXT,
    seq_no       INTEGER,                           -- 세션 내 순서 (사후 복원 불가 — 처음부터 수집)
    payload      JSONB       NOT NULL DEFAULT '{}'::jsonb, -- 화이트리스트 필드만
    client_ts    TIMESTAMPTZ,                       -- 클라 시각 (오프라인 큐 대비)
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now() -- 서버 수신 시각
);
COMMENT ON TABLE analytics.events IS '행동 이벤트 (append 전용) — payload에 자유텍스트·닉네임·식별정보 절대 금지';
CREATE INDEX IF NOT EXISTS idx_events_type_time ON analytics.events (event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_events_uid_time  ON analytics.events (pseudo_uid, created_at);

-- ---------------------------------------------------------------------------
-- 4. {{도메인 차원 테이블 — 예: 콘텐츠 메타, 개념 매핑, 오류 코드 레지스트리}}
--    통제 어휘(오류 코드 등)도 레지스트리 패턴으로.
-- ---------------------------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS analytics.{{...}} ( ... );

-- ---------------------------------------------------------------------------
-- 5. RLS 기본 거부 (packs/security-privacy 병용 시 그쪽 정책 템플릿 우선)
-- ---------------------------------------------------------------------------
-- 원칙: "모든 테이블 RLS 활성화, 예외 없음" — 레지스트리도 포함 (정책 없는 테이블 = 기본 거부가 정상)
ALTER TABLE analytics.app_registry        ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.event_type_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.events              ENABLE ROW LEVEL SECURITY;
-- 쓰기: 서비스/수집 롤만 / 읽기: 분석용 읽기전용 롤·뷰만.
-- 정책 골격 = packs/security-privacy/rls-policy-template.sql (INSERT 정책은 반드시 TO로 롤 스코프,
-- UPDATE는 USING+WITH CHECK 쌍). 상세는 프로젝트 보안 설계에서.
