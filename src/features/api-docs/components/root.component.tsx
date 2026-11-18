import { ApiDocsSwaggerViewerComponent } from '@/features/api-docs/components/swagger-viewer.component';
import {
  API_DOCS_NOTICES,
  API_DOCS_SPEC_PATHNAME,
} from '@/features/api-docs/constants/api-docs.constant';

export function ApiDocsComponent() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">API 문서</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        로또 당첨번호 조회, 핫/콜드 통계, CSV 다운로드 API의 요청과 응답 형식을
        정리했어요. 이 문서는 개발 환경에서만 열려요. 호출 제한은 IP당 기준이며
        서버 상황에 따라 달라질 수 있어요. 명세 원본은{' '}
        <a
          className="text-foreground underline underline-offset-2"
          href={API_DOCS_SPEC_PATHNAME}
        >
          {API_DOCS_SPEC_PATHNAME}
        </a>
        에서 받을 수 있어요.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
        {API_DOCS_NOTICES.map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
      </ul>
      <div className="mt-6 min-w-0 overflow-x-auto rounded-lg border bg-white">
        <ApiDocsSwaggerViewerComponent />
      </div>
    </div>
  );
}
