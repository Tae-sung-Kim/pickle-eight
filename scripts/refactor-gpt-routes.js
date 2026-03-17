const fs = require('fs');

const engWordPath = 'src/app/api/gpt/english-word-quiz/route.ts';
let content = fs.readFileSync(engWordPath, 'utf8');
content = content.replace('callOpenAI }', 'callOpenAiWithRetry }');
content = content.replace(/for\s*\(let\s*i\s*=\s*0;\s*i\s*<\s*3;\s*i\+\+\)\s*\{[\s\S]*\}\s*return\s*NextResponse\.json\([^)]*\);/, `
  try {
    const quizData = await callOpenAiWithRetry<any>({
      messages: [
        {
          role: 'system',
          content: 'You are a meticulous quiz generator. Always respond with strict JSON matching the schema.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      presence_penalty: 0.1,
      frequency_penalty: 0.3,
      top_p: 0.9,
      max_tokens: 350,
    }, 3, (data) => {
      if (
        data.quiz &&
        data.options &&
        data.answer &&
        data.explanation &&
        Array.isArray(data.options) &&
        data.options.length === 4 &&
        data.options.includes(data.answer)
      ) {
        return data;
      }
      throw new Error('Invalid JSON structure');
    });
    return NextResponse.json(quizData);
  } catch (error) {
    console.error('English word quiz generation failed:', error);
    return NextResponse.json(
      { error: '퀴즈 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
`);
fs.writeFileSync(engWordPath, content);
console.log('Updated', engWordPath);

const fourIdiomPath = 'src/app/api/gpt/four-idiom-quiz/route.ts';
let fourContent = fs.readFileSync(fourIdiomPath, 'utf8');
fourContent = fourContent.replace('callOpenAI }', 'callOpenAiWithRetry }');
fourContent = fourContent.replace(/for\s*\(let\s*i\s*=\s*0;\s*i\s*<\s*3;\s*i\+\+\)\s*\{[\s\S]*\}\s*return\s*NextResponse\.json\([^)]*\);/, `
  try {
    const data = await callOpenAiWithRetry<any>({
      messages: [
        { role: 'system', content: '항상 JSON만 반환하세요.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.3,
    }, 3, (parsed) => {
      if (
        !parsed.question ||
        !parsed.answer ||
        !parsed.hint ||
        !parsed.explanation ||
        parsed.answer !== targetIdioms.answer
      ) {
        throw new Error('Invalid JSON structure or answer mismatch');
      }
      return parsed;
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Four idiom quiz generation failed:', error);
    return NextResponse.json(
      { error: '퀴즈 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
`);
fs.writeFileSync(fourIdiomPath, fourContent);
console.log('Updated', fourIdiomPath);

const triviaPath = 'src/app/api/gpt/trivia-quiz/route.ts';
let triviaContent = fs.readFileSync(triviaPath, 'utf8');
triviaContent = triviaContent.replace('callOpenAI }', 'callOpenAiWithRetry }');
triviaContent = triviaContent.replace(/for\s*\(let\s*i\s*=\s*0;\s*i\s*<\s*3;\s*i\+\+\)\s*\{[\s\S]*return\s*NextResponse\.json\([^)]*\);\s*\}/, `
    try {
      const data = await callOpenAiWithRetry<TriviaRawQuizJsonType>({
        messages: [
          {
            role: 'system',
            content: '당신은 퀴즈 출제 전문가입니다. 반드시 JSON만 반환합니다.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.6,
        presence_penalty: 0.1,
        frequency_penalty: 0.3,
      }, 3, (parsed: any) => {
        if (
          !parsed.question ||
          !parsed.options ||
          !parsed.answer ||
          !parsed.explanation ||
          parsed.options.length !== 4 ||
          !parsed.options.includes(parsed.answer)
        ) {
          throw new Error('AI 응답이 유효하지 않습니다.');
        }
        return parsed as TriviaRawQuizJsonType;
      });
      return NextResponse.json({
        category,
        difficulty,
        question: data.question,
        options: data.options,
        answer: data.answer,
        explanation: data.explanation,
      });
    } catch (e: any) {
      console.error('Trivia quiz failed:', e.message);
      return NextResponse.json(
        { error: '문제 생성 실패' },
        { status: 500 }
      );
    }
`);
fs.writeFileSync(triviaPath, triviaContent);
console.log('Updated', triviaPath);
