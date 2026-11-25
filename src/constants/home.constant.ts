import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { SITE_NAME } from '@/lib/seo';

export const HOME_TITLE = `${SITE_NAME} - 오늘의 운세·메뉴·뽑기 도구 모음`;

export const HOME_DESCRIPTION =
  '오늘의 운세, 오늘 뭐 먹지, 타로, 운빨 뽑기, 꿈 해몽을 무료로 가볍게 즐겨 보세요. 로또 번호 만들기와 당첨 결과 확인도 할 수 있습니다.';

export const HOME_HERO_DESCRIPTION =
  '오늘의 운세와 메뉴 고르기, 타로, 뽑기까지. 가볍게 즐기는 도구 모음입니다.';

export const HOME_GROUP_DESCRIPTIONS: Readonly<
  Record<MENU_GROUP_NAME_ENUM, string>
> = {
  [MENU_GROUP_NAME_ENUM.FORTUNE]:
    '생년월일로 보는 오늘의 운세, 띠별·별자리 운세, 궁합',
  [MENU_GROUP_NAME_ENUM.MEAL]: '아침·점심·저녁 메뉴를 룰렛으로 골라 보기',
  [MENU_GROUP_NAME_ENUM.TAROT]: '카드 한 장 또는 세 장으로 보는 오늘의 흐름',
  [MENU_GROUP_NAME_ENUM.LUCKY_DRAW]:
    '사다리 타기, 돌림판, 제비뽑기로 순서와 당번 정하기',
  [MENU_GROUP_NAME_ENUM.DREAM]: '꿈에 나온 소재로 찾아보는 민간 풀이 사전',
  [MENU_GROUP_NAME_ENUM.NO_SON_DAYS]:
    '음력 끝자리 9·0일, 손 없는 날을 양력 달력으로 보기',
  [MENU_GROUP_NAME_ENUM.LOTTO]: '로또 번호 만들기, 회차별 당첨 결과, 번호 채점',
};
