export type MenuItemType = {
  href: string;
  label: string;
  description: string;
  colorClass: string;
  icon: string; // 아이콘 이름만 저장
  example?: string;
};

export type MenuGroupType = {
  group: string;
  label: string;
  items: readonly MenuItemType[];
};
