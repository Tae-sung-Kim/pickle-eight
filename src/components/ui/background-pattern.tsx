import { cn } from '@/lib/utils';

interface BackgroundPatternProps {
  className?: string;
}

export function BackgroundPattern({ className }: BackgroundPatternProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 -z-50 overflow-hidden pointer-events-none',
        className
      )}
    >
      {/* Light mode gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/20 opacity-60 dark:hidden" />

      {/* Dark mode gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background hidden dark:block" />

      {/* Mesh/Noise overlay (optional) */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );
}
