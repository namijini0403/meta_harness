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
const invalid = () => { console.error('입력 오류: 자격증명 없는 HTTP(S) URL과 유효한 marker/timeout/interval 옵션을 사용하세요.'); process.exit(1); };
let url;
try { url = new URL(args[0]); } catch { invalid(); }
if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) invalid();
const options = {marker: null, timeout: '300', interval: '10'};
const seen = new Set();
for (let i = 1; i < args.length; i += 2) {
  const key = args[i].slice(2);
  if (!args[i].startsWith('--') || !Object.hasOwn(options, key) || seen.has(key) || args[i + 1] === undefined) invalid();
  seen.add(key); options[key] = args[i + 1];
}
const marker = options.marker;
if (marker !== null && (!marker.length || marker.length > 4096)) invalid();
const timeoutMs = Number(options.timeout) * 1000;
const intervalMs = Number(options.interval) * 1000;
if (!Number.isFinite(timeoutMs) || timeoutMs < 10 || timeoutMs > 3600000 || !Number.isFinite(intervalMs) || intervalMs < 1 || intervalMs > 60000) invalid();

// Caller-supplied deployment URL only; never expose this CLI as an arbitrary URL fetching API.
async function boundedBody(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = []; let bytes = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 1024 * 1024) { await reader.cancel(); throw new Error('Body limit'); }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString('utf8');
  } finally { reader.releaseLock(); }
}

const started = Date.now();
let attempt = 0;
while (Date.now() - started < timeoutMs) {
  attempt++;
  try {
    const remaining = Math.max(1, Math.ceil(timeoutMs - (Date.now() - started)));
    const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(Math.min(10000, remaining)) });
    const body = await boundedBody(res);
    if (!res.ok) {
      console.log(`[${attempt}] HTTP ${res.status} — 대기`);
    } else if (marker && !body.includes(marker)) {
      console.log(`[${attempt}] 마커 불일치 — 대기`);
    } else {
      console.log(`[${attempt}] 배포 확인 — HTTP ${res.status}${marker ? ' + 마커 일치' : ' (마커 미지정: 구버전일 수 있음)'}`);
      process.exit(0);
    }
  } catch {
    console.log(`[${attempt}] 접속 또는 응답 검증 실패 — 대기`);
  }
  await new Promise((r) => setTimeout(r, Math.min(intervalMs, Math.max(0, timeoutMs - (Date.now() - started)))));
}
console.error(`타임아웃(${timeoutMs / 1000}s): 배포 미확인 — 배포 대시보드 로그를 보라. 롤백 판단은 docs/deploy-verification-loop.md.`);
process.exit(1);
