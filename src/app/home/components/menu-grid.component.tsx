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
  SquareStack,
  CalendarSearch,
  BarChart2,
  CheckCircle2,
  PlayCircle,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';
import {
  MENU_GROUP_NAME_ENUM,
  MENU_LIST,
  SECTION_ICON_COLOR,
} from '@/constants';
import { HomeMenuFeatureItemComponent } from './feature-item.component';
import { MenuSectionKeyType } from '@/types';

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

export function HomeMenuGridComponent() {
  return (
    <section className="max-w-6xl mx-auto py-10 px-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MENU_LIST.map((data) => {
          const groupName = data.group as MenuSectionKeyType;

          return (
            <div key={data.group}>
              <div className="flex items-center gap-2 mb-3 px-2">
                {groupName === MENU_GROUP_NAME_ENUM.LOTTO && (
                  <span className="text-xl">🎱</span>
                )}
                {groupName === MENU_GROUP_NAME_ENUM.RANDOM_PICKER && (
                  <span className="text-xl">🎲</span>
                )}
                {groupName === MENU_GROUP_NAME_ENUM.QUIZ && (
                  <span className="text-xl">🤖</span>
                )}
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

export default HomeMenuGridComponent;
