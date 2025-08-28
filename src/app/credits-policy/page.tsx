import type { JSX } from 'react';
import { CREDIT_POLICY, SPEND_COST } from '@/constants';

/**
 * 크레딧 정책 페이지
 * 코드 상수(CREDIT_POLICY, SPEND_COST) 기반으로 표기하여 불일치 방지
 */
export default function CreditsPolicyPage(): JSX.Element {
  const minutes = Math.floor(CREDIT_POLICY.cooldownMs / 60000);
  const seconds = Math.round((CREDIT_POLICY.cooldownMs % 60000) / 1000);
  const cooldownLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">크레딧 정책</h1>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">핵심 규칙</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            매일 기본 크레딧: <strong>{CREDIT_POLICY.baseDaily}</strong>
            <span className="text-muted-foreground"> (자정에 리셋)</span>
          </li>
          <li>
            광고는 화면에{' '}
            <strong>{CREDIT_POLICY.visibleSecondsRequired}초</strong> 이상
            노출되고, 가시성 비율이{' '}
            <strong>{CREDIT_POLICY.visibleRatioRequired}</strong> 이상이어야 함
          </li>
          <li>
            하루 최대 획득 한도: <strong>{CREDIT_POLICY.dailyCap}</strong>{' '}
            크레딧
          </li>
          <li>
            보상 쿨다운: <strong>{cooldownLabel}</strong> 이후 다음 보상 가능
          </li>
          <li>
            자정 기준 리셋 시 크레딧은{' '}
            <strong>{CREDIT_POLICY.baseDaily}</strong>로 초기화
          </li>
        </ul>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">소비 비용</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            분석: <strong>{SPEND_COST.analysis}</strong>
          </li>
          <li>
            시뮬레이터: <strong>{SPEND_COST.simulator}</strong>
          </li>
          <li>
            고급 기능: <strong>{SPEND_COST.advanced}</strong>
          </li>
        </ul>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">추가 가산 규칙</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            분석: 범위 크기 (최대 200) 기준으로 1~30 +0, 31~60 +1, 61~90 +2 즉
            30개 단위로 +1로 가산.
          </li>
          <li>
            시뮬레이터: 티켓 수에 따라 랜덤은 +10, 커스텀은 +2 가산. 회수는
            +500으로 1~500 +0, 501~1000 +1로 가산
          </li>
          <li>
            고급 기능: 기본 {SPEND_COST.advanced}에 가중치 사용 시 +2, 생성
            매수는 +3으로 1~3장 +0, 4~6장 +1로 가산
          </li>
        </ul>
      </section>
    </main>
  );
}
