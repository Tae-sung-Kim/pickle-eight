// hook 공통 유틸: stdin JSON 읽기, 차단(exit 2) 처리
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_DIR =
  process.env.CLAUDE_PROJECT_DIR || path.join(__dirname, '..', '..');

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

// exit 2 + stderr: Claude Code가 도구 호출(또는 종료)을 막고 메시지를 Claude에게 전달한다
function block(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

// 프로젝트 기준 상대 경로 (구분자는 /)
function relPath(filePath) {
  if (!filePath) return '';
  const abs = path.isAbsolute(filePath)
    ? filePath
    : path.join(PROJECT_DIR, filePath);
  return path.relative(PROJECT_DIR, abs).split(path.sep).join('/');
}

module.exports = { PROJECT_DIR, readInput, block, relPath };
