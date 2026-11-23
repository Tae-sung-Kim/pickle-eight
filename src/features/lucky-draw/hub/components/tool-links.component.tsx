import Link from 'next/link';
import type { JSX } from 'react';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import { MENU_ICONS } from '@/constants/menu-icon.constant';
import {
  LUCKY_DRAW_LADDER_RULE,
  LUCKY_DRAW_LOTS_RULE,
  LUCKY_DRAW_ROULETTE_RULE,
} from '../../constants/lucky-draw-limit.constant';
import { LUCKY_DRAW_HUB_ROLE_COMPARE } from '../../constants/lucky-draw-notice.constant';
import {
  LUCKY_DRAW_TOOL_LABELS,
  LUCKY_DRAW_TOOL_PATHS,
} from '../../constants/lucky-draw-route.constant';
import type { LuckyDrawToolKeyType } from '../../types/lucky-draw.type';

const TOOL_KEYS: readonly LuckyDrawToolKeyType[] = [
  'ladder',
  'roulette',
  'lots',
];

const LIMIT_TEXT: Readonly<Record<LuckyDrawToolKeyType, string>> = {
  ladder: `${LUCKY_DRAW_LADDER_RULE.minCount}~${LUCKY_DRAW_LADDER_RULE.maxCount}명`,
  roulette: `항목 ${LUCKY_DRAW_ROULETTE_RULE.minCount}~${LUCKY_DRAW_ROULETTE_RULE.maxCount}개`,
  lots: `항목 ${LUCKY_DRAW_LOTS_RULE.minCount}~${LUCKY_DRAW_LOTS_RULE.maxCount}개`,
};

const HUB_TITLE = '도구 고르기';

const LUCKY_GROUP = MENU_LIST.find(
  (group) => group.group === MENU_GROUP_NAME_ENUM.LUCKY_DRAW
);

/**
 * LuckyDrawToolLinksComponent
 * - 허브 도구 링크 행 세 개. 설명과 예시는 MENU_LIST 항목에서 가져온다. 서버 컴포넌트.
 */
export function LuckyDrawToolLinksComponent(): JSX.Element {
  return (
    <section aria-labelledby="lucky-draw-tools-title" className="space-y-4">
      <h2
        id="lucky-draw-tools-title"
        className="break-keep text-xl font-semibold leading-8 sm:text-2xl"
      >
        {HUB_TITLE}
      </h2>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {TOOL_KEYS.map((key) => {
          const href = LUCKY_DRAW_TOOL_PATHS[key];
          const item = LUCKY_GROUP?.items.find((it) => it.href === href);
          const Icon = item ? MENU_ICONS[item.icon] : undefined;
          return (
            <li key={key}>
              <Link
                href={href}
                className="flex h-full gap-4 rounded-panel border border-border bg-card p-4 transition-colors duration-150 hover:border-menu-lucky/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none md:flex-col"
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-menu-lucky/10 text-menu-lucky"
                >
                  {Icon ? <Icon className="size-6" /> : null}
                </span>
                <span className="min-w-0 space-y-1">
                  <h3 className="break-keep text-lg font-semibold leading-7 text-foreground">
                    {LUCKY_DRAW_TOOL_LABELS[key]}
                  </h3>
                  {item ? (
                    <>
                      <span className="block text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </span>
                      {item.example ? (
                        <span className="block text-sm leading-6 text-muted-foreground">
                          {item.example}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                  <span className="block font-mono text-sm leading-6 text-foreground">
                    {LIMIT_TEXT[key]}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="text-sm leading-6 text-foreground">
        {LUCKY_DRAW_HUB_ROLE_COMPARE}
      </p>
    </section>
  );
}
