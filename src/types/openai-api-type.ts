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
