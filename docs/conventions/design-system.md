# 디자인 시스템

화면을 디자인하거나 구현할 때 따른다. 값의 원본은 `src/app/globals.css`이고, 이 문서는 쓰는 규칙을 정리한다.

## 컨셉: 피클 병 속 연구실

종이(브라인) 위에 딜 그린 잉크로 쓴 연구 노트. 사이트 이름(운빨연구소)처럼 "운을 차분하게 관찰하는 연구실" 톤이다. 화려한 카지노·점술집 분위기를 내지 않는다.

- 모든 메뉴가 같은 종이 배경, 글자색, 폰트, 반경을 쓴다. 메뉴마다 다른 사이트처럼 보이면 안 된다.
- 메뉴의 개성은 **라벨 색 하나**와 **일러스트·인터랙션 한 곳**으로만 준다.

## 색

| 역할 | 토큰 (Tailwind 클래스) | 값 |
|---|---|---|
| 배경 / 카드 / 팝오버 | `background`, `card`, `popover` | 종이색 `#eef0e6` 계열 |
| 글자 / 보조 글자 | `foreground`, `muted-foreground` | 짙은 녹색 `#1b3328` / `#5a6a5f` |
| 브랜드 | `primary` | 딜 그린 `#2d6a3e` |
| 상태 | `success`, `warning`, `info`, `destructive` | |
| 강조 패널 | `jar`, `jar-foreground`, `jar-muted` | 병 속 심록 `#173a2b` |
| 로또 공 / 차트 | `ball-1`~`ball-5`, `ball-bonus`, `chart-1`~`chart-5` | 로또 전용 |

### 메뉴 라벨 색

피클 병마다 라벨 색이 다르다는 생각으로 메뉴마다 하나씩 정했다. 모두 종이 배경 위에서 글자색으로 써도 명도 대비 4.5:1 이상(WCAG AA)이다.

| 메뉴 | 토큰 | 값 | 이름 |
|---|---|---|---|
| 로또 | `menu-lotto` | `var(--primary)` | 딜 |
| 타로 | `menu-tarot` | `#7a3358` | 비트 |
| 운세 | `menu-fortune` | `#8a6110` | 강황 |
| 점심 | `menu-lunch` | `#a5481f` | 당근 |
| 어디 가 | `menu-where` | `#2a6672` | 염수 |

- 쓰는 곳: 메뉴 아이콘, 배지, 그 메뉴 화면의 강조 요소(선택 상태, 주요 버튼 한두 개, 제목 장식).
- 배경 전체나 큰 면적에는 쓰지 않는다. 면은 `bg-menu-<key>/10`처럼 옅게 쓴다.
- 기본 버튼, 링크, 포커스 링은 메뉴와 상관없이 `primary`를 쓴다.
- 새 메뉴를 추가하면 `globals.css`에 `--menu-<key>`를 추가하고, 위 표와 `src/constants/theme.constant.ts`를 같이 갱신한다. 새 색은 종이 배경 대비 4.5:1 이상이어야 한다.

### 금지 (design-guard.js가 검사)

- Tailwind 기본 팔레트(`violet-600`, `sky-500` 등)와 hex 값을 컴포넌트에 직접 쓰지 않는다. 토큰만 쓴다.
- 새 토큰이 꼭 필요하면 ui-ux-design.md에 이유를 적고 사용자 승인을 받는다.

## 타이포그래피

- 폰트: Pretendard Variable 하나 (`layout.tsx`에서 CDN으로 불러온다). 숫자·코드는 `font-mono`(Fira Mono).
- 다른 웹폰트를 추가하지 않는다. 필요하면 라이선스(상업적 이용)를 확인하고 승인을 받는다.

## 반경·간격

- 반경은 계층마다 다르다: 작은 컨트롤 `rounded-md`(6px), 버튼·입력 `rounded-lg`(8px), 패널·카드 `rounded-panel`(14px), 공·아바타 `rounded-full`. 모든 요소에 같은 반경을 쓰지 않는다.
- 페이지 폭은 레이아웃의 `max-w-7xl`을 따른다. 페이지 상단은 `PageHeaderComponent`/`TitleWrapperComponent`, 본문은 `ContentWrapperComponent`를 쓴다.

## 모션

모션은 써도 된다. 다만 **과하게 쓰지 않는다.** 개수 제한은 없고, 아래 표와 판단 기준으로 정한다.

| 상황 | 도구 | 예 |
|---|---|---|
| 오버레이 열기·닫기 | `tw-animate-css` (`animate-in`, `fade-in-0`, `slide-in-from-*`) | 다이얼로그, 시트, 셀렉트, 툴팁, 모바일 메뉴. shadcn 컴포넌트에 이미 들어 있으니 새로 붙일 일은 거의 없다 |
| 로딩 표시 | Tailwind `animate-spin`, `animate-pulse` | 스피너, 스켈레톤 |
| 기능의 핵심 연출 | `framer-motion` | 타로 카드 뒤집기, 로또 공이 차례로 공개, 결과 공개 |
| 목록 재배치·드래그 | `framer-motion` (`layout`, `drag`) | 순서 바꾸기, 항목 추가·삭제 |
| 로또 공 떨어지기 | `globals.css`의 `ball-drop` | 기존 로또 화면 |

과하다고 보는 경우 (보통 빼는 게 낫다):
- 페이지·섹션·카드마다 들어올 때 붙는 등장 효과(fade-up 등)
- 모든 카드에 일괄로 붙인 hover 확대·그림자 변화
- 사용자 행동과 상관없이 계속 움직이는 장식(로딩 표시 제외)
- 연출 때문에 결과를 보기까지 기다려야 하는 경우

판단 기준:
- 이 움직임이 무엇이 바뀌었는지, 어디를 봐야 하는지 알려 주는가? 그렇다면 넣는다.
- 꾸밈만 하는 움직임이면 뺀다. 여러 연출이 한 화면에서 서로 경쟁하면 줄인다.
- ui-ux-design.md에 넣는 모션마다 이유를 한 줄로 적는다.
- **판단이 애매하면 넣지도 빼지도 말고 사용자에게 묻는다.** ui-ux-designer는 "넣는 안 / 빼는 안"과 각각의 장단점을 적어 PM에게 올리고, PM이 사용자에게 결정을 요청한다. 구현 중에 생긴 애매한 경우도 frontend-dev가 PM에게 올린다.
- 길이: 사용자 행동에 대한 반응은 150~300ms, 공개 연출은 1초 이내.
- 접근성: framer-motion은 `src/providers/motion.provider.tsx`(`MotionConfig reducedMotion="user"`)가 자동으로 줄인다. CSS 애니메이션을 쓰는 파일에는 `motion-reduce:animate-none` 같은 처리를 직접 넣는다.

하네스: `.claude/hooks/design-guard.js`가 tsx 수정 직후 검사한다. 모션 개수는 검사하지 않는다. CSS 애니메이션에 `motion-reduce:` 처리가 없을 때만 알린다. (`src/components/ui/`는 제외)

## 다크 모드

- **지금은 쓰지 않는다.** `globals.css`의 `.dark` 블록은 나중을 위해 남겨 둔 것이다. 켜는 코드(토글, 시스템 설정 연동)는 없다.
- 토스트(`src/components/ui/sonner.tsx`)도 `theme="light"`로 고정했다.
- 새 토큰을 추가할 때 `.dark` 값은 넣지 않아도 된다. 다크 모드를 도입할 때 한꺼번에 정한다.
- `dark:` 클래스를 새로 쓰지 않는다. (design-guard.js가 검사)
