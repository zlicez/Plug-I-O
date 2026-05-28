import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
  /** When `false`, the tooltip will not render — useful for conditional hints. */
  enabled?: boolean;
}

/**
 * Tooltip wrapper around Radix Tooltip with our design-system styling.
 * Per the design brief: never use above ports — surface port info in the
 * status bar instead. Use this for icon-only buttons and dense controls.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className,
  enabled = true,
}: TooltipProps) {
  if (!enabled) {
    return <>{children}</>;
  }
  return (
    <RadixTooltip.Root delayDuration={delayDuration}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          align={align}
          className={cn(
            'z-50 pointer-events-none rounded-2 border border-line-2 bg-bg-2 ' +
              'px-2 py-1.5 font-mono text-12 text-copy shadow-elev-3 ' +
              'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out ' +
              'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
            className,
          )}
          side={side}
          sideOffset={6}
        >
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export const TooltipProvider = RadixTooltip.Provider;
