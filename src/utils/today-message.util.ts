import { MealType } from "@/types/today-message.type";
import { getKoreanTimeString, getKoreaTime } from './common.util';

export function getTodayPrompts(): {
  mealType: MealType;
  menuPrompt: string;
  todoPrompt: string;
} {
  const date = getKoreaTime();
  const month = date.getMonth() + 1;
  const hour = date.getHours();
  const timeString = getKoreanTimeString(date);

  let mealType: MealType;
  let menuPrompt: string;

  const currentTimeMessage = `현재는 ${month}월 입니다. 현재 시간은 ${timeString}입니다. 보통(일반, 대중적인)의 직장인입니다.`;
  const meneExceptMessage =
    '매번 다른 메뉴를 추천해 주세요. 반드시 실제로 존재하는 메뉴만 추천해 주세요. 없는 메뉴, 직접 만든 조합은 추천하지 마세요.';
  const todoExceptMessage = '특별하거나 어려운 일은 제외해줘.';

  if (hour >= 5 && hour < 10) {
    mealType = '아침';
    menuPrompt = `${currentTimeMessage} 오늘 아침에 간단하게 먹기 좋은 메뉴를 한두 가지 메뉴만 추천해 주세요. ${meneExceptMessage}`;
  } else if (hour >= 11 && hour < 15) {
    mealType = '점심';
    menuPrompt = `${currentTimeMessage} 오늘 점심에 든든하게 먹기 좋은 메뉴를 한두 가지 메뉴만 추천해 주세요. ${meneExceptMessage}`;
  } else if (hour >= 17 && hour < 21) {
    mealType = '저녁';
    menuPrompt = `${currentTimeMessage} 오늘 저녁에 든든하게 먹을수 있는 식사 메뉴와, 저녁에 든든하게 먹을수 있는 술과 함께 즐기기 좋은 안주 메뉴를 각각 한두 가지씩 추천해 주세요. 두 추천은 명확히 구분해서 보여주세요. ${meneExceptMessage}`;
  } else {
    mealType = '간식';
    menuPrompt = `${currentTimeMessage} 지금 먹기 좋은 간식을 간단하게 한두 가지 메뉴만 추천해 주세요.${meneExceptMessage}`;
  }

  const todoPrompt = `${currentTimeMessage} 지금 시간에 하면 좋은 간단한 할 일을 한국어로 한 줄로 추천해줘. 예시:가벼운 스트레칭, 창문 열고 환기하기, 따뜻한 차 한잔 마시기, 가벼운 스트레칭, 음악 감상, 짧은 휴식 등. ${todoExceptMessage}`;

  return { mealType, menuPrompt, todoPrompt };
}

export function getTimeSlot(
  hour: number
): 'morning' | 'lunch' | 'dinner' | 'snack' {
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 17 && hour < 21) return 'dinner';
  return 'snack';
}
