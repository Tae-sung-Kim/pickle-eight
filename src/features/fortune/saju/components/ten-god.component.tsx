import { type JSX, useId } from 'react';
import {
  FORTUNE_SAJU_BRANCHES,
  FORTUNE_SAJU_STEMS,
  FORTUNE_SAJU_TEN_GODS,
} from '@/features/fortune/constants/fortune-saju.constant';
import {
  FORTUNE_SAJU_PANEL_TEXTS,
  FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS,
} from '@/features/fortune/constants/fortune-saju-notice.constant';
import type {
  FortunePillarType,
  FortuneTenGodKeyType,
} from '@/features/fortune/types/fortune-saju.type';
import { cn } from '@/lib/utils';

const ROW_CLASS =
  'flex items-center justify-between border-t border-border py-3 md:block md:rounded-md md:border md:p-3 md:text-center';
const LABEL_CLASS = 'text-xs text-muted-foreground md:mb-1';

type ValuePropsType = Readonly<{ ko: string; hanja: string }>;

function Value({ ko, hanja }: ValuePropsType): JSX.Element {
  return (
    <dd className="leading-none">
      <span className="text-2xl font-bold text-foreground">{ko}</span>{' '}
      <span
        aria-hidden="true"
        className="text-lg font-normal text-muted-foreground"
      >
        {hanja}
      </span>
    </dd>
  );
}

export type FortuneSajuTenGodComponentPropsType = Readonly<{
  /** 오늘 일진(한국 시간 날짜의 일주) */
  todayPillar: FortunePillarType;
  /** 내 일간(천간 인덱스 0~9) */
  dayStem: number;
  tenGod: FortuneTenGodKeyType;
}>;

/**
 * 오늘 일진·내 일간·십신 비교 + 십신 한 줄 설명.
 * 모바일은 기록표 행 3줄, md 이상은 같은 모양의 3칸. 지지 음양·지지 십신은 표시하지 않는다(AC-55).
 */
export function FortuneSajuTenGodComponent({
  todayPillar,
  dayStem,
  tenGod,
}: FortuneSajuTenGodComponentPropsType): JSX.Element {
  const titleId = useId();
  const todayStem = FORTUNE_SAJU_STEMS[todayPillar.stem];
  const todayBranch = FORTUNE_SAJU_BRANCHES[todayPillar.branch];
  const myStem = FORTUNE_SAJU_STEMS[dayStem];
  const tenGodInfo = FORTUNE_SAJU_TEN_GODS[tenGod];

  return (
    <section aria-labelledby={titleId} className="space-y-3">
      <h3
        id={titleId}
        className="text-lg leading-snug font-semibold break-keep text-foreground"
      >
        {`${FORTUNE_SAJU_PANEL_TEXTS.todayPillarLabel}과 ${FORTUNE_SAJU_PANEL_TEXTS.myDayStemLabel}`}
      </h3>
      <dl className="md:grid md:grid-cols-3 md:gap-3">
        <div className={ROW_CLASS}>
          <dt className={LABEL_CLASS}>
            {FORTUNE_SAJU_PANEL_TEXTS.todayPillarLabel}
          </dt>
          <Value
            ko={`${todayStem.ko}${todayBranch.ko}`}
            hanja={`${todayStem.hanja}${todayBranch.hanja}`}
          />
        </div>
        <div className={cn(ROW_CLASS, 'md:border-2 md:border-menu-fortune')}>
          <dt className={LABEL_CLASS}>
            {FORTUNE_SAJU_PANEL_TEXTS.myDayStemLabel}
          </dt>
          <Value ko={myStem.ko} hanja={myStem.hanja} />
        </div>
        <div className={ROW_CLASS}>
          <dt className={LABEL_CLASS}>
            {FORTUNE_SAJU_PANEL_TEXTS.tenGodLabel}
          </dt>
          <Value ko={tenGodInfo.name} hanja={tenGodInfo.hanja} />
        </div>
      </dl>
      <p className="max-w-[68ch] text-base leading-7 text-foreground">
        {FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS[tenGod]}
      </p>
    </section>
  );
}
