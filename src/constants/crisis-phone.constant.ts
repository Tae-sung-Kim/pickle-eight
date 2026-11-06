import type { CrisisPhoneType } from '@/types/crisis-phone.type';

/**
 * 상담전화 공용 상수 (타로·운세가 같이 쓴다).
 * 순서가 곧 화면 순서 = DOM 순서 = 탭 순서다. 바꾸지 않는다.
 * 출시 전에 다섯 번호와 24시간 운영 여부를 다시 확인한다.
 */
export const CRISIS_PHONES: readonly CrisisPhoneType[] = [
  {
    id: 'suicide-prevention',
    name: '자살예방 상담전화',
    number: '109',
    displayNumber: '109',
    href: 'tel:109',
    description: '자살 생각과 위기 상황 상담',
    showInCrisisPanel: true,
  },
  {
    id: 'mental-health-crisis',
    name: '정신건강위기상담전화',
    number: '1577-0199',
    displayNumber: '1577-0199',
    href: 'tel:15770199',
    description: '우울·불안 등 정신건강 위기 상담',
    showInCrisisPanel: true,
  },
  {
    id: 'life-line',
    name: '한국생명의전화',
    number: '1588-9191',
    displayNumber: '1588-9191',
    href: 'tel:15889191',
    description: '삶의 고민과 마음의 어려움 상담',
    showInCrisisPanel: true,
  },
  {
    id: 'youth',
    name: '청소년전화',
    number: '1388',
    displayNumber: '1388',
    href: 'tel:1388',
    description: '청소년의 고민과 위기 상담',
    showInCrisisPanel: false,
  },
  {
    id: 'women-emergency',
    name: '여성긴급전화',
    number: '1366',
    displayNumber: '1366',
    href: 'tel:1366',
    description: '가정폭력·성폭력 등 폭력 피해 상담',
    showInCrisisPanel: false,
  },
];

// 결과 하단 안내 첫 줄
export const CRISIS_RESULT_LINE =
  '마음이 많이 힘드시다면 혼자 견디지 마시고 아래 상담전화에서 이야기를 나눠 보시기 바랍니다. 모두 24시간 운영합니다.';
