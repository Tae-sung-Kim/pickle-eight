export enum GPT_MODEL_ENUM {
  BASIC = 'gpt-5-nano',
  STANDARD = 'gpt-4o-mini',
  PLUS = 'gpt-4.1-mini',
  PREMIUM = 'gpt-5-mini',
}

export const GPT_MODEL_LABEL: Record<GPT_MODEL_ENUM, string> = {
  [GPT_MODEL_ENUM.BASIC]: 'BASIC',
  [GPT_MODEL_ENUM.STANDARD]: 'STANDARD',
  [GPT_MODEL_ENUM.PLUS]: 'PLUS',
  [GPT_MODEL_ENUM.PREMIUM]: 'PREMIUM',
} as const;

// Always use gpt-4o-mini
export const DEFAULT_GPT_MODEL: GPT_MODEL_ENUM = GPT_MODEL_ENUM.STANDARD;

// Credit cost per model (set all to 0 to disable spending)
export const GPT_MODEL_COST: Record<GPT_MODEL_ENUM, number> = {
  [GPT_MODEL_ENUM.BASIC]: 0,
  [GPT_MODEL_ENUM.STANDARD]: 0,
  [GPT_MODEL_ENUM.PLUS]: 0,
  [GPT_MODEL_ENUM.PREMIUM]: 0,
} as const;
