import { FORTUNE_DISCLAIMER_TEXT } from '@/features/fortune/constants/fortune-notice.constant';
import type {
  FortuneAgeBlockedTextsType,
  FortuneConsentTextsType,
  FortuneDeclinedTextsType,
} from '@/features/fortune/types/fortune.type';

/**
 * 궁합 고정 문구 초안 (합니다체). CP-2 승인 전에는 화면에 연결하지 않는다.
 * 운세 승인 문구(fortune-notice.constant.ts)는 바꾸지 않고 재사용만 한다.
 * 상담전화 안내는 넣지 않는다. 작성 기록은 docs/compatibility/copy-log.md에만 둔다.
 */

/** 상시 면책에 더하는 궁합 문장 (확정 답변 15번) */
export const FORTUNE_COMPATIBILITY_DISCLAIMER_ADDITION =
  '띠와 별자리 궁합은 전통 이론과 대중 관례이며 과학적으로 검증되지 않았습니다.';

/** 상시 면책 전체: 운세 면책 + 궁합 추가 문장 */
export const FORTUNE_COMPATIBILITY_DISCLAIMER_TEXT = `${FORTUNE_DISCLAIMER_TEXT} ${FORTUNE_COMPATIBILITY_DISCLAIMER_ADDITION}`;

/** 입력 영역 위 안내: 입력 미저장과 상대방 정보 (확정 답변 Q-3, 합니다체) */
export const FORTUNE_COMPATIBILITY_PRIVACY_INPUT_NOTICE =
  '입력하는 정보는 상대방의 것입니다. 입력하기 전에 상대방에게 궁합 확인에 쓴다는 것을 알리고 동의를 받았는지 확인해 주시기 바랍니다. 입력한 정보는 서버로 전송되거나 저장되지 않습니다.';

/** 입력 영역 위 연령 안내 */
export const FORTUNE_COMPATIBILITY_AGE_INPUT_NOTICE =
  '궁합은 두 사람 모두 만 14세 이상일 때 이용하실 수 있습니다. 궁합은 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다.';

/** 결과 안 한 줄, 결과 하단 고지 */
export const FORTUNE_COMPATIBILITY_RESULT_NOTICE =
  '궁합 결과는 오락과 참고를 위한 것이며, 두 사람의 관계나 앞으로의 일을 판단하는 근거가 아닙니다.';

/** 이용 전 확인 화면. 항목 4개, 첫 항목은 두 사람 모두 */
export const FORTUNE_COMPATIBILITY_CONSENT_TEXTS: FortuneConsentTextsType = {
  title: '이용 전 확인해 주세요',
  intro:
    '궁합을 이용하시려면 아래 네 가지를 직접 확인해 주시기 바랍니다. 네 가지를 모두 확인하셔야 이용하실 수 있으며, 확인은 이용자의 선택에 따라 진행됩니다.',
  fieldsetLegend: '이용 전 확인 항목 네 가지',
  items: [
    '두 사람 모두 만 14세 이상입니다.',
    '궁합은 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택에 대한 책임은 이용자 본인에게 있음을 확인합니다.',
    '입력한 두 사람의 생년월일은 서버로 전송되거나 저장되지 않고 이 브라우저의 메모리에서만 사용됨을 확인합니다.',
    '상대방의 정보를 입력하는 경우 상대방에게 궁합 확인에 쓴다는 것을 알리고 정보주체의 동의를 받았음을 확인합니다.',
  ],
  storageNotice:
    '동의 여부와 동의한 안내문의 버전, 동의 시각만 이 탭에 저장되며, 탭을 닫으면 지워집니다. 두 사람의 생년월일은 저장되지 않습니다. 저장된 동의는 하단의 동의 다시 설정에서 지울 수 있습니다.',
  blockedNotice: '네 가지를 모두 확인해 주셔야 이용하실 수 있습니다.',
  grantButton: '동의하고 시작',
  declineButton: '동의하지 않음',
};

/** 이용 불가(동의 거부) 화면 */
export const FORTUNE_COMPATIBILITY_DECLINED_TEXTS: FortuneDeclinedTextsType = {
  title: '궁합을 이용하실 수 없습니다',
  body: '이용 안내에 동의하지 않으셔서 궁합을 보여 드릴 수 없습니다. 이 서비스는 두 사람 모두 만 14세 이상일 때 오락과 참고를 위해 이용하도록 만들어졌습니다. 마음이 바뀌시면 이용 전 확인 화면으로 돌아가실 수 있습니다.',
  backButton: '이용 전 확인 화면으로 돌아가기',
};

/** 연령 안내 화면. 두 사람 중 누가 해당하는지, 생년월일 값을 밝히지 않는다 */
export const FORTUNE_COMPATIBILITY_AGE_BLOCKED_TEXTS: FortuneAgeBlockedTextsType =
  {
    title: '연령 안내',
    body: '입력하신 생년월일을 기준으로 만 14세 미만이 포함되어 있어 궁합을 보여 드릴 수 없습니다. 이 서비스는 두 사람 모두 만 14세 이상일 때 이용하실 수 있습니다. 궁합은 오락과 참고를 위한 것이며, 결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다. 입력하신 내용은 저장되거나 전송되지 않습니다.',
    homeLinkLabel: '홈으로',
  };

/** 연결 링크 문구 */
export const FORTUNE_COMPATIBILITY_LINK_TEXTS = {
  /** 운세 페이지 → 궁합 */
  fromFortuneNotice: '두 사람의 관계는 따로 볼 수 있습니다.',
  fromFortuneLabel: '궁합 테스트 보기',
  /** 허브 → 각자의 띠·별자리 확인 */
  hubFinderNotice: '각자의 띠와 별자리가 궁금하면 먼저 확인해 볼 수 있습니다.',
  /** 띠 ↔ 별자리 궁합 연결 */
  crossNotice: '다른 방식의 궁합도 볼 수 있습니다.',
  ttiLabel: '띠 궁합 보기',
  starSignLabel: '별자리 궁합 보기',
} as const;
