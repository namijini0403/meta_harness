#!/usr/bin/env node
// 배포 완료 폴링 (e2e-deploy 팩) — 그대로 실행 가능
//
// 핵심 함정 방지: 푸시 직후에는 **구버전이 아직 살아 있다**. 헬스체크 200만 보고
// "배포 완료"라 판단하면 구버전을 스모크하게 된다 → --marker로 새 버전 문자열을 대조하라.
// (마커 = 배포마다 바뀌는 값: 커밋 SHA를 심은 /version 응답, index.html의 빌드 해시 등)
//
// 사용:
//   node scripts/wait-for-deploy.mjs <URL> [--marker <새버전문자열>] [--timeout <초=300>] [--interval <초=10>]
// 예:
//   node scripts/wait-for-deploy.mjs https://myapp.up.railway.app/version --marker "$(git rev-parse --short HEAD)"
// 종료코드: 0=배포 확인 / 1=타임아웃·오류 (CI 게이트·후속 스모크의 선행 조건으로 사용)

const args = process.argv.slice(2);
const url = args[0];
if (!url || url.startsWith('--')) {
  console.error('사용법: node wait-for-deploy.mjs <URL> [--marker <문자열>] [--timeout <초>] [--interval <초>]');
  process.exit(1);
}
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : def;
};
const marker = opt('marker', null);
const timeoutMs = Number(opt('timeout', 300)) * 1000;
const intervalMs = Number(opt('interval', 10)) * 1000;

const started = Date.now();
let attempt = 0;
while (Date.now() - started < timeoutMs) {
  attempt++;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const body = await res.text();
    if (!res.ok) {
      console.log(`[${attempt}] HTTP ${res.status} — 대기`);
    } else if (marker && !body.includes(marker)) {
      console.log(`[${attempt}] 200이지만 마커 "${marker}" 없음 — 구버전이 아직 서빙 중, 대기`);
    } else {
      console.log(`[${attempt}] 배포 확인 — HTTP ${res.status}${marker ? ` + 마커 "${marker}" 일치` : ' (⚠ 마커 미지정: 구버전일 수 있음)'}`);
      process.exit(0);
    }
  } catch (e) {
    console.log(`[${attempt}] 접속 실패(${e.cause?.code ?? e.message}) — 대기`);
  }
  await new Promise((r) => setTimeout(r, intervalMs));
}
console.error(`타임아웃(${timeoutMs / 1000}s): 배포 미확인 — 배포 대시보드 로그를 보라. 롤백 판단은 docs/deploy-verification-loop.md.`);
process.exit(1);
