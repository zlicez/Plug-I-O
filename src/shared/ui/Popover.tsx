import * as RadixPopover from '@radix-ui/react-popover';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  className?: string;
  /** Width hint for the floating panel; defaults to auto. */
  width?: number | string;
}

/**
 * Radix Popover wrapped with the design-system surface (`--surface-2` bg,
 * `--line-2` border, elevation-2 shadow). Use for filter dropdowns,
 * action menus, undo-history list, etc.
 */
export function Popover({
  trigger,
  children,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  alignOffset = 0,
  className,
  width,
}: PopoverProps) {
  return (
    <RadixPopover.Root onOpenChange={onOpenChange} open={open}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          alignOffset={alignOffset}
          className={cn(
            'z-50 rounded-3 border border-line-2 bg-surface-2 p-1.5 shadow-elev-2 ' +
              'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ' +
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className,
          )}
          side={side}
          sideOffset={sideOffset}
          style={width !== undefined ? { width } : undefined}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
