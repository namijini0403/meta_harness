---
name: design-style-catalog
description: 웹/랜딩 페이지의 디자인 스타일·무드·배경 효과·스크롤 모션·WebGL 연출 요청 시 사용 — "랜딩 페이지 만들어", "○○풍/스타일로", "배경에 효과", "스크롤 애니메이션", "프리미엄/미니멀/다크 느낌", GSAP·Three.js·글로브·글래스모피즘 언급 시. docs/design-styles/의 62종 스타일 시스템에서 골라 해당 SKILL.md를 읽어 그대로 적용한다.
---

# 디자인 스타일 카탈로그 (라우터)

`docs/design-styles/<이름>/SKILL.md` 에 62종 스타일 시스템(MengTo/Skills 큐레이션)이 있다. **이 파일은 목차다 — 스타일을 고르면 반드시 해당 SKILL.md 전문을 읽고 그 안의 정확한 값(색·간격·그림자·코드)을 그대로 쓴다.** 어림 재현 금지.

## 사용 절차

1. 요청의 무드·기술 키워드로 아래에서 1~3개 후보 선정 (모호하면 후보를 사용자에게 제시 — 무드 선택은 사용자 몫).
2. 선정한 스타일의 `docs/design-styles/<이름>/SKILL.md` **전문 정독** → 그 규격대로 구현.
3. 조합 가능: 스타일 시스템(전체 무드) 1개 + 디테일/모션 여러 개. 스타일 시스템끼리 섞지 말 것(무드 충돌).
4. 폴더가 없으면 미설치 — `packs/design-skills/INSTALL.md` 세트 C 설치를 안내.

## 카탈로그

**페이지 패턴**: landing-page(고전환 랜딩 구조·카피) · pricing-page(SaaS 가격 페이지)

**스타일 시스템 (전체 무드 — 하나만 선택)**:
agency-grid-layout-minimal(에이전시 편집 그리드·큰 타이포) · blue-cloudy-clean-modern(밝은 하늘·구름빛) · blue-laser-clean-glass-layout(다크 글래스+블루 레이저) · book-serif-index(고서 세리프·아카이브) · bright-green-tech-system-webgl(형광 그린 테크) · clean-minimal-beige-light-mode(베이지 미니멀 라이트) · dark-blue-contrasting-clean(코발트 대비 다크) · dark-glass-clean-layout(프로스티드 다크 워크스페이스) · dither-laser-dark-mode(디더 텍스처+레이저 다크) · editorial-tech(매거진 편집×테크) · framed-tech-dark-border-gradient(보더 그라디언트 프레임 다크) · funky-purple-container-tech(퍼플 컨테이너 테크) · glass-dark-mode-clock(다크 글래스+다이얼 계기) · glass-dark-ui(글래스모피즘 다크) · high-contrast-skeuomorphic-clean(고대비 스큐어모픽) · image-first-grid-layout(풀블리드 사진 그리드) · light-mode-paper-technical(종이질감 라이트 테크니컬) · mesh-gradient-dark-blue-clean(메시 그라디언트 다크블루) · nested-container-clean-agency(중첩 컨테이너 에이전시) · orange-clean-paper-saas(오렌지 페이퍼 SaaS) · skeuomorphic-ui(스큐어모픽 표면) · split-layout-technical(듀얼 패널 테크니컬) · tech-green-dark-mode-modern(에메랄드 시그널 다크) · technical-wireframe-info-layout(와이어프레임 도해)

**레이아웃 구조**: framed-grid-layout(가는 프레임+코너 브래킷) · nested-container-frames(컨테이너 중첩 프레임) · container-lines(수직 가이드라인+코너 스퀘어)

**배경·분위기**: atmosphere-background(수직 광류 다크) · dither-background(베이어 디더 모노) · background-grid-webgl(원근 그리드 WebGL) · corner-lasers(코너 레이저 빔) · gooey-blob-system(SVG 구이 블롭) · globe-particles(파티클 글로브)

**모션·리빌**: animation-systems(Stripe/Linear급 모션 체계 — 모션 전반의 정본) · animation-on-scroll(IntersectionObserver 트리거) · cinematic-gsap-lenis-motion-system(GSAP+Lenis 시네마틱) · cinematic-scroll-storytelling(스크롤 스토리텔링) · gsap-scrolltrigger-storytelling(스티키 제품 서사) · masked-reveal(마스크 워드 리빌) · staggered-word-reveal(단어 단위 페이드업) · marquee-loop(무한 마퀴)

**WebGL·3D**: webgl-3d-object(PBR 3D 오브젝트) · webgl-landing-steering(WebGL 랜딩 방향 조정) · webgl-laser(풀스크린 레이저)

**디테일 컴포넌트**: beautiful-shadows(레이어드 그림자 정확값) · corner-diagonals(사선 컷 코너) · css-alpha-masking(엣지 페이드 마스크) · css-border-gradient(그라디언트 보더) · progressive-blur(단계 블러) · number-details(01/02 장식 넘버) · company-logos(Simple Icons 로고) · solar-duotone-bold(Solar 아이콘 스타일)

**라이브러리 가이드** (해당 기술 쓸 때): gsap · tailwindcss · threejs · matterjs(2D 물리) · cobejs(경량 글로브) · globe-gl(3D 글로브 데이터) · vantajs(배경 효과) · unicorn-studio(임베드)

## 규율

- 학습앱·대시보드 등 **기능 UI에는 스타일 시스템을 통째로 끼얹지 말 것** — 디테일 컴포넌트·모션만 선별 (무드 프리셋은 마케팅/랜딩 지향).
- 성능: WebGL·스크롤 모션 채택 시 저사양·모바일 폴백을 같이 구현 (`optimize-web-animations` 스킬 병용).
- 프로젝트에 디자인 시스템이 이미 있으면 그것이 우선 — 카탈로그는 새 표면(랜딩·소개 페이지)에만.
