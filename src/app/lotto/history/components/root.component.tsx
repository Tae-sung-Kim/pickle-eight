'use client';

import { useEffect, useState } from 'react';
import { useLatestLottoDrawQuery, useLottoDrawsQuery } from '@/queries';
import LottoHistorySearchComponent from './search.component';
import LottoHistoryResultComponent from './result.component';
import { LOTTO_MAX_HISTORY_RANGE } from '@/constants';

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
    // 입력 정규화 + 최대 200회 클램프
    const to = Math.max(1, Math.floor(searchData.to));
    const fromRaw = Math.max(1, Math.floor(searchData.from));
    const normalizedFrom = Math.min(fromRaw, to);
    const count = to - normalizedFrom + 1;
    const clampedFrom =
      count > LOTTO_MAX_HISTORY_RANGE
        ? Math.max(1, to - LOTTO_MAX_HISTORY_RANGE + 1)
        : normalizedFrom;
    setSearchData({ from: clampedFrom, to, enabled: searchData.enabled });
  };

  const { data, isError, error } = useLottoDrawsQuery(searchData);

  useEffect(() => {
    const latest = latestDraw?.lastDrawNumber;
    if (!latest || latest <= 0) return;
    const next = {
      // 초기값: 최근 10회 (포함 범위 → latest-9 ~ latest)
      from: Math.max(1, latest - 9),
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
    <div className="bg-white shadow-sm rounded-lg p-5">
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        ※ 표시되는 통계/분석 정보는 당첨 번호 6개를 기준으로 하며, 보너스 번호는
        포함하지 않습니다.
      </div>
      {/* 조회 */}
      <LottoHistorySearchComponent
        onSearch={handleSearch}
        initRange={searchData}
      />

      {/* 결과 */}
      <div className="mt-5">
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
    </div>
  );
}

export default LottoHistoryComponent;
