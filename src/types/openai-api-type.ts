export type TodayMessageType = 'cheer' | 'fortune';

export type MessageStateType = {
  cheer: string | null;
  fortune: string | null;
};

export type OpenAIRequestType = {
  messages: { role: 'user' | 'system'; content: string }[];
  max_tokens?: number;
  temperature?: number;
};

export type OpenAIResponseType = {
  choices: {
    message: {
      content: string;
    };
  }[];
};
