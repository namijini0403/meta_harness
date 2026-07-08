# e2e-deploy 팩 — 설치/제거 (브라우저 E2E + 배포 검증 루프)

**대상**: 브라우저에서 돌아가는 앱(웹/PWA)이 있는 프로젝트. §3 루프(타입체크·테스트·빌드)는 "코드가 옳은가"까지만 본다 — 이 팩은 **"실제 브라우저에서 사용자 여정이 돌아가는가"**(E2E)와 **"배포된 것이 진짜 그 버전이고 살아 있는가"**(배포 검증)를 게이트로 추가한다.

## 설치 (명령 포함 — 순서대로)

1. **Playwright 설치** (프로젝트 루트에서):
   ```
   npm i -D @playwright/test
   npx playwright install chromium        # Chrome 계열 엔진 — E2E는 chromium 하나로 시작(멀티 브라우저는 필요해질 때)
   ```
2. **파일 배치**:
   - `playwright.config.template.ts` → 프로젝트 루트 `playwright.config.ts` (`.template` 제거, `{{...}}` 채우기)
   - `tests/smoke.spec.template.ts` → `tests/e2e/smoke.spec.ts` (핵심 여정으로 교체)
   - `scripts/wait-for-deploy.mjs` → 프로젝트 `scripts/` (수정 불요 — 그대로 실행 가능)
   - `browser-verification.md`, `deploy-verification-loop.md` → 프로젝트 `docs/`
3. **첫 작동 확인** (여기까지 통과해야 설치 완료 — 안 도는 게이트를 규약에 박지 말 것):
   ```
   npx playwright test                    # 로컬 스모크 통과 확인 (webServer가 개발 서버 자동 기동)
   ```
4. **CLAUDE.md §3 검증 루프에 한 줄 추가**:
   ```
   npx playwright test                    # E2E 스모크 — UI 여정 회귀 (e2e-deploy 팩)
   ```
5. **CLAUDE.md §7 배포 줄 뒤에 추가**:
   ```
   배포 후 검증 필수 = docs/deploy-verification-loop.md (버전 마커 확인 전에 "배포 완료" 선언 금지).
   UI 변경 검증 규약 = docs/browser-verification.md.
   ```
6. **(선택) AI 브라우저 검증** — Claude Code에서 playwright MCP를 쓰면 AI가 직접 브라우저를 열어 육안 검증한다:
   ```
   claude mcp add playwright -- npx @playwright/mcp@latest
   ```

## 제거

- `npm rm @playwright/test`, 배치한 파일 5개 삭제, CLAUDE.md §3·§7의 해당 줄 삭제.

## 내용물

| 파일 | 용도 |
|---|---|
| `playwright.config.template.ts` | 최소 설정 — 로컬 개발서버 자동 기동 + `E2E_BASE_URL`로 배포본 대상 전환 |
| `tests/smoke.spec.template.ts` | 스모크 3종 골격(로드·핵심 여정·저장 유지) + 콘솔 에러 0 단언 |
| `scripts/wait-for-deploy.mjs` | **실행 가능**: 배포 완료 폴링 — 헬스체크 + 버전 마커 대조(구버전 오검증 방지) |
| `browser-verification.md` | 브라우저 검증 2모드 규약 — 자동 E2E(회귀) vs AI 조작 검증(육안) |
| `deploy-verification-loop.md` | 배포 검증 루프(사전→대기→사후 스모크→실패 시 롤백) + 배포 실험 절차 + CI 예시 |
