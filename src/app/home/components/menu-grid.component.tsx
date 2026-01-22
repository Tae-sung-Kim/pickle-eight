import { MENU_LIST } from '@/constants/menu.constant';
import { SECTION_ICON_COLOR } from '@/constants/theme.constant';
import { MenuSectionKeyType } from '@/types/menu.type';
import {
  BarChart2,
  BookOpen,
  Bot,
  Brain,
  CalendarSearch,
  CheckCircle2,
  Circle,
  Dice5,
  Group,
  Layout,
  LayoutDashboard,
  PlayCircle,
  ScrollText,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  SpellCheck,
  SquareStack,
  Ticket,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import { HomeMenuFeatureItemComponent } from './feature-item.component';

const ICONS: Record<string, LucideIcon> = {
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
  SquareStack,
  CalendarSearch,
  BarChart2,
  CheckCircle2,
  PlayCircle,
  LayoutDashboard,
};

const SECTION_ICONS: Record<MenuSectionKeyType, LucideIcon> = {
  lotto: Circle,
  'random-picker': Dice5,
  quiz: Bot,
};

export function HomeMenuGridComponent() {
  return (
    <section className="max-w-6xl mx-auto py-10 px-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MENU_LIST.map((data) => {
          const groupName = data.group as MenuSectionKeyType;
          const SectionIcon = SECTION_ICONS[groupName];

          return (
            <div key={data.group}>
              <div className="flex items-center gap-2 mb-3 px-2">
                <SectionIcon
                  className={`w-5 h-5 ${SECTION_ICON_COLOR[groupName]}`}
                />
                <span
                  className={`text-base font-bold ${SECTION_ICON_COLOR[groupName]}`}
                >
                  {data.label}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {data.items.map((menu) => {
                  const Icon =
                    ICONS[menu.icon as keyof typeof ICONS] ?? Sparkles;
                  return (
                    <li key={menu.href}>
                      <HomeMenuFeatureItemComponent
                        section={groupName}
                        Icon={Icon}
                        href={menu.href}
                        label={menu.label}
                        description={menu.description}
                        example={menu.example}
                        isCredit={menu.isCredit}
                        isConditionalCredit={menu.isConditionalCredit}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
