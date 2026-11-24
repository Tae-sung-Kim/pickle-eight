import {
  MEAL_AREA_ALLOWED_PATTERN,
  MEAL_AREA_MAX_DIGIT_RUN,
  MEAL_AREA_MAX_DIGIT_TOTAL,
  MEAL_AREA_MAX_LENGTH,
} from '@/features/meal/constants/meal-area.constant';
import type { MealAreaInputResultType } from '@/features/meal/types/meal.type';

/** 전화번호나 상세 번지처럼 보이는 숫자 입력인지 검사 */
function hasTooManyDigits(value: string): boolean {
  const total = (value.match(/\d/g) ?? []).length;
  const longestRun = Math.max(
    0,
    ...(value.match(/\d+/g) ?? []).map((run) => run.length)
  );
  return (
    total > MEAL_AREA_MAX_DIGIT_TOTAL || longestRun > MEAL_AREA_MAX_DIGIT_RUN
  );
}

/** 동네 이름 입력 검사. 순수 함수. 순서: NFC, 공백 정리, 빈 값, 문자, 길이 */
export function parseMealAreaInput(raw: string): MealAreaInputResultType {
  const value = raw.normalize('NFC').replace(/\s+/g, ' ').trim();

  if (value === '') {
    return { status: 'empty' };
  }
  if (!MEAL_AREA_ALLOWED_PATTERN.test(value)) {
    return { status: 'invalid', reason: 'invalid_char' };
  }
  if (Array.from(value).length > MEAL_AREA_MAX_LENGTH) {
    return { status: 'invalid', reason: 'too_long' };
  }
  if (hasTooManyDigits(value)) {
    return { status: 'invalid', reason: 'too_many_digits' };
  }
  return { status: 'valid', value };
}
