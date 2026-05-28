import type { Cable } from '../../../entities/cable/model/types';
import { endpointKey } from '../../../entities/cable/lib/endpoint-key';
import type { Point, RackGeometry } from '../../../shared/constants/rack-geometry';
import type { PortLocation } from './port-geometry';

export interface RoutedCable {
  id: string;
  cable: Cable;
  from: PortLocation;
  to: PortLocation;
  /** SVG path through the assigned raceway lane, with rounded corners. */
  d: string;
  /** Which side of the rack the cable runs along. */
  side: 'left' | 'right';
  /** Mid-point along the vertical raceway segment (used for warning notices). */
  midpoint: Point;
}

interface Interval {
  cableId: string;
  min: number;
  max: number;
}

/**
 * Greedy interval colouring. Sorts intervals by their lower bound and packs each into the
 * lowest-indexed lane whose previous occupant has already ended. The result is the minimum
 * number of lanes required so that no two overlapping intervals share a lane.
 */
function assignLanes(intervals: Interval[]): Map<string, number> {
  const sorted = [...intervals].sort((a, b) => a.min - b.min || a.max - b.max);
  const lanes: number[] = [];
  const result = new Map<string, number>();
  sorted.forEach((interval) => {
    let placed = -1;
    for (let i = 0; i < lanes.length; i += 1) {
      if (lanes[i] < interval.min) {
        lanes[i] = interval.max;
        placed = i;
        break;
      }
    }
    if (placed === -1) {
      lanes.push(interval.max);
      placed = lanes.length - 1;
    }
    result.set(interval.cableId, placed);
  });
  return result;
}

/**
 * Builds an SVG path through a polyline with rounded 90° corners. Each corner is replaced by
 * a quadratic Bézier whose control point is the corner itself; the entry / exit are pulled
 * `radius` away from the corner so the curve stays smooth without overshooting short edges.
 */
function roundedManhattan(points: Point[], radius = 8): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const inDx = curr.x - prev.x;
    const inDy = curr.y - prev.y;
    const outDx = next.x - curr.x;
    const outDy = next.y - curr.y;
    const inLen = Math.hypot(inDx, inDy);
    const outLen = Math.hypot(outDx, outDy);
    const r = Math.max(0, Math.min(radius, inLen / 2, outLen / 2));
    const enterX = curr.x - (inLen ? (inDx / inLen) * r : 0);
    const enterY = curr.y - (inLen ? (inDy / inLen) * r : 0);
    const exitX = curr.x + (outLen ? (outDx / outLen) * r : 0);
    const exitY = curr.y + (outLen ? (outDy / outLen) * r : 0);
    d += ` L ${enterX.toFixed(2)} ${enterY.toFixed(2)}`;
    d += ` Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}, ${exitX.toFixed(2)} ${exitY.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return d;
}

/**
 * Routes every cable through one of the two side raceways using Manhattan-style segments.
 * Per-raceway lanes are assigned by interval-colouring on the cables' Y ranges so parallel
 * runs stay separated. Cables exiting the same panel cluster look like a tidy loom rather
 * than spaghetti.
 */
export function routeCables(
  cables: Cable[],
  positions: Map<string, PortLocation>,
  geometry: RackGeometry,
): RoutedCable[] {
  const panelMidX = geometry.PANEL_X + geometry.PANEL_WIDTH / 2;
  const leftRacewayBase = geometry.PANEL_X - Math.max(24, geometry.RACEWAY * 0.55);
  const rightRacewayBase =
    geometry.PANEL_X + geometry.PANEL_WIDTH + Math.max(24, geometry.RACEWAY * 0.55);
  const laneSpacing = 5;
  const cornerRadius = 8;

  const resolved = cables.flatMap((cable) => {
    const from = positions.get(endpointKey(cable.from));
    const to = positions.get(endpointKey(cable.to));
    if (!from || !to) return [];
    const avgX = (from.x + to.x) / 2;
    const side: 'left' | 'right' = avgX >= panelMidX ? 'right' : 'left';
    return [{ cable, from, to, side }];
  });

  const intervalsForSide = (side: 'left' | 'right'): Interval[] =>
    resolved
      .filter((entry) => entry.side === side)
      .map((entry) => ({
        cableId: entry.cable.id,
        min: Math.min(entry.from.y, entry.to.y),
        max: Math.max(entry.from.y, entry.to.y),
      }));

  const leftLanes = assignLanes(intervalsForSide('left'));
  const rightLanes = assignLanes(intervalsForSide('right'));

  return resolved.map((entry) => {
    const lanes = entry.side === 'left' ? leftLanes : rightLanes;
    const lane = lanes.get(entry.cable.id) ?? 0;
    const racewayX =
      entry.side === 'left'
        ? leftRacewayBase - lane * laneSpacing
        : rightRacewayBase + lane * laneSpacing;
    const points: Point[] = [
      { x: entry.from.x, y: entry.from.y },
      { x: racewayX, y: entry.from.y },
      { x: racewayX, y: entry.to.y },
      { x: entry.to.x, y: entry.to.y },
    ];
    return {
      id: entry.cable.id,
      cable: entry.cable,
      from: entry.from,
      to: entry.to,
      side: entry.side,
      d: roundedManhattan(points, cornerRadius),
      midpoint: { x: racewayX, y: (entry.from.y + entry.to.y) / 2 },
    };
  });
}
