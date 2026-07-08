import { test, expect, type Page } from '@playwright/test';

// 스모크 스위트 골격 (e2e-deploy 팩) — {{...}}를 프로젝트 핵심 여정으로 교체.
// 원칙: 스모크는 "많이"가 아니라 "치명 경로만" — 홈 로드 / 돈이 되는(=존재 이유인) 여정 1개 / 저장 유지.
// 세부 회귀는 단위·컴포넌트 테스트 소관. 스모크가 5분 넘게 걸리면 커밋 게이트에서 빠지기 시작한다(형해화).

// 모든 스모크 공통: 콘솔 에러 0 — "화면은 떴는데 콘솔이 빨갛다"를 잡는다
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

test('홈이 뜨고 콘솔 에러가 없다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  await expect(page.getByText('{{앱 이름 또는 홈 화면의 확정 텍스트}}')).toBeVisible();
  expect(errors, `콘솔 에러: ${errors.join(' | ')}`).toHaveLength(0);
});

test('핵심 사용자 여정이 끝까지 돈다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  // {{존재 이유인 여정 1개 — 예: 학습 시작 → 문제 풀이 → 결과 화면}}
  // await page.getByRole('button', { name: '{{시작 버튼}}' }).click();
  // await page.getByRole('button', { name: '{{보기 선택}}' }).click();
  // await expect(page.getByText('{{완료 화면 텍스트}}')).toBeVisible();
  expect(errors, `콘솔 에러: ${errors.join(' | ')}`).toHaveLength(0);
});

test('저장이 새로고침을 살아남는다', async ({ page }) => {
  await page.goto('/');
  // {{상태를 만드는 조작 — 예: 설정 변경, 진행도 획득}}
  await page.reload();
  // {{그 상태가 유지되는지 단언 — localStorage/서버 저장 회귀를 잡는다}}
});
