import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type BadgeTone = 'default' | 'accent' | 'positive' | 'warning' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

const toneStyles: Record<BadgeTone, string> = {
  default: 'bg-surface-2 text-copy-2 border-line',
  accent: 'bg-accent-soft text-accent border-accent-ring',
  positive: 'bg-positive-soft text-positive border-[rgb(74_222_128/0.3)]',
  warning: 'bg-warning-soft text-warning border-[rgb(242_169_59/0.3)]',
  danger: 'bg-danger-soft text-danger border-[rgb(224_84_84/0.3)]',
  info: 'bg-info-soft text-info border-[rgb(64_147_214/0.3)]',
};

export function Badge({ tone = 'default', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center h-4.5 min-w-4.5 px-1.5 ' +
          'rounded-pill border font-mono text-10 font-medium tabular-nums tracking-[-0.01em]',
        toneStyles[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
