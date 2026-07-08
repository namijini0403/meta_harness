import { defineConfig } from '@playwright/test';

// E2E 설정 (e2e-deploy 팩)
// - 로컬: `npx playwright test` — webServer가 개발 서버를 자동 기동
// - 배포본: `E2E_BASE_URL=https://{{배포URL}} npx playwright test` — webServer 생략, 원격 대상
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,          // CI에서만 재시도 — 로컬 간헐 실패는 숨기지 말고 고친다
  use: {
    baseURL: process.env.E2E_BASE_URL ?? '{{예: http://localhost:5173}}',
    screenshot: 'only-on-failure',           // 실패 화면이 곧 버그 리포트
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: '{{개발 서버 기동 명령 — 예: npm run dev -w client}}',
        url: '{{예: http://localhost:5173}}',
        reuseExistingServer: true,           // 이미 떠 있으면 재사용 (AI 세션이 서버를 켜둔 경우)
        timeout: 60_000,
      },
});
