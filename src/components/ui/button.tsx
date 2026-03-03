import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * 버튼 컴포넌트의 스타일 변형 정의 (CVA)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive cursor-pointer will-change-transform active:scale-95",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90 hover:-translate-y-0.5',
        destructive:
          'bg-destructive text-white shadow-sm hover:shadow-md hover:bg-destructive/90 focus-visible:ring-destructive/20 hover:-translate-y-0.5',
        outline:
          'border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-primary to-emerald-400 text-white shadow-md hover:shadow-lg hover:brightness-110 hover:-translate-y-0.5 border-0',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4 text-base',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Button 컴포넌트 Props 타입 정의
 */
export type ButtonType = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** 자식 엘리먼트를 컴포넌트로 사용할지 여부 (Radix Slot 사용) */
    asChild?: boolean;
  };

/**
 * 프로젝트 전체에서 공통으로 사용되는 버튼 컴포넌트
 * @param props ButtonType
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonType) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
