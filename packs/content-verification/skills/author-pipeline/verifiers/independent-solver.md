# 독립 재계산(적대 검증) 작성 가이드

> 자동 속성 테스트가 못 잡는 부류: **"정답은 맞는데 표시가 틀린"** 버그.
> 생성 로직과 검증 로직을 같은 코드로 짜면 같은 버그를 공유한다 — 검증자는 처음부터 다시 푼다.

## 원칙

1. **입력은 표시값만**: 산출물이 사용자에게 보여주는 값(프롬프트의 숫자·텍스트)에서 출발한다.
   생성기의 내부 변수·중간값을 import하지 않는다.
2. **독립 구현**: 정답 계산을 검증 테스트 안에서 처음부터 구현. 생성기 코드 복붙 금지.
3. **대량 샘플**: 시드/파라미터를 수천 개 돌려 전수 대조.
4. **유일성 단언**: 선택지형이면 "보기 N개 중 정답 조건을 만족하는 것이 정확히 1개"를 단언
   (정답이 둘 이상 생기는 극단 조합을 잡는다).

## 템플릿 (의사코드 — 프로젝트 테스트 프레임워크로 번역)

```ts
// zztmp_verify_{{항목}}.test.ts — 제출 전 삭제 (임시 접두사 규약 준수)
for (seed of range(0, 5000)) {
  const item = generate(seed);
  const displayed = extractDisplayedValues(item.prompt);   // 표시값만
  const expected = solveFromScratch(displayed);            // 독립 재계산
  expect(item.answer).toEqual(expected);
  if (item.type === 'choice') {
    const satisfying = item.choices.filter(c => isCorrect(c, displayed));
    expect(satisfying.length).toBe(1);                     // 유일성
  }
}
```

## 실전에서 이것만이 잡은 버그 (근거)

- 폴백 변수 vs 루프 후보 변수 혼동 → 정답은 맞고 **표시만 틀림** (자동 테스트 전부 통과).
- 해설의 산술 방향 역전 ("a에서 b를 뺀"이 실제로는 b−a).
- 교정 해설의 최종값이 실제 정답과 불일치.
