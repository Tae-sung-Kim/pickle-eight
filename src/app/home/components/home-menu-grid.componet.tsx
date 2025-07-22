import {
  Dice5,
  Wand2,
  Group,
  SlidersHorizontal,
  Ticket,
  Layout,
  Shuffle,
  Sparkles,
  BookOpen,
  SpellCheck,
  Brain,
  ScrollText,
} from 'lucide-react';
import Link from 'next/link';
import { MENU_LIST } from '@/constants';
import { cn } from '@/lib';
import MenuTooltipComponent from './menu-tooltip.component';

const ICONS = {
  Ticket,
  Wand2,
  Layout,
  Group,
  SlidersHorizontal,
  Dice5,
  Shuffle,
  Sparkles,
  BookOpen,
  SpellCheck,
  Brain,
  ScrollText,
};

export function HomeMenuGridComponent() {
  return (
    <section className="max-w-4xl mx-auto py-10 px-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MENU_LIST.map((data) => (
          <div key={data.group}>
            <div className="flex items-center gap-2 mb-3 px-2">
              {data.group === 'lotto' && <span className="text-xl">🎱</span>}
              {data.group === 'random' && <span className="text-xl">🎲</span>}
              {data.group === 'quiz' && <span className="text-xl">🤖</span>}
              <span className="text-base font-bold text-primary/90">
                {data.label}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {data.items.map((menu) => {
                const Icon = ICONS[menu.icon as keyof typeof ICONS];

                return (
                  <li key={menu.href}>
                    <Link
                      href={menu.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 bg-white shadow-sm border border-border transition hover:bg-primary/5 hover:shadow-md',
                        'focus-visible:ring-2 focus-visible:ring-primary/30'
                      )}
                    >
                      <Icon className={cn('w-8 h-8', menu.colorClass)} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[16px] text-foreground truncate">
                          {menu.label}
                        </div>
                        <MenuTooltipComponent
                          description={menu.description}
                          example={menu.example}
                        />
                      </div>
                      <span className="ml-2 text-primary/60 text-lg flex-shrink-0">
                        {'>'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeMenuGridComponent;
