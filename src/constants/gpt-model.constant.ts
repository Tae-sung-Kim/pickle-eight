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

export const DEFAULT_GPT_MODEL: GPT_MODEL_ENUM = GPT_MODEL_ENUM.BASIC;

// Credit cost per model (0 means free)
export const GPT_MODEL_COST: Record<GPT_MODEL_ENUM, number> = {
  [GPT_MODEL_ENUM.BASIC]: 0,
  [GPT_MODEL_ENUM.STANDARD]: 1,
  [GPT_MODEL_ENUM.PLUS]: 3,
  [GPT_MODEL_ENUM.PREMIUM]: 5,
} as const;
