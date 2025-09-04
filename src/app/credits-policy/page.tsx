import type { JSX } from 'react';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import { JsonLdComponent } from '@/components';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib';
import { CREDIT_POLICY, SPEND_COST } from '@/constants';

/**
 * 크레딧 정책 페이지
 * 코드 상수(CREDIT_POLICY, SPEND_COST) 기반으로 표기하여 불일치 방지
 */
const baseMeta = buildMetadata({
  title: '크레딧 정책 - Pickle Eight',
  description:
    '일일 기본/상한, 보상 조건(가시성/시간), 쿨다운 및 소비 비용 등 크레딧 운영 정책을 안내합니다.',
  pathname: '/credits-policy',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '크레딧 정책 - Pickle Eight',
        '일일 기본/상한, 보상 조건(가시성/시간), 쿨다운 및 소비 비용 등 크레딧 운영 정책을 안내합니다.',
        '크레딧 정책'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '크레딧 정책 - Pickle Eight',
        '일일 기본/상한, 보상 조건(가시성/시간), 쿨다운 및 소비 비용 등 크레딧 운영 정책을 안내합니다.',
        '크레딧 정책'
      ),
    ],
  },
};

export default function CreditsPolicyPage(): JSX.Element {
  const minutes = Math.floor(CREDIT_POLICY.cooldownMs / 60000);
  const seconds = Math.round((CREDIT_POLICY.cooldownMs % 60000) / 1000);
  const cooldownLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const EFFECTIVE_DATE = '2025-08-28' as const;
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '크레딧 정책', item: canonicalUrl('/credits-policy') },
  ]);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <h1 className="text-2xl font-bold mb-6">크레딧 정책</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        시행일: {EFFECTIVE_DATE}
      </p>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">핵심 규칙</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            매일 기본 크레딧: <strong>{CREDIT_POLICY.baseDaily}</strong>
            <span className="text-muted-foreground"> (자정에 리셋)</span>
          </li>
          <li>
            광고 네트워크 기준에 따라 <strong>전체 시청 완료</strong> 시 보상
            지급
          </li>
          <li>
            보상량은 시청 시간에 따라 가변 적용: 기본
            <strong> {CREDIT_POLICY.rewardAmount}</strong>개, 이후
            <strong> {CREDIT_POLICY.stepReward}초</strong>마다 +
            <strong>{CREDIT_POLICY.rewardAmount}</strong>씩 증가
          </li>
          <li>
            광고 1회 최대 지급: <strong>{CREDIT_POLICY.maxPerAd}</strong>개
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
        <h2 className="text-lg font-semibold">데이터 처리 및 보안</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            보상 판단을 위해 광고 가시성/노출 시간, 클릭/표시 이벤트, 쿨다운
            타이밍 등의 로그가 처리될 수 있습니다.
          </li>
          <li>
            개인정보 처리의 범위·보관 기간·동의 관리 등은{' '}
            <a href="/privacy" className="underline">
              개인정보처리방침
            </a>
            을 따릅니다.
          </li>
          <li>분석/광고 스크립트는 이용자 동의 후에만 활성화됩니다.</li>
        </ul>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">부정 이용 방지</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            자동화 도구 사용, 비정상 다중 요청, 가시성 요건 우회 등은
            금지됩니다.
          </li>
          <li>
            부정 획득이 확인되면 보상 취소·회수, 계정 제한 등 조치가 적용될 수
            있습니다.
          </li>
          <li>
            자세한 책임 및 금지 행위는{' '}
            <a href="/terms" className="underline">
              이용약관
            </a>
            을 참조하세요.
          </li>
        </ul>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">정책 및 관련 문서</h2>
        <p className="text-sm leading-6">
          본 정책은 서비스 개선 또는 법령 변경에 따라 갱신될 수 있으며, 중요
          변경 시 공지합니다. 세부 개인정보 처리 및 권리에 대한 내용은{' '}
          <a href="/privacy" className="underline">
            개인정보처리방침
          </a>
          과{' '}
          <a href="/terms" className="underline">
            이용약관
          </a>
          을 함께 확인하세요.
        </p>
      </section>
    </main>
  );
}
