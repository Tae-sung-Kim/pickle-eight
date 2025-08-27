'use client';

import { useEffect, useMemo, useState } from 'react';
import { LottoUtils } from '@/utils';
import LottoAnalysisControlsComponent from './controls.component';
import LottoAnalysisFrequencySectionComponent from './frequency-section.component';
import LottoAnalysisBucketSectionComponent from './bucket-section.component';
import LottoAnalysisOddEvenSectionComponent from './odd-even-section.component';
import LottoAnalysisSumSectionComponent from './sum-section.component';
import LottoAnalysisConsecutiveSectionComponent from './consecutive-section.component';
import { useLottoDrawsQuery, useLatestLottoDrawQuery } from '@/queries';

export function LottoAnalysisComponent() {
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(50);
  const [bootstrapped, setBootstrapped] = useState<boolean>(false);

  const enabled = useMemo(
    () =>
      bootstrapped &&
      Number.isInteger(from) &&
      Number.isInteger(to) &&
      from > 0 &&
      to >= from,
    [bootstrapped, from, to]
  );

  // 데이터 로딩은 queries 훅을 사용합니다.
  const { data, isLoading, isError, error, refetch, isFetching } =
    useLottoDrawsQuery({ from, to, enabled });

  const stats = useMemo(
    () => (data && data.length > 0 ? LottoUtils.computeStats(data) : null),
    [data]
  );

  // 부트스트랩: 최신 회차 로딩 성공 시 마지막-20 ~ 마지막으로 최초 1회 조회
  // 최신 회차 불가(로딩 종료 + 에러/데이터 없음) 시 1~50으로 폴백하여 최초 1회 조회
  const {
    data: latest,
    isLoading: isLatestLoading,
    isError: isLatestError,
    isSuccess: isLatestSuccess,
  } = useLatestLottoDrawQuery();

  useEffect(() => {
    if (bootstrapped) return;
    if (isLatestSuccess && latest) {
      const last = latest.lastDrawNumber;
      if (Number.isInteger(last) && last > 0) {
        const nextFrom = Math.max(1, last - 20);
        const nextTo = last;
        setFrom((prev) => (prev !== nextFrom ? nextFrom : prev));
        setTo((prev) => (prev !== nextTo ? nextTo : prev));
        setBootstrapped(true);
        return;
      }
    }
    if (!isLatestLoading && (isLatestError || !latest)) {
      // 폴백: 1~50
      setFrom((prev) => (prev !== 1 ? 1 : prev));
      setTo((prev) => (prev !== 50 ? 50 : prev));
      setBootstrapped(true);
    }
  }, [bootstrapped, isLatestLoading, isLatestError, isLatestSuccess, latest]);

  return (
    <>
      <div className="mt-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        ※ 본 페이지의 모든 통계는 당첨 번호 6개만을 기준으로 하며, 보너스 번호는
        포함하지 않습니다. 공식 공개된 회차 데이터에 근거해 계산됩니다.
      </div>

      {!bootstrapped ? (
        <div className="mt-6 text-sm text-muted-foreground">
          최신 회차 정보를 불러오는 중입니다...
        </div>
      ) : (
        <>
          <LottoAnalysisControlsComponent
            from={from}
            to={to}
            setFrom={setFrom}
            setTo={setTo}
            enabled={enabled}
            isFetching={isFetching}
            onAnalyze={() => refetch()}
          />

          <div className="mt-6 space-y-8 bg-white rounded-md shadow p-4">
            {isLoading && <p className="text-sm">불러오는 중…</p>}
            {isError && (
              <p className="text-sm text-destructive">
                오류: {(error as Error).message}
              </p>
            )}

            {stats && (
              <>
                <LottoAnalysisFrequencySectionComponent
                  frequencyByNumber={stats.frequencyByNumber}
                />
                <LottoAnalysisBucketSectionComponent
                  bucketDistribution={stats.bucketDistribution}
                />
                <LottoAnalysisOddEvenSectionComponent
                  odd={stats.oddEvenDistribution.odd}
                  even={stats.oddEvenDistribution.even}
                />
                <LottoAnalysisSumSectionComponent
                  sumDistribution={stats.sumDistribution}
                />
                <LottoAnalysisConsecutiveSectionComponent
                  consecutiveCount={stats.consecutiveCount}
                />
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default LottoAnalysisComponent;
