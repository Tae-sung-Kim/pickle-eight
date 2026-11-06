import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { CrisisPhoneType } from '@/types/crisis-phone.type';

/**
 * 상담전화 한 곳. 터치용 tel: 링크와 PC용 글자를 서버 HTML에 함께 그리고,
 * CSS 미디어 쿼리 `(hover: hover) and (pointer: fine)`의 display로 한쪽만 보이게 한다.
 * - JS·훅 없음. 숨은 쪽은 display: none이라 접근성 트리·탭 순서에서 빠진다.
 * - sr-only, visibility, opacity, aria-hidden으로 숨기지 않는다.
 * - 숨은 쪽 요소에 id를 주거나 aria-labelledby/aria-describedby로 참조하지 않는다.
 * - globals.css에 @custom-variant를 추가하지 않으려고 임의 변형을 쓴다. 리터럴로 적어야 Tailwind가 찾는다.
 */
const TOUCH_ONLY = '[@media(hover:hover)_and_(pointer:fine)]:hidden';
const PC_ONLY = 'hidden [@media(hover:hover)_and_(pointer:fine)]:block';

export type CrisisPhoneComponentPropsType = Readonly<{
  phone: CrisisPhoneType;
  /** 터치 상태 링크 안 내용 */
  linkContent: ReactNode;
  /** PC 상태 글자 내용. 이름과 번호가 반드시 들어간다 */
  textContent: ReactNode;
  /** 터치 상태 모양(레이아웃·색). 숨김용 display 클래스는 넣지 않는다 */
  linkClassName: string;
  /** PC 상태 모양. 숨김용 display 클래스는 넣지 않는다 */
  textClassName: string;
  /** 링크일 때만 쓰는 접근 이름. 글자 쪽에는 붙이지 않는다 */
  linkAriaLabel?: string;
}>;

export function CrisisPhoneComponent({
  phone,
  linkContent,
  textContent,
  linkClassName,
  textClassName,
  linkAriaLabel,
}: CrisisPhoneComponentPropsType) {
  return (
    <>
      <a
        href={phone.href}
        aria-label={linkAriaLabel}
        className={cn(linkClassName, TOUCH_ONLY)}
      >
        {linkContent}
      </a>
      <span className={cn(textClassName, PC_ONLY)}>{textContent}</span>
    </>
  );
}
