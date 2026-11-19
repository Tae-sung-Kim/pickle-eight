'use client';

import { type JSX, useId, useRef, useState } from 'react';

import { CRISIS_TERMS } from '@/constants/crisis-term.constant';
import { DreamHubCategoryListComponent } from '@/features/dream/hub/components/category-list.component';
import { DreamHubCrisisNoticeComponent } from '@/features/dream/hub/components/crisis-notice.component';
import { DreamHubEmptyComponent } from '@/features/dream/hub/components/empty.component';
import { DreamHubResultStatusComponent } from '@/features/dream/hub/components/result-status.component';
import { DreamHubSearchInputComponent } from '@/features/dream/hub/components/search-input.component';
import type { DreamHubGroupType } from '@/features/dream/types/dream.type';
import {
  filterDreamSearchItems,
  normalizeDreamSearchText,
} from '@/features/dream/utils/dream-search.util';
import { hasCrisisSignal } from '@/lib/crisis-signal';

export type DreamHubComponentPropsType = Readonly<{
  groups: readonly DreamHubGroupType[];
}>;

/**
 * DreamHubComponent
 * - 허브의 유일한 클라이언트 경계. 상태는 검색어 하나뿐이다.
 * - 검색어는 서버·분석·URL·저장소·콘솔로 내보내지 않는다. 필터·개수·위기 감지는 렌더링 중 계산값이다.
 */
export function DreamHubComponent({
  groups,
}: DreamHubComponentPropsType): JSX.Element {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const inputId = `${baseId}-search`;
  const noticeId = `${baseId}-notice`;
  const otherTitleId = `${baseId}-crisis-other`;

  const hasQuery = normalizeDreamSearchText(query) !== '';
  const filtered = filterDreamSearchItems(groups, query);
  const count = filtered.reduce((sum, group) => sum + group.items.length, 0);
  const showCrisis = hasCrisisSignal(query, CRISIS_TERMS);

  const handleReset = (): void => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      <div>
        <DreamHubSearchInputComponent
          inputId={inputId}
          noticeId={noticeId}
          value={query}
          onChange={setQuery}
          inputRef={inputRef}
        />
        <DreamHubCrisisNoticeComponent
          visible={showCrisis}
          otherTitleId={otherTitleId}
        />
      </div>
      <DreamHubResultStatusComponent
        query={hasQuery ? query.trim() : ''}
        count={count}
      />
      <DreamHubCategoryListComponent groups={filtered} idPrefix={baseId} />
      {hasQuery && count === 0 ? (
        <DreamHubEmptyComponent onReset={handleReset} />
      ) : null}
    </div>
  );
}
