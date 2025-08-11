import { MealType } from '@/types';
import { getKoreanTimeString } from './common.util';

export function getTodayPrompts(): {
  mealType: MealType;
  menuPrompt: string;
  todoPrompt: string;
} {
  const date = new Date();
  const hour = date.getHours();
  const timeString = getKoreanTimeString(date);

  let mealType: MealType;
  let menuPrompt: string;
  let todoPrompt: string;

  if (hour >= 5 && hour < 11) {
    mealType = '아침';
    menuPrompt = `현재 시간은 ${timeString}입니다. 오늘 아침 먹기 좋은 메뉴를 간단하게 한두 가지 메뉴만 추천해 주세요.`;
    todoPrompt =
      '아침 시간에 하면 좋은 간단한 할 일을 한국어로 한 줄로 추천해줘. 예시: 가벼운 스트레칭, 창문 열고 환기하기, 따뜻한 차 한잔 마시기 등. 특별하거나 어려운 일은 제외해줘.';
  } else if (hour >= 11 && hour < 17) {
    mealType = '점심';
    menuPrompt = `현재 시간은 ${timeString}입니다. 오늘 점심 먹기 좋은 메뉴를 간단하게 한두 가지 메뉴만 추천해 주세요.`;
    todoPrompt =
      '점심 시간에 하면 좋은 간단한 할 일을 한국어로 한 줄로 추천해줘. 예시: 산책하기, 가벼운 낮잠, 주변 정리정돈 등. 특별하거나 어려운 일은 제외해줘.';
  } else if (hour >= 17 && hour < 20) {
    mealType = '저녁';
    menuPrompt = `현재 시간은 ${timeString}입니다. 오늘 저녁 식사 메뉴와, 저녁에 술과 함께 즐기기 좋은 안주 메뉴를 각각 간단하게 한두 가지씩 추천해 주세요. 두 추천은 명확히 구분해서 보여주세요.`;
    todoPrompt =
      '저녁 시간에 하면 좋은 간단한 할 일을 한국어로 한 줄로 추천해줘. 예시: 산책하기, 가족과 대화, 조용히 책 읽기 등. 특별하거나 어려운 일은 제외해줘.';
  } else {
    mealType = '간식';
    menuPrompt = `현재 시간은 ${timeString}입니다. 지금 먹기 좋은 간식을 간단하게 한두 가지 메뉴만 추천해 주세요.`;
    todoPrompt =
      '지금 시간에 하면 좋은 간단한 할 일을 한국어로 한 줄로 추천해줘. 예시: 가벼운 스트레칭, 음악 감상, 짧은 휴식 등. 특별하거나 어려운 일은 제외해줘.';
  }

  return { mealType, menuPrompt, todoPrompt };
}

export function getTimeSlot(
  hour: number
): 'morning' | 'lunch' | 'dinner' | 'snack' {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'lunch';
  if (hour >= 17 && hour < 20) return 'dinner';
  return 'snack';
}
