import {
  FORTUNE_MAX_BIRTH,
  FORTUNE_MIN_BIRTH,
} from '@/features/fortune/constants/fortune-input.constant';
import type {
  FortuneBirthErrorType,
  FortuneBirthInputType,
  FortuneBirthResolvedType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import {
  compareYmd,
  isValidSolarDate,
} from '@/features/fortune/utils/fortune-date.util';
import { convertLunarToSolar } from '@/features/fortune/utils/fortune-lunar.util';

function fail(error: FortuneBirthErrorType): FortuneBirthResolvedType {
  return { ok: false, error };
}

function isFilledNumber(value: number | undefined): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * 폼 값 → 양력 날짜. 순서: 빈 값 → (음력이면 변환, 양력이면 날짜 유효성)
 * → 1920-01-01 이전 → 2028-12-31 이후 → KST 오늘 이후.
 * 연령 판정은 하지 않는다(호출부가 calculateFortuneManAge로 한다).
 * calendar가 없으면 양력으로 본다. 오류에는 입력값을 담지 않는다
 */
export function resolveFortuneBirth(
  input: Partial<FortuneBirthInputType>,
  today: FortuneYmdType
): FortuneBirthResolvedType {
  const { year, month, day } = input;
  if (!isFilledNumber(year) || !isFilledNumber(month) || !isFilledNumber(day)) {
    return fail('empty');
  }

  let solar: FortuneYmdType;
  let isFromLunar = false;
  if (input.calendar === 'lunar') {
    const converted = convertLunarToSolar(
      year,
      month,
      day,
      input.isLeapMonth === true
    );
    if (!converted.ok) {
      return converted;
    }
    solar = converted.solar;
    isFromLunar = true;
  } else {
    solar = { year, month, day };
    if (!isValidSolarDate(solar)) {
      return fail('invalid-date');
    }
  }

  if (compareYmd(solar, FORTUNE_MIN_BIRTH) < 0) {
    return fail('before-min');
  }
  if (compareYmd(solar, FORTUNE_MAX_BIRTH) > 0) {
    return fail('after-max');
  }
  if (compareYmd(solar, today) > 0) {
    return fail('future');
  }
  return { ok: true, solar, isFromLunar };
}
