import { ChevronDown } from 'lucide-react';
import type { JSX, ReactNode } from 'react';

const HEADING_CLASS = {
  2: 'text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl',
  3: 'text-lg leading-snug font-semibold break-keep text-foreground',
} as const;

export type CollapsiblePropsType = Readonly<{
  heading: string;
  level?: 2 | 3;
  /** 접혀도 항상 보이는 한 줄 안내(제목 아래) */
  note?: string;
  children: ReactNode;
}>;

/**
 * CollapsibleComponent
 * - 제목은 보이고 본문만 접히는 <details>. 본문은 서버 HTML에 그대로 있다. JS 없이 동작. 서버 컴포넌트.
 */
export function CollapsibleComponent({
  heading,
  level = 3,
  note,
  children,
}: CollapsiblePropsType): JSX.Element {
  const Heading = level === 2 ? 'h2' : 'h3';

  return (
    <details className="group border-b border-border">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <div className="space-y-1">
          <Heading className={HEADING_CLASS[level]}>{heading}</Heading>
          {note ? (
            <p className="text-sm leading-6 text-muted-foreground">{note}</p>
          ) : null}
        </div>
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-muted-foreground group-open:rotate-180"
        />
      </summary>
      <div className="space-y-2 pt-1 pb-3">{children}</div>
    </details>
  );
}
