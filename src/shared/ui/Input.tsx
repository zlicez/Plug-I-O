import { Search, X } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional left adornment — typically an icon. */
  leadingIcon?: ReactNode;
  /** Optional right adornment — clear button, kbd hint, etc. */
  trailing?: ReactNode;
  error?: boolean;
}

const base =
  'block w-full h-8 rounded-2 border bg-bg-2 px-2.5 ' +
  'font-mono text-13 text-copy placeholder:text-muted-2 ' +
  'transition-colors duration-150 ease-standard ' +
  'focus:outline-none disabled:opacity-40 disabled:pointer-events-none';

const idleBorder = 'border-line-2 focus:border-accent';
const errorBorder = 'border-danger focus:border-danger';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leadingIcon, trailing, error = false, style, ...rest },
  ref,
) {
  const focusShadow = error
    ? '0 0 0 3px rgb(224 84 84 / 0.18)'
    : '0 0 0 3px rgb(200 255 0 / 0.18)';
  const focusStyle = {
    '--focus-shadow': focusShadow,
    ...style,
  } as React.CSSProperties;

  return (
    <div className="relative w-full">
      {leadingIcon ? (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2">
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          base,
          error ? errorBorder : idleBorder,
          leadingIcon && 'pl-8',
          trailing && 'pr-12',
          // emulate the 3px focus halo via inset shadow (no Tailwind shadow utility for token).
          'focus:[box-shadow:var(--focus-shadow)]',
          className,
        )}
        style={focusStyle}
        {...rest}
      />
      {trailing ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>
      ) : null}
    </div>
  );
});

interface SearchInputProps extends Omit<InputProps, 'leadingIcon'> {
  value: string;
  onValueChange: (next: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onValueChange, placeholder = 'Search…', trailing, className, ...rest },
  ref,
) {
  return (
    <Input
      ref={ref}
      className={className}
      leadingIcon={<Search size={13} />}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={placeholder}
      trailing={
        <span className="flex items-center gap-1">
          {value ? (
            <button
              aria-label="Clear search"
              className="grid h-4 w-4 place-items-center rounded-1 text-muted-2 hover:bg-control hover:text-copy"
              onClick={() => onValueChange('')}
              type="button"
            >
              <X size={11} />
            </button>
          ) : null}
          {trailing}
        </span>
      }
      type="search"
      value={value}
      {...rest}
    />
  );
});
