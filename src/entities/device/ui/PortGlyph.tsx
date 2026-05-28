import { memo } from 'react';
import type { Port } from '../model/types';

export function portColor(port: Port): string {
  if (port.protocol === 'power') return '#e3bd3a';
  if (port.protocol === 'midi') return '#ad75e8';
  if (['dante', 'milan_avb'].includes(port.protocol ?? '')) return '#45bd70';
  if (port.protocol !== 'analog') return '#27bfd4';
  if (port.direction === 'in') return '#468cff';
  return '#e65350';
}

function PortGlyphComponent({ port, x, y }: { port: Port; x: number; y: number }) {
  const color = portColor(port);
  if (port.type.startsWith('rj45') || port.type === 'ethercon') {
    return (
      <g>
        <rect fill="#111418" height="12" rx="2" stroke={color} width="18" x={x - 9} y={y - 6} />
        {[0, 1, 2, 3].map((pin) => (
          <line
            key={pin}
            stroke={color}
            x1={x - 5 + pin * 3}
            x2={x - 5 + pin * 3}
            y1={y - 4}
            y2={y}
          />
        ))}
      </g>
    );
  }
  if (port.type === 'db25_dsub') {
    return (
      <rect fill="#14171a" height="10" rx="4" stroke={color} width="24" x={x - 12} y={y - 5} />
    );
  }
  if (port.type === 'jack_trs' || port.type === 'jack_ts') {
    return (
      <g>
        <circle cx={x} cy={y} fill="#101214" r="6" stroke={color} />
        <circle cx={x} cy={y} fill={color} r="2" />
      </g>
    );
  }
  return (
    <g>
      <circle cx={x} cy={y} fill="#111418" r="7" stroke={color} />
      {port.type.startsWith('xlr') && (
        <>
          <circle cx={x} cy={y - 3} fill={color} r="1" />
          <circle cx={x - 3} cy={y + 2} fill={color} r="1" />
          <circle cx={x + 3} cy={y + 2} fill={color} r="1" />
        </>
      )}
    </g>
  );
}

export const PortGlyph = memo(PortGlyphComponent);
