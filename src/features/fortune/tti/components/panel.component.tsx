import {
  type JSX,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import { useKoreaDateKey } from '@/features/fortune/hooks/use-korea-date-key.hook';
import { FortuneTtiFinderComponent } from '@/features/fortune/tti/components/finder.component';
import { FortuneTtiListComponent } from '@/features/fortune/tti/components/list.component';
import type { FortuneTtiKeyType } from '@/features/fortune/types/fortune.type';
import { cn } from '@/lib/utils';

// 화면 문구. ui-ux-design.md "문구"(패널 제목, 결과 공지(sr)).
// 운세 상수 파일에는 아직 없어 이 파일에 둔다
const TTI_PANEL_TEXTS = {
  chipTitle: '띠 고르기',
  announcementSuffix: '오늘의 운세를 펼쳤습니다.',
} as const;

const PANEL_CLASS =
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';
const TITLE_CLASS =
  'rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl';
const CHIP_CLASS =
  'min-h-11 scroll-mb-48 rounded-md border border-border bg-background px-2 text-sm font-medium break-keep text-foreground hover:border-menu-fortune/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none';
const CHIP_SELECTED_CLASS =
  'border-menu-fortune bg-menu-fortune/10 font-semibold hover:border-menu-fortune';

/**
 * 펼친 띠 기록. 메모리(state)에만 둔다(저장·URL 금지, AC-28, AC-30).
 * - key: 목록에서 펼친 띠. null이면 모두 접힘
 * - count: 펼친 횟수. 점수 눈금 모션·포커스·공지의 신호이며 0이면 아직 펼친 적 없음
 */
type ExpandedType = Readonly<{
  key: FortuneTtiKeyType | null;
  count: number;
}>;

const INITIAL_EXPANDED: ExpandedType = { key: null, count: 0 };

const TTI_NAME_BY_KEY = Object.fromEntries(
  FORTUNE_ZODIAC.map((zodiac) => [zodiac.key, zodiac.name])
) as Readonly<Record<FortuneTtiKeyType, string>>;

export type FortuneTtiPanelComponentPropsType = Readonly<{
  /** 동의 화면에서 막 동의한 경우에만 true. 첫 h2("띠 고르기")로 포커스를 옮긴다 */
  shouldFocusTitle?: boolean;
}>;

/**
 * 띠별 운세 panel. 동의(granted) 뒤에만 root가 next/dynamic으로 불러온다.
 * 문구 풀(list)과 달력 표(finder)는 이 panel 아래에서만 import한다(동의 전에 내려받지 않는다).
 * - 칩 12개 / 내 띠 찾기 / 12띠 목록. 어느 경로로 띠가 정해져도 같은 펼침 상태(expanded) 하나를 바꾼다.
 * - 오늘의 운세 링크는 여기에 두지 않는다(페이지의 서버 영역에 한 곳, D12).
 */
export function FortuneTtiPanelComponent({
  shouldFocusTitle = false,
}: FortuneTtiPanelComponentPropsType): JSX.Element {
  const todayKey = useKoreaDateKey();
  const [expanded, setExpanded] = useState<ExpandedType>(INITIAL_EXPANDED);
  const chipTitleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 동의 직후 한 번만 첫 h2로 포커스를 옮긴다(이미 동의한 탭의 첫 로드에서는 옮기지 않는다)
  useEffect(() => {
    if (shouldFocusTitle) {
      titleRef.current?.focus();
    }
  }, [shouldFocusTitle]);

  // 칩을 다시 누르면 접힌다. 접을 때는 포커스를 옮기지 않는다(count 유지)
  function handleChipClick(key: FortuneTtiKeyType): void {
    setExpanded((previous) =>
      previous.key === key
        ? { key: null, count: previous.count }
        : { key, count: previous.count + 1 }
    );
  }

  // 내 띠 찾기 결과는 칩 선택과 같은 상태로 펼친다(접지 않는다)
  const handleFound = useCallback((key: FortuneTtiKeyType): void => {
    setExpanded((previous) => ({ key, count: previous.count + 1 }));
  }, []);

  // 펼친 직후에만 공지한다. 접었을 때는 비운다
  const announcement = expanded.key
    ? `${TTI_NAME_BY_KEY[expanded.key]} ${TTI_PANEL_TEXTS.announcementSuffix}`
    : '';

  return (
    <div className={cn(PANEL_CLASS, 'space-y-8')}>
      {/* 결과 공지: 영역은 항상 두고 내용만 바꾼다. 입력값은 넣지 않는다 */}
      <div aria-live="polite" className="sr-only">
        {announcement ? <p key={expanded.count}>{announcement}</p> : null}
      </div>

      <div className="space-y-8 md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-8 md:space-y-0">
        <section aria-labelledby={chipTitleId} className="space-y-3">
          <h2
            id={chipTitleId}
            ref={titleRef}
            tabIndex={-1}
            className={TITLE_CLASS}
          >
            {TTI_PANEL_TEXTS.chipTitle}
          </h2>
          <fieldset
            aria-labelledby={chipTitleId}
            className="grid min-w-0 grid-cols-4 gap-2"
          >
            {FORTUNE_ZODIAC.map((zodiac) => {
              const isSelected = expanded.key === zodiac.key;
              return (
                <button
                  key={zodiac.key}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleChipClick(zodiac.key)}
                  className={cn(CHIP_CLASS, isSelected && CHIP_SELECTED_CLASS)}
                >
                  {zodiac.name}
                </button>
              );
            })}
          </fieldset>
        </section>

        <FortuneTtiFinderComponent todayKey={todayKey} onFound={handleFound} />
      </div>

      <div className="border-t border-border pt-8">
        <FortuneTtiListComponent
          todayKey={todayKey}
          selectedKey={expanded.key}
          focusSignal={expanded.key ? expanded.count : 0}
          animationKey={expanded.key ? expanded.count : null}
        />
      </div>
    </div>
  );
}
