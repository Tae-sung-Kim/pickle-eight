import { describe, expect, test } from 'vitest';
import {
  DREAM_CRISIS_PANEL_STORAGE_NOTICE,
  DREAM_DETAIL_NOTICE_ITEMS,
  DREAM_DISCLAIMER_TEXT,
  DREAM_SEARCH_NOTICE,
} from '@/features/dream/constants/dream-notice.constant';

describe('AC-6: 꿈 해몽 고지 원문 고정', () => {
  test('AC-6: DREAM_DISCLAIMER_TEXT', () => {
    expect(DREAM_DISCLAIMER_TEXT).toBe(
      '본 꿈 해몽 서비스는 오락과 자기 성찰을 위한 민간 풀이 콘텐츠입니다. 꿈의 내용이 현실의 일을 예측하거나 보장하지 않으며, 풀이를 근거로 중요한 결정을 내리지 않으시기 바랍니다.'
    );
  });

  test('AC-6: DREAM_SEARCH_NOTICE', () => {
    expect(DREAM_SEARCH_NOTICE).toBe(
      '소재 이름만 입력해 주시기 바랍니다. 꿈 내용이나 개인적인 이야기는 적지 않으시기 바랍니다. 입력한 검색어는 서버로 보내거나 저장하지 않습니다.'
    );
  });

  test('AC-6: DREAM_CRISIS_PANEL_STORAGE_NOTICE', () => {
    expect(DREAM_CRISIS_PANEL_STORAGE_NOTICE).toBe(
      '입력한 검색어는 저장되거나 전송되지 않습니다.'
    );
  });

  test('AC-6: DREAM_DETAIL_NOTICE_ITEMS 2항 (text-slim 2단계 D-10~D-13 삭제)', () => {
    expect([...DREAM_DETAIL_NOTICE_ITEMS]).toEqual([
      '꿈의 내용이 현실의 일을 예측하거나 보장하지 않습니다.',
      '건강, 수면, 정신건강, 법률, 재정과 관련된 고민은 전문가와 상담하시기 바랍니다.',
    ]);
  });
});
