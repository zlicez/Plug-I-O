import { X } from 'lucide-react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  onDismiss?: () => void;
  children: ReactNode;
  /** When `true`, render as a button (semantic button + cursor-pointer). */
  asButton?: boolean;
}

const base =
  'inline-flex items-center gap-1.5 h-5.5 px-2 ' +
  'rounded-pill border font-mono text-11 leading-none ' +
  'transition-colors duration-150 ease-standard';

const idle = 'bg-surface-2 border-line-2 text-copy-2';
const activeStyle = 'bg-accent-soft border-accent-ring text-accent';

export function Chip({
  active = false,
  onDismiss,
  className,
  children,
  asButton = false,
  ...rest
}: ChipProps) {
  const classes = cn(
    base,
    active ? activeStyle : idle,
    (asButton || onDismiss) && 'cursor-pointer hover:border-line-strong',
    className,
  );

  const content = (
    <>
      {children}
      {onDismiss ? (
        <button
          aria-label="Remove filter"
          className="ml-0.5 -mr-0.5 inline-flex h-3 w-3 items-center justify-center text-muted hover:text-copy"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
          type="button"
        >
          <X size={10} />
        </button>
      ) : null}
    </>
  );

  if (asButton) {
    const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button className={classes} type="button" {...buttonProps}>
        {content}
      </button>
    );
  }
  return (
    <span className={classes} {...rest}>
      {content}
    </span>
  );
}
