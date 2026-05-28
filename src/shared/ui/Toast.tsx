import { AlertTriangle, Check, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  kind?: ToastKind;
  title: ReactNode;
  body?: ReactNode;
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}

const kindStyles: Record<ToastKind, { border: string; icon: ReactNode; color: string }> = {
  info: {
    border: 'border-l-info',
    icon: <Info size={12} />,
    color: 'text-info',
  },
  success: {
    border: 'border-l-positive',
    icon: <Check size={12} />,
    color: 'text-positive',
  },
  warning: {
    border: 'border-l-warning',
    icon: <AlertTriangle size={12} />,
    color: 'text-warning',
  },
  error: {
    border: 'border-l-danger',
    icon: <AlertTriangle size={12} />,
    color: 'text-danger',
  },
};

/**
 * Toast/Notification — slide-up from bottom-right via ToastHost.
 * — 3px left border colored by `kind`
 * — 320-460px wide
 * — error sticks until dismissed; others auto-expire (handled by ToastHost)
 *
 * Per a11y spec, this component does NOT manage live regions itself —
 * ToastHost wraps the stack with role="status" / aria-live.
 */
export function Toast({ kind = 'info', title, body, onClose, action, className }: ToastProps) {
  const meta = kindStyles[kind];
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 min-w-[320px] max-w-[460px] p-3 ' +
          'rounded-3 border border-line-2 bg-surface shadow-elev-3 ' +
          'border-l-[3px]',
        meta.border,
        className,
      )}
    >
      <div
        className={cn(
          'grid h-5 w-5 shrink-0 place-items-center rounded-pill',
          'bg-[rgb(255_255_255/0.04)]',
          meta.color,
        )}
      >
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-13 font-medium leading-snug text-copy">{title}</div>
        {body ? <div className="mt-0.5 text-12 leading-snug text-muted">{body}</div> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
      {onClose ? (
        <button
          aria-label="Dismiss notification"
          className={
            'grid h-6 w-6 -mr-1 -mt-1 place-items-center rounded-1 text-muted-2 ' +
            'hover:bg-control hover:text-copy transition-colors duration-150 ease-standard'
          }
          onClick={onClose}
          type="button"
        >
          <X size={12} />
        </button>
      ) : null}
    </div>
  );
}
