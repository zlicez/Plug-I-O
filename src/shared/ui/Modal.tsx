import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  /** Mono UPPERCASE eyebrow shown above the title. */
  eyebrow?: ReactNode;
  /** Optional explicit description (used as Radix Description) and rendered under the title. */
  description?: ReactNode;
  children: ReactNode;
  /** Footer slot — usually the action row. */
  footer?: ReactNode;
  width?: number;
  /** When true (default), shows a × close button in the header. */
  closable?: boolean;
  className?: string;
}

/**
 * Modal/Dialog wrapper around Radix Dialog with the design-system look:
 * — backdrop rgba(8,9,11,0.7) + 2px blur
 * — surface with `--line-2` border, `--r-4` radius, `--elev-3` shadow
 * — scale-in entrance 240ms / `--e-emphasized`
 *
 * Use for confirm dialogs, configurator, export menu, shortcuts, etc.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  eyebrow,
  description,
  children,
  footer,
  width = 460,
  closable = true,
  className,
}: ModalProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-90 backdrop-blur-[2px] bg-[rgba(8,9,11,0.7)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-1/2 top-1/2 z-100 -translate-x-1/2 -translate-y-1/2',
            'rounded-4 border border-line-2 bg-surface shadow-elev-3 overflow-hidden',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'max-w-[90vw] focus:outline-none',
            className,
          )}
          style={{ width }}
        >
          {(title || eyebrow || closable) && (
            <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
              <div className="min-w-0 flex-1">
                {eyebrow ? (
                  <div className="font-mono text-10 font-medium uppercase tracking-[0.14em] text-muted-2">
                    {eyebrow}
                  </div>
                ) : null}
                {title ? (
                  <Dialog.Title className="mt-0.5 text-16 font-semibold text-copy">
                    {title}
                  </Dialog.Title>
                ) : null}
                {description ? (
                  <Dialog.Description className="mt-1 text-13 leading-snug text-muted">
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
              {closable ? (
                <Dialog.Close
                  aria-label="Close"
                  className={
                    'grid h-7 w-7 place-items-center rounded-2 text-muted-2 ' +
                    'hover:bg-control hover:text-copy transition-colors duration-150 ease-standard'
                  }
                >
                  <X size={14} />
                </Dialog.Close>
              ) : null}
            </header>
          )}
          <div className="px-5 py-4">{children}</div>
          {footer ? (
            <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
              {footer}
            </footer>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
