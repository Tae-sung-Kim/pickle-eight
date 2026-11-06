import type { JSX } from 'react';

import { MenuListComponent } from '@/components/common/menu-list.component';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import { FORTUNE_HUB_GUIDE } from '@/features/fortune/constants/fortune-guide.constant';

// 허브 전용 라벨. ui-ux-design.md "운세 허브" 승인 문구
const FORTUNE_HUB_LIST_TITLE = '운세 고르기';
const FORTUNE_HUB_EMPTY_TEXT =
  '지금 볼 수 있는 운세가 없습니다. 메뉴에서 다른 기능을 이용해 주시기 바랍니다.';
const LIST_HEADING_ID = 'fortune-hub-list-heading';

/** 허브 목록의 원본. 운세 그룹 items를 그대로 쓴다(없으면 빈 배열) */
export const getFortuneHubItems = () =>
  MENU_LIST.find((g) => g.group === MENU_GROUP_NAME_ENUM.FORTUNE)?.items ?? [];

/**
 * FortuneHubComponent
 * - 운세 허브 본문(서버 컴포넌트): 운세 고르기 목록 + 허브 설명(세 가지 운세의 차이).
 * - 동의 게이트, 입력칸, 문구 풀을 쓰지 않는다. 동의 상태를 만들거나 지우지 않는다(AC-83).
 */
export function FortuneHubComponent(): JSX.Element {
  const items = getFortuneHubItems();

  return (
    <div className="space-y-10">
      <section aria-labelledby={LIST_HEADING_ID} className="space-y-3">
        <h2
          id={LIST_HEADING_ID}
          className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl"
        >
          {FORTUNE_HUB_LIST_TITLE}
        </h2>
        {items.length > 0 ? (
          <MenuListComponent items={items} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {FORTUNE_HUB_EMPTY_TEXT}
          </p>
        )}
      </section>

      <section className="space-y-6">
        {FORTUNE_HUB_GUIDE.map((section) => (
          <div key={section.heading} className="space-y-2">
            <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-[68ch] text-sm leading-7 text-foreground sm:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
