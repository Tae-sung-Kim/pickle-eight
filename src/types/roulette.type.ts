export type RouletteItemType = Readonly<{
  key: string;
  label: string;
  /** 칸 면 색 클래스(예: 'fill-menu-meal/10'). 없거나 공백이면 번갈아 칠함 */
  colorClassName?: string;
}>;
