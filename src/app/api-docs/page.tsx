import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiDocsComponent } from '@/features/api-docs/components/root.component';
import {
  API_DOCS_ENABLED,
  API_DOCS_PATHNAME,
} from '@/features/api-docs/constants/api-docs.constant';
import { buildMetadata } from '@/lib/seo';

// 개발 환경 전용 문서라 검색에 노출하지 않는다 (noindex, sitemap 제외, robots 차단).
export const metadata: Metadata = {
  ...buildMetadata({
    title: 'API 문서',
    description:
      '로또 당첨번호 API의 요청과 응답 형식을 정리한 개발용 문서입니다.',
    pathname: API_DOCS_PATHNAME,
  }),
  robots: { index: false, follow: false },
};

export default function ApiDocsPage() {
  if (!API_DOCS_ENABLED) notFound();
  return <ApiDocsComponent />;
}
