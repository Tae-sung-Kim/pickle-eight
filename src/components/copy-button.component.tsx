'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * CopyButtonComponent provides a small button to copy provided text to the clipboard.
 * It shows a transient success state after copying.
 */
export type CopyButtonProps = {
  text: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  label?: string;
};

export function CopyButtonComponent({
  text,
  size = 'sm',
  className,
  label = '복사',
}: CopyButtonProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op: keeping silent as clipboard may be blocked in some contexts
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={className}
      onClick={handleCopy}
    >
      {copied ? '복사됨' : label}
    </Button>
  );
}

export default CopyButtonComponent;
