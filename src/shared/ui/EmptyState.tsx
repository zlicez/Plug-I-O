import type { ComponentType, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface EmptyStateProps {
  icon?: ComponentType<{ size?: number; color?: string }>;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Compact variant for use inside panels (library, inspector). */
  compact?: boolean;
}

/**
 * Empty-state pattern — used for "no results" in library, "nothing selected"
 * in inspector, "no cables connected", "no saved sessions", and so on.
 *
 * Visual contract: 44px circle with muted icon, 13px title, 12px muted body,
 * optional action button rendered by the parent (use `action` slot).
 */
export function EmptyState({
  icon: IconComponent,
  title,
  body,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center text-muted',
        compact ? 'p-4' : 'p-5',
        className,
      )}
    >
      {IconComponent ? (
        <div
          className={
            'mb-3.5 grid h-11 w-11 place-items-center rounded-pill ' +
            'border border-line bg-surface-2 text-muted-2'
          }
        >
          <IconComponent size={20} />
        </div>
      ) : null}
      <div className="text-13 font-medium text-copy">{title}</div>
      {body ? <div className="mt-1 max-w-[28ch] text-12 leading-snug text-muted">{body}</div> : null}
      {action ? <div className="mt-3.5">{action}</div> : null}
    </div>
  );
}
