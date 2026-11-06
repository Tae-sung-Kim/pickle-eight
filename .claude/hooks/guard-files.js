// PreToolUse(Edit|Write): 보호 파일 수정과 agent 범위 밖 수정을 막는다
const fs = require('node:fs');
const path = require('node:path');
const { PROJECT_DIR, readInput, block, relPath } = require('./lib');

// agent별로 쓸 수 있는 경로 (앞부분 일치). 없는 agent는 검사하지 않는다.
const DOCS = ['docs/'];
const SCOPES = {
  researcher: DOCS,
  planner: DOCS,
  architect: DOCS,
  'ui-ux-designer': DOCS,
  'dev-lead': DOCS,
  qa: ['e2e/', 'docs/'],
  'db-dev': ['supabase/', 'docs/'],
  'backend-dev': [
    'src/app/api/',
    'src/lib/',
    'src/types/',
    /^src\/features\/[^/]+\/services\/[^/]+\.repository\.ts$/,
    /^src\/features\/[^/]+\/(types|constants)\//,
    'scripts/fortune-calendar/',
    'docs/',
  ],
  'frontend-dev': [
    'src/app/',
    'src/components/',
    'src/features/',
    'src/hooks/',
    'src/stores/',
    'src/styles/',
    'src/providers/',
    'src/constants/',
    'src/types/',
    'public/',
    'docs/',
  ],
};
// 서버 로직은 backend-dev 몫
const FRONTEND_DENY = ['src/app/api/', /\.repository\.ts$/];
// 문자열은 앞부분 일치, 정규식은 패턴 일치
const match = (p) =>
  typeof p === 'string' ? file.startsWith(p) : p.test(file);

const input = readInput();
const file = relPath(input.tool_input?.file_path);
if (!file) process.exit(0);

// 1. 시크릿 파일
if (/(^|\/)\.env(\..+)?$/.test(file) && !file.endsWith('.env.example')) {
  block(
    `[guard-files] 차단: ${file}은 시크릿 파일이다. 수정이 필요하면 사용자에게 요청해라.`
  );
}

// 2. 이미 있는 마이그레이션은 고치지 않는다
if (
  file.startsWith('supabase/migrations/') &&
  fs.existsSync(path.join(PROJECT_DIR, file))
) {
  block(
    `[guard-files] 차단: ${file}은 이미 있는 마이그레이션이다. 새 마이그레이션 파일을 만들어라.`
  );
}

// 3. agent 범위 (hook 입력에 agent_type이 있을 때만)
const agent = input.agent_type;
// 규칙 문서와 템플릿은 메인 세션(사용자 승인)만 고친다
if (
  agent &&
  ['docs/conventions/', 'docs/_templates/'].some((p) => file.startsWith(p))
) {
  block(
    `[guard-files] 차단: ${file}은 규칙 문서다. agent는 수정할 수 없다. 바꿔야 하면 PM에게 제안해라.`
  );
}
const scope = agent && SCOPES[agent];
if (scope) {
  const denied = agent === 'frontend-dev' && FRONTEND_DENY.some(match);
  if (denied || !scope.some(match)) {
    block(
      `[guard-files] 차단: ${agent}는 ${file}을 수정할 수 없다. 허용 경로: ${scope.map(String).join(', ')}. 필요하면 PM에게 보고해라.`
    );
  }
}
