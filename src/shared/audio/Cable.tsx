import { memo } from 'react';
import type { AudioProtocol } from '../../entities/device/model/types';
import { dashArray, PROTOCOLS, resolveProtocolKey, type ProtocolKey } from './protocols';

export type CableState = 'idle' | 'selected' | 'invalid';

export interface CablePoint {
  x: number;
  y: number;
}

interface CableProps {
  from: CablePoint;
  to: CablePoint;
  /** Pass either a project AudioProtocol or an explicit design-system key. */
  audioProtocol?: AudioProtocol;
  protocol?: ProtocolKey;
  state?: CableState;
  /** Dimmed (~25% opacity) — used by signal-flow scoping. */
  dimmed?: boolean;
  /** Adds a soft outer halo around the cable; used when selected. */
  glow?: boolean;
  /** Per-cable color override (signal-flow source-coloring). */
  colorOverride?: string;
  /** Force a specific dash pattern (e.g., when overriding for signal-flow). */
  dashOverride?: string;
  /** Optional click/hover handlers — set pointer-events accordingly upstream. */
  className?: string;
}

/**
 * Bézier cable between two ports. Two strokes are stacked:
 *  1. shadow — rgba(0,0,0,0.55), 3.6px, translated +1.5y
 *  2. main   — protocol color, 2.4px, dashed per protocol meta
 *  3. (optional) glow — color, 6px, opacity 0.18, when selected
 *
 * Spec source: design_handoff_plug_io/design_canvas/src/shared.jsx Cable.
 */
function CableImpl({
  from,
  to,
  audioProtocol,
  protocol,
  state = 'idle',
  dimmed = false,
  glow = false,
  colorOverride,
  dashOverride,
  className,
}: CableProps) {
  if (!from || !to) return null;

  const protocolKey: ProtocolKey = protocol ?? resolveProtocolKey(audioProtocol);
  const meta = PROTOCOLS[protocolKey];
  const stroke =
    colorOverride ??
    (state === 'invalid'
      ? 'var(--danger)'
      : state === 'selected'
        ? 'var(--accent)'
        : meta.color);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const sag = Math.min(80, Math.abs(dx) * 0.3 + 24);
  const _ignoreDy = dy; // kept to clarify dx vs dy intent; not used directly.
  void _ignoreDy;
  const c1 = { x: from.x + dx * 0.15, y: from.y + sag };
  const c2 = { x: to.x - dx * 0.15, y: to.y + sag };
  const d = `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`;
  const dashAttr = dashOverride ?? dashArray(meta.dash);
  const opacity = dimmed ? 0.25 : state === 'idle' ? 0.85 : 1;

  return (
    <g className={className} style={{ opacity }}>
      {glow ? (
        <path
          d={d}
          fill="none"
          opacity="0.18"
          stroke={stroke}
          strokeLinecap="round"
          strokeWidth="6"
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke="rgba(0,0,0,0.55)"
        strokeLinecap="round"
        strokeWidth="3.6"
        transform="translate(0, 1.5)"
      />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeDasharray={dashAttr}
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <circle cx={from.x} cy={from.y} fill={stroke} r="2.6" />
      <circle cx={to.x} cy={to.y} fill={stroke} r="2.6" />
    </g>
  );
}

export const Cable = memo(CableImpl);
