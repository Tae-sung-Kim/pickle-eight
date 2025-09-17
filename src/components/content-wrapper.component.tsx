import { BACKGROUND_COLORS } from "@/constants/theme.constant";
import { MenuSectionKeyType } from "@/types/menu.type";

type ContentWarpperType = {
  className?: string;
  type: MenuSectionKeyType;
  children: React.ReactNode;
};

export function ContentWrapperComponent({
  type,
  children,
}: ContentWarpperType) {
  return <div className={`w-full ${BACKGROUND_COLORS[type]}`}>{children}</div>;
}

export default ContentWrapperComponent;
