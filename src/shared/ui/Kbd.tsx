import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 ' +
          'rounded-1 bg-surface-2 border border-line-2 border-b-2 ' +
          'font-mono text-11 font-medium text-copy-2',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}
