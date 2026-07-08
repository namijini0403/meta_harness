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
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
-- ⚠ UPDATE는 USING만 쓰면 안 된다: WITH CHECK가 없으면 본인 행을 잡은 뒤
--   user_id를 타인으로 바꿔치기(소유권 이전)가 가능하다. 항상 쌍으로.

-- 3. 스코프 관리자 (예: 담당 반/조직만) — 권한 계층은 RBAC_ABAC_MATRIX.md가 정본
CREATE POLICY "{{table}}_select_scoped_admin" ON {{schema}}.{{table}}
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM {{schema}}.admin_scope s
                WHERE s.admin_id = auth.uid() AND s.scope_id = {{table}}.{{scope_col}})
    );

-- 4. append 전용 테이블 (이벤트·감사 로그): INSERT만, UPDATE/DELETE 정책을 만들지 않는다
-- ⚠ WITH CHECK (true)를 롤 제한 없이 쓰면 "모든 롤에 INSERT 허용"이다 — 반드시 TO로 롤을 스코프.
--   (Supabase의 service_role은 원래 RLS를 우회하므로 이 정책 자체가 불필요할 수 있다.
--    별도 수집용 롤을 쓰는 경우의 골격:)
CREATE POLICY "{{events}}_insert_service" ON {{schema}}.{{events}}
    FOR INSERT TO {{ingest_role}}          -- 수집 전용 롤만 — anon/authenticated에 열지 말 것
    WITH CHECK (true);

-- 5. 검증 쿼리 — 감사 시 실행: RLS 꺼진 테이블 적발 (0행이 정상)
--    (pg_namespace로 스키마까지 조인 — relname만으로 조인하면 타 스키마 동명 테이블 때문에 거짓 통과)
-- SELECT n.nspname AS schema, c.relname AS "table"
-- FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = '{{schema}}' AND c.relkind = 'r' AND NOT c.relrowsecurity;
