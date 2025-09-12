import { LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';

export type MenuItemType = {
  href: string;
  label: string;
  description: string;
  colorClass: string;
  icon: string; // 아이콘 이름만 저장
  example?: string;
  isCredit?: boolean;
  isConditionalCredit?: boolean; // 모델/옵션에 따라 과금될 수 있는 경우
};

export type MenuGroupType = {
  group: string;
  label: string;
  href?: string;
  items: readonly MenuItemType[];
};

export type MenuSectionKeyType = 'lotto' | 'random-picker' | 'quiz';

export type FeatureItemType = {
  section: MenuSectionKeyType;
  Icon: ComponentType<{ className?: string }> | LucideIcon;
  href: string;
  label: string;
  description?: string;
  example?: string;
  className?: string;
  isCredit?: boolean;
  isConditionalCredit?: boolean;
};
