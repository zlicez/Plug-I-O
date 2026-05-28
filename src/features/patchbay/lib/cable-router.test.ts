import { describe, expect, it } from 'vitest';
import { endpointKey } from '../../../entities/cable/lib/endpoint-key';
import type { Cable } from '../../../entities/cable/model/types';
import type { Port } from '../../../entities/device/model/types';
import { REAR_GEOMETRY } from '../../../shared/constants/rack-geometry';
import { routeCables } from './cable-router';
import type { PortLocation } from './port-geometry';

const port = (id: string, direction: Port['direction'] = 'out'): Port => ({
  id,
  label: id.toUpperCase(),
  type: 'xlr_analog',
  direction,
  protocol: 'analog',
});

const location = (instanceId: string, portId: string, x: number, y: number): PortLocation => ({
  instanceId,
  port: port(portId),
  x,
  y,
});

const cable = (id: string, from: PortLocation, to: PortLocation): Cable => ({
  id,
  from: { instanceId: from.instanceId, portId: from.port.id },
  to: { instanceId: to.instanceId, portId: to.port.id },
  color: '#4388ff',
  notices: [],
});

describe('routeCables', () => {
  it('assigns distinct raceway lanes to cables with overlapping vertical ranges', () => {
    const a1 = location('A', 'out-1', 200, 100);
    const a2 = location('A', 'out-2', 200, 120);
    const b1 = location('B', 'in-1', 220, 400);
    const b2 = location('B', 'in-2', 220, 420);
    const positions = new Map<string, PortLocation>([
      [endpointKey({ instanceId: 'A', portId: a1.port.id }), a1],
      [endpointKey({ instanceId: 'A', portId: a2.port.id }), a2],
      [endpointKey({ instanceId: 'B', portId: b1.port.id }), b1],
      [endpointKey({ instanceId: 'B', portId: b2.port.id }), b2],
    ]);
    const routed = routeCables(
      [cable('c1', a1, b1), cable('c2', a2, b2)],
      positions,
      REAR_GEOMETRY,
    );
    expect(routed).toHaveLength(2);
    // Both cables should resolve to the same raceway side and use distinct lane X.
    expect(routed[0].side).toBe(routed[1].side);
    expect(routed[0].midpoint.x).not.toBe(routed[1].midpoint.x);
  });

  it('reuses the same lane for non-overlapping cables', () => {
    const a = location('A', 'out', 200, 100);
    const b = location('B', 'in', 250, 200);
    const c = location('C', 'out', 200, 500);
    const d = location('D', 'in', 250, 600);
    const positions = new Map<string, PortLocation>([
      [endpointKey({ instanceId: 'A', portId: a.port.id }), a],
      [endpointKey({ instanceId: 'B', portId: b.port.id }), b],
      [endpointKey({ instanceId: 'C', portId: c.port.id }), c],
      [endpointKey({ instanceId: 'D', portId: d.port.id }), d],
    ]);
    const routed = routeCables(
      [cable('top', a, b), cable('bottom', c, d)],
      positions,
      REAR_GEOMETRY,
    );
    expect(routed).toHaveLength(2);
    // Non-overlapping Y ranges → both can sit in lane 0 → same raceway X.
    expect(routed[0].midpoint.x).toBe(routed[1].midpoint.x);
  });

  it('picks the side of the rack closer to the cable endpoints', () => {
    const leftFrom = location('A', 'l-out', 200, 100);
    const leftTo = location('B', 'l-in', 220, 200);
    const rightFrom = location('C', 'r-out', 900, 100);
    const rightTo = location('D', 'r-in', 920, 200);
    const positions = new Map<string, PortLocation>([
      [endpointKey({ instanceId: 'A', portId: leftFrom.port.id }), leftFrom],
      [endpointKey({ instanceId: 'B', portId: leftTo.port.id }), leftTo],
      [endpointKey({ instanceId: 'C', portId: rightFrom.port.id }), rightFrom],
      [endpointKey({ instanceId: 'D', portId: rightTo.port.id }), rightTo],
    ]);
    const routed = routeCables(
      [cable('left', leftFrom, leftTo), cable('right', rightFrom, rightTo)],
      positions,
      REAR_GEOMETRY,
    );
    const left = routed.find((entry) => entry.id === 'left')!;
    const right = routed.find((entry) => entry.id === 'right')!;
    expect(left.side).toBe('left');
    expect(right.side).toBe('right');
  });

  it('skips cables whose endpoints are not in the position map', () => {
    const here = location('A', 'present', 200, 100);
    const positions = new Map([[endpointKey({ instanceId: 'A', portId: here.port.id }), here]]);
    const orphan = cable('orphan', here, location('B', 'missing', 300, 200));
    expect(routeCables([orphan], positions, REAR_GEOMETRY)).toHaveLength(0);
  });
});
