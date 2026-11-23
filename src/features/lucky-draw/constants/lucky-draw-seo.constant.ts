import type {
  LuckyDrawPageKeyType,
  LuckyDrawSeoType,
} from '../types/lucky-draw.type';
import {
  LUCKY_DRAW_HUB_PATH,
  LUCKY_DRAW_TOOL_PATHS,
} from './lucky-draw-route.constant';

export const LUCKY_DRAW_BREADCRUMB_GROUP = {
  name: '운빨 뽑기',
  pathname: LUCKY_DRAW_HUB_PATH,
} as const;

/** 루트 레이아웃 category("로또" 포함)를 덮어쓰는 값 */
export const LUCKY_DRAW_METADATA_CATEGORY = '엔터테인먼트, 운빨 뽑기';

export const LUCKY_DRAW_HUB_SEO: LuckyDrawSeoType = {
  title: '운빨 뽑기 - 사다리 타기, 돌림판, 제비뽑기',
  description:
    '사다리 타기, 돌림판, 제비뽑기로 당번과 순서, 고를 항목을 무작위로 정해 보는 오락 목적의 도구입니다. 입력한 이름은 저장하지 않으며 결과는 보장하지 않습니다.',
  pathname: LUCKY_DRAW_HUB_PATH,
  keywords: ['운빨 뽑기', '랜덤 뽑기 도구'],
  ogImageAlt: '운빨 뽑기 안내 이미지',
  heading: '운빨 뽑기',
  headerDescription:
    '사다리 타기, 돌림판, 제비뽑기로 짝과 항목, 뽑을 카드를 무작위로 정해 보세요.',
  breadcrumbName: '운빨 뽑기',
};

export const LUCKY_DRAW_LADDER_SEO: LuckyDrawSeoType = {
  title: '사다리 타기 - 온라인 사다리 게임으로 당번 정하기',
  description:
    '참가자와 결과를 줄마다 입력하면 사다리를 그려 이름별 결과를 따라가 보는 오락 목적의 사다리 게임입니다. 2명부터 10명까지 할 수 있으며 결과는 보장하지 않습니다.',
  pathname: LUCKY_DRAW_TOOL_PATHS.ladder,
  keywords: [
    '사다리타기',
    '사다리 게임',
    '사다리타기 온라인',
    '사다리 타기 당번',
    '당번 정하기',
  ],
  ogImageAlt: '사다리 타기 안내 이미지',
  heading: '사다리 타기',
  headerDescription:
    '참가자와 결과를 줄마다 넣으면 사다리를 그려 이름별 결과를 따라가 볼 수 있어요.',
  breadcrumbName: '사다리 타기',
};

export const LUCKY_DRAW_ROULETTE_SEO: LuckyDrawSeoType = {
  title: '돌림판 - 항목을 넣고 돌리는 랜덤 돌림판',
  description:
    '항목을 28개까지 넣고 같은 크기의 칸으로 나뉜 돌림판을 돌려 하나를 고르는 오락 목적의 도구입니다. 뽑힌 항목을 빼고 다시 돌릴 수 있으며 결과는 보장하지 않습니다.',
  pathname: LUCKY_DRAW_TOOL_PATHS.roulette,
  keywords: ['돌림판', '돌림판 돌리기', '랜덤 돌림판'],
  ogImageAlt: '돌림판 안내 이미지',
  heading: '돌림판',
  headerDescription:
    '항목을 넣고 같은 크기의 칸으로 나뉜 돌림판을 돌려 하나를 골라 보세요.',
  breadcrumbName: '돌림판',
};

export const LUCKY_DRAW_LOTS_SEO: LuckyDrawSeoType = {
  title: '제비뽑기 - 뒷면 카드를 한 장씩 여는 카드 뽑기',
  description:
    '항목을 30개까지 넣으면 뒷면 카드로 섞어 두고 한 장씩 열어 보는 오락 목적의 제비뽑기입니다. 결과는 보장하지 않습니다.',
  pathname: LUCKY_DRAW_TOOL_PATHS.lots,
  keywords: ['제비뽑기', '카드 뽑기', '랜덤 뽑기'],
  ogImageAlt: '제비뽑기 안내 이미지',
  heading: '제비뽑기',
  headerDescription:
    '항목을 넣으면 뒷면 카드가 섞여 놓이고, 카드를 한 장씩 열어 항목을 뽑아요.',
  breadcrumbName: '제비뽑기',
};

export const LUCKY_DRAW_SEO: Readonly<
  Record<LuckyDrawPageKeyType, LuckyDrawSeoType>
> = {
  hub: LUCKY_DRAW_HUB_SEO,
  ladder: LUCKY_DRAW_LADDER_SEO,
  roulette: LUCKY_DRAW_ROULETTE_SEO,
  lots: LUCKY_DRAW_LOTS_SEO,
};
