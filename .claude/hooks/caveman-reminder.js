// UserPromptSubmit: 매 사용자 턴마다 caveman 응답 규칙을 컨텍스트에 주입한다 (토큰 절약을 위해 한 줄로 유지)
const reminder =
  '[caveman] 이번 턴도 짧은 caveman 한국어로 답한다. 서론·재요약 없이 결과, 변경 파일, 사용자가 정할 것만. 예외(일반 문장): 서비스 노출 문구, docs/, agent 프롬프트.';

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: reminder,
    },
  })
);
