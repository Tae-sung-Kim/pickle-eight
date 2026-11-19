import type { DreamCategoryType } from '@/features/dream/types/dream.type';

/** 카테고리 7개. 배열 순서가 허브 표시 순서이자 DREAM_TOPICS 합본 순서다 */
export const DREAM_CATEGORIES = [
  { key: 'animal', label: '동물' },
  { key: 'people', label: '사람·관계' },
  { key: 'body', label: '신체' },
  { key: 'nature', label: '자연·날씨' },
  { key: 'action', label: '행동·상황' },
  { key: 'object', label: '사물·장소·재물' },
  { key: 'death', label: '죽음·사고' },
] as const satisfies readonly DreamCategoryType[];
