import * as Tooltip from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { devices } from '../../../data/devices';
import { validateConnection } from '../../../entities/cable/lib/validation';
import { endpointKey } from '../../../entities/cable/lib/endpoint-key';
import type { CableEndpoint } from '../../../entities/cable/model/types';
import { getDeviceById } from '../../../entities/device/lib/device-utils';
import { PortGlyph, portColor } from '../../../entities/device/ui/PortGlyph';
import { REAR_GEOMETRY, type Point } from '../../../shared/constants/rack-geometry';
import { cn } from '../../../shared/lib/cn';
import { useRackStore } from '../../rack/model/use-rack-store';
import { routeCables } from '../lib/cable-router';
import { cablePath, layoutPorts, type PortLocation } from '../lib/port-geometry';

interface RearRackSvgProps {
  onPortHover: (endpoint: CableEndpoint | null) => void;
  pointer: Point | null;
}

const NAME_FONT = 11;
const LABEL_OFFSET = 14;
const ROTATE_THRESHOLD = 42;

export function RearRackSvg({ onPortHover, pointer }: RearRackSvgProps) {
  const installed = useRackStore((state) => state.installed);
  const cables = useRackStore((state) => state.cables);
  const activeCableStart = useRackStore((state) => state.activeCableStart);
  const selectedCableId = useRackStore((state) => state.selectedCableId);
  const startCable = useRackStore((state) => state.startCable);
  const completeCable = useRackStore((state) => state.completeCable);
  const selectDevice = useRackStore((state) => state.selectDevice);
  const selectCable = useRackStore((state) => state.selectCable);
  const [hoveredCableId, setHoveredCableId] = useState<string | null>(null);

  const geometry = REAR_GEOMETRY;
  const { PANEL_X, PANEL_WIDTH, UNIT_HEIGHT, RACK_TOP, NAME_STRIP } = geometry;

  const locations = useMemo(
    () =>
      installed.flatMap((instance) => {
        const device = getDeviceById(devices, instance.deviceId);
        return device ? layoutPorts(instance, device, geometry) : [];
      }),
    [installed, geometry],
  );
  const positionMap = useMemo(
    () =>
      new Map(
        locations.map((location) => [
          endpointKey({ instanceId: location.instanceId, portId: location.port.id }),
          location,
        ]),
      ),
    [locations],
  );

  // Dense compact rows: when sockets are packed closer than the threshold the full
  // labels collide even rotated. Switch those rows to short trailing-digit labels and
  // render the original group name once as a header at the leftmost socket.
  const denseRows = useMemo(() => {
    const byRowY = new Map<number, PortLocation[]>();
    locations.forEach((location) => {
      if (!location.compact) return;
      const list = byRowY.get(location.y) ?? [];
      list.push(location);
      byRowY.set(location.y, list);
    });
    const dense = new Map<number, { header: string; firstX: number }>();
    byRowY.forEach((rowPorts, y) => {
      if (rowPorts.length < 2) return;
      const xs = rowPorts.map((p) => p.x).sort((a, b) => a - b);
      let minSpacing = Infinity;
      for (let i = 1; i < xs.length; i += 1) {
        minSpacing = Math.min(minSpacing, xs[i] - xs[i - 1]);
      }
      if (minSpacing >= ROTATE_THRESHOLD) return;
      const leftmost = [...rowPorts].sort((a, b) => a.x - b.x)[0];
      const header = leftmost.port.label.replace(/\s+\d+$/, '');
      dense.set(y, { header, firstX: leftmost.x });
    });
    return dense;
  }, [locations]);

  const routedCables = useMemo(
    () => routeCables(cables, positionMap, geometry),
    [cables, positionMap, geometry],
  );

  const start = activeCableStart ? positionMap.get(endpointKey(activeCableStart)) : undefined;
  const portState = (location: PortLocation): string | undefined => {
    if (!start) return undefined;
    if (
      location.instanceId === activeCableStart?.instanceId &&
      location.port.id === activeCableStart.portId
    ) {
      return 'is-source';
    }
    if (location.instanceId === activeCableStart?.instanceId) return 'is-unavailable';
    return validateConnection(start.port, location.port).allowed
      ? 'is-compatible'
      : 'is-unavailable';
  };

  const hasHover = hoveredCableId !== null;

  return (
    <>
      {installed.map((instance) => {
        const device = getDeviceById(devices, instance.deviceId);
        if (!device) return null;
        const slotTop = RACK_TOP + instance.slot * UNIT_HEIGHT;
        const panelHeight = device.rackUnits * UNIT_HEIGHT - 1;
        const nameLabel = `${device.manufacturer.toUpperCase()} · ${device.name.toUpperCase()}`;
        return (
          <g key={instance.instanceId} onClick={() => selectDevice(instance.instanceId)}>
            <rect
              fill="#111418"
              height={panelHeight}
              rx="3"
              stroke="#333941"
              width={PANEL_WIDTH}
              x={PANEL_X}
              y={slotTop}
            />
            <rect fill="#0b0d10" height={NAME_STRIP} width={PANEL_WIDTH} x={PANEL_X} y={slotTop} />
            <rect
              fill={device.frontPanel.colorAccent}
              height="2"
              width={PANEL_WIDTH}
              x={PANEL_X}
              y={slotTop}
            />
            <text
              fill="#cdd2d8"
              fontFamily="IBM Plex Mono, monospace"
              fontSize={NAME_FONT}
              fontWeight="500"
              x={PANEL_X + 12}
              y={slotTop + NAME_STRIP - 4}
            >
              {nameLabel}
            </text>
            <text
              fill="#727986"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="9"
              textAnchor="end"
              x={PANEL_X + PANEL_WIDTH - 12}
              y={slotTop + NAME_STRIP - 4}
            >
              {device.rackUnits}U · REAR
            </text>
          </g>
        );
      })}

      {routedCables.map(({ id, cable, d }) => {
        const warning = cable.notices.some((notice) => notice.level === 'warning');
        const isSelected = selectedCableId === id;
        const isHovered = hoveredCableId === id;
        const isFocused = isSelected || isHovered;
        let dim = 0.55;
        if (hasHover && !isHovered) dim = 0.18;
        else if (isSelected) dim = 1;
        const select = () => selectCable(id);
        return (
          <g
            className={cn('cable-group', isFocused && 'is-focused', warning && 'is-warning')}
            key={id}
            onClick={(event) => {
              event.stopPropagation();
              select();
            }}
            onPointerEnter={() => setHoveredCableId(id)}
            onPointerLeave={() => setHoveredCableId((current) => (current === id ? null : current))}
            style={{ opacity: dim }}
          >
            <path
              className="patch-cable-hit"
              d={d}
              fill="none"
              pointerEvents="stroke"
              stroke="transparent"
              strokeWidth={18}
            />
            <motion.path
              animate={{ pathLength: 1 }}
              className="patch-cable"
              d={d}
              fill="none"
              initial={{ pathLength: 0 }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  select();
                }
              }}
              role="button"
              stroke={warning ? '#d4820a' : cable.color}
              strokeDasharray={warning ? '6 5' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isFocused ? 4 : 2.5}
              style={{
                filter: isFocused
                  ? `drop-shadow(0 0 6px ${warning ? '#d4820a' : cable.color})`
                  : undefined,
              }}
              tabIndex={0}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </g>
        );
      })}

      {hoveredCableId &&
        (() => {
          const hovered = routedCables.find((entry) => entry.id === hoveredCableId);
          if (!hovered) return null;
          const TT_WIDTH = 280;
          const TT_HEIGHT = 96;
          const tx = Math.max(
            8,
            Math.min(hovered.midpoint.x - TT_WIDTH / 2, geometry.VIEW_WIDTH - TT_WIDTH - 8),
          );
          const ty = Math.max(8, hovered.midpoint.y - TT_HEIGHT - 14);
          const sourceInstance = installed.find(
            (item) => item.instanceId === hovered.from.instanceId,
          );
          const destInstance = installed.find((item) => item.instanceId === hovered.to.instanceId);
          const sourceName =
            sourceInstance && getDeviceById(devices, sourceInstance.deviceId)?.name;
          const destName = destInstance && getDeviceById(devices, destInstance.deviceId)?.name;
          const protocol = (hovered.from.port.protocol ?? hovered.from.port.type).replaceAll(
            '_',
            ' ',
          );
          return (
            <foreignObject
              height={TT_HEIGHT}
              style={{ overflow: 'visible', pointerEvents: 'none' }}
              width={TT_WIDTH}
              x={tx}
              y={ty}
            >
              <div className="cable-floating-tooltip">
                <strong>
                  {sourceName ?? '?'} · {hovered.from.port.label}
                </strong>
                <span>
                  → {destName ?? '?'} · {hovered.to.port.label}
                </span>
                <small>{protocol}</small>
                {hovered.cable.notices.map((notice) => (
                  <em
                    className={`cable-tooltip__notice cable-tooltip__notice--${notice.level}`}
                    key={notice.message}
                  >
                    {notice.message}
                  </em>
                ))}
              </div>
            </foreignObject>
          );
        })()}

      {start && pointer && (
        <motion.path
          animate={{ pathLength: 1 }}
          d={cablePath(start, pointer)}
          fill="none"
          initial={{ pathLength: 0 }}
          stroke="#c8ff00"
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      )}

      {locations.map((location) => {
        const denseInfo = location.compact ? denseRows.get(location.y) : undefined;
        const labelY = location.y + LABEL_OFFSET;
        const trailing = denseInfo ? location.port.label.match(/(\d+)$/)?.[1] : undefined;
        const label = trailing ?? location.port.label;
        return (
          <g
            className={cn('rack-port', portState(location))}
            key={`${location.instanceId}:${location.port.id}`}
            onBlur={() => onPortHover(null)}
            onClick={(event) => {
              event.stopPropagation();
              if (activeCableStart) completeCable(location.instanceId, location.port.id);
              else startCable(location.instanceId, location.port.id);
            }}
            onFocus={() =>
              onPortHover({ instanceId: location.instanceId, portId: location.port.id })
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (activeCableStart) completeCable(location.instanceId, location.port.id);
                else startCable(location.instanceId, location.port.id);
              }
            }}
            onMouseEnter={() =>
              onPortHover({ instanceId: location.instanceId, portId: location.port.id })
            }
            onMouseLeave={() => onPortHover(null)}
            role="button"
            tabIndex={0}
          >
            <title>{`${location.port.label} — ${location.port.direction.toUpperCase()}`}</title>
            {location.compact ? (
              <>
                <circle cx={location.x} cy={location.y} fill="transparent" r="7" />
                <circle
                  cx={location.x}
                  cy={location.y}
                  fill="#101214"
                  r="3.4"
                  stroke={portColor(location.port)}
                  strokeWidth="1.4"
                />
              </>
            ) : (
              <PortGlyph port={location.port} x={location.x} y={location.y} />
            )}
            {location.showLabel && (
              <text
                fill="#9ca2ad"
                fontFamily="IBM Plex Mono, monospace"
                fontSize={denseInfo ? 8 : geometry.PORT_FONT_SIZE}
                textAnchor="middle"
                x={location.x}
                y={labelY}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}

      {Array.from(denseRows.entries()).map(([y, info]) => (
        <text
          fill="#6c727c"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="8"
          fontWeight="500"
          key={`header-${y}`}
          textAnchor="end"
          x={info.firstX - 14}
          y={y + 3}
        >
          {info.header.toUpperCase()}
        </text>
      ))}

      {routedCables.map(({ id, cable, midpoint }) => {
        if (cable.notices.length === 0) return null;
        return (
          <foreignObject
            height="22"
            key={`${id}-notice`}
            width="22"
            x={midpoint.x - 11}
            y={midpoint.y - 11}
          >
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button aria-label="Cable warning details" className="cable-notice" type="button" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="tooltip" sideOffset={5}>
                  {cable.notices.map((notice) => notice.message).join(' ')}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </foreignObject>
        );
      })}
    </>
  );
}
