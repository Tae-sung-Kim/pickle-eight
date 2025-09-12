import {
  OpenAIErrorResponseType,
  OpenAIRequestType,
  OpenAIResponseType,
} from '@/types';
import axios, { AxiosError } from 'axios';

const OPENAI_TIMEOUT_MS: number = 20000; // per-call timeout
const OPENAI_MAX_RETRIES: number = 2; // retry up to 2 times on transient errors

/** Minimal shape of OpenAI Chat Completions API response */

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
  json = false,
  presence_penalty,
  frequency_penalty,
  top_p,
}: OpenAIRequestType): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('OpenAI API Key is missing');

  // Always use Chat Completions API with gpt-4o-mini
  const FIXED_MODEL = 'gpt-4o-mini' as const;
  let attempt = 0;
  let lastError: unknown = null;
  while (attempt <= OPENAI_MAX_RETRIES) {
    try {
      const res = await axios.post<OpenAIResponseType>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: FIXED_MODEL,
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
      const text: string =
        res.data?.choices?.[0]?.message?.content?.trim() ?? '';
      return text;
    } catch (e) {
      lastError = e;
      if (isTransientError(e) && attempt < OPENAI_MAX_RETRIES) {
        attempt += 1;
        await sleep(400 * attempt);
        continue;
      }
      const ax = e as AxiosError<OpenAIErrorResponseType>;
      const status: number | undefined = ax?.response?.status;
      const payload: OpenAIErrorResponseType | undefined = ax?.response?.data;
      const fallbackMsg: string = ax?.message ?? 'Unknown error';
      const errMsg: string = payload?.error?.message ?? fallbackMsg;
      const msg: string =
        `openai_request_failed: ${errMsg}` +
        (status ? `; status=${status}` : '');
      throw new Error(msg);
    }
  }
  throw new Error(String(lastError) || 'openai_request_failed');
}
