// PostToolUse(Edit|Write): tsx를 고친 직후 디자인 규칙(docs/conventions/design-system.md)을 검사한다
// 위반이 있으면 exit 2로 Claude에게 알려 바로 고치게 한다
const fs = require('node:fs');
const path = require('node:path');
const { PROJECT_DIR, readInput, block, relPath } = require('./lib');

const input = readInput();
const file = relPath(input.tool_input?.file_path);
if (!file.startsWith('src/') || !file.endsWith('.tsx')) process.exit(0);
// shadcn 원본과 OG 이미지 생성(서버에서 그리는 이미지)은 제외
if (file.startsWith('src/components/ui/') || file.startsWith('src/app/api/'))
  process.exit(0);

const abs = path.join(PROJECT_DIR, file);
if (!fs.existsSync(abs)) process.exit(0);
const src = fs.readFileSync(abs, 'utf8');
const lines = src.split('\n');

const problems = [];
const scan = (re, msg) => {
  lines.forEach((line, i) => {
    const m = line.match(re);
    if (m) problems.push(`${file}:${i + 1} ${msg} (${m[0]})`);
  });
};

// 1. 색: 토큰만 쓴다
scan(
  /\b(bg|text|border|ring|from|to|via|fill|stroke|outline|shadow|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
  'Tailwind 기본 팔레트 대신 토큰(primary, menu-<key> 등)을 써라'
);
scan(
  /(className|style)=.*#[0-9a-fA-F]{3,8}\b/,
  'hex 색 대신 globals.css 토큰을 써라'
);

// 2. 다크 모드: 아직 쓰지 않는다
scan(/(^|[\s"'`])dark:/, '다크 모드는 아직 쓰지 않는다. dark: 클래스를 빼라');

// 3. 모션 접근성 (개수는 제한하지 않는다. 양은 design-system.md "모션"의 판단 기준을 따른다)
// framer는 MotionProvider가 reducedMotion을 처리하지만, CSS 애니메이션은 직접 처리해야 한다
const cssAnimation =
  /\banimate-(in|out|bounce|ping|\[[^\]]+\])|\b(fade|zoom|slide|spin)-(in|out)\b/.test(
    src
  );
if (cssAnimation && !src.includes('motion-reduce:')) {
  problems.push(
    `${file} CSS 애니메이션이 있는데 motion-reduce: 처리가 없다. 예: motion-reduce:animate-none`
  );
}

if (problems.length) {
  block(
    `[design-guard] docs/conventions/design-system.md 위반:\n${problems.map((p) => `- ${p}`).join('\n')}`
  );
}
