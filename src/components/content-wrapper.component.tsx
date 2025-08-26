import { MenuSectionKeyType } from '@/types';

type ContentWarpperType = {
  className?: string;
  type: MenuSectionKeyType;
  children: React.ReactNode;
};

const COLORS: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-sky-50 dark:bg-slate-950',
  random: 'bg-sky-50 dark:bg-slate-950',
  quiz: 'bg-sky-50 dark:bg-slate-950',
};

export function ContentWrapperComponent({
  type = 'lotto',
  children,
}: ContentWarpperType) {
  return <div className={`w-full ${COLORS[type]}`}>{children}</div>;
}

export default ContentWrapperComponent;
