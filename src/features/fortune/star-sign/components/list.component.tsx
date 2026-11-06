'use client';

import { type JSX, useEffect, useMemo, useRef } from 'react';
import { FORTUNE_METHOD_A_STAR_SIGN_NOTICE } from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import { FORTUNE_COMMON_POOL } from '@/features/fortune/constants/pools/common.constant';
import { FORTUNE_STAR_SIGN_POOLS } from '@/features/fortune/constants/pools/star-sign-pools.constant';
import { FortuneLuckyComponent } from '@/features/fortune/shared/components/lucky.component';
import {
  FortuneReadingComponent,
  FortuneScoreScaleComponent,
} from '@/features/fortune/shared/components/reading.component';
import type {
  FortuneReadingType,
  FortuneStarSignKeyType,
} from '@/features/fortune/types/fortune.type';
import { buildFortuneReading } from '@/features/fortune/utils/fortune-reading.util';

// 목록 문구. ui-ux-design.md "접근성 > 라벨·읽기", "결과 항목 이름". 운세 상수 파일에는 아직 없어 이 파일에 둔다
const LIST_TEXTS = {
  selectedSuffix: '(선택한 별자리)',
  scoreUnit: '점',
} as const;

const ITEM_LABELS = [
  { key: 'money', label: '재물' },
  { key: 'love', label: '애정' },
  { key: 'work', label: '직장·학업' },
  { key: 'health', label: '건강' },
] as const;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** 시드 문자열은 design.md 4.6 확정값이다. 바꾸면 모든 결과가 바뀐다 */
function buildStarSignSeed(key: FortuneStarSignKeyType, dateKey: string) {
  return `fortune-v1|star-sign|${key}|${dateKey}`;
}

/** 펼침 요청. 같은 별자리를 다시 찾아도 nonce가 달라져 포커스·스크롤·M1 모션이 다시 일어난다 */
export type FortuneStarSignSelectionType = Readonly<{
  key: FortuneStarSignKeyType;
  nonce: number;
}>;

export type FortuneStarSignListComponentPropsType = Readonly<{
  /** KST 오늘 'YYYY-MM-DD'. 모든 사용자에게 같은 결과가 나온다(AC-18) */
  dateKey: string;
  /** 펼친 항목. null이면 12개 모두 접힘 */
  selection: FortuneStarSignSelectionType | null;
}>;

/** 펼친 항목 제목이 화면에 절반 이상 보이지 않을 때만 항목 위로 스크롤한다. 동작 줄이기이면 즉시 이동 */
function scrollItemIntoViewIfNeeded(title: HTMLElement): void {
  const rect = title.getBoundingClientRect();
  const visibleHeight =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  if (visibleHeight >= rect.height / 2) {
    return;
  }
  const isReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  (title.closest('li') ?? title).scrollIntoView({
    block: 'start',
    behavior: isReduced ? 'auto' : 'smooth',
  });
}

type CollapsedItemPropsType = Readonly<{
  name: string;
  reading: FortuneReadingType;
}>;

/** 접힌 항목: 이름 + 총운 점수 + 작은 눈금 + 한 줄 요약 + 항목 4개. 항목 머리는 버튼이 아니다 */
function CollapsedItem({ name, reading }: CollapsedItemPropsType): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg leading-snug font-semibold break-keep text-foreground">
          {name}
        </h3>
        <p className="text-menu-fortune tabular-nums">
          <span className="text-2xl leading-none font-semibold">
            {reading.total.score}
          </span>
          <span className="text-sm">{LIST_TEXTS.scoreUnit}</span>
        </p>
      </div>
      <FortuneScoreScaleComponent
        score={reading.total.score}
        variant="compact"
      />
      <p className="max-w-[68ch] text-base leading-7 break-keep text-foreground">
        {reading.summary}
      </p>
      <dl className="space-y-2 text-sm leading-6">
        {ITEM_LABELS.map((item) => (
          <div
            key={item.key}
            className="md:grid md:grid-cols-[9rem_minmax(0,1fr)] md:gap-x-4"
          >
            <dt className="flex items-baseline gap-2 font-medium text-foreground">
              <span>{item.label}</span>
              <span className="text-menu-fortune tabular-nums">
                {reading[item.key].score}
                {LIST_TEXTS.scoreUnit}
              </span>
            </dt>
            <dd className="max-w-[68ch] break-keep text-foreground">
              {reading[item.key].text}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * FortuneStarSignListComponent
 * - 12별자리 오늘의 운세. 12개 항목이 처음부터 모두 접힌 채 보인다(AC-20).
 * - 펼침은 칩·찾기·후보로만 한다(부모가 selection을 내려 준다). 항목 머리는 버튼이 아니라 제목이다.
 * - 펼친 항목은 오늘의 운세 결과와 같은 기록표 + 행운 요소·로또 고지·링크. 로또 영역은 펼친 항목 안에만 있어 한 화면에 한 번이다.
 * - 절기 함수를 import하지 않는다. 키와 오늘 날짜만으로 계산하므로 2029년 이후에도 그대로 동작한다(AC-84).
 */
export function FortuneStarSignListComponent({
  dateKey,
  selection,
}: FortuneStarSignListComponentPropsType): JSX.Element {
  const selectedTitleRef = useRef<HTMLHeadingElement>(null);

  // 12개 모두 같은 날짜 키에서 렌더링 중 계산한다(상태 아님)
  const readings = useMemo(
    () =>
      FORTUNE_STAR_SIGNS.map((sign) => ({
        sign,
        reading: buildFortuneReading({
          seedText: buildStarSignSeed(sign.key, dateKey),
          dateKey,
          pool: FORTUNE_STAR_SIGN_POOLS[sign.key],
          common: FORTUNE_COMMON_POOL,
        }),
      })),
    [dateKey]
  );

  // 펼침 요청이 올 때마다 펼친 항목 h3로 포커스를 옮기고, 화면 밖이면 스크롤한다
  useEffect(() => {
    const title = selectedTitleRef.current;
    if (!selection || !title) {
      return;
    }
    title.focus({ preventScroll: true });
    scrollItemIntoViewIfNeeded(title);
  }, [selection]);

  return (
    <ul className="border-b border-border">
      {readings.map(({ sign, reading }) => {
        const isSelected = selection?.key === sign.key;
        return (
          <li
            key={sign.key}
            className={
              isSelected
                ? 'scroll-mt-20 border-t border-border border-l-2 border-l-menu-fortune py-5 pl-4'
                : 'border-t border-border py-5'
            }
          >
            {isSelected ? (
              <div className="space-y-4">
                <FortuneReadingComponent
                  reading={reading}
                  methodNotice={FORTUNE_METHOD_A_STAR_SIGN_NOTICE}
                  title={sign.name}
                  titleSrSuffix={LIST_TEXTS.selectedSuffix}
                  headingLevel="h3"
                  titleRef={selectedTitleRef}
                  animationKey={selection.nonce}
                />
                <FortuneLuckyComponent lucky={reading.lucky} />
              </div>
            ) : (
              <CollapsedItem name={sign.name} reading={reading} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
