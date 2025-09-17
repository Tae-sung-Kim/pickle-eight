import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import {
  CREDIT_POLICY,
  CREDIT_SPEND_COST,
} from '@/constants/ad-credit.constant';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { Metadata } from 'next';
import type { JSX } from 'react';

/**
 * 크레딧 정책 페이지
 * 코드 상수(CREDIT_POLICY, CREDIT_SPEND_COST) 기반으로 표기하여 불일치 방지
 */
const baseMeta = buildMetadata({
  title: '크레딧 정책 - ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
  description:
    '일일 기본/상한 및 소비 비용 등 현재 크레딧 운영 정책을 안내합니다.',
  pathname: '/credits-policy',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '크레딧 정책 - ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '일일 기본/상한 및 소비 비용 등 현재 크레딧 운영 정책을 안내합니다.',
        '크레딧 정책'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '크레딧 정책 - ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '일일 기본/상한 및 소비 비용 등 현재 크레딧 운영 정책을 안내합니다.',
        '크레딧 정책'
      ),
    ],
  },
};

export default function CreditsPolicyPage(): JSX.Element {
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
            하루 최대 보유/사용 상한: <strong>{CREDIT_POLICY.dailyCap}</strong>
          </li>
          <li>
            리필: <strong>5분마다 +1</strong>씩 자동 충전되며, 최대{' '}
            <strong>{CREDIT_POLICY.dailyCap}</strong>까지 충전됩니다.
          </li>
        </ul>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">소비 비용</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            분석: <strong>{CREDIT_SPEND_COST.analysis}</strong>
          </li>
          <li>
            시뮬레이터: <strong>{CREDIT_SPEND_COST.simulator}</strong>
          </li>
          <li>
            고급 기능: <strong>{CREDIT_SPEND_COST.advanced}</strong>
          </li>
          <li>
            CSV 내보내기: <strong>1</strong>
          </li>
        </ul>
        <div className="mt-3 rounded-md border bg-muted/30 p-3">
          <p className="text-sm font-medium">세부 과금 규칙(로또)</p>
          <ul className="mt-1 list-disc pl-5 text-sm leading-6">
            <li>
              고급 번호 생성: <strong>최대 3개까지 1 크레딧</strong>, 이후
              <strong> 2개 추가 생성 시마다 +1 크레딧</strong>이 추가로
              청구됩니다.
            </li>
            <li>
              자동 비교 실행: 기본 <strong>10회 = 1 크레딧</strong>, 이후
              <strong> 5회 추가마다 +1 크레딧</strong> (예: 15회=2, 20회=3 …).
            </li>
            <li>
              핫/콜드/지연 조회: <strong>두 가지 모드</strong> 중 하나를 선택해
              조회합니다. 조회는
              <em>반드시 조회 버튼 클릭 시</em>에만 실행되며, 그때 크레딧이
              청구됩니다.
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Top 모드: <strong>Top N은 5단위 버킷</strong>으로 과금됩니다.
                  <strong> ceil(N/5)</strong> (예: 5=1, 10=2, 15=3 …)
                </li>
                <li>
                  회차 범위 모드: <strong>조회 길이 = (To - From)</strong>을
                  기준으로
                  <strong> 10단위 버킷</strong> 과금(
                  <strong>ceil(length/10)</strong>). 예: 1179~1189 → 길이 10 → 1
                  크레딧, 1179~1190 → 길이 11 → 2 크레딧
                </li>
              </ul>
            </li>
            <li>
              CSV 내보내기: <strong>1</strong> 고정.
            </li>
          </ul>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          과금 표시는 모든 버튼에 <em>(-{`크레딧`})</em> 형태로 표기되며, 작업
          실패 시 청구가 취소되거나 복구됩니다.
        </p>
        <div className="mt-3 rounded-md border bg-muted/30 p-3">
          <p className="text-sm font-medium">AI 퀴즈/게임 크레딧 정책</p>
          <ul className="mt-1 list-disc pl-5 text-sm leading-6">
            <li>
              현재 모든 AI 퀴즈/게임은 <strong>크레딧 소모 없이</strong> 이용
              가능합니다.
            </li>
            <li>
              모델 선택 기능은 제공하지 않으며, 내부적으로{' '}
              <strong>gpt-4o-mini</strong>로 고정되어 동작합니다.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">동의 및 접근성</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            본 사이트는 크레딧 없이도 대부분의 페이지를 자유롭게 이용할 수
            있습니다.
          </li>
          <li>
            다만 아래 기능 중 일부는 크레딧 기반으로 제한됩니다. 필요한 경우
            광고/쿠키 동의 후 사용하실 수 있습니다.
          </li>
          <li>
            동의하지 않으면 크레딧 &quot;사용&quot;이 비활성화되며, 이미 사용된
            내역은 그대로 유지됩니다.
          </li>
          <li>
            동의 상태는 하단 배너 또는 설정에서 언제든 변경할 수 있습니다.
          </li>
        </ul>
        <div className="mt-2 rounded-md border bg-muted/30 p-3">
          <p className="text-sm font-medium">크레딧 제한 기능 목록</p>
          <ul className="mt-1 list-disc pl-5 text-sm leading-6">
            <li>로또 분석(범위 조회 및 통계 계산)</li>
            <li>로또 고급 번호 생성(가중치/필터 기반)</li>
            <li>CSV 내보내기 및 일부 보상형 기능</li>
            <li>
              AI 퀴즈/게임: <strong>크레딧 소모 없음</strong>
            </li>
          </ul>
        </div>
        <div className="mt-2 rounded-md border bg-muted/30 p-3">
          <p className="text-sm font-medium">요청 쿨다운 안내</p>
          <p className="text-sm leading-6">
            짧은 시간에 반복 요청이 과도한 경우{' '}
            <strong>429(Too Many Requests)</strong>가 발생할 수 있으며, 이 때
            화면 우측 상단 토스트로 쿨다운 안내가 표시됩니다. 잠시 후 다시
            시도해 주세요.
          </p>
        </div>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">데이터 처리 및 보안</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>
            서비스 운영과 품질 개선을 위해 최소한의 사용 로그를 수집할 수
            있습니다.
          </li>
          <li>
            개인정보 처리의 범위·보관 기간·동의 관리는{' '}
            <a href="/privacy" className="underline">
              개인정보처리방침
            </a>
            을 따릅니다.
          </li>
        </ul>
      </section>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">부정 이용 방지</h2>
        <ul className="list-disc pl-5 text-sm leading-6">
          <li>자동화 도구 사용, 비정상 다중 요청 등은 금지됩니다.</li>
          <li>
            부정 획득이 확인되면 크레딧 회수 및 계정 제한이 적용될 수 있습니다.
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
