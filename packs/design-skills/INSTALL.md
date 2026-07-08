# design-skills 팩 — 설치/제거 (MengTo/Skills 큐레이션)

**대상**: 웹 UI·랜딩 페이지·모션이 있는 프로젝트. Meng To(Design+Code)의 [MengTo/Skills](https://github.com/MengTo/Skills) (MIT)에서 검증·선별한 디자인 스킬을 세트로 편입한다.

## 보안·품질 감사 기록 (이 팩의 존재 근거 — 갱신 시 재감사)

- **감사 기준 커밋**: `25f872a94e3bbee85ecacba4041fa52c21cb0e44` (2026-07-08 감사)
- 실행 스크립트 9개 전수 검토: 공식 API(api.elevenlabs.io)·OS 스크린샷 도구·로컬 playwright만 호출. eval/난독화/자격증명 유출 경로 **0**.
- 전 SKILL.md 프롬프트 인젝션 스캔: 악성 지시 0 (유일한 히트는 오히려 방어 문구).
- 외부 도메인: 공식 문서·unsplash·CDN 위주. `hoirqrkdgbmvpwutwuwj.supabase.co`는 aura-asset-images 스킬의 공개 이미지 버킷(Aura Build 에셋) — 읽기 전용, 단 서드파티 의존이라 언젠가 깨질 수 있음.
- 라이선스: 루트 MIT. **예외 = `ui/frontend-design`**: Anthropic 공식 스킬 사본으로 보이며 참조된 LICENSE.txt 부재 → **설치 제외** (Claude Code 공식 frontend-design 플러그인이 동일 역할).
- frontmatter 95/95 정상 — Claude Code 자동 발동(description 매칭) 호환.

## 세트 구성 (넣었다 뺐다의 단위)

| 세트 | 설치 위치 | 구성 | 언제 |
|---|---|---|---|
| **A. 디자인 코어** (자동 발동) | `.claude/skills/` | high-end-visual-design · design-taste-frontend · minimalist-ui · image-to-code · redesign-existing-projects · seo-audit · optimize-web-animations | UI 있는 프로젝트 기본 |
| **B. 레퍼런스→프롬프트 워크플로** (자동 발동) | `.claude/skills/` | video-to-superprompt · html-to-interaction-prompts · stitched-full-page-capture · daily-ui-inspiration-capture · unsplash-asset-images | 레퍼런스 기반 디자인 작업 시 |
| **C. 스타일 카탈로그** (라우터 경유) | `docs/design-styles/` + 라우터 스킬 1개 | web-design 62종 스타일·모션·WebGL 시스템 | 랜딩/마케팅 페이지 프로젝트 |

**C를 스킬 폴더에 직접 넣지 않는 이유**: 62개 스킬이 목록에 들어가면 세션마다 스킬 리스트가 비대해진다. 대신 이 팩의 **`design-style-catalog` 라우터 스킬 하나**가 자동 발동해 카탈로그에서 골라 해당 SKILL.md를 읽어 적용한다.

**설치 제외 (이유 기록)**: ui/frontend-design(라이선스 불명·공식 플러그인 중복) · ui/gpt-taste(GPT 전용) · codex/playwright·playwright-interactive·screenshot·stitched의 Codex 전용 부분(Claude Code는 playwright MCP·e2e-deploy 팩이 대체 — stitched는 스크립트가 로컬 playwright라 유지) · `agents/openai.yaml` 전부(Codex 메타) · elevenlabs-tts·netlify-deploy·swiftui-*·고객지원/이메일/X 스킬(도메인 특수 — 필요할 때 개별 설치).

## 설치 (PowerShell)

```powershell
# 1. 클론 + 감사 기준 대조 (다르면 변경분 검토 후 진행 — 위 감사는 해당 커밋 기준)
git clone --depth 1 https://github.com/MengTo/Skills "$env:TEMP\mengto-skills"
git -C "$env:TEMP\mengto-skills" log -1 --format=%H   # 25f872a… 이면 그대로, 다르면 diff 확인

# 2. 세트 A+B → .claude/skills/
$src = "$env:TEMP\mengto-skills\agent-skills"
$setA = @("ui\high-end-visual-design","ui\design-taste-frontend","ui\minimalist-ui","ui\image-to-code","ui\redesign-existing-projects","ui\seo-audit","codex\optimize-web-animations")
$setB = @("codex\video-to-superprompt","codex\html-to-interaction-prompts","codex\stitched-full-page-capture","codex\daily-ui-inspiration-capture","media\unsplash-asset-images")
foreach ($s in $setA + $setB) { Copy-Item "$src\$s" ".claude\skills\$(Split-Path $s -Leaf)" -Recurse }
Remove-Item ".claude\skills\*\agents" -Recurse -ErrorAction SilentlyContinue   # Codex 전용 메타 제거

# 3. 세트 C → docs/design-styles/ + 라우터 스킬
Copy-Item "$src\web-design\*" "docs\design-styles\" -Recurse
Copy-Item "packs\design-skills\skills\design-style-catalog" ".claude\skills\design-style-catalog" -Recurse

# 4. 정리
Remove-Item "$env:TEMP\mengto-skills" -Recurse -Force
```

- 필요 없는 세트는 해당 단계만 생략. **설치 확인**: 새 세션에서 스킬 목록에 세트 A·B와 `design-style-catalog`가 보이고, "랜딩 페이지 스타일 골라줘" 요청에 라우터가 발동하면 완료.
- CLAUDE.md §0에 한 줄 추가(권장): `디자인·랜딩 페이지 작업 = design-style-catalog 스킬이 스타일 정본 (docs/design-styles/).`

## 갱신 / 제거

- **갱신**: 새 커밋을 받으면 **위 감사 항목(스크립트·인젝션·도메인)을 새 diff에 재실행**한 뒤 복사 — 감사 없이 갱신 금지 (서드파티 스킬은 공급망이다). 감사 기준 커밋을 이 파일에 갱신.
- **제거**: 복사한 스킬 폴더들 + `docs/design-styles/` 삭제, CLAUDE.md 줄 삭제.
