// PreToolUse(Bash): 위험하거나 프로젝트 규칙에 어긋나는 명령을 막는다
const { readInput, block } = require('./lib');

const RULES = [
  {
    re: /(^|[\s;&|(])(npm|yarn)\s/,
    msg: '이 프로젝트는 pnpm만 쓴다. npm/yarn 대신 pnpm을 써라.',
  },
  { re: /(^|[\s;&|(])npx\s/, msg: 'npx 대신 pnpm exec 또는 pnpm dlx를 써라.' },
  {
    re: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\b/,
    msg: 'rm -rf는 막혀 있다. 지울 파일을 사용자에게 확인받고 하나씩 지워라.',
  },
  {
    re: /\bsupabase\s+db\s+(push|reset\s+.*--linked)/,
    msg: '운영 Supabase DB 변경은 막혀 있다. 마이그레이션 파일만 만들고 적용은 사용자에게 맡긴다.',
  },
  {
    re: /\bsupabase\s+migration\s+repair\b/,
    msg: 'supabase migration repair는 사용자 확인이 필요하다.',
  },
  {
    re: /\bgit\s+push\b/,
    msg: 'git push는 사용자가 직접 하거나 명시적으로 요청할 때만 한다.',
  },
  {
    re: /\bgit\s+(reset\s+--hard|clean\s+-[a-zA-Z]*f|checkout\s+--\s|restore\b(?!\s+--staged\b(?!.*(--worktree|\s-W))))/,
    msg: '작업 내용을 지우는 git 명령은 막혀 있다. 사용자에게 확인받아라.',
  },
  {
    re: /\bvercel\s+(--prod|deploy\s+.*--prod)/,
    msg: '운영 배포는 사용자 확인이 필요하다.',
  },
  {
    // 파일 경로로 쓴 .env만 잡는다 (process.env 같은 코드 검색은 허용)
    re: /\b(cat|type|less|more|head|tail|grep|rg|sed|awk|cp|source)\b[^|;&]*(^|[\s/'"=])\.env(\.local|\.production|\.development)?(\s|$|['"])/,
    msg: '.env 시크릿 파일은 읽지 않는다. 키 이름은 .env.example을 봐라.',
  },
];

const input = readInput();
const cmd = input.tool_input?.command ?? '';
// heredoc 본문과 따옴표 안의 글자(파일 내용, 스크립트 문자열)는 명령이 아니므로 지운 뒤 검사한다
// 단, .env 규칙은 경로를 따옴표로 감싸는 경우가 있어 원래 명령으로 검사한다
const bare = cmd
  .replace(/<<-?\s*['"]?(\w+)['"]?[^\n]*\n[\s\S]*?\n\s*\1\s*(\n|$)/g, '\n')
  .replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, '""');
for (const { re, msg } of RULES) {
  const target = msg.includes('.env') ? cmd : bare;
  if (re.test(target)) block(`[guard-bash] 차단: ${msg}\n명령: ${cmd}`);
}
