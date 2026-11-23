import { describe, expect, test } from 'vitest';
import * as n from '@/features/fortune/constants/fortune-notice.constant';
import * as s from '@/features/fortune/constants/fortune-saju-notice.constant';

describe('AC-73, AC-37: 운세 고지 상수 원문 (글자 그대로)', () => {
  test('FORTUNE_SAJU_GLOSS 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_SAJU_GLOSS).toEqual(
      '사주(태어난 연·월·일·시로 세우는 네 기둥)'
    );
  });

  test('FORTUNE_DISCLAIMER_TEXT 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_DISCLAIMER_TEXT).toEqual(
      '본 운세 서비스는 오락 및 엔터테인먼트 목적으로 제공되며, 전문적인 법률·의학·재정적 조언을 대신할 수 없습니다.'
    );
  });

  test('FORTUNE_RESULT_DISCLAIMER_TEXT 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_RESULT_DISCLAIMER_TEXT).toEqual(
      '운세는 오락과 참고를 위한 콘텐츠이며, 결과는 앞날을 알려 주거나 어떤 결과를 약속하지 않습니다. 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있으며, 건강·법률·투자 등 중요한 결정은 전문가와 상담하시기 바랍니다.'
    );
  });

  test('FORTUNE_METHOD_A_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_METHOD_A_NOTICE).toEqual(
      '이 결과는 생년월일과 오늘 날짜를 바탕으로 서비스가 정한 규칙에 따라 문구를 고른 것이며, 사주(태어난 연·월·일·시로 세우는 네 기둥)를 계산한 결과가 아닙니다.'
    );
  });

  test('FORTUNE_METHOD_A_TTI_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_METHOD_A_TTI_NOTICE).toEqual(
      '이 결과는 띠와 오늘 날짜를 바탕으로 서비스가 정한 규칙에 따라 문구를 고른 것이며, 사주(태어난 연·월·일·시로 세우는 네 기둥)를 계산한 결과가 아닙니다. 같은 띠에는 같은 내용이 표시됩니다.'
    );
  });

  test('FORTUNE_METHOD_A_STAR_SIGN_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_METHOD_A_STAR_SIGN_NOTICE).toEqual(
      '이 결과는 별자리와 오늘 날짜를 바탕으로 서비스가 정한 규칙에 따라 문구를 고른 것이며, 사주(태어난 연·월·일·시로 세우는 네 기둥)를 계산한 결과가 아닙니다. 같은 별자리에는 같은 내용이 표시됩니다.'
    );
  });

  test('FORTUNE_METHOD_B_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_METHOD_B_NOTICE).toEqual(
      '만세력으로 구한 사주(태어난 연·월·일·시로 세우는 네 기둥)와 오늘의 일진을 비교해 서비스가 정한 해석 규칙으로 보여 드립니다. 해석은 학파와 서비스마다 다를 수 있습니다.'
    );
  });

  test('FORTUNE_SCORE_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_SCORE_NOTICE).toEqual(
      '점수는 서비스가 정한 규칙으로 만든 수치이며 정확도를 뜻하지 않습니다.'
    );
  });

  test('FORTUNE_PRIVACY_INPUT_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_PRIVACY_INPUT_NOTICE).toEqual(
      '입력하신 생년월일과 태어난 시간은 서버로 전송되거나 저장되지 않습니다. 이 화면을 벗어나면 사라집니다.'
    );
  });

  test('FORTUNE_AGE_INPUT_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_AGE_INPUT_NOTICE).toEqual(
      '운세는 만 14세 이상 이용자를 대상으로 합니다. 운세는 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다.'
    );
  });

  test('FORTUNE_CONSENT_TEXTS 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_CONSENT_TEXTS).toEqual({
      title: '이용 전 확인해 주세요',
      intro:
        '운세를 이용하시려면 아래 세 가지를 직접 확인해 주시기 바랍니다. 세 가지를 모두 확인하셔야 이용하실 수 있으며, 확인은 이용자의 선택에 따라 진행됩니다.',
      fieldsetLegend: '이용 전 확인 항목 세 가지',
      items: [
        '만 14세 이상입니다.',
        '운세는 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택에 대한 책임은 이용자 본인에게 있음을 확인합니다.',
        '입력한 생년월일은 서버로 전송되거나 저장되지 않고 이 브라우저의 메모리에서만 사용됨을 확인합니다.',
      ],
      storageNotice:
        '동의 여부와 동의한 안내문의 버전, 동의 시각만 이 탭에 저장되며, 탭을 닫으면 지워집니다. 생년월일은 저장되지 않습니다. 저장된 동의는 하단의 동의 다시 설정에서 지울 수 있습니다.',
      blockedNotice: '세 가지를 모두 확인해 주셔야 이용하실 수 있습니다.',
      grantButton: '동의하고 시작',
      declineButton: '동의하지 않음',
    });
  });

  test('FORTUNE_CONSENT_RESET_TEXTS 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_CONSENT_RESET_TEXTS).toEqual({
      button: '동의 다시 설정',
      description:
        '이 탭에 저장된 이용 동의를 지우고 이용 전 확인 화면으로 돌아갑니다.',
    });
  });

  test('FORTUNE_DECLINED_TEXTS 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_DECLINED_TEXTS).toEqual({
      title: '운세를 이용하실 수 없습니다',
      body: '이용 안내에 동의하지 않으셔서 운세를 보여 드릴 수 없습니다. 이 서비스는 만 14세 이상 이용자가 오락과 참고를 위해 이용하도록 만들어졌습니다. 마음이 바뀌시면 이용 전 확인 화면으로 돌아가실 수 있습니다.',
      backButton: '이용 전 확인 화면으로 돌아가기',
    });
  });

  test('FORTUNE_AGE_BLOCKED_TEXTS 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_AGE_BLOCKED_TEXTS).toEqual({
      title: '연령 안내',
      body: '입력하신 생년월일을 기준으로 만 14세 미만으로 확인되어 운세를 보여 드릴 수 없습니다. 이 서비스는 만 14세 이상 이용자를 대상으로 합니다. 운세는 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다. 입력하신 내용은 저장되거나 전송되지 않습니다.',
      homeLinkLabel: '홈으로',
    });
  });

  test('FORTUNE_CALC_BASIS_TTI 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_CALC_BASIS_TTI).toEqual(
      '이 서비스는 입춘 시각을 기준으로 띠를 나눕니다. 설날을 기준으로 하면 1월 하순~2월 중순에 태어난 분의 띠가 다를 수 있습니다.'
    );
  });

  test('FORTUNE_CALC_BASIS_STAR_SIGN 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_CALC_BASIS_STAR_SIGN).toEqual(
      '별자리는 태양의 위치로 정해져 해마다 바뀌는 날이 하루 정도 달라집니다. 별자리가 바뀌는 날에 태어난 분은 태어난 시각으로 판정합니다.'
    );
  });

  test('FORTUNE_TIME_UNKNOWN_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_TIME_UNKNOWN_NOTICE).toEqual(
      '태어난 시각을 모르시면 두 가지 결과를 모두 확인해 보시기 바랍니다.'
    );
  });

  test('FORTUNE_SEOLLAL_TEMPLATE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_SEOLLAL_TEMPLATE).toEqual(
      '설날을 기준으로 하면 {띠}로 보기도 합니다.'
    );
  });

  test('FORTUNE_DST_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_DST_NOTICE).toEqual(
      '출생 당시의 표준시와 서머타임 적용에 따라 태어난 시간의 계산 결과가 다를 수 있습니다.'
    );
  });

  test('FORTUNE_SUPPORTED_RANGE_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_SUPPORTED_RANGE_NOTICE).toEqual(
      '계산에 쓰는 절기 자료가 제공되는 기간에 맞춰 생년월일은 1920년 1월 1일부터 2028년 12월 31일까지 입력하실 수 있습니다.'
    );
  });

  test('FORTUNE_LEAP_MONTH_HINT_TEMPLATE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_LEAP_MONTH_HINT_TEMPLATE).toEqual(
      '음력 {연도}년 {월}월에는 윤달이 있습니다. 윤달에 태어나셨다면 윤달을 선택해 주시기 바랍니다.'
    );
  });

  test('FORTUNE_DETAIL_NOTICE_TITLE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_DETAIL_NOTICE_TITLE).toEqual('이용 안내');
  });

  test('FORTUNE_DETAIL_NOTICE_ITEMS 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_DETAIL_NOTICE_ITEMS).toEqual([
      '본 서비스는 오락과 참고 목적으로 제공됩니다.',
      '운세는 과학적으로 입증된 것이 아니며, 앞날을 알려 주거나 어떤 결과를 약속하지 않습니다.',
      '운세 결과는 참고용이며, 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다.',
      '건강, 법률, 투자, 심리 위기와 관련된 문제는 해당 분야 전문가와 상담하시기 바랍니다.',
      '운세 결과만으로 중요한 결정을 내리지 않으시기 바랍니다.',
      '본 서비스는 특정 운세 서비스나 역술인과 제휴·후원 관계가 없습니다.',
      '운세의 계산과 해석 기준은 학파와 서비스마다 다릅니다. 본 서비스의 기준은 계산 기준 안내에서 확인하실 수 있습니다.',
      '입력하신 생년월일과 태어난 시간은 서버로 전송되거나 저장되지 않습니다.',
      '본 서비스는 만 14세 이상 이용자를 대상으로 하며, 이용 전에 이용 조건을 확인하는 절차가 있습니다. 생년월일을 입력했을 때 만 14세 미만으로 확인되면 이용하실 수 없습니다.',
    ]);
  });

  test('FORTUNE_LOTTO_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_LOTTO_NOTICE).toEqual(
      '행운 숫자는 재미를 위한 오락용 표시이며, 로또 추첨 결과나 당첨 확률과 관계가 없습니다. 번호 생성기는 운세와 상관없이 번호를 무작위로 만듭니다. 복권은 만 19세 이상만 구매할 수 있으며, 무리하지 않는 범위에서 즐기시기 바랍니다.'
    );
  });

  test('FORTUNE_LOTTO_LINK_LABEL 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_LOTTO_LINK_LABEL).toEqual(
      '로또 번호 생성기 (무작위 생성)'
    );
  });

  test('FORTUNE_LOTTO_LINK_HREF 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_LOTTO_LINK_HREF).toEqual('/lotto/generator');
  });

  test('FORTUNE_DIFFERENT_BASIS_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_DIFFERENT_BASIS_NOTICE).toEqual(
      '띠별 운세는 같은 띠에게 같은 내용을 보여 드리며, 생년월일로 보는 오늘의 운세와 기준이 달라 점수와 문구가 다를 수 있습니다.'
    );
  });

  test('FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE).toEqual(
      '별자리 운세는 같은 별자리에게 같은 내용을 보여 드리며, 생년월일로 보는 오늘의 운세와 기준이 달라 점수와 문구가 다를 수 있습니다.'
    );
  });

  test('FORTUNE_FINDER_BASIS_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_FINDER_BASIS_NOTICE).toEqual(
      '생년월일은 내 띠를 찾는 데 쓰이며, 띠별 운세 문구는 누구에게나 같습니다.'
    );
  });

  test('FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE).toEqual(
      '생년월일은 내 별자리를 찾는 데 쓰이며, 별자리별 운세 문구는 누구에게나 같습니다.'
    );
  });

  test('FORTUNE_TODAY_LINK_LABEL 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_TODAY_LINK_LABEL).toEqual('생년월일로 보는 오늘의 운세');
  });

  test('FORTUNE_NOSCRIPT_NOTICE 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_NOSCRIPT_NOTICE).toEqual(
      '운세 이용에는 JavaScript가 필요합니다. 브라우저 설정에서 JavaScript를 켜 주시기 바랍니다.'
    );
  });

  test('FORTUNE_KST_LABEL 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_KST_LABEL).toEqual('한국 시간 기준');
  });

  test('FORTUNE_BIRTH_ERROR_MESSAGES 원문이 승인 문구와 같다', () => {
    expect(n.FORTUNE_BIRTH_ERROR_MESSAGES).toEqual({
      empty: '출생 연도, 월, 일을 모두 입력해 주시기 바랍니다.',
      'invalid-date':
        '달력에 없는 날짜입니다. 월과 일을 다시 확인해 주시기 바랍니다.',
      'before-min':
        '1920년 1월 1일부터 2028년 12월 31일 사이의 생년월일만 입력하실 수 있습니다.',
      'after-max':
        '1920년 1월 1일부터 2028년 12월 31일 사이의 생년월일만 입력하실 수 있습니다.',
      future: '오늘(한국 시간) 이후의 날짜는 입력하실 수 없습니다.',
      'lunar-no-leap':
        '입력하신 해의 그 달에는 윤달이 없습니다. 윤달 선택을 해제하거나 날짜를 다시 확인해 주시기 바랍니다.',
      'lunar-invalid-day':
        '음력으로 그 달에 없는 날입니다. 일을 다시 확인해 주시기 바랍니다.',
      'out-of-table':
        '이 날짜는 계산할 수 없습니다. 날짜를 다시 확인해 주시기 바랍니다.',
    });
  });
});

describe('AC-56: 사주 계산 기준 고지 원문 (글자 그대로)', () => {
  test('FORTUNE_SAJU_CALC_BASIS_PILLARS 원문이 승인 문구와 같다', () => {
    expect(s.FORTUNE_SAJU_CALC_BASIS_PILLARS).toEqual(
      '연주(태어난 해의 기둥)는 입춘 시각, 월주(태어난 달의 기둥)는 절기(입춘·경칩 등 달이 바뀌는 기준이 되는 날)가 드는 시각을 기준으로 나눕니다. 입춘이나 절기가 드는 날에 태어나셨는데 태어난 시간을 모르시면 두 경우를 함께 보여 드립니다.'
    );
  });

  test('FORTUNE_SAJU_CALC_BASIS_DAY_HOUR 원문이 승인 문구와 같다', () => {
    expect(s.FORTUNE_SAJU_CALC_BASIS_DAY_HOUR).toEqual(
      '일주(태어난 날의 기둥)는 한국 시간 자정에 바뀝니다. 시주(태어난 시간의 기둥)는 시계 시각으로 정하며 23:00부터 00:59까지를 자시로 봅니다. 23:00~23:59(야자시)에 태어나셨다면 일주는 태어난 날 그대로 두고, 시주의 천간만 다음 날 일주의 천간을 기준으로 구합니다.'
    );
  });

  test('FORTUNE_SAJU_CALC_BASIS_SCHOOLS 원문이 승인 문구와 같다', () => {
    expect(s.FORTUNE_SAJU_CALC_BASIS_SCHOOLS).toEqual(
      '23시대 출생을 처리하는 방식은 학설이 갈립니다. 23시에 일주를 다음 날로 바꾸는 방식(자시 통합)을 쓰는 만세력도 있지만 이 서비스는 그 방식을 쓰지 않으므로, 23시대에 태어나신 분은 다른 만세력과 일주나 시주가 다를 수 있습니다.'
    );
  });

  test('FORTUNE_SAJU_CALC_BASIS_ZI_START 원문이 승인 문구와 같다', () => {
    expect(s.FORTUNE_SAJU_CALC_BASIS_ZI_START).toEqual(
      '이 서비스는 자시를 시계 시각 23:00부터 봅니다. 23:30부터 보는 만세력도 있어, 시주가 바뀌는 시각의 앞뒤 30분 안에 태어나신 분은 결과가 다를 수 있습니다.'
    );
  });

  test('FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION 원문이 승인 문구와 같다', () => {
    expect(s.FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION).toEqual(
      '태어난 곳의 경도(동서 위치), 출생 당시의 표준시와 서머타임은 보정하지 않고 입력하신 시각 그대로 계산합니다. 1948~1961년과 1987~1988년에 태어나신 분께는 결과 화면에서 한 번 더 안내합니다.'
    );
  });

  test('FORTUNE_SAJU_CALC_BASIS_STATEMENT 원문이 승인 문구와 같다', () => {
    expect(s.FORTUNE_SAJU_CALC_BASIS_STATEMENT).toEqual(
      '계산과 해석의 기준은 학파마다 다르며, 위 내용은 이 서비스의 기준입니다.'
    );
  });

  test('FORTUNE_SAJU_TIME_UNKNOWN_NOTICE 원문이 승인 문구와 같다', () => {
    expect(s.FORTUNE_SAJU_TIME_UNKNOWN_NOTICE).toEqual(
      '태어난 시간을 모르시면 시주 없이 연·월·일 기둥만 보여 드립니다. 오늘의 사주 운세는 태어난 날의 천간(일간)으로 정하므로 시간을 모르셔도 볼 수 있습니다.'
    );
  });
});

describe('AC-56: 계산 기준 6항목의 필수 내용', () => {
  test('AC-56: 연주·월주 기준, 자정·23:00~23:59(야자시 한 번), 학설·자시 통합, 23:30 만세력, 경도·표준시·서머타임, 학파별 기준이 있다', () => {
    const [pillars, dayHour, schools, ziStart, noCorrection, statement] = [
      s.FORTUNE_SAJU_CALC_BASIS_PILLARS,
      s.FORTUNE_SAJU_CALC_BASIS_DAY_HOUR,
      s.FORTUNE_SAJU_CALC_BASIS_SCHOOLS,
      s.FORTUNE_SAJU_CALC_BASIS_ZI_START,
      s.FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION,
      s.FORTUNE_SAJU_CALC_BASIS_STATEMENT,
    ];
    expect(pillars).toContain('입춘');
    expect(pillars).toContain('절기');
    expect(dayHour).toContain('자정');
    expect(dayHour).toContain('23:00~23:59');
    expect(dayHour.split('야자시')).toHaveLength(2);
    expect(schools).toContain('학설');
    expect(schools).toContain('자시 통합');
    expect(schools).toContain('다를 수');
    expect(ziStart).toContain('23:00');
    expect(ziStart).toContain('23:30');
    for (const word of ['경도', '표준시', '서머타임']) {
      expect(noCorrection).toContain(word);
    }
    expect(statement).toContain('학파');
    expect(statement).toContain('이 서비스의 기준');
    expect(s.FORTUNE_SAJU_TIME_UNKNOWN_NOTICE).toContain('시주');
  });
});

describe('AC-31, AC-48, AC-68, AC-73: 고지 핵심 문구와 책임 표현', () => {
  test('AC-31: 입력 개인정보·연령 안내에 비전송·만 14세 이상·본인 책임 문구가 있다', () => {
    expect(n.FORTUNE_PRIVACY_INPUT_NOTICE).toContain(
      '서버로 전송되거나 저장되지 않습니다'
    );
    expect(n.FORTUNE_AGE_INPUT_NOTICE).toContain('만 14세 이상');
    expect(n.FORTUNE_AGE_INPUT_NOTICE).toContain('이용자 본인에게 있습니다');
  });

  test('AC-48: 상세 이용 안내에 만 14세 이상 대상 항목과 판단·선택 책임 항목이 있다', () => {
    const joined = n.FORTUNE_DETAIL_NOTICE_ITEMS.join('\n');
    expect(joined).toContain('만 14세 이상 이용자를 대상으로 하며');
    expect(joined).toContain('판단과 선택은 이용자 본인에게 있습니다');
  });

  test('AC-68: 확인 항목 세 개의 문장이 승인 문구와 같다', () => {
    const items = n.FORTUNE_CONSENT_TEXTS.items;
    expect(items).toHaveLength(3);
    expect(items[0]).toContain('만 14세 이상');
    expect(items[1]).toContain('책임은 이용자 본인에게 있음');
    expect(items[2]).toContain('서버로 전송되거나 저장되지 않고');
  });

  test('AC-73: 이용 동의 항목이 3개이고 동의가 법적 책임을 없앤다는 뜻으로 읽히는 표현이 없다', () => {
    const consent = n.FORTUNE_CONSENT_TEXTS;
    expect(consent.items).toHaveLength(3);
    const texts = [
      consent.title,
      consent.intro,
      consent.storageNotice,
      consent.blockedNotice,
      ...consent.items,
      ...Object.values(n.FORTUNE_DECLINED_TEXTS),
    ];
    for (const text of texts) {
      expect(text).not.toMatch(/면책|면제|책임을 지지|책임이 없|책임 없음/);
      expect(text).not.toMatch(/책임(이|을)? (면제|없)/);
    }
  });
});
