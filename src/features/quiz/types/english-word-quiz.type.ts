export type EnglishWordQuizStatusType = {
  status: 'loading' | 'error' | 'limit' | 'none';
  error?: unknown;
};
