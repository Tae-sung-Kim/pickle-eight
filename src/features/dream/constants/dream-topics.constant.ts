import { DREAM_ACTION_TOPICS } from '@/features/dream/constants/topics/action.constant';
import { DREAM_ANIMAL_TOPICS } from '@/features/dream/constants/topics/animal.constant';
import { DREAM_BODY_TOPICS } from '@/features/dream/constants/topics/body.constant';
import { DREAM_DEATH_TOPICS } from '@/features/dream/constants/topics/death.constant';
import { DREAM_NATURE_TOPICS } from '@/features/dream/constants/topics/nature.constant';
import { DREAM_OBJECT_TOPICS } from '@/features/dream/constants/topics/object.constant';
import { DREAM_PEOPLE_TOPICS } from '@/features/dream/constants/topics/people.constant';
import type { DreamTopicType } from '@/features/dream/types/dream.type';

/** 서버 전용. DREAM_CATEGORIES 순서(동물, 사람·관계, 신체, 자연·날씨, 행동·상황, 사물·장소·재물, 죽음·사고)로 합친다 */
export const DREAM_TOPICS: readonly DreamTopicType[] = [
  ...DREAM_ANIMAL_TOPICS,
  ...DREAM_PEOPLE_TOPICS,
  ...DREAM_BODY_TOPICS,
  ...DREAM_NATURE_TOPICS,
  ...DREAM_ACTION_TOPICS,
  ...DREAM_OBJECT_TOPICS,
  ...DREAM_DEATH_TOPICS,
];

/** 목표 소재 수. 데이터 검사(AC-42)가 DREAM_TOPICS.length와 비교한다 */
export const DREAM_TOPIC_COUNT = 120;
