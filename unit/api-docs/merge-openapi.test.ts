import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mergeOpenApiPieces } from '@/features/api-docs/utils/merge-openapi.util';
import { ROOT } from '../helpers/source-scan.util';

const INFO = { title: 't', version: '1', description: 'd' } as const;

// 파일은 읽기만 한다. src/에는 쓰지 않는다.
const lottoPiece: unknown = JSON.parse(
  readFileSync(
    join(ROOT, 'src/features/api-docs/specs/lotto.openapi.json'),
    'utf8'
  )
);
const lottoFile = { fileName: 'lotto.openapi.json', piece: lottoPiece };

function dummy(paths?: object) {
  return {
    'x-feature': 'test-feature',
    tags: [{ name: 'TestFeature', description: 'dummy' }],
    paths: paths ?? {
      '/api/test-feature/ping': {
        get: {
          summary: 'ping',
          operationId: 'testFeaturePing',
          tags: ['TestFeature'],
          responses: { '200': { description: 'ok' } },
        },
      },
    },
  };
}

describe('mergeOpenApiPieces', () => {
  it('정상 조각이면 경로가 합쳐진다', () => {
    const doc = mergeOpenApiPieces(
      [lottoFile, { fileName: 'test-feature.openapi.json', piece: dummy() }],
      INFO
    );
    const paths = Object.keys(doc.paths as Record<string, unknown>);
    expect(paths).toContain('/api/test-feature/ping');
    expect(paths).toContain('/api/lotto/draws');
  });

  it('responses 누락이면 예외 메시지에 responses가 있다', () => {
    const bad = dummy({
      '/api/test-feature/ping': {
        get: {
          summary: 'ping',
          operationId: 'testFeaturePing',
          tags: ['TestFeature'],
        },
      },
    });
    expect(() =>
      mergeOpenApiPieces(
        [lottoFile, { fileName: 'test-feature.openapi.json', piece: bad }],
        INFO
      )
    ).toThrow(/responses/);
  });

  it('lotto 조각과 경로가 겹치면 예외', () => {
    const dup = dummy({
      '/api/lotto/draws': {
        get: {
          summary: 'dup',
          operationId: 'testFeatureDup',
          tags: ['TestFeature'],
          responses: { '200': { description: 'ok' } },
        },
      },
    });
    expect(() =>
      mergeOpenApiPieces(
        [lottoFile, { fileName: 'test-feature.openapi.json', piece: dup }],
        INFO
      )
    ).toThrow(/경로 중복/);
  });
});
