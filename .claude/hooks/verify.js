// Stop / SubagentStop: 코드가 바뀌었으면 끝내기 전에 typecheck와 lint를 돌린다. 실패하면 종료를 막는다.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { PROJECT_DIR, readInput, block } = require('./lib');

const CACHE = path.join(PROJECT_DIR, '.claude', '.verify-cache');
const CODE = /^(src|e2e)\/.+\.(ts|tsx|js|jsx|css)$/;

const input = readInput();
// 이미 한 번 막았으면 다시 막지 않는다 (무한 반복 방지)
if (input.stop_hook_active) process.exit(0);

const run = (cmd) =>
  execSync(cmd, { cwd: PROJECT_DIR, stdio: 'pipe', encoding: 'utf8' });

// 바뀐 코드 파일 (staged, unstaged, 새 파일)
const changed = run('git status --porcelain --untracked-files=all')
  .split('\n')
  .map((l) => l.slice(3).trim().replace(/^"|"$/g, ''))
  .map((f) => (f.includes(' -> ') ? f.split(' -> ')[1] : f))
  .filter((f) => CODE.test(f) && fs.existsSync(path.join(PROJECT_DIR, f)));
if (changed.length === 0) process.exit(0);

// 지난번 통과한 상태와 같으면 건너뛴다
const hash = crypto
  .createHash('sha1')
  .update(run('git diff HEAD'))
  .update(changed.join('\n'))
  .digest('hex');
if (fs.existsSync(CACHE) && fs.readFileSync(CACHE, 'utf8') === hash)
  process.exit(0);

const fails = [];
try {
  run('pnpm typecheck');
} catch (e) {
  fails.push(
    `## pnpm typecheck 실패\n${`${e.stdout ?? ''}${e.stderr ?? ''}`.slice(-3000)}`
  );
}
try {
  run(
    `pnpm exec biome check --no-errors-on-unmatched ${changed.map((f) => `"${f}"`).join(' ')}`
  );
} catch (e) {
  fails.push(
    `## biome check 실패\n${`${e.stdout ?? ''}${e.stderr ?? ''}`.slice(-3000)}`
  );
}

if (fails.length) {
  block(
    `[verify] 끝내기 전 검사 실패. 고친 뒤 다시 끝내라.\n${fails.join('\n\n')}`
  );
}
fs.writeFileSync(CACHE, hash);
