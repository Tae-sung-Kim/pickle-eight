import { describe, expect, test } from 'vitest';
import { MEAL_COPY_ALLOWED_SENTENCES } from '@/features/meal/constants/meal-copy-rule.constant';
import {
  MEAL_DISCLAIMER_TEXT,
  MEAL_EXTERNAL_LINK_NOTICE_TEXT,
  MEAL_NO_REWARD_NOTICE_TEXT,
  MEAL_RANDOM_NOTICE_TEXT,
  MEAL_RESULT_NOTICE_TEXT,
} from '@/features/meal/constants/meal-notice.constant';

// 원문은 상수를 import하지 않고 리터럴로 비교한다
const DISCLAIMER =
  '본 서비스는 오락 목적으로 제공되며, 메뉴 선택 결과나 식당의 영업 여부를 보장하지 않습니다.';
const RANDOM =
  '결과는 무작위로 정해지며, 날씨 반영을 켜면 날씨에 따라 뽑힐 확률이 조금 달라집니다. 특정 메뉴나 식당을 평가하지 않습니다.';
const NO_REWARD =
  '룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다.';
const EXTERNAL =
  '지도 검색 페이지는 카카오·네이버·구글이 각각 운영하는 외부 사이트이며 새 탭에서 열립니다. 이동 후에는 해당 사이트의 정책이 적용되고, 검색어로는 뽑힌 메뉴 이름과 적은 경우 동네 이름만 전달됩니다. 검색 결과와 영업 정보는 해당 서비스 기준입니다.';
const RESULT =
  '이 결과는 날씨에 따라 확률이 조금 달라지는 오락 목적의 무작위 뽑기이며, 특정 메뉴나 식당을 평가하지 않습니다.';

describe('AC-6: 메뉴 룰렛 고지 원문 고정', () => {
  test('고지 5문장 원문', () => {
    expect(MEAL_DISCLAIMER_TEXT).toBe(DISCLAIMER);
    expect(MEAL_RANDOM_NOTICE_TEXT).toBe(RANDOM);
    expect(MEAL_NO_REWARD_NOTICE_TEXT).toBe(NO_REWARD);
    expect(MEAL_EXTERNAL_LINK_NOTICE_TEXT).toBe(EXTERNAL);
    expect(MEAL_RESULT_NOTICE_TEXT).toBe(RESULT);
  });

  test('고지 5문장이 허용 문장 목록과 정확히 같다', () => {
    const five = [DISCLAIMER, RANDOM, NO_REWARD, EXTERNAL, RESULT];
    expect(MEAL_COPY_ALLOWED_SENTENCES).toHaveLength(5);
    expect(new Set(five).size).toBe(5);
    expect(new Set(MEAL_COPY_ALLOWED_SENTENCES)).toEqual(new Set(five));
  });
});
