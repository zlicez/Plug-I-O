import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface EyebrowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Mono 10–11px UPPERCASE label with wide tracking — used above section
 * titles ("LIBRARY", "INSPECTOR", "CANVAS"), filter group headers,
 * spec rows.
 */
export function Eyebrow({ className, children, ...rest }: EyebrowProps) {
  return (
    <div
      className={cn(
        'font-mono text-10 font-medium uppercase tracking-[0.14em] text-muted-2',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
