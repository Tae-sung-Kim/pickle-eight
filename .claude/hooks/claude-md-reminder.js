// SessionStart: CLAUDE.md는 이미 자동 로드되므로 본문을 다시 넣지 않는다.
// caveman 플러그인(`/caveman:caveman`)의 SKILL.md 본문을 매 세션 컨텍스트에 직접 넣는다.
// token-optimizer 플러그인의 token-optimization SKILL.md 본문도 같이 넣는다.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const reminder =
  'CLAUDE.md의 "응답 스타일"을 따른다. caveman·token-optimization 지침은 아래에 이미 들어 있으니 skill을 따로 호출하지 않는다. 우선순위는 caveman > token-optimizer.';

// 플러그인 캐시에서 가장 최근 버전의 SKILL.md를 찾는다. 없으면 건너뛴다.
function readSkill(segments, skillName) {
  try {
    const base = path.join(
      os.homedir(),
      '.claude',
      'plugins',
      'cache',
      ...segments
    );
    const versions = fs
      .readdirSync(base)
      .map((name) => ({
        name,
        mtime: fs.statSync(path.join(base, name)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);
    for (const { name } of versions) {
      const file = path.join(base, name, 'skills', skillName, 'SKILL.md');
      if (fs.existsSync(file)) {
        // frontmatter(--- ... ---)는 뺀다.
        return fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
      }
    }
  } catch {
    // 플러그인이 없어도 세션은 계속된다.
  }
  return '';
}

const skill = [
  readSkill(['anthropic-plugin-directory', 'caveman'], 'caveman'),
  readSkill(['token-optimizer', 'token-optimizer'], 'token-optimization'),
]
  .filter(Boolean)
  .join('\n\n');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: skill ? `${reminder}\n\n${skill}` : reminder,
    },
  })
);
