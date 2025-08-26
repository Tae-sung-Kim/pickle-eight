import { BACKGROUND_COLORS } from '@/constants';
import { MenuSectionKeyType } from '@/types';

type ContentWarpperType = {
  className?: string;
  type: MenuSectionKeyType;
  children: React.ReactNode;
};

export function ContentWrapperComponent({
  type = 'lotto',
  children,
}: ContentWarpperType) {
  if (type === 'random') {
    return (
      <div
        className={`w-full py-12 px-4 sm:px-6 lg:px-8 ${BACKGROUND_COLORS[type]}`}
      >
        {children}
      </div>
    );
  } else if (type === 'quiz') {
    return (
      <div className={`w-full ${BACKGROUND_COLORS[type]}`}>{children}</div>
    );
  } else {
    return (
      <div className={`w-full ${BACKGROUND_COLORS[type]}`}>{children}</div>
    );
  }
}

export default ContentWrapperComponent;
