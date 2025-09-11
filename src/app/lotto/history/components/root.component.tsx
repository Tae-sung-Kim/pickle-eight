'use client';

import { useEffect, useState } from 'react';
import { useLatestLottoDrawQuery, useLottoDrawsQuery } from '@/queries';
import LottoHistorySearchComponent from './search.component';
import LottoHistoryResultComponent from './result.component';
import { LOTTO_MAX_HISTORY_RANGE } from '@/constants';
import { CsvExportButtonComponent } from '@/components';

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
    // from 앵커 기준 포함 범위 500으로 클램프
    const fromRaw = Math.max(1, Math.floor(searchData.from));
    const toRaw = Math.max(1, Math.floor(searchData.to));
    const safeFrom = fromRaw; // 앵커
    const minTo = safeFrom + 1;
    const maxTo = safeFrom + LOTTO_MAX_HISTORY_RANGE; // 포함 기준: from..from+500
    const safeTo = Math.max(minTo, Math.min(toRaw, maxTo));
    setSearchData({ from: safeFrom, to: safeTo, enabled: searchData.enabled });
  };

  const { data, isError, error } = useLottoDrawsQuery(searchData);

  useEffect(() => {
    const latest = latestDraw?.lastDrawNumber;
    if (!latest || latest <= 0) return;
    const next = {
      // 초기값: 최근 10회 (포함 범위 → latest-9 ~ latest)
      from: Math.max(1, latest - 9),
      to: latest,
      enabled: false,
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

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <CsvExportButtonComponent
          className="shrink-0"
          from={searchData.enabled ? searchData.from : undefined}
          to={searchData.enabled ? searchData.to : undefined}
        />
      </div>

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
