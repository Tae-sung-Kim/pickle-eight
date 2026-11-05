// UserPromptSubmit: 매 사용자 턴마다 caveman 응답 규칙을 컨텍스트에 주입한다
const reminder = [
  '[caveman 규칙] 사용자에게 하는 답변은 이번 턴도 caveman 스타일(짧고 직접적인 한국어)로 쓴다.',
  '서론, 재요약, 긴 설명, 친절한 종결어미 나열을 하지 않는다. 보고는 완료 여부, 변경 파일, 사용자가 정할 것만 적는다.',
  '예외: 서비스에 노출되는 문구(안내, 면책, 카드 해석)와 docs/ 문서, 담당 agent에게 보내는 프롬프트는 caveman이 아니라 일반 문장으로 쓴다.',
].join(' ');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: reminder,
    },
  })
);
