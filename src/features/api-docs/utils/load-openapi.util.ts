import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  API_DOCS_SPEC_DIR,
  API_DOCS_SPEC_FILE_SUFFIX,
} from '@/features/api-docs/constants/api-docs.constant';
import type { ApiDocsInfoType } from '@/features/api-docs/types/api-docs.type';
import { mergeOpenApiPieces } from '@/features/api-docs/utils/merge-openapi.util';

const API_DOCS_INFO: ApiDocsInfoType = {
  title: '운빨연구소 API',
  version: '1.0.0',
  description:
    '개발 환경 전용 API 문서입니다. 호출 제한 수치는 코드 기준이며 서버 상황에 따라 달라질 수 있습니다.',
};

/**
 * 명세 폴더의 `*.openapi.json` 조각을 모두 읽어 합친다. 서버(개발 환경)에서만 쓴다.
 * 새 기능은 조각 파일 하나만 추가하면 되고, 이 파일은 고치지 않는다.
 */
export async function loadOpenApiDocument(): Promise<Record<string, unknown>> {
  const dir = path.join(process.cwd(), API_DOCS_SPEC_DIR);
  const names = (await readdir(dir)).filter((name) =>
    name.endsWith(API_DOCS_SPEC_FILE_SUFFIX)
  );
  const files = await Promise.all(
    names.map(async (fileName) => ({
      fileName,
      piece: JSON.parse(await readFile(path.join(dir, fileName), 'utf-8')),
    }))
  );
  return mergeOpenApiPieces(files, API_DOCS_INFO);
}
