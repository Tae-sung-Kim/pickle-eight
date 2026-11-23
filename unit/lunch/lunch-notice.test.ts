import { describe, expect, test } from 'vitest';
import { LUNCH_COPY_ALLOWED_SENTENCES } from '@/features/lunch/constants/lunch-copy-rule.constant';
import {
  LUNCH_DISCLAIMER_TEXT,
  LUNCH_EXTERNAL_LINK_NOTICE_TEXT,
  LUNCH_NO_REWARD_NOTICE_TEXT,
  LUNCH_RANDOM_NOTICE_TEXT,
  LUNCH_RESULT_NOTICE_TEXT,
} from '@/features/lunch/constants/lunch-notice.constant';

describe('AC-6: 점심 메뉴 고지 원문 고정', () => {
  test('AC-6: LUNCH_DISCLAIMER_TEXT', () => {
    expect(LUNCH_DISCLAIMER_TEXT).toBe(
      '본 서비스는 오락 목적으로 제공되며, 메뉴 선택 결과나 식당의 영업 여부를 보장하지 않습니다.'
    );
  });

  test('AC-6: LUNCH_NO_REWARD_NOTICE_TEXT', () => {
    expect(LUNCH_NO_REWARD_NOTICE_TEXT).toBe(
      '룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다.'
    );
  });

  test('AC-6: LUNCH_EXTERNAL_LINK_NOTICE_TEXT', () => {
    expect(LUNCH_EXTERNAL_LINK_NOTICE_TEXT).toBe(
      '지도 검색 페이지는 카카오·네이버·구글이 각각 운영하는 외부 사이트이며 새 탭에서 열립니다. 이동 후에는 해당 사이트의 정책이 적용되고, 검색어로는 메뉴 이름만 전달됩니다. 검색 결과와 영업 정보는 해당 서비스 기준입니다.'
    );
  });

  test('고지 5문장이 허용 문장 목록과 정확히 같다', () => {
    const five = [
      LUNCH_DISCLAIMER_TEXT,
      LUNCH_RANDOM_NOTICE_TEXT,
      LUNCH_NO_REWARD_NOTICE_TEXT,
      LUNCH_EXTERNAL_LINK_NOTICE_TEXT,
      LUNCH_RESULT_NOTICE_TEXT,
    ];
    expect(LUNCH_COPY_ALLOWED_SENTENCES).toHaveLength(5);
    expect(new Set(five).size).toBe(5);
    expect(new Set(LUNCH_COPY_ALLOWED_SENTENCES)).toEqual(new Set(five));
  });
});
