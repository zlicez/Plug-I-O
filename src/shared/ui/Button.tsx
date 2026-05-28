import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ' +
  'border rounded-2 transition-colors duration-150 ease-standard ' +
  'disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none';

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-6.5 px-2.5 text-12',
  md: 'h-8 px-3 text-13',
  lg: 'h-10 px-4 text-14',
  icon: 'h-8 w-8 px-0',
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-text border-accent font-semibold ' +
    'hover:bg-accent-2 hover:border-accent-2',
  secondary:
    'bg-control text-copy border-line-2 ' +
    'hover:bg-control-hover hover:border-line-strong ' +
    'active:bg-surface-2',
  ghost:
    'bg-transparent text-copy-2 border-transparent ' +
    'hover:bg-control hover:text-copy hover:border-line-2',
  danger:
    'bg-danger-soft text-[#ffb4b4] border-[rgb(224_84_84/0.3)] ' +
    'hover:bg-[rgb(224_84_84/0.22)]',
};

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, sizeStyles[size], variantStyles[variant], className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
