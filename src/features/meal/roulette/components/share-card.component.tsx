import type { JSX } from 'react';

import type { MealShareInputType } from '@/features/meal/utils/meal-share.util';

type MenuTextStyleType = Readonly<{ size: number; lines: 1 | 2 | 3 }>;

/** 글자 수(코드 포인트) 기준 크기 단계표. 안쪽 원 안 폭 260 */
function getMenuTextStyle(menuName: string): MenuTextStyleType {
  const length = Array.from(menuName).length;
  if (length <= 3) return { size: 72, lines: 1 };
  if (length === 4) return { size: 60, lines: 1 };
  if (length === 5) return { size: 48, lines: 1 };
  if (length <= 8) return { size: 40, lines: 2 };
  if (length <= 12) return { size: 34, lines: 2 };
  return { size: 30, lines: 3 };
}

const CLAMP_CLASS: Record<MenuTextStyleType['lines'], string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
};

/**
 * MealRouletteShareCardComponent
 * - 공유 카드 본문(440×410). 끼니 알약과 이중 링 안의 메뉴 이름만 그린다.
 * - 버튼, 링크, 이미지, 모션 없음. 카드 공통 틀은 부모가 감싼다.
 */
export function MealRouletteShareCardComponent({
  mealLabel,
  menuName,
}: MealShareInputType): JSX.Element {
  const { size, lines } = getMenuTextStyle(menuName);

  return (
    <div className="flex flex-col items-center gap-6">
      <span className="inline-flex h-8 items-center rounded-full border border-share-card-accent-meal px-4 text-lg leading-none font-semibold text-share-card-accent-meal">
        {mealLabel}
      </span>
      <div className="flex size-[336px] items-center justify-center rounded-full border border-share-card-accent-meal">
        <div className="flex size-[296px] items-center justify-center rounded-full bg-share-card-accent-meal/10 px-5">
          <p
            className={`w-[260px] text-center font-bold text-share-card-fg ${CLAMP_CLASS[lines]}`}
            style={{ fontSize: size, lineHeight: 1.15 }}
          >
            {menuName}
          </p>
        </div>
      </div>
    </div>
  );
}
