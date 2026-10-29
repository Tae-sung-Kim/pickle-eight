// SessionStart hook: CLAUDE.md 내용을 그대로 읽어 additionalContext로 다시 주입한다.
// 규칙은 CLAUDE.md에만 두고, 여기에는 복사하지 않는다.
const fs = require('node:fs');
const path = require('node:path');

const claudeMd = fs.readFileSync(
  path.join(__dirname, '..', '..', 'CLAUDE.md'),
  'utf8'
);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `아래 CLAUDE.md 지시를 첫 응답 전에 반드시 수행하라.\n\n${claudeMd}`,
    },
  })
);
