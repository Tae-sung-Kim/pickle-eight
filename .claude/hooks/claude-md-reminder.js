// SessionStart: CLAUDE.md는 이미 자동 로드되므로 본문을 다시 넣지 않는다.
// skill은 호출하지 않는다(토큰 절약). 응답 스타일 안내 한 줄만 주입한다.
const reminder =
  'CLAUDE.md의 "응답 스타일"을 따른다. 세션 시작에 skill 호출은 하지 않는다. 우선순위는 caveman > token-optimizer.';

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: reminder,
    },
  })
);
