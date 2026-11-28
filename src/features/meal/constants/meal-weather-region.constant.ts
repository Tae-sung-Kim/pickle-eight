// 임시 산출값, 출시 전 공식 표 대조 필요 (docs/meal-weather/grid-check.md 9장)
export const MEAL_WEATHER_REGIONS = [
  { key: 'seoul', label: '서울', nx: 60, ny: 127 },
  { key: 'busan', label: '부산', nx: 98, ny: 76 },
  { key: 'daegu', label: '대구', nx: 89, ny: 91 },
  { key: 'incheon', label: '인천', nx: 55, ny: 124 },
  { key: 'jeonnam-gwangju', label: '전남·광주', nx: 58, ny: 74 },
  { key: 'daejeon', label: '대전', nx: 67, ny: 100 },
  { key: 'ulsan', label: '울산', nx: 102, ny: 84 },
  { key: 'sejong', label: '세종', nx: 66, ny: 103 },
  { key: 'gyeonggi', label: '경기', nx: 61, ny: 120 },
  { key: 'gangwon', label: '강원', nx: 73, ny: 134 },
  { key: 'chungbuk', label: '충북', nx: 69, ny: 107 },
  { key: 'chungnam', label: '충남', nx: 55, ny: 106 },
  { key: 'jeonbuk', label: '전북', nx: 63, ny: 89 },
  { key: 'gyeongbuk', label: '경북', nx: 91, ny: 106 },
  { key: 'gyeongnam', label: '경남', nx: 91, ny: 77 },
  { key: 'jeju', label: '제주', nx: 53, ny: 38 },
] as const;
