import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Hint for stagger animations — N×60ms delay. */
  delay?: number;
}

/**
 * Skeleton block — animates opacity 0.4 → 0.7 in a soft loop.
 * Stagger using the `delay` prop (each unit is ~60ms).
 *
 * Use for the loading-session state: skeleton rows in library,
 * skeleton chassis in canvas, skeleton header rows in inspector.
 */
export function Skeleton({ className, style, delay = 0, ...rest }: SkeletonProps) {
  const composedStyle: CSSProperties = {
    animation: 'skel 1.4s ease-in-out infinite',
    animationDelay: `${delay * 60}ms`,
    ...style,
  };
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-2 bg-surface-2', className)}
      style={composedStyle}
      {...rest}
    />
  );
}
