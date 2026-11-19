import type { LunchMenuType } from '@/features/lunch/types/lunch.type';

/**
 * 점심 메뉴 48개. 배열 순서가 돌림판 칸 순서다. 렌더링 중에 섞지 않는다.
 * 국물 기준: 주 요리가 국물에 담겨 나오고 국물을 떠먹으면 soup, 그 밖은 dry.
 * mapQuery는 1차에 쓰지 않는다(이름으로 검색).
 */
export const LUNCH_MENUS = [
  // 한식
  { id: 'kimchi-jjigae', name: '김치찌개', category: 'korean', broth: 'soup' },
  {
    id: 'doenjang-jjigae',
    name: '된장찌개',
    category: 'korean',
    broth: 'soup',
  },
  { id: 'sundaeguk', name: '순대국', category: 'korean', broth: 'soup' },
  { id: 'seolleongtang', name: '설렁탕', category: 'korean', broth: 'soup' },
  { id: 'kalguksu', name: '칼국수', category: 'korean', broth: 'soup' },
  { id: 'naengmyeon', name: '냉면', category: 'korean', broth: 'soup' },
  { id: 'bibimbap', name: '비빔밥', category: 'korean', broth: 'dry' },
  { id: 'jeyuk-bokkeum', name: '제육볶음', category: 'korean', broth: 'dry' },
  { id: 'bulgogi', name: '불고기', category: 'korean', broth: 'dry' },
  { id: 'baekban', name: '백반', category: 'korean', broth: 'dry' },
  // 중식
  { id: 'jjamppong', name: '짬뽕', category: 'chinese', broth: 'soup' },
  { id: 'malatang', name: '마라탕', category: 'chinese', broth: 'soup' },
  { id: 'nurungji-tang', name: '누룽지탕', category: 'chinese', broth: 'soup' },
  { id: 'jjajangmyeon', name: '짜장면', category: 'chinese', broth: 'dry' },
  { id: 'tangsuyuk', name: '탕수육', category: 'chinese', broth: 'dry' },
  { id: 'bokkeumbap', name: '볶음밥', category: 'chinese', broth: 'dry' },
  { id: 'malaxiangguo', name: '마라샹궈', category: 'chinese', broth: 'dry' },
  { id: 'kkanpunggi', name: '깐풍기', category: 'chinese', broth: 'dry' },
  // 일식
  { id: 'ramen', name: '라멘', category: 'japanese', broth: 'soup' },
  { id: 'udon', name: '우동', category: 'japanese', broth: 'soup' },
  { id: 'donkatsu', name: '돈카츠', category: 'japanese', broth: 'dry' },
  { id: 'chobap', name: '초밥', category: 'japanese', broth: 'dry' },
  { id: 'gyudon', name: '규동', category: 'japanese', broth: 'dry' },
  { id: 'soba', name: '소바', category: 'japanese', broth: 'dry' },
  { id: 'curry-rice', name: '카레라이스', category: 'japanese', broth: 'dry' },
  { id: 'karaage', name: '가라아게', category: 'japanese', broth: 'dry' },
  // 양식
  { id: 'pasta', name: '파스타', category: 'western', broth: 'dry' },
  { id: 'steak', name: '스테이크', category: 'western', broth: 'dry' },
  { id: 'risotto', name: '리조또', category: 'western', broth: 'dry' },
  { id: 'pizza', name: '피자', category: 'western', broth: 'dry' },
  { id: 'omurice', name: '오므라이스', category: 'western', broth: 'dry' },
  { id: 'sandwich', name: '샌드위치', category: 'western', broth: 'dry' },
  { id: 'hamburger', name: '햄버거', category: 'western', broth: 'dry' },
  { id: 'gratin', name: '그라탕', category: 'western', broth: 'dry' },
  // 분식
  { id: 'eomuk', name: '어묵', category: 'bunsik', broth: 'soup' },
  { id: 'tteokbokki', name: '떡볶이', category: 'bunsik', broth: 'dry' },
  { id: 'gimbap', name: '김밥', category: 'bunsik', broth: 'dry' },
  { id: 'rabokki', name: '라볶이', category: 'bunsik', broth: 'dry' },
  { id: 'jjolmyeon', name: '쫄면', category: 'bunsik', broth: 'dry' },
  { id: 'twigim', name: '튀김', category: 'bunsik', broth: 'dry' },
  // 세계·기타
  { id: 'pho', name: '쌀국수', category: 'world', broth: 'soup' },
  { id: 'shabu-shabu', name: '샤브샤브', category: 'world', broth: 'soup' },
  { id: 'tom-yum-goong', name: '똠얌꿍', category: 'world', broth: 'soup' },
  { id: 'pad-thai', name: '팟타이', category: 'world', broth: 'dry' },
  { id: 'taco', name: '타코', category: 'world', broth: 'dry' },
  { id: 'kebab', name: '케밥', category: 'world', broth: 'dry' },
  { id: 'chicken', name: '치킨', category: 'world', broth: 'dry' },
  { id: 'ssambap', name: '쌈밥', category: 'world', broth: 'dry' },
] as const satisfies readonly LunchMenuType[];

export const LUNCH_MENU_COUNT = 48;
