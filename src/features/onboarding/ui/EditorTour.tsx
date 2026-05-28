import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Button } from '../../../shared/ui/Button';

interface TourStep {
  /** CSS selector for the element to spotlight. Falls back to a centered card if absent. */
  target: string;
  title: string;
  body: string;
}

const steps: TourStep[] = [
  {
    target: '#device-library',
    title: 'Device library',
    body: 'Search, filter, then drag any unit into a free rack slot — or click it to drop into the first opening.',
  },
  {
    target: '[data-tour="view-toggle"]',
    title: 'Front & rear',
    body: 'Flip the rack to the rear panel to expose every connector, then click an output and an input to patch a cable.',
  },
  {
    target: '[data-tour="export"]',
    title: 'Save & export',
    body: 'Auto-saving keeps your session locally. Export the build as JSON to share, or render the rack to PNG.',
  },
];

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

function measure(selector: string): SpotRect | null {
  const element = document.querySelector(selector);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };
}

/** Clamps the callout into the viewport, preferring placement below/right of the spot. */
function calloutPosition(spot: SpotRect | null): { top: number; left: number } {
  const width = 360;
  const margin = 16;
  if (!spot) {
    return {
      top: window.innerHeight / 2 - 90,
      left: window.innerWidth / 2 - width / 2,
    };
  }
  const below = spot.top + spot.height + 12;
  const fitsBelow = below + 170 < window.innerHeight;
  const top = fitsBelow ? below : Math.max(margin, spot.top - 182);
  const left = Math.min(
    Math.max(margin, spot.left),
    window.innerWidth - width - margin,
  );
  return { top, left };
}

export function EditorTour({ request }: { request: number }) {
  const [closedRequest, setClosedRequest] = useState(0);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<SpotRect | null>(null);
  const open = request > closedRequest;

  // Restart at the first step whenever the tour is reopened.
  useEffect(() => {
    if (open) setStep(0);
  }, [open, request]);

  // Track the highlighted element across step changes and window resizing.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const update = () => setSpot(measure(steps[step].target));
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, step]);

  const close = () => setClosedRequest(request);
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const callout = calloutPosition(spot);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          aria-label="Guided tour"
          className="tour-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={close}
          role="dialog"
        >
          {spot && (
            <motion.div
              animate={{ opacity: 1, ...spot }}
              className="tour-spotlight"
              initial={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            />
          )}
          <motion.section
            animate={{ opacity: 1, top: callout.top, left: callout.left }}
            className="tour-panel"
            initial={{ opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <Button aria-label="Close tour" onClick={close} size="icon" variant="ghost">
              <X size={16} />
            </Button>
            <p className="eyebrow">
              STEP {step + 1} / {steps.length}
            </p>
            <h2>{current.title}</h2>
            <p>{current.body}</p>
            <div>
              {step > 0 && (
                <Button onClick={() => setStep((value) => value - 1)} variant="secondary">
                  Back
                </Button>
              )}
              <Button
                onClick={() => (isLast ? close() : setStep((value) => value + 1))}
                variant="primary"
              >
                {isLast ? 'Finish' : 'Next'}
              </Button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
