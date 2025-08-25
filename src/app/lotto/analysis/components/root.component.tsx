'use client';

import { useEffect, useMemo, useState } from 'react';
import { LottoUtils } from '@/utils';
import { LottoWarningAlertComponent } from '@/components';
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
      const last = latest.lastDrawNumber ?? latest.drawNumber;
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">로또 분석</h1>
      <p className="text-sm text-muted-foreground mt-1">
        회차 범위를 선택하여 빈도/패턴을 확인하세요.
      </p>

      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />

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

          <div className="mt-6 space-y-8">
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
    </div>
  );
}

export default LottoAnalysisComponent;
