import {
  API_DOCS_HTTP_METHODS,
  API_DOCS_SPEC_FILE_SUFFIX,
} from '@/features/api-docs/constants/api-docs.constant';
import type {
  ApiDocsInfoType,
  ApiDocsJsonObjectType,
  ApiDocsSpecFileType,
} from '@/features/api-docs/types/api-docs.type';

const FEATURE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is ApiDocsJsonObjectType {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** meal-menu -> MealMenu. 스키마 이름은 이 접두사로 시작해야 한다. */
function toSchemaPrefix(feature: string): string {
  return feature
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function collectRefs(value: unknown, out: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, out);
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (key === '$ref' && typeof child === 'string') out.push(child);
    else collectRefs(child, out);
  }
}

function validateOperation(
  where: string,
  operation: unknown,
  operationIds: Set<string>
): void {
  if (!isRecord(operation)) {
    throw new Error(`${where}: operation이 객체가 아니다`);
  }
  if (typeof operation.summary !== 'string' || !operation.summary) {
    throw new Error(`${where}: summary가 없다`);
  }
  const { operationId } = operation;
  if (typeof operationId !== 'string' || !operationId) {
    throw new Error(`${where}: operationId가 없다`);
  }
  if (operationIds.has(operationId)) {
    throw new Error(`${where}: operationId 중복 (${operationId})`);
  }
  operationIds.add(operationId);
  if (!Array.isArray(operation.tags) || operation.tags.length === 0) {
    throw new Error(`${where}: tags가 없다`);
  }
  if (
    !isRecord(operation.responses) ||
    Object.keys(operation.responses).length === 0
  ) {
    throw new Error(`${where}: responses가 없다`);
  }
}

/**
 * 기능별 조각을 하나의 OpenAPI 문서로 합친다.
 * 조각 하나라도 규칙을 어기면 일부만 빠뜨리지 않고 전체가 실패한다.
 * 규칙: 파일 이름 = `<x-feature>.openapi.json`, 경로는 `/api/`로 시작,
 * 모든 operation에 summary·operationId·tags·responses, 스키마 이름은 기능 접두사(PascalCase),
 * 경로·operationId·스키마 이름·태그 중복 금지,
 * `#/components/schemas/*` 참조는 합친 결과 안에 있어야 한다.
 */
export function mergeOpenApiPieces(
  files: readonly ApiDocsSpecFileType[],
  info: ApiDocsInfoType
): ApiDocsJsonObjectType {
  if (files.length === 0) throw new Error('OpenAPI 조각 파일이 하나도 없다');

  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};
  const tags: ApiDocsJsonObjectType[] = [];
  const tagNames = new Set<string>();
  const features = new Set<string>();
  const operationIds = new Set<string>();
  const refs: string[] = [];

  const sorted = [...files].sort((a, b) =>
    a.fileName.localeCompare(b.fileName)
  );
  for (const { fileName, piece } of sorted) {
    if (!isRecord(piece)) {
      throw new Error(`${fileName}: 최상위가 객체가 아니다`);
    }

    const feature = piece['x-feature'];
    if (typeof feature !== 'string' || !FEATURE_PATTERN.test(feature)) {
      throw new Error(`${fileName}: x-feature가 없거나 kebab-case가 아니다`);
    }
    if (fileName !== `${feature}${API_DOCS_SPEC_FILE_SUFFIX}`) {
      throw new Error(
        `${fileName}: 파일 이름이 ${feature}${API_DOCS_SPEC_FILE_SUFFIX}와 다르다`
      );
    }
    if (features.has(feature)) throw new Error(`${fileName}: x-feature 중복`);
    features.add(feature);

    if (!isRecord(piece.paths) || Object.keys(piece.paths).length === 0) {
      throw new Error(`${fileName}: paths가 비어 있다`);
    }
    for (const [path, item] of Object.entries(piece.paths)) {
      const where = `${fileName} ${path}`;
      if (!path.startsWith('/api/')) {
        throw new Error(`${where}: 경로는 /api/로 시작해야 한다`);
      }
      if (path in paths) throw new Error(`${where}: 경로 중복`);
      if (!isRecord(item)) {
        throw new Error(`${where}: 경로 항목이 객체가 아니다`);
      }
      const methods = Object.keys(item).filter((key) =>
        API_DOCS_HTTP_METHODS.includes(key)
      );
      if (methods.length === 0) throw new Error(`${where}: 메서드가 없다`);
      for (const method of methods) {
        validateOperation(`${where} ${method}`, item[method], operationIds);
      }
      paths[path] = item;
    }

    const prefix = toSchemaPrefix(feature);
    const pieceSchemas = isRecord(piece.components)
      ? piece.components.schemas
      : undefined;
    if (pieceSchemas !== undefined) {
      if (!isRecord(pieceSchemas)) {
        throw new Error(`${fileName}: components.schemas가 객체가 아니다`);
      }
      for (const [name, schema] of Object.entries(pieceSchemas)) {
        if (!name.startsWith(prefix)) {
          throw new Error(
            `${fileName}: 스키마 ${name}은 ${prefix}로 시작해야 한다`
          );
        }
        if (name in schemas) {
          throw new Error(`${fileName}: 스키마 이름 중복 (${name})`);
        }
        schemas[name] = schema;
      }
    }

    if (Array.isArray(piece.tags)) {
      for (const tag of piece.tags) {
        if (!isRecord(tag) || typeof tag.name !== 'string') {
          throw new Error(`${fileName}: tags 항목에 name이 없다`);
        }
        if (tagNames.has(tag.name)) {
          throw new Error(`${fileName}: 태그 중복 (${tag.name})`);
        }
        tagNames.add(tag.name);
        tags.push(tag);
      }
    }

    collectRefs(piece, refs);
  }

  for (const ref of refs) {
    const name = /^#\/components\/schemas\/(.+)$/.exec(ref)?.[1];
    if (!name || !(name in schemas)) {
      throw new Error(`참조를 찾을 수 없다: ${ref}`);
    }
  }

  return {
    openapi: '3.0.3',
    info,
    servers: [{ url: '/' }],
    tags,
    paths,
    components: { schemas },
  };
}
