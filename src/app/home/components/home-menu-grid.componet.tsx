import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dice5,
  Wand2,
  Group,
  SlidersHorizontal,
  Ticket,
  Layout,
  Shuffle,
} from 'lucide-react';
import Link from 'next/link';
import { MENU_LIST } from '@/constants';

const icons = [
  {
    href: '/lotto-random',
    icon: <Ticket className="w-8 h-8 text-indigo-500" />,
  },
  {
    href: '/name-random',
    icon: <Wand2 className="w-8 h-8 text-pink-500" />,
  },
  {
    href: '/seat-assignment',
    icon: <Layout className="w-8 h-8 text-orange-500" />, // 자리 배정: 좌석, 주황색
  },
  {
    href: '/team-assignment',
    icon: <Group className="w-8 h-8 text-violet-500" />, // 팀 배정: 여러 명, 보라색
  },
  {
    href: '/ladder-game',
    icon: <SlidersHorizontal className="w-8 h-8 text-green-500" />,
  },
  {
    href: '/dice-game',
    icon: <Dice5 className="w-8 h-8 text-yellow-500" />,
  },
  {
    href: '/draw-order',
    icon: <Shuffle className="w-8 h-8 text-orange-500" />,
  },
];

export function HomeMenuGridComponent() {
  return (
    <section className="max-w-5xl mx-auto py-12 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {MENU_LIST.map((menu) => (
        <Card
          key={menu.label}
          className="flex flex-col h-full shadow-md hover:shadow-xl transition-shadow"
        >
          <CardHeader className="flex flex-col items-center gap-2">
            {icons.find((icon) => icon.href === menu.href)?.icon}
            <CardTitle className="text-xl text-center">{menu.label}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-gray-700 mb-2">{menu.description}</p>
              <p className="text-xs text-gray-500 italic">💡 {menu.example}</p>
            </div>
            <Link href={menu.href} className="mt-4 block" tabIndex={-1}>
              <Button className="w-full" variant="outline">
                바로가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export default HomeMenuGridComponent;
