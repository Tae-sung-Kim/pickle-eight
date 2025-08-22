'use client';

import React, { useEffect, useState } from 'react';
import { useLatestLottoDrawQuery, useLottoDrawsQuery } from '@/queries';
import LottoHistorySearchComponent from './lotto-history-search.component';
import LottoHistoryResultComponent from './lotto-history-result.component';

export function LottoHistoryComponent() {
  const { data: latestDraw } = useLatestLottoDrawQuery();

  const [searchData, setSearchData] = useState({
    from: 0,
    to: 0,
    enabled: false,
  });

  const handleSearch = (searchData: {
    from: number;
    to: number;
    enabled: boolean;
  }) => {
    setSearchData(searchData);
  };

  const { data, isError, error } = useLottoDrawsQuery(searchData);

  useEffect(() => {
    const latest = latestDraw?.lastDrawNumber;
    if (!latest || latest <= 0) return;
    const next = {
      from: Math.max(1, latest - 11 + 1), // 최근 12주 예시 -> 필요시 조정 가능; 현재는 10개면 latest-9
      to: latest,
      enabled: true,
    };
    setSearchData((prev) => {
      if (
        prev.from === next.from &&
        prev.to === next.to &&
        prev.enabled === next.enabled
      )
        return prev;
      return next;
    });
  }, [latestDraw]);

  return (
    <>
      {/* 조회 */}
      <LottoHistorySearchComponent
        onSearch={handleSearch}
        initRange={searchData}
      />

      {/* 결과 */}
      <div className="mt-6">
        {isError && (
          <p className="text-sm text-destructive">
            오류: {(error as Error).message}
          </p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            데이터가 없습니다. 범위를 변경해 다시 시도해주세요.
          </p>
        )}

        <LottoHistoryResultComponent data={data ?? []} />
      </div>
    </>
  );
}

export default LottoHistoryComponent;
