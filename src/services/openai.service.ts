import { GPT_MODEL_ENUM } from '@/constants';
import { OpenAIRequestType } from '@/types';
import axios, { AxiosError } from 'axios';

const OPENAI_TIMEOUT_MS: number = 20000; // per-call timeout
const OPENAI_MAX_RETRIES: number = 2; // retry up to 2 times on transient errors

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(e: unknown): boolean {
  const err = e as AxiosError | Error;
  if ((err as AxiosError).code === 'ECONNABORTED') return true; // timeout
  if ((err as AxiosError).response) {
    const status = (err as AxiosError).response!.status;
    return status >= 500 || status === 429; // server error or rate limit
  }
  return true; // network/unknown treat as transient
}

export async function callOpenAI({
  messages,
  max_tokens = 400,
  temperature = 0.8,
  model = GPT_MODEL_ENUM.STANDARD,
  json = false,
  presence_penalty,
  frequency_penalty,
  top_p,
}: OpenAIRequestType): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('OpenAI API Key is missing');

  let attempt = 0;
  let lastError: unknown = null;
  while (attempt <= OPENAI_MAX_RETRIES) {
    try {
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
          timeout: OPENAI_TIMEOUT_MS,
        }
      );
      if (!res.data) throw new Error('Failed to fetch GPT');
      return res.data.choices?.[0]?.message?.content?.trim() ?? '';
    } catch (e) {
      lastError = e;
      attempt += 1;
      if (attempt > OPENAI_MAX_RETRIES || !isTransientError(e)) break;
      // simple exponential backoff: 400ms, 800ms
      await sleep(400 * attempt);
    }
  }
  // throw controlled error with message for upstream handlers
  const err = lastError as AxiosError | Error;
  const code = (err as AxiosError).code || 'openai_request_failed';
  const status = (err as AxiosError).response?.status;
  const msg =
    (err as Error).message ||
    `OpenAI request failed${status ? ` (status ${status})` : ''}`;
  throw new Error(`${code}: ${msg}`);
}
