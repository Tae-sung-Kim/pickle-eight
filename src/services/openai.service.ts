import { OpenAIRequestType } from '@/types';
import axios from 'axios';

export async function callOpenAI({
  messages,
  max_tokens = 400,
  temperature = 0.8,
  model = 'gpt-3.5-turbo',
  json = false,
  presence_penalty,
  frequency_penalty,
  top_p,
}: OpenAIRequestType): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('OpenAI API Key is missing');

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages,
      max_tokens,
      temperature,
      ...(typeof top_p === 'number' && { top_p }),
      ...(typeof presence_penalty === 'number' && { presence_penalty }),
      ...(typeof frequency_penalty === 'number' && { frequency_penalty }),
      ...(json && { response_format: { type: 'json_object' } }),
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
