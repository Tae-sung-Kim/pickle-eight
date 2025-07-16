export type TodayMessageType = 'fortune' | 'cheer';

export type MessageStateType = {
  cheer: string | null;
  fortune: string | null;
};

export interface OpenAIRequestType {
  messages: { role: 'user' | 'system'; content: string }[];
  max_tokens?: number;
  temperature?: number;
  model?: string;
  json?: boolean;
  response_format?: { type: 'json_object' };
}

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
};

export type GptEnglishWordQuizResponse = {
  quiz: string;
  options: string[];
  answer: string;
  explanation: string;
};
