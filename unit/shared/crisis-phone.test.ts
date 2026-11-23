import { describe, expect, test } from 'vitest';
import {
  CRISIS_PHONES,
  CRISIS_RESULT_LINE,
} from '@/constants/crisis-phone.constant';

describe('AC-6: 상담전화 원문 고정', () => {
  test('AC-6: 상담전화는 5개이고 name·number·href·순서가 같다', () => {
    expect(
      CRISIS_PHONES.map((p) => ({
        name: p.name,
        number: p.number,
        href: p.href,
      }))
    ).toEqual([
      { name: '자살예방 상담전화', number: '109', href: 'tel:109' },
      {
        name: '정신건강위기상담전화',
        number: '1577-0199',
        href: 'tel:15770199',
      },
      { name: '한국생명의전화', number: '1588-9191', href: 'tel:15889191' },
      { name: '청소년전화', number: '1388', href: 'tel:1388' },
      { name: '여성긴급전화', number: '1366', href: 'tel:1366' },
    ]);
  });

  test('AC-6: href는 number에서 하이픈만 뺀 tel 링크다', () => {
    for (const p of CRISIS_PHONES) {
      expect(p.href).toBe(`tel:${p.number.replace(/-/g, '')}`);
    }
  });

  test('AC-6: CRISIS_RESULT_LINE 원문', () => {
    expect(CRISIS_RESULT_LINE).toBe(
      '마음이 많이 힘드시다면 혼자 견디지 마시고 아래 상담전화에서 이야기를 나눠 보시기 바랍니다. 모두 24시간 운영합니다.'
    );
  });
});
