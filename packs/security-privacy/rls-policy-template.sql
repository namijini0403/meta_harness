-- =============================================================================
-- RLS(행 수준 보안) 정책 골격 — 기본 거부 + 역할별 최소 허용
-- 원칙: ① 모든 테이블 RLS 활성화 (예외 없음) ② 정책 없는 테이블 = 아무도 못 읽음이 정상
--       ③ 서비스 롤 키는 서버에서만 (클라이언트 노출 = 전체 우회)
-- =============================================================================

-- 1. 전 테이블 RLS 활성화 (새 테이블 생성 시 반드시 포함 — CI 게이트로 강제 권장)
ALTER TABLE {{schema}}.{{table}} ENABLE ROW LEVEL SECURITY;

-- 2. 본인 행만 접근 (사용자 테이블 기본형)
CREATE POLICY "{{table}}_select_own" ON {{schema}}.{{table}}
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "{{table}}_update_own" ON {{schema}}.{{table}}
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. 스코프 관리자 (예: 담당 반/조직만) — 권한 계층은 RBAC_ABAC_MATRIX.md가 정본
CREATE POLICY "{{table}}_select_scoped_admin" ON {{schema}}.{{table}}
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM {{schema}}.admin_scope s
                WHERE s.admin_id = auth.uid() AND s.scope_id = {{table}}.{{scope_col}})
    );

-- 4. append 전용 테이블 (이벤트·감사 로그): INSERT만, UPDATE/DELETE 정책을 만들지 않는다
CREATE POLICY "{{events}}_insert_service" ON {{schema}}.{{events}}
    FOR INSERT WITH CHECK (true);  -- 서비스 롤 경유만 (anon 키에 INSERT 권한 주지 말 것)

-- 5. 검증 쿼리 — 감사 시 실행: RLS 꺼진 테이블 적발 (0행이 정상)
-- SELECT schemaname, tablename FROM pg_tables
-- WHERE schemaname = '{{schema}}'
--   AND tablename NOT IN (SELECT tablename FROM pg_tables t
--                         JOIN pg_class c ON c.relname = t.tablename
--                         WHERE c.relrowsecurity);
