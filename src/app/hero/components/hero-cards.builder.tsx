import { TodayMessageCardType, TodayMessageType } from "@/types/today-message.type";
import { ListChecks, Smile, Sparkles, UtensilsCrossed } from 'lucide-react';

export type CardItem = { key: TodayMessageType; props: TodayMessageCardType };

export function buildHeroCards(args: {
  messages: { cheer: string; fortune: string; todo: string; menu: string };
  mealType: string;
  siteName: string;
}): CardItem[] {
  const { messages, mealType, siteName } = args;
  return [
    {
      key: 'cheer',
      props: {
        title: '오늘의 응원',
        icon: <Smile className="w-8 h-8 text-success" />,
        titleColorClass: 'text-success',
        iconBorderClass: 'border-success/30',
        message: messages.cheer,
        fileName: `${siteName}-cheer.png`,
        shareTitle: '오늘의 응원',
        ariaLabel: '오늘의 응원 캡처 및 공유',
      },
    },
    {
      key: 'fortune',
      props: {
        title: '오늘의 행운',
        icon: <Sparkles className="w-8 h-8 text-info" />,
        titleColorClass: 'text-info',
        iconBorderClass: 'border-info/30',
        message: messages.fortune,
        fileName: `${siteName}-fortune.png`,
        shareTitle: '오늘의 행운',
        ariaLabel: '오늘의 행운 캡처 및 공유',
      },
    },
    {
      key: 'todo',
      props: {
        title: '지금 할 일',
        icon: <ListChecks className="w-8 h-8 text-warning" />,
        titleColorClass: 'text-warning',
        iconBorderClass: 'border-warning/30',
        message: messages.todo,
        fileName: `${siteName}-todo.png`,
        shareTitle: '지금 할 일',
        ariaLabel: '지금 할 일 캡처 및 공유',
      },
    },
    {
      key: 'menu',
      props: {
        title: `${mealType} 추천 메뉴`,
        icon: <UtensilsCrossed className="w-8 h-8 text-indigo-600" />,
        titleColorClass: 'text-indigo-600',
        iconBorderClass: 'border-indigo-300',
        message: messages.menu,
        fileName: `${siteName}-menu.png`,
        shareTitle: `${mealType} 추천 메뉴`,
        ariaLabel: `${mealType} 추천 메뉴 캡처 및 공유`,
      },
    },
  ];
}
