// SessionStart hook: 매 세션 시작 시 아래를 additionalContext로 주입한다.
// 1. CLAUDE.md 내용 (규칙은 CLAUDE.md에만 두고, 여기에는 복사하지 않는다.)
// 2. 필수 플러그인 skill의 SKILL.md 내용 (skill 호출 여부와 무관하게 규칙을 강제 적용)
//    배열 순서가 우선순위다. 앞쪽 skill이 뒤쪽 skill과 충돌하면 앞쪽을 따른다.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REQUIRED_SKILLS = [
  {
    label: 'caveman',
    pluginId: 'caveman@anthropic-plugin-directory',
    skillDir: 'caveman',
    skillName: 'caveman:caveman',
    note: '이 세션 내내 유지한다. 사용자가 끄라고 하기 전까지 모든 응답에 적용한다. 응답 언어는 한국어이므로 아래 규칙을 한국어 문장에 맞춰 적용한다.',
  },
  {
    label: 'token-optimizer',
    pluginId: 'token-optimizer@token-optimizer',
    skillDir: 'token-optimization',
    skillName: 'token-optimizer:token-optimization',
    note: '도구 사용 방식(읽기, 검색, 편집)에 적용한다. 응답 말투와 길이는 caveman을 따른다.',
  },
];

const claudeMd = fs.readFileSync(
  path.join(__dirname, '..', '..', 'CLAUDE.md'),
  'utf8'
);

// installed_plugins.json의 installPath를 읽어 PC마다 다른 설치 경로를 찾는다.
function loadSkill({ pluginId, skillDir }) {
  try {
    const registry = JSON.parse(
      fs.readFileSync(
        path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json'),
        'utf8'
      )
    );
    const installPath = registry.plugins?.[pluginId]?.[0]?.installPath;
    if (!installPath) {
      return { error: `${pluginId} 설치 정보를 찾지 못함` };
    }
    const raw = fs.readFileSync(
      path.join(installPath, 'skills', skillDir, 'SKILL.md'),
      'utf8'
    );
    // frontmatter(--- ... ---) 제거
    return { body: raw.replace(/^---[\s\S]*?---\s*/, '').trim() };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

const errors = [];
const skillSections = REQUIRED_SKILLS.map((skill, index) => {
  const loaded = loadSkill(skill);
  if (loaded.error) {
    errors.push(`${skill.label} 주입 실패: ${loaded.error}`);
    return `[경고: ${skill.label} 규칙 주입 실패. \`${skill.skillName}\` skill을 직접 호출하라.]`;
  }
  return `[${skill.label} ON (우선순위 ${index + 1}): ${skill.note}]\n\n${loaded.body}`;
});

const priority = REQUIRED_SKILLS.map((s) => s.label).join(' > ');

const output = {
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: `아래 CLAUDE.md 지시를 첫 응답 전에 반드시 수행하라.\n\n${claudeMd}\n\n---\n필수 적용 skill 우선순위: ${priority} (충돌 시 앞쪽을 따른다)\n\n${skillSections.join('\n\n---\n')}`,
  },
};

if (errors.length > 0) {
  output.systemMessage = errors.join(' / ');
}

process.stdout.write(JSON.stringify(output));
