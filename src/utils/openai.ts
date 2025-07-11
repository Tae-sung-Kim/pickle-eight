const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error('OpenAI API Key is missing');

export async function callOpenAI({
  messages,
  max_tokens = 60,
  temperature = 0.8,
}: {
  messages: { role: 'user' | 'system'; content: string }[];
  max_tokens?: number;
  temperature?: number;
}): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens,
      temperature,
    }),
  });
  if (!res.ok) throw new Error('Failed to fetch GPT');
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}
