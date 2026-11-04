# SEO

새 페이지를 기획·설계·구현할 때 따른다.

## SEO 규칙

Google, Naver에 이미 등록되어 있다. 새 페이지는 기존 SEO 구조를 그대로 따른다.

- 메타데이터: 새 페이지는 `src/lib/seo.ts`의 `buildMetadata()`로 title, description, canonical, OG를 만든다. 직접 객체를 만들지 않는다.
  - OG 이미지는 `ogImage: { alt, tag? }`, 키워드는 `keywords`로 넘긴다. `tag`를 빼면 메뉴 라벨(`getOgTag`)을 쓴다.
  - `pathname`과 `canonicalUrl()`의 인자는 반드시 `/`로 시작한다. (`/lotto/check` O, `lotto/check` X)
  - 기존 로또 페이지 일부(check, history, analysis, simulator)는 metadata 객체를 직접 쓴다. og 제목·설명이 title과 달라서 옮기면 검색 노출 문구가 바뀐다. 그 페이지를 고칠 일이 생기면 사용자에게 묻고 바꾼다.
- 구조화 데이터: `src/components/seo/json-ld.component.tsx`와 `seo.ts`의 `jsonLdBreadcrumb`, `jsonLdFaq` 등을 쓴다.
- 사이트맵: `src/app/sitemap.ts`는 `src/constants/menu.constant.ts`의 `MENU_LIST`를 읽는다. 새 메뉴는 여기에 등록하고, 준비 중이면 `comingSoon: true`로 둔다.
- 콘텐츠: 검색에 노출될 핵심 내용(설명, 해석 등)은 서버 렌더링으로 HTML에 들어가야 한다. 클라이언트에서만 그리는 내용은 검색에 잡히지 않는다.
- URL: 소문자, 하이픈(`/tarot/daily`). 이미 노출된 URL을 바꾸면 `next.config.ts`에 301 redirect를 추가한다.
- 한 페이지에 `h1`은 하나만 쓴다. 이미지에는 `alt`를 넣는다.
- `layout.tsx`의 사이트 인증 메타 태그(`naver-site-verification` 등)는 지우거나 바꾸지 않는다.
