const fs = require('fs');

const path = 'src/features/quiz/services/openai.service.ts';
let content = fs.readFileSync(path, 'utf8');

const helper = `

/**
 * Enhanced callOpenAI with retry and JSON parsing.
 */
export async function callOpenAiWithRetry<T>(
  request: OpenAIRequestType,
  retries: number = 3,
  validator?: (data: any) => T
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt < retries) {
    try {
      const content = await callOpenAI({ ...request, json: true });
      const rawJson = content.replace(/\`\`\`json|\`\`\`/g, '').trim();
      const parsed = JSON.parse(rawJson);
      if (validator) {
        return validator(parsed);
      }
      return parsed as T;
    } catch (e) {
      lastError = e;
      attempt += 1;
      await sleep(1000 * attempt);
    }
  }
  throw new Error('All retries failed: ' + String(lastError));
}
`;

if (!content.includes('callOpenAiWithRetry')) {
    content += helper;
    fs.writeFileSync(path, content);
    console.log(`Updated ${path}`);
} else {
    console.log(`${path} already updated`);
}
