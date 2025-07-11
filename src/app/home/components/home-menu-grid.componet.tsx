import {
  Dice5,
  Wand2,
  Group,
  SlidersHorizontal,
  Ticket,
  Layout,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { MENU_LIST } from '@/constants';
import { cn } from '@/lib/utils';

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
    icon: <Layout className="w-8 h-8 text-orange-500" />,
  },
  {
    href: '/team-assignment',
    icon: <Group className="w-8 h-8 text-violet-500" />,
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
  {
    href: '/knowledge',
    icon: <Sparkles className="w-8 h-8 text-blue-500" />,
  },
];

export function HomeMenuGridComponent() {
  return (
    <section className="max-w-4xl mx-auto py-10 px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MENU_LIST.map((group) => (
          <div key={group.group}>
            <div className="flex items-center gap-2 mb-3 px-2">
              {group.group === 'random' && <span className="text-xl">🎲</span>}
              {group.group === 'ai' && <span className="text-xl">🤖</span>}
              <span className="text-base font-bold text-primary/90">
                {group.label}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {group.items.map((menu) => (
                <li key={menu.href}>
                  <Link
                    href={menu.href}
                    className={cn(
                      'flex items-start gap-3 rounded-lg px-4 py-3 bg-white shadow-sm border border-border transition hover:bg-primary/5 hover:shadow-md',
                      'focus-visible:ring-2 focus-visible:ring-primary/30'
                    )}
                  >
                    {icons.find((icon) => icon.href === menu.href)?.icon}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[16px] text-foreground truncate">
                        {menu.label}
                      </div>
                      {menu.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {menu.description}
                        </div>
                      )}
                      {menu.example && (
                        <div className="text-[11px] text-muted-foreground italic truncate mt-0.5">
                          💡 {menu.example}
                        </div>
                      )}
                    </div>
                    <span className="ml-2 text-primary/60 text-lg flex-shrink-0">
                      {'>'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeMenuGridComponent;
