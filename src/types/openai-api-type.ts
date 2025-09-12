import { GPT_MODEL_ENUM } from '@/constants';

export type MessageStateType = {
  cheer: string | null;
  fortune: string | null;
  todo: string | null;
  menu: string | null;
};

export type OpenAIRequestType = {
  messages: { role: 'user' | 'system'; content: string }[];
  max_tokens?: number;
  temperature?: number;
  model?: string;
  json?: boolean;
  response_format?: { type: 'json_object' };
  // added optional knobs for better control
  presence_penalty?: number;
  frequency_penalty?: number;
  top_p?: number;
  // when true, do not fallback/translate model families behind the scenes
  strictModel?: boolean;
};

export type OpenAIResponseType = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

export type GptTodayMessageResponse = {
  fortune: string;
  cheer: string;
  todo: string;
  menu: string;
};

export type GptEnglishWordQuizResponse = {
  quiz: string;
  options: string[];
  answer: string;
  explanation: string;
};

// Responses API minimal parse shapes
export type ResponsesApiOutputContentItem = {
  text?: string;
  content?: string;
};

export type ResponsesApiOutputItem = {
  content?: ResponsesApiOutputContentItem[];
};

export type OpenAIResponsesApiResponse = {
  output_text?: string;
  output?: ResponsesApiOutputItem[];
  choices?: { message?: { content?: string } }[];
};

// Explicit error shape returned by OpenAI
export type OpenAIErrorResponse = {
  error?: {
    message?: string;
    type?: string; // e.g., 'invalid_request_error'
    code?: string | null; // e.g., 'model_not_found'
    param?: string | null;
  };
};

export type GptModelSelectButtonType = {
  readonly model: string;
  readonly onModelChange: (model: string) => void;
  readonly onProceed: () => void;
  readonly isBusy?: boolean;
  readonly className?: string;
  readonly triggerSize?: 'sm' | 'default';
  readonly buttonLabel?: string; // base label; will be decorated with credit cost if paid
  readonly allowed?: readonly GPT_MODEL_ENUM[]; // limit options if provided
};
