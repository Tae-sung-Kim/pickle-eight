import { OpenAIRequestType } from '@/types';
import axios from 'axios';

export async function callOpenAI({
  messages,
  max_tokens = 60,
  temperature = 0.8,
}: OpenAIRequestType): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('OpenAI API Key is missing');

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens,
      temperature,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  if (!res.data) throw new Error('Failed to fetch GPT');
  return res.data.choices?.[0]?.message?.content?.trim() ?? '';
}
