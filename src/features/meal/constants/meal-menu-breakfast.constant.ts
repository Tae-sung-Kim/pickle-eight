import type {
  MealBreakfastCategoryKeyType,
  MealMenuType,
} from '@/features/meal/types/meal.type';

/**
 * 아침·브런치 메뉴 44개. 배열 순서가 돌림판 칸 순서다. 렌더링 중에 섞지 않는다.
 * 국물 기준: 주 요리가 국물에 담겨 나오고 국물을 떠먹으면 soup, 그 밖은 dry.
 * 죽은 dry, 수프는 soup으로 둔다.
 */
export const MEAL_BREAKFAST_MENUS = [
  // 한식
  { id: 'miyeokguk', name: '미역국', category: 'korean', broth: 'soup' },
  {
    id: 'sogogi-mutguk',
    name: '소고기뭇국',
    category: 'korean',
    broth: 'soup',
  },
  { id: 'gyeran-guk', name: '계란국', category: 'korean', broth: 'soup' },
  {
    id: 'doenjang-jjigae',
    name: '된장찌개',
    category: 'korean',
    broth: 'soup',
  },
  {
    id: 'sundubu-jjigae',
    name: '순두부찌개',
    category: 'korean',
    broth: 'soup',
  },
  { id: 'nurungji', name: '누룽지', category: 'korean', broth: 'dry' },
  {
    id: 'kimchi-bokkeumbap',
    name: '김치볶음밥',
    category: 'korean',
    broth: 'dry',
  },
  { id: 'bibimbap', name: '비빔밥', category: 'korean', broth: 'dry' },
  // 죽·수프
  { id: 'jeonbok-juk', name: '전복죽', category: 'porridge', broth: 'dry' },
  { id: 'hobak-juk', name: '호박죽', category: 'porridge', broth: 'dry' },
  { id: 'yachae-juk', name: '야채죽', category: 'porridge', broth: 'dry' },
  { id: 'pat-juk', name: '팥죽', category: 'porridge', broth: 'dry' },
  {
    id: 'mushroom-soup',
    name: '양송이수프',
    category: 'porridge',
    broth: 'soup',
  },
  { id: 'potato-soup', name: '감자수프', category: 'porridge', broth: 'soup' },
  // 빵·토스트
  { id: 'toast', name: '토스트', category: 'bread', broth: 'dry' },
  { id: 'french-toast', name: '프렌치토스트', category: 'bread', broth: 'dry' },
  { id: 'bagel', name: '베이글', category: 'bread', broth: 'dry' },
  { id: 'croissant', name: '크루아상', category: 'bread', broth: 'dry' },
  { id: 'waffle', name: '와플', category: 'bread', broth: 'dry' },
  { id: 'pancake', name: '팬케이크', category: 'bread', broth: 'dry' },
  { id: 'scone', name: '스콘', category: 'bread', broth: 'dry' },
  {
    id: 'avocado-toast',
    name: '아보카도 토스트',
    category: 'bread',
    broth: 'dry',
  },
  // 샌드위치
  {
    id: 'ham-cheese-sandwich',
    name: '햄치즈 샌드위치',
    category: 'sandwich',
    broth: 'dry',
  },
  {
    id: 'egg-sandwich',
    name: '에그 샌드위치',
    category: 'sandwich',
    broth: 'dry',
  },
  { id: 'panini', name: '파니니', category: 'sandwich', broth: 'dry' },
  {
    id: 'english-muffin',
    name: '잉글리시 머핀',
    category: 'sandwich',
    broth: 'dry',
  },
  { id: 'burrito', name: '부리토', category: 'sandwich', broth: 'dry' },
  { id: 'hot-dog', name: '핫도그', category: 'sandwich', broth: 'dry' },
  // 브런치 요리
  { id: 'omelette', name: '오믈렛', category: 'brunch', broth: 'dry' },
  {
    id: 'eggs-benedict',
    name: '에그 베네딕트',
    category: 'brunch',
    broth: 'dry',
  },
  {
    id: 'scrambled-eggs',
    name: '스크램블드에그',
    category: 'brunch',
    broth: 'dry',
  },
  { id: 'shakshuka', name: '샥슈카', category: 'brunch', broth: 'dry' },
  { id: 'frittata', name: '프리타타', category: 'brunch', broth: 'dry' },
  { id: 'quiche', name: '키시', category: 'brunch', broth: 'dry' },
  { id: 'hash-brown', name: '해시브라운', category: 'brunch', broth: 'dry' },
  // 간편식
  { id: 'gimbap', name: '김밥', category: 'quick', broth: 'dry' },
  { id: 'jumeokbap', name: '주먹밥', category: 'quick', broth: 'dry' },
  { id: 'yubu-chobap', name: '유부초밥', category: 'quick', broth: 'dry' },
  { id: 'cup-bap', name: '컵밥', category: 'quick', broth: 'dry' },
  { id: 'cereal', name: '시리얼', category: 'quick', broth: 'dry' },
  { id: 'tteok', name: '떡', category: 'quick', broth: 'dry' },
  { id: 'goguma', name: '군고구마', category: 'quick', broth: 'dry' },
  { id: 'yogurt-bowl', name: '요거트볼', category: 'quick', broth: 'dry' },
  { id: 'oatmeal', name: '오트밀', category: 'quick', broth: 'dry' },
] as const satisfies readonly MealMenuType<MealBreakfastCategoryKeyType>[];
