'use client';

import {
  type JSX,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  FORTUNE_CALC_BASIS_STAR_SIGN,
  FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE,
  FORTUNE_KST_LABEL,
} from '@/features/fortune/constants/fortune-notice.constant';
import {
  FORTUNE_STAR_SIGN_GUIDE_RANGES,
  FORTUNE_STAR_SIGNS,
} from '@/features/fortune/constants/fortune-star-sign.constant';
import { useKoreaDateKey } from '@/features/fortune/hooks/use-korea-date-key.hook';
import { FortuneStarSignFinderComponent } from '@/features/fortune/star-sign/components/finder.component';
import {
  FortuneStarSignListComponent,
  type FortuneStarSignSelectionType,
} from '@/features/fortune/star-sign/components/list.component';
import type { FortuneStarSignKeyType } from '@/features/fortune/types/fortune.type';
import { parseDateKey } from '@/features/fortune/utils/fortune-date.util';
import { cn } from '@/lib/utils';

// 패널 문구. ui-ux-design.md "문구 > 승인됨(2026-11-05)"의 패널 제목·칩 아래·빈 상태·결과 공지.
// 운세 상수 파일에는 아직 없어 이 파일에 둔다
const PANEL_TEXTS = {
  chipsTitle: '별자리 고르기',
  rangeNote: '날짜는 일반적인 기간이며 해마다 하루 정도 달라질 수 있습니다.',
  listTitle: '12별자리 오늘의 운세',
  emptyHint:
    '별자리를 고르면 그 별자리의 조언과 행운 요소까지 펼쳐 볼 수 있습니다.',
  /** {별자리}를 이름으로 바꿔 쓴다(sr 결과 공지) */
  expandedAnnouncementSuffix: ' 오늘의 운세를 펼쳤습니다.',
} as const;

const WEEKDAY_LABELS = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

const PANEL_CLASS =
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';
const H2_CLASS =
  'rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl';
const CHIP_CLASS =
  'flex min-h-14 scroll-mb-48 flex-col items-center justify-center gap-0.5 rounded-md border border-border bg-background px-2 text-sm font-medium break-keep text-foreground transition-none hover:border-menu-fortune/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none';
const CHIP_SELECTED_CLASS =
  'border-menu-fortune bg-menu-fortune/10 font-semibold hover:border-menu-fortune';

const STAR_SIGN_NAMES: Readonly<Record<FortuneStarSignKeyType, string>> =
  Object.fromEntries(
    FORTUNE_STAR_SIGNS.map((sign) => [sign.key, sign.name])
  ) as Record<FortuneStarSignKeyType, string>;

/** 기준 날짜 줄: {YYYY}년 {M}월 {D}일 {요일} (한국 시간 기준) */
function formatDateLine(dateKey: string): string {
  const ymd = parseDateKey(dateKey);
  if (!ymd) {
    return dateKey;
  }
  const weekday = new Date(
    Date.UTC(ymd.year, ymd.month - 1, ymd.day)
  ).getUTCDay();
  return `${ymd.year}년 ${ymd.month}월 ${ymd.day}일 ${WEEKDAY_LABELS[weekday]} (${FORTUNE_KST_LABEL})`;
}

export type FortuneStarSignPanelComponentPropsType = Readonly<{
  /** 동의 화면에서 막 동의한 경우에만 true. 첫 h2("별자리 고르기")로 포커스를 옮긴다 */
  shouldFocusTitle?: boolean;
}>;

/**
 * FortuneStarSignPanelComponent (별자리 운세 panel)
 * - 동의(granted) 뒤에만 root가 next/dynamic으로 불러온다. 문구 풀·달력 표는 이 panel 아래에서만 import한다.
 * - 별자리 칩 12개(생년월일 없이 쓴다, AC-21) + 내 별자리 찾기 + 12별자리 목록. 펼친 항목 상태는 칩·찾기가 함께 쓴다.
 * - 목록 안 펼친 항목의 상태를 이 panel이 가진다. 칩과 찾기 면이 같은 항목을 가리켜야 해서 list가 아닌 여기에 둔다.
 */
export function FortuneStarSignPanelComponent({
  shouldFocusTitle = false,
}: FortuneStarSignPanelComponentPropsType): JSX.Element {
  const chipsTitleId = useId();
  const listTitleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nonceRef = useRef(0);
  const dateKey = useKoreaDateKey();
  const [selection, setSelection] =
    useState<FortuneStarSignSelectionType | null>(null);

  useEffect(() => {
    if (shouldFocusTitle) {
      titleRef.current?.focus();
    }
  }, [shouldFocusTitle]);

  // 칩: 같은 칩을 다시 누르면 접힌다. 찾기·후보는 접지 않고 항상 그 항목을 펼친다
  const handleChipClick = useCallback((key: FortuneStarSignKeyType): void => {
    nonceRef.current += 1;
    const nonce = nonceRef.current;
    setSelection((current) => (current?.key === key ? null : { key, nonce }));
  }, []);

  const handleFound = useCallback((key: FortuneStarSignKeyType): void => {
    nonceRef.current += 1;
    setSelection({ key, nonce: nonceRef.current });
  }, []);

  return (
    <div className={cn(PANEL_CLASS, 'space-y-8')}>
      <div className="space-y-6 md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-8 md:space-y-0">
        <section className="space-y-3">
          <h2
            id={chipsTitleId}
            ref={titleRef}
            tabIndex={-1}
            className={H2_CLASS}
          >
            {PANEL_TEXTS.chipsTitle}
          </h2>
          <fieldset
            aria-labelledby={chipsTitleId}
            className="m-0 grid min-w-0 grid-cols-3 gap-2 border-0 p-0 sm:grid-cols-4"
          >
            {FORTUNE_STAR_SIGNS.map((sign) => {
              const isSelected = selection?.key === sign.key;
              return (
                <button
                  key={sign.key}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleChipClick(sign.key)}
                  className={cn(CHIP_CLASS, isSelected && CHIP_SELECTED_CLASS)}
                >
                  <span>{sign.name}</span>
                  <span className="text-xs font-normal whitespace-nowrap text-muted-foreground tabular-nums">
                    {FORTUNE_STAR_SIGN_GUIDE_RANGES[sign.key]}
                  </span>
                </button>
              );
            })}
          </fieldset>
          <p className="text-xs leading-5 break-keep text-muted-foreground">
            {PANEL_TEXTS.rangeNote}
          </p>
        </section>

        <FortuneStarSignFinderComponent
          todayKey={dateKey}
          onFound={handleFound}
        />
      </div>

      <section
        aria-labelledby={listTitleId}
        className="space-y-3 border-t border-border pt-8"
      >
        <h2 id={listTitleId} className={H2_CLASS}>
          {PANEL_TEXTS.listTitle}
        </h2>
        {dateKey ? (
          <p className="text-sm leading-6 font-medium text-foreground tabular-nums">
            {formatDateLine(dateKey)}
          </p>
        ) : null}
        <div className="max-w-[68ch] space-y-1">
          <p className="text-sm leading-6 break-keep text-muted-foreground">
            {FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE}
          </p>
          <p className="text-sm leading-6 break-keep text-muted-foreground">
            {FORTUNE_CALC_BASIS_STAR_SIGN}
          </p>
        </div>
        {selection ? null : (
          <p className="text-sm leading-6 break-keep text-muted-foreground">
            {PANEL_TEXTS.emptyHint}
          </p>
        )}
        {dateKey ? (
          <FortuneStarSignListComponent
            dateKey={dateKey}
            selection={selection}
          />
        ) : null}
      </section>

      {/* 결과 공지: 기능 영역의 live 영역은 이 하나다(입력 오류 줄은 폼이 따로 읽힌다) */}
      <div aria-live="polite" className="sr-only">
        {selection ? (
          <p key={selection.nonce}>
            {`${STAR_SIGN_NAMES[selection.key]}${PANEL_TEXTS.expandedAnnouncementSuffix}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
