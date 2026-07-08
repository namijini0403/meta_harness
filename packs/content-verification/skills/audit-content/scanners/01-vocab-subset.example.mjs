#!/usr/bin/env node
// 참조 스캐너 예시 (실행 가능): "산출물이 쓰는 토큰 ⊆ 통제 어휘" 대조
// — 파일명의 .example을 떼고 상단 CONFIG를 프로젝트에 맞게 채우면 그대로 동작한다.
// 이것이 HARNESS.md §4 "문서 규칙 → 테스트" 승격의 최소 형태다: 프레임워크 없이 Node만으로 돌고,
// 종료코드 1이면 실패이므로 검증 루프(§3)나 CI에 한 줄로 편입된다.
//
// 사용: node scanners/01-vocab-subset.example.mjs
import { readFileSync } from 'node:fs';

// ── CONFIG (프로젝트에 맞게 교체) ──────────────────────────────
const VOCAB_FILE = 'src/vocab.json';          // 통제 어휘 정본 — 예: ["missing_carry", "swap_operands", ...]
const CONTENT_GLOB_FILE = 'src/content.json'; // 산출물(토큰을 사용하는 쪽) — 예: [{ id, code }, ...]
const TOKEN_FIELD = 'code';                   // 산출물에서 검사할 필드명
// ────────────────────────────────────────────────────────────

const vocab = new Set(JSON.parse(readFileSync(VOCAB_FILE, 'utf8')));
const items = JSON.parse(readFileSync(CONTENT_GLOB_FILE, 'utf8'));

const violations = items
  .filter((it) => it[TOKEN_FIELD] != null && !vocab.has(it[TOKEN_FIELD]))
  .map((it) => `${it.id ?? '(id없음)'} → 미등록 토큰 "${it[TOKEN_FIELD]}"`);

if (violations.length) {
  console.error(`통제 어휘 위반 ${violations.length}건 (자유 문자열 금지 — PROPOSED 보고 → 메인 승인 → 등록):\n` + violations.join('\n'));
  process.exit(1);
}
console.log(`통제 어휘 대조 통과 — 항목 ${items.length}개, 어휘 ${vocab.size}개`);
