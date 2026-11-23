import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type SourceFileType = { path: string; content: string };

/** 프로젝트 루트 (이 파일은 unit/helpers/ 아래). cwd와 무관 */
export const ROOT = path.resolve(
  fileURLToPath(new URL('../../', import.meta.url))
);
const SCAN_DIRS = ['src', 'public'] as const;
const SKIP_DIR_NAMES = new Set(['node_modules', '.next']);
const TAROT_DEV_GUIDE = 'src/features/tarot/tarot-dev-guide.md';

function toPosix(file: string): string {
  return file.split(path.sep).join('/');
}

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

/** 검사 목록 자체인 규칙 파일과 타로 개발 가이드는 스캔에서 뺀다 */
export function isScanExcluded(relPath: string): boolean {
  const posix = toPosix(relPath);
  return posix.endsWith('-copy-rule.constant.ts') || posix === TAROT_DEV_GUIDE;
}

/** `src/`·`public/` 아래 파일의 루트 기준 상대 경로 (제외 목록 적용). `extensions`로 확장자 제한 */
export function listSourcePaths(extensions?: readonly string[]): string[] {
  const all = SCAN_DIRS.flatMap((dir) => walkFiles(path.join(ROOT, dir)));
  if (all.length === 0) {
    throw new Error(`src/public을 찾지 못했다 (루트: ${ROOT})`);
  }
  return all
    .map((file) => toPosix(path.relative(ROOT, file)))
    .filter((rel) => !isScanExcluded(rel))
    .filter(
      (rel) => !extensions || extensions.some((ext) => rel.endsWith(ext))
    );
}

/** 소스 파일을 읽는다 (읽기 전용) */
export function readSourceFiles(
  extensions: readonly string[] = ['.ts', '.tsx', '.md']
): SourceFileType[] {
  return listSourcePaths(extensions).map((rel) => ({
    path: rel,
    content: fs.readFileSync(path.join(ROOT, rel), 'utf8'),
  }));
}

/** 용어가 들어 있는 `파일: 용어` 목록. `ignoreCase`면 대소문자 무시. 비어 있어야 통과 */
export function findTermsInSource(
  terms: readonly string[],
  options: { ignoreCase?: boolean; extensions?: readonly string[] } = {}
): string[] {
  const hits: string[] = [];
  for (const file of readSourceFiles(options.extensions)) {
    const body = options.ignoreCase ? file.content.toLowerCase() : file.content;
    for (const term of terms) {
      const needle = options.ignoreCase ? term.toLowerCase() : term;
      if (body.includes(needle)) hits.push(`${file.path}: "${term}"`);
    }
  }
  return hits;
}
