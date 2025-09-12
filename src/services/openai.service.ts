import {
  OpenAIRequestType,
  OpenAIResponsesApiResponse,
  OpenAIErrorResponse,
} from '@/types';
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

// Heuristic model family detector
// chat: Chat Completions API
// responses: Responses API (o1/o3, 4.1/5 family, etc.)
function getModelFamily(model?: string): 'chat' | 'responses' {
  const m = (model || '').toLowerCase();
  if (!m) return 'chat';
  // Known chat-compatible
  if (
    m.startsWith('gpt-3.5') ||
    m === 'gpt-4' ||
    m.startsWith('gpt-4-') ||
    m.startsWith('gpt-4o') ||
    m.startsWith('gpt-4-turbo')
  ) {
    return 'chat';
  }
  // Likely responses family
  if (
    m.startsWith('o1') ||
    m.startsWith('o3') ||
    m.includes('4.1') ||
    m.startsWith('gpt-5') ||
    m.includes('nano')
  ) {
    return 'responses';
  }
  // Default to chat to maximize compatibility
  return 'chat';
}

function stringifyMessages(messages: OpenAIRequestType['messages']): string {
  // Flatten messages to a single string for Responses API "input"
  // Keep roles as headings for minimal structure.
  return messages
    .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
    .join('\n\n');
}

function parseResponsesApiText(data: OpenAIResponsesApiResponse): string {
  // Try multiple shapes:
  // 1) output_text
  if (typeof data?.output_text === 'string' && data.output_text.length > 0) {
    return data.output_text;
  }
  // 2) output[0].content[*].text
  const contentItems = data?.output?.[0]?.content || [];
  const texts: string[] = contentItems
    .map((item) => item?.text ?? item?.content)
    .filter((t): t is string => typeof t === 'string');
  if (texts.length > 0) return texts.join('\n');
  // 3) choices like chat
  const choice = data?.choices?.[0]?.message?.content;
  if (typeof choice === 'string') return choice;
  return '';
}

function isModelNotFound(e: unknown): boolean {
  const err = e as AxiosError<OpenAIErrorResponse>;
  const status: number | undefined = err?.response?.status;
  const data: OpenAIErrorResponse | undefined = err?.response?.data;
  const code: string | undefined | null =
    data?.error?.code ?? data?.error?.type;
  return status === 404 || code === 'model_not_found';
}

const BACKUP_CHAT_MODEL = 'gpt-4o-mini';

function buildResponsesPayload(
  model: string,
  input: string | Array<{ role: string; content: string }>,
  opts: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    withJson?: boolean;
    dropSampling?: boolean;
  }
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    model,
    input,
  };
  if (!opts?.dropSampling && typeof opts?.temperature === 'number') {
    base.temperature = opts.temperature;
  }
  if (!opts?.dropSampling && typeof opts?.top_p === 'number') {
    base.top_p = opts.top_p;
  }
  if (opts?.withJson) {
    base.response_format = { type: 'json_object' };
  }
  if (typeof opts?.max_tokens === 'number') {
    base.max_output_tokens = opts.max_tokens;
  }
  return base;
}

export async function callOpenAI({
  messages,
  max_tokens = 400,
  temperature = 0.8,
  model = 'gpt-4o-mini',
  json = false,
  presence_penalty,
  frequency_penalty,
  top_p,
  strictModel,
}: OpenAIRequestType): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('OpenAI API Key is missing');

  const family = getModelFamily(model);

  let attempt = 0;
  let lastError: unknown = null;
  let usedBackup = false;
  let triedResponsesWithoutJson = false; // adaptive retry for responses models that reject response_format
  let triedStructuredInput = false; // adaptive retry for input shape
  let triedDropSampling = false; // adaptive retry: remove temperature/top_p

  while (attempt <= OPENAI_MAX_RETRIES) {
    try {
      if (family === 'chat' || usedBackup) {
        // Chat Completions API
        const res = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: usedBackup ? BACKUP_CHAT_MODEL : model,
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
        const text = res.data.choices?.[0]?.message?.content?.trim() ?? '';
        if (!text && !usedBackup && family === 'responses' && !strictModel) {
          usedBackup = true;
          continue;
        }
        return text;
      }

      // Responses API path
      const inputString = stringifyMessages(messages);
      const inputStructured = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const withJson = json && !triedResponsesWithoutJson;
      const useStructured = triedResponsesWithoutJson && !triedStructuredInput;
      const dropSampling =
        triedResponsesWithoutJson && triedStructuredInput && !triedDropSampling;

      const payload = buildResponsesPayload(
        model,
        useStructured ? inputStructured : inputString,
        {
          temperature,
          top_p,
          max_tokens,
          withJson,
          dropSampling,
        }
      );

      const res = await axios.post(
        'https://api.openai.com/v1/responses',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          timeout: OPENAI_TIMEOUT_MS,
        }
      );
      if (!res.data) throw new Error('Failed to fetch GPT (responses)');
      const text = (parseResponsesApiText(res.data) || '').trim();
      if (!text) {
        if (!strictModel) {
          usedBackup = true;
          continue;
        }
        throw new Error('empty_response_text');
      }
      return text;
    } catch (e) {
      lastError = e;
      const ax = e as AxiosError<OpenAIErrorResponse>;
      const status = ax?.response?.status;
      const errCode =
        ax?.response?.data?.error?.code || ax?.response?.data?.error?.type;
      const errMsg =
        ax?.response?.data?.error?.message || (ax as any)?.message || '';

      // Adaptive 1: drop response_format when 400 references json/response_format
      if (
        family === 'responses' &&
        json &&
        !triedResponsesWithoutJson &&
        status === 400 &&
        (String(errCode || '').includes('invalid') ||
          String(errMsg || '')
            .toLowerCase()
            .includes('response_format') ||
          String(errMsg || '')
            .toLowerCase()
            .includes('json'))
      ) {
        triedResponsesWithoutJson = true;
        continue;
      }

      // Adaptive 2: switch to structured input array
      if (family === 'responses' && !triedStructuredInput && status === 400) {
        triedStructuredInput = true;
        continue;
      }

      // Adaptive 3: drop sampling params (temperature/top_p)
      if (family === 'responses' && !triedDropSampling && status === 400) {
        triedDropSampling = true;
        continue;
      }

      // If responses family and model not found/4xx, transparently retry once with chat backup (when strictModel is false)
      if (!strictModel) {
        if (
          !usedBackup &&
          family === 'responses' &&
          (isModelNotFound(e) || !isTransientError(e))
        ) {
          usedBackup = true;
          continue;
        }
      }
      attempt += 1;
      if (attempt > OPENAI_MAX_RETRIES || !isTransientError(e)) break;
      await sleep(400 * attempt);
    }
  }
  const err = lastError as AxiosError | Error;
  const status = (err as AxiosError).response?.status;
  const dataStr = JSON.stringify(
    (err as AxiosError).response?.data || {}
  ).slice(0, 300);
  const code = (err as AxiosError).code || 'openai_request_failed';
  const msg =
    (err as Error).message ||
    `OpenAI request failed${status ? ` (status ${status})` : ''}`;
  throw new Error(`${code}: ${msg}; status=${status}; body=${dataStr}`);
}
