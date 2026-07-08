# 배포 검증 루프 (푸시 = 배포 완료가 아니다)

> 실전 사고 패턴: 푸시하고 "배포됐습니다"라고 보고했는데 ① 빌드가 원격에서만 실패 ② CDN/프록시가 구버전 캐시를 서빙 ③ 환경변수 누락으로 뜨자마자 죽음. **"배포 완료" 선언은 아래 루프 통과 후에만.**

## 표준 루프 (배포마다)

```
[사전] CLAUDE.md §3 전체 게이트 통과 → 푸시(=배포 트리거)
   ↓
[대기] node scripts/wait-for-deploy.mjs {{배포URL/버전엔드포인트}} --marker "$(git rev-parse --short HEAD)"
       — 헬스 200 + 새 버전 마커 확인까지 폴링 (구버전 오검증 방지)
   ↓
[사후 스모크] E2E_BASE_URL={{배포URL}} npx playwright test
       — 로컬에서 통과한 그 스위트를 배포본에 그대로 (환경 차이·env 누락이 여기서 드러난다)
   ↓
[판정] 전부 통과 → "배포 완료+검증됨" 보고 (마커·스모크 결과 포함)
       실패 → 아래 "실패 시"
```

- **버전 마커 심기** (한 번만 해두면 됨): 배포마다 바뀌는 값을 응답에 노출 — {{예: 서버 `/version`이 빌드 시 주입된 커밋 SHA 반환, 또는 클라 빌드가 index.html에 해시 메타태그 삽입}}.
- AI 세션이 배포를 기다릴 때: 폴링 스크립트가 블로킹으로 대신 기다려준다 — 수동 새로고침 반복 금지.

## 실패 시

1. **원인 분류부터**: 빌드 실패(대시보드 로그) / 기동 실패(env·마이그레이션) / 뜨지만 스모크 실패(회귀).
2. 사용자 영향이 있으면 **롤백 먼저 조사 나중** — 직전 성공 배포로 되돌리는 절차: {{예: Railway 대시보드에서 이전 배포 redeploy}}. 침해·데이터 사고 의심은 인시던트 러닝북(security-privacy 팩).
3. 원인은 debug 스킬 규율로(재현→가설→검증). **원격에서만 실패한 원인은 §3 게이트에 추가**할 수 있는지 항상 물어라(예: env 검증 스크립트, node 버전 고정) — 같은 실패의 재발 방지가 이 루프의 성장 방식이다.

## 배포 파이프라인 실험 (신규 프로젝트·파이프라인 변경 시 1회)

파이프라인 자체를 믿기 전에 **무해한 변경으로 전체 루프를 실험**한다:

1. 눈에 보이는 사소한 변경(예: 푸터 버전 문구)을 커밋·푸시.
2. 표준 루프 전체 실행 — 대기 폴링이 실제로 새 마커를 잡는지, 스모크가 배포본에서 도는지.
3. **롤백도 실험**: 이전 배포로 되돌려보고 마커가 구버전으로 돌아오는지 확인. (롤백을 사고 당일 처음 해보는 것이 최악이다.)
4. 소요 시간을 기록(§8 자주 쓰는 사실) — "푸시 후 N분이 정상"을 알아야 이상 지연을 감지한다.

## CI 편입 (automation-gates.md의 gate.yml에 추가하는 잡)

```yaml
  post-deploy-smoke:
    needs: verify                # 게이트 통과 후 (배포 트리거가 push일 때)
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci && npx playwright install chromium --with-deps
      - name: 배포 완료 대기 (새 버전 마커)
        run: node scripts/wait-for-deploy.mjs {{배포URL/버전엔드포인트}} --marker "${GITHUB_SHA::7}" --timeout 600
      - name: 배포본 스모크
        run: E2E_BASE_URL={{배포URL}} npx playwright test
        # 실패 = 배포본이 깨짐 — 알림 설정 권장 (레포 Settings → Notifications 또는 알림 액션)
```
