import { memo, type ReactNode } from 'react';
import type { Port } from '../../entities/device/model/types';
import type { ConnectorKind } from './connectors';
import { resolveConnector } from './connectors';
import type { ProtocolKey } from './protocols';
import { PROTOCOLS, protocolMeta, resolveProtocolKey } from './protocols';

export type PortGlyphState = 'idle' | 'compatible' | 'invalid';

interface PortGlyphProps {
  /** Either pass a Port (preferred — direction-aware) or explicit kind+protocol. */
  port?: Port;
  kind?: ConnectorKind;
  protocol?: ProtocolKey;
  size?: number;
  state?: PortGlyphState;
  title?: string;
  className?: string;
}

/**
 * Schematic connector glyph rendered as a 24×24 SVG.
 * Color: protocol palette in idle, lime accent (with pulse-ring) when a
 * compatible target during a draw, red halo when explicitly invalid.
 *
 * Spec source: design_handoff_plug_io/design_canvas/src/shared.jsx Connector.
 */
function PortGlyphImpl({
  port,
  kind,
  protocol,
  size = 24,
  state = 'idle',
  title,
  className,
}: PortGlyphProps) {
  const connectorKind: ConnectorKind = kind ?? (port ? resolveConnector(port) : 'xlrM');
  const protocolKey: ProtocolKey = protocol ?? resolveProtocolKey(port?.protocol);

  const accent =
    state === 'invalid'
      ? 'var(--danger)'
      : state === 'compatible'
        ? 'var(--accent)'
        : PROTOCOLS[protocolKey].color;

  return (
    <svg
      aria-hidden={title ? undefined : 'true'}
      aria-label={title ?? `${protocolMeta(port?.protocol).label} ${connectorKind} port`}
      className={className}
      height={size}
      role={title ? 'img' : undefined}
      style={{ display: 'block' }}
      viewBox="0 0 24 24"
      width={size}
    >
      {state === 'compatible' ? (
        <circle
          cx="12"
          cy="12"
          fill="none"
          opacity="0.5"
          r="11"
          stroke="var(--accent)"
          strokeWidth="1"
          style={{ animation: 'pulse-ring 1.2s ease-out infinite' }}
        />
      ) : null}
      {renderConnector(connectorKind, accent)}
      {state === 'invalid' ? (
        <circle
          cx="12"
          cy="12"
          fill="none"
          opacity="0.7"
          r="11"
          stroke="var(--danger)"
          strokeWidth="1.2"
        />
      ) : null}
    </svg>
  );
}

export const PortGlyph = memo(PortGlyphImpl);

function renderConnector(kind: ConnectorKind, color: string): ReactNode {
  switch (kind) {
    case 'xlrM':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="10" stroke={color} strokeWidth="1.4" />
          <circle cx="12" cy="9" fill={color} r="1.5" />
          <circle cx="9.5" cy="13.5" fill={color} r="1.5" />
          <circle cx="14.5" cy="13.5" fill={color} r="1.5" />
        </g>
      );
    case 'xlrF':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="10" stroke={color} strokeWidth="1.4" />
          <circle cx="12" cy="9" fill="none" r="2.2" stroke={color} strokeWidth="1" />
          <circle cx="9.5" cy="13.5" fill="none" r="2.2" stroke={color} strokeWidth="1" />
          <circle cx="14.5" cy="13.5" fill="none" r="2.2" stroke={color} strokeWidth="1" />
        </g>
      );
    case 'trs':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="7" stroke={color} strokeWidth="1.2" />
          <circle cx="12" cy="12" fill={color} r="3" />
        </g>
      );
    case 'ts':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="7" stroke={color} strokeWidth="1.2" />
          <circle cx="12" cy="12" fill={color} r="2" />
        </g>
      );
    case 'rca':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="7" stroke={color} strokeWidth="1.2" />
          <circle cx="12" cy="12" fill={color} r="2" />
          <circle cx="12" cy="12" fill="none" opacity="0.5" r="4.4" stroke={color} strokeWidth="0.5" />
        </g>
      );
    case 'bnc':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="7" stroke={color} strokeWidth="1.2" />
          <path d="M 6 12 A 6 6 0 0 1 18 12" fill="none" stroke={color} strokeWidth="0.8" />
          <circle cx="12" cy="12" fill={color} r="1.8" />
        </g>
      );
    case 'rj45':
      return (
        <g>
          <rect fill="var(--bg)" height="12" rx="1" stroke={color} strokeWidth="1.2" width="18" x="3" y="6" />
          {[6, 9, 12, 15, 18].map((x) => (
            <line key={x} stroke={color} strokeWidth="0.8" x1={x} x2={x} y1="9" y2="12" />
          ))}
        </g>
      );
    case 'optical':
      return (
        <g>
          <rect fill="var(--bg)" height="8" rx="1" stroke={color} strokeWidth="1.2" width="16" x="4" y="8" />
          <circle cx="12" cy="12" fill={color} r="2.4" />
        </g>
      );
    case 'usbA':
      return (
        <g>
          <rect fill="var(--bg)" height="8" rx="0.5" stroke={color} strokeWidth="1.2" width="16" x="4" y="8" />
          <rect fill={color} height="3" width="11" x="6.5" y="10" />
        </g>
      );
    case 'usbB':
      return (
        <g>
          <path
            d="M 7 7 H 17 L 18 11 V 17 H 6 V 11 Z"
            fill="var(--bg)"
            stroke={color}
            strokeWidth="1.2"
          />
          <rect fill={color} height="3" width="7" x="8.5" y="10" />
        </g>
      );
    case 'usbC':
      return (
        <g>
          <rect fill="var(--bg)" height="6" rx="3" stroke={color} strokeWidth="1.2" width="18" x="3" y="9" />
          <rect fill={color} height="2" rx="1" width="12" x="6" y="11" />
        </g>
      );
    case 'thunderbolt':
      return (
        <g>
          <rect fill="var(--bg)" height="6" rx="3" stroke={color} strokeWidth="1.2" width="18" x="3" y="9" />
          <path d="M 11 9 L 9 12 L 12 12 L 11 15 L 14 11 L 11 11 Z" fill={color} />
        </g>
      );
    case 'powerCon':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="9" stroke={color} strokeWidth="1.4" />
          <rect fill={color} height="6" rx="0.5" width="6" x="9" y="9" />
          <rect fill={color} height="3" width="2" x="11" y="6" />
        </g>
      );
    case 'iec':
      return (
        <g>
          <path
            d="M 4 9 H 20 V 14 Q 20 16 18 16 H 6 Q 4 16 4 14 Z"
            fill="var(--bg)"
            stroke={color}
            strokeWidth="1.2"
          />
          <rect fill={color} height="3" width="2" x="7" y="11" />
          <rect fill={color} height="3" width="2" x="11" y="11" />
          <rect fill={color} height="3" width="2" x="15" y="11" />
        </g>
      );
    case 'nema':
      return (
        <g>
          <rect
            fill="var(--bg)"
            height="14"
            rx="2"
            stroke={color}
            strokeWidth="1.2"
            width="14"
            x="5"
            y="5"
          />
          <rect fill={color} height="4" width="1.6" x="9" y="8" />
          <rect fill={color} height="4" width="1.6" x="13.4" y="8" />
          <circle cx="12" cy="16" fill={color} r="1.1" />
        </g>
      );
    case 'midi5':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="9" stroke={color} strokeWidth="1.4" />
          <circle cx="12" cy="7.5" fill={color} r="1" />
          <circle cx="7.5" cy="11" fill={color} r="1" />
          <circle cx="16.5" cy="11" fill={color} r="1" />
          <circle cx="9" cy="15" fill={color} r="1" />
          <circle cx="15" cy="15" fill={color} r="1" />
        </g>
      );
    case 'db25':
      return (
        <g>
          <path
            d="M 2 9 L 4 7 H 20 L 22 9 V 14 L 20 16 H 4 L 2 14 Z"
            fill="var(--bg)"
            stroke={color}
            strokeWidth="1.2"
          />
          {[5, 8, 11, 14, 17, 20].map((x) => (
            <circle key={x} cx={x} cy="11" fill={color} r="0.6" />
          ))}
          {[6.5, 9.5, 12.5, 15.5, 18.5].map((x) => (
            <circle key={x} cx={x} cy="13.5" fill={color} r="0.6" />
          ))}
        </g>
      );
    case 'speakon':
      return (
        <g>
          <circle cx="12" cy="12" fill="var(--bg)" r="9" stroke={color} strokeWidth="1.4" />
          <circle cx="9" cy="9.5" fill={color} r="1.4" />
          <circle cx="15" cy="9.5" fill={color} r="1.4" />
          <circle cx="9" cy="14.5" fill={color} r="1.4" />
          <circle cx="15" cy="14.5" fill={color} r="1.4" />
        </g>
      );
    case 'terminal':
      return (
        <g>
          <rect fill="var(--bg)" height="10" rx="1" stroke={color} strokeWidth="1.2" width="18" x="3" y="7" />
          {[6, 10, 14, 18].map((x) => (
            <g key={x}>
              <circle cx={x} cy="12" fill="var(--bg)" r="1.6" stroke={color} strokeWidth="0.8" />
              <line stroke={color} strokeWidth="0.6" x1={x - 0.8} x2={x + 0.8} y1="12" y2="12" />
            </g>
          ))}
        </g>
      );
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
