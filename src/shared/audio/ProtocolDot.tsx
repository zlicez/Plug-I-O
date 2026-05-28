import type { AudioProtocol } from '../../entities/device/model/types';
import { PROTOCOLS, resolveProtocolKey, type ProtocolKey } from './protocols';

interface ProtocolDotProps {
  protocol?: ProtocolKey;
  audioProtocol?: AudioProtocol;
  size?: number;
}

/**
 * Tiny pattern + color dot used inside chips and inspector rows.
 * Encodes the dash style as an inset ring so even at 8–10px the protocol
 * remains distinguishable (e.g., "dashed" reads as a hollow halo).
 */
export function ProtocolDot({ protocol, audioProtocol, size = 10 }: ProtocolDotProps) {
  const meta = PROTOCOLS[protocol ?? resolveProtocolKey(audioProtocol)];
  const insetRing =
    meta.dash === 'dashed'
      ? 'inset 0 0 0 2px var(--bg)'
      : meta.dash === 'dotted'
        ? 'inset 0 0 0 1px var(--bg)'
        : undefined;

  return (
    <span
      aria-hidden="true"
      style={{
        background: meta.color,
        borderRadius: '50%',
        boxShadow: insetRing,
        display: 'inline-block',
        flexShrink: 0,
        height: size,
        width: size,
      }}
    />
  );
}
