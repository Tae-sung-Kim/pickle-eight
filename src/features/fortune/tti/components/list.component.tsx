import { type JSX, useEffect, useId, useMemo, useRef } from 'react';
import {
  FORTUNE_CALC_BASIS_TTI,
  FORTUNE_DIFFERENT_BASIS_NOTICE,
  FORTUNE_KST_LABEL,
  FORTUNE_METHOD_A_TTI_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import { FORTUNE_COMMON_POOL } from '@/features/fortune/constants/pools/common.constant';
import { FORTUNE_TTI_POOLS } from '@/features/fortune/constants/pools/tti-pools.constant';
import { FortuneLuckyComponent } from '@/features/fortune/shared/components/lucky.component';
import {
  FortuneReadingComponent,
  FortuneScoreScaleComponent,
} from '@/features/fortune/shared/components/reading.component';
import type {
  FortuneReadingType,
  FortuneTtiKeyType,
} from '@/features/fortune/types/fortune.type';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import { buildFortuneReading } from '@/features/fortune/utils/fortune-reading.util';

// 화면 문구. ui-ux-design.md "문구"(패널 제목, 목록 빈 상태, 기준 날짜, 항목 이름).
// 운세 상수 파일에는 아직 없어 이 파일에 둔다
const TTI_LIST_TEXTS = {
  title: '12띠 오늘의 운세',
  emptyNotice: '띠를 고르면 그 띠의 조언과 행운 요소까지 펼쳐 볼 수 있습니다.',
  selectedSuffix: '(선택한 띠)',
  scoreUnit: '점',
} as const;

/** 접힌 항목에 보이는 항목 이름. 기록표(reading.component)와 같은 이름·순서다 */
const COLLAPSED_ITEMS = [
  { key: 'money', label: '재물' },
  { key: 'love', label: '애정' },
  { key: 'work', label: '직장·학업' },
  { key: 'health', label: '건강' },
] as const;

const WEEKDAY_LABELS = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

/** 시드 문자열 틀(design.md 4.6 확정): fortune-v1|tti|{띠 키}|{KST 오늘}. 바꾸면 모든 결과가 바뀐다 */
const TTI_SEED_PREFIX = 'fortune-v1|tti';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** '2026-11-05' → '2026년 11월 5일 목요일 (한국 시간 기준)' */
function formatBaseDate(dateKey: string): string {
  const ymd = parseDateKey(dateKey);
  if (!ymd) {
    return dateKey;
  }
  const weekday = new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day)
  ).getUTCDay();
  return `${ymd.year}년 ${ymd.month}월 ${ymd.day}일 ${WEEKDAY_LABELS[weekday]} (${FORTUNE_KST_LABEL})`;
}

/** 펼친 항목 제목이 화면에 절반 이상 보이지 않을 때만 그 항목 위치로 스크롤한다. 동작 줄이기면 즉시 이동한다 */
function scrollItemIntoViewIfNeeded(
  item: HTMLElement | null,
  title: HTMLElement | null
): void {
  if (!item || !title) {
    return;
  }
  const rect = title.getBoundingClientRect();
  const visibleHeight =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  if (visibleHeight >= rect.height / 2) {
    return;
  }
  const isReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  item.scrollIntoView({
    block: 'start',
    behavior: isReduced ? 'auto' : 'smooth',
  });
}

export type FortuneTtiListComponentPropsType = Readonly<{
  /** KST 오늘 'YYYY-MM-DD'(useKoreaDateKey). 마운트 전 null이면 항목을 그리지 않는다 */
  todayKey: string | null;
  /** 펼친 띠. null이면 12개 모두 접힘 */
  selectedKey: FortuneTtiKeyType | null;
  /** 펼칠 때마다 올라가는 신호(0이면 아직 펼친 적 없음). 바뀌면 펼친 항목 제목으로 포커스를 옮긴다 */
  focusSignal: number;
  /** M1 모션 재생 신호. 펼친 항목의 점수 눈금에만 쓴다. null이면 움직임 없음 */
  animationKey: number | null;
}>;

/**
 * 12띠 오늘의 운세 목록.
 * - 12개 항목이 처음부터 모두 보인다(AC-12). 같은 날 같은 띠는 모든 사용자에게 같은 결과다(AC-18).
 * - 항목 머리는 버튼이 아니라 제목이다. 펼침은 칩·찾기·후보 선택으로만 한다(부모가 selectedKey를 정한다).
 * - 펼친 항목은 기록표 + 조언·주의 + 방식 A 안내(띠 변형) + 행운 요소·로또 고지·링크. 로또 영역은 여기에만 있어 한 화면에 한 번이다.
 * - 결과는 렌더링 중 계산한다(상태 아님). 오늘 날짜의 절기를 쓰지 않아 2029년 이후에도 정상이다(AC-84).
 */
export function FortuneTtiListComponent({
  todayKey,
  selectedKey,
  focusSignal,
  animationKey,
}: FortuneTtiListComponentPropsType): JSX.Element {
  const titleId = useId();
  const expandedItemRef = useRef<HTMLLIElement>(null);
  const expandedTitleRef = useRef<HTMLHeadingElement>(null);

  const readings = useMemo(() => {
    if (!todayKey) {
      return null;
    }
    return FORTUNE_ZODIAC.map((zodiac) => ({
      key: zodiac.key,
      name: zodiac.name,
      reading: buildFortuneReading({
        seedText: `${TTI_SEED_PREFIX}|${zodiac.key}|${todayKey}`,
        dateKey: todayKey,
        pool: FORTUNE_TTI_POOLS[zodiac.key],
        common: FORTUNE_COMMON_POOL,
      }),
    }));
  }, [todayKey]);

  // 사용자가 띠를 펼친 직후에만 펼친 항목 제목으로 포커스를 옮긴다(첫 렌더링·날짜 갱신에는 옮기지 않는다)
  useEffect(() => {
    if (focusSignal === 0) {
      return;
    }
    scrollItemIntoViewIfNeeded(
      expandedItemRef.current,
      expandedTitleRef.current
    );
    expandedTitleRef.current?.focus({ preventScroll: true });
  }, [focusSignal]);

  function renderCollapsed(
    name: string,
    reading: FortuneReadingType
  ): JSX.Element {
    return (
      <div className="md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-base leading-snug font-semibold break-keep text-foreground sm:text-lg">
              {name}
            </h3>
            <p className="text-menu-fortune tabular-nums">
              <span className="text-2xl leading-none font-semibold">
                {reading.total.score}
              </span>
              <span className="text-sm">{TTI_LIST_TEXTS.scoreUnit}</span>
            </p>
          </div>
          <FortuneScoreScaleComponent
            score={reading.total.score}
            variant="compact"
          />
        </div>
        <div className="mt-3 space-y-3 md:mt-0">
          <p className="max-w-[68ch] text-base leading-7 break-keep text-foreground">
            {reading.summary}
          </p>
          <ul className="space-y-2">
            {COLLAPSED_ITEMS.map((item) => (
              <li
                key={item.key}
                className="grid max-w-[68ch] grid-cols-[7rem_minmax(0,1fr)] gap-x-3 text-sm leading-6 text-foreground"
              >
                <span className="font-medium break-keep">
                  {item.label}{' '}
                  <span className="tabular-nums">
                    {reading[item.key].score}
                    {TTI_LIST_TEXTS.scoreUnit}
                  </span>
                </span>
                <span className="break-keep">{reading[item.key].text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby={titleId} className="space-y-3">
      <h2
        id={titleId}
        className="rounded-sm text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl"
      >
        {TTI_LIST_TEXTS.title}
      </h2>
      {todayKey ? (
        <p className="text-sm leading-6 font-medium text-foreground tabular-nums">
          {formatBaseDate(todayKey)}
        </p>
      ) : null}
      <div className="max-w-[68ch] space-y-1 text-sm leading-6 break-keep text-muted-foreground">
        <p>{FORTUNE_DIFFERENT_BASIS_NOTICE}</p>
        <p>{FORTUNE_CALC_BASIS_TTI}</p>
      </div>
      {selectedKey === null ? (
        <p className="text-sm leading-6 break-keep text-muted-foreground">
          {TTI_LIST_TEXTS.emptyNotice}
        </p>
      ) : null}

      {readings ? (
        <ul>
          {readings.map((item) => {
            const isExpanded = item.key === selectedKey;
            if (isExpanded) {
              return (
                <li
                  key={item.key}
                  ref={expandedItemRef}
                  className="scroll-mt-20 space-y-4 border-t border-t-border border-l-2 border-l-menu-fortune py-5 pl-4"
                >
                  <FortuneReadingComponent
                    reading={item.reading}
                    methodNotice={FORTUNE_METHOD_A_TTI_NOTICE}
                    title={item.name}
                    titleSrSuffix={TTI_LIST_TEXTS.selectedSuffix}
                    headingLevel="h3"
                    titleRef={expandedTitleRef}
                    animationKey={animationKey}
                  />
                  <FortuneLuckyComponent lucky={item.reading.lucky} />
                </li>
              );
            }
            return (
              <li key={item.key} className="border-t border-border py-5">
                {renderCollapsed(item.name, item.reading)}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
