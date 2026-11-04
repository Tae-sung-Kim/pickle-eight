// PostToolUse(Edit|Write): 수정한 파일을 Biome으로 바로 정리한다. 자동으로 못 고친 문제는 Claude에게 알린다.
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { PROJECT_DIR, readInput, block, relPath } = require('./lib');

const input = readInput();
const file = relPath(input.tool_input?.file_path);
if (!/\.(ts|tsx|js|jsx|mjs|cjs|json|jsonc|css)$/.test(file)) process.exit(0);
// 프로젝트 밖(다른 드라이브 포함)과 .claude/는 건너뛴다
if (
  file.startsWith('..') ||
  path.isAbsolute(file) ||
  file.startsWith('.claude/')
)
  process.exit(0);

try {
  execFileSync(
    'pnpm',
    ['exec', 'biome', 'check', '--write', '--no-errors-on-unmatched', file],
    {
      cwd: PROJECT_DIR,
      stdio: 'pipe',
      shell: process.platform === 'win32',
    }
  );
} catch (e) {
  const out = `${e.stdout ?? ''}${e.stderr ?? ''}`.slice(-3000);
  block(
    `[format] ${file}에 Biome이 자동으로 못 고친 문제가 있다. 고쳐라.\n${out}`
  );
}
