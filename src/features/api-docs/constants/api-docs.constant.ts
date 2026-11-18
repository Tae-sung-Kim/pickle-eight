/**
 * API 문서는 개발 환경에서만 연다. `next dev`는 NODE_ENV가 development이고,
 * `next build`/`next start`와 Vercel 배포(preview 포함)는 production이다.
 */
export const API_DOCS_ENABLED: boolean = process.env.NODE_ENV !== 'production';

export const API_DOCS_PATHNAME = '/api-docs' as const;
export const API_DOCS_SPEC_PATHNAME = '/openapi.json' as const;

export const API_DOCS_SPEC_FILE_SUFFIX = '.openapi.json' as const;
export const API_DOCS_SPEC_DIR = 'src/features/api-docs/specs' as const;

export const API_DOCS_HTTP_METHODS: readonly string[] = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
];

export const API_DOCS_NOTICES: readonly string[] = [
  '본 API가 제공하는 데이터는 참고용이며 당첨을 보장하지 않습니다.',
  '오락 목적으로 제공되는 정보이며, 로또 운영 기관과 관련이 없습니다.',
  '당첨번호는 공개된 결과 데이터를 서버가 주기적으로 수집해 저장한 것입니다. 갱신이 늦거나 일부 회차가 비어 있을 수 있습니다.',
  '데이터의 재배포와 상업적 이용은 허용 범위를 확인하기 전까지 제한합니다. 개발 환경에서 동작을 확인하는 용도로만 쓰세요.',
];
