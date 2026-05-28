import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { devices } from '../../../data/devices';
import { validateConnection } from '../../../entities/cable/lib/validation';
import { endpointKey } from '../../../entities/cable/lib/endpoint-key';
import type { CableEndpoint } from '../../../entities/cable/model/types';
import { getDeviceById } from '../../../entities/device/lib/device-utils';
import { PortGlyph } from '../../../shared/audio/PortGlyph';
import { protocolMeta, resolveProtocolKey } from '../../../shared/audio';
import { REAR_GEOMETRY, type Point } from '../../../shared/constants/rack-geometry';
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

type PortState = 'idle' | 'compatible' | 'invalid' | 'source';

/**
 * Rear panel renderer + interactive patchbay.
 *
 * Drives the cable-drawing flow from the design canvas spec:
 *  - click a port → activeCableStart (source)
 *  - compatible ports get a pulsing accent ring; incompatible ports
 *    show a red halo
 *  - click another compatible port to commit; identical port to cancel
 *  - cable bezier "draws in" via stroke-dashoffset animation
 *
 * Color palette is the design-system protocol map — cable.color is set
 * at creation time by cableColorForPort(port) using the same hex values.
 */
export function RearRackSvg({ onPortHover, pointer }: RearRackSvgProps) {
  const installed = useRackStore((state) => state.installed);
  const cables = useRackStore((state) => state.cables);
  const activeCableStart = useRackStore((state) => state.activeCableStart);
  const selectedCableId = useRackStore((state) => state.selectedCableId);
  const hoveredCableId = useRackStore((state) => state.hoveredCableId);
  const setHoveredCable = useRackStore((state) => state.setHoveredCable);
  const startCable = useRackStore((state) => state.startCable);
  const completeCable = useRackStore((state) => state.completeCable);
  const selectDevice = useRackStore((state) => state.selectDevice);
  const selectCable = useRackStore((state) => state.selectCable);

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

  // Dense compact rows: when sockets pack closer than the threshold the
  // full labels would collide even rotated. Render those rows with only
  // the trailing digit, plus a single header label on the left.
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
  const portState = (location: PortLocation): PortState => {
    if (!start || !activeCableStart) return 'idle';
    if (
      location.instanceId === activeCableStart.instanceId &&
      location.port.id === activeCableStart.portId
    ) {
      return 'source';
    }
    if (location.instanceId === activeCableStart.instanceId) return 'invalid';
    return validateConnection(start.port, location.port).allowed ? 'compatible' : 'invalid';
  };

  const hoveredId = hoveredCableId;
  const pendingProtocol = activeCableStart
    ? resolveProtocolKey(start?.port.protocol)
    : undefined;
  const pendingColor = pendingProtocol ? protocolMeta(start?.port.protocol).hex : undefined;

  return (
    <>
      {/* ────────── Device panels ────────── */}
      {installed.map((instance) => {
        const device = getDeviceById(devices, instance.deviceId);
        if (!device) return null;
        const slotTop = RACK_TOP + instance.slot * UNIT_HEIGHT;
        const panelHeight = device.rackUnits * UNIT_HEIGHT - 1;
        const nameLabel = `${device.manufacturer.toUpperCase()} · ${device.name.toUpperCase()}`;
        return (
          <g key={instance.instanceId} onClick={() => selectDevice(instance.instanceId)}>
            <rect
              fill="#101113"
              height={panelHeight}
              rx="3"
              stroke="var(--line-2)"
              width={PANEL_WIDTH}
              x={PANEL_X}
              y={slotTop}
            />
            <rect
              fill="#0b0d10"
              height={NAME_STRIP}
              width={PANEL_WIDTH}
              x={PANEL_X}
              y={slotTop}
            />
            <rect
              fill={device.frontPanel.colorAccent}
              height="2"
              width={PANEL_WIDTH}
              x={PANEL_X}
              y={slotTop}
            />
            <text
              fill="var(--copy-2)"
              fontFamily="IBM Plex Mono, monospace"
              fontSize={NAME_FONT}
              fontWeight="500"
              x={PANEL_X + 12}
              y={slotTop + NAME_STRIP - 4}
            >
              {nameLabel}
            </text>
            <text
              fill="var(--muted-2)"
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

      {/* ────────── Routed cables ────────── */}
      {routedCables.map(({ id, cable, d }) => {
        const warning = cable.notices.some((notice) => notice.level === 'warning');
        const isSelected = selectedCableId === id;
        const isHovered = hoveredId === id;
        const isFocused = isSelected || isHovered;
        const hasFocusElsewhere = (hoveredId !== null && hoveredId !== id) || (selectedCableId !== null && selectedCableId !== id);
        const dim = hasFocusElsewhere ? 0.2 : isFocused ? 1 : 0.85;
        const stroke = isSelected
          ? 'var(--accent)'
          : warning
            ? 'var(--warning)'
            : cable.color;
        const protocolKey = resolveProtocolKey(undefined);
        void protocolKey;
        const select = () => selectCable(id);
        return (
          <g
            key={id}
            onClick={(event) => {
              event.stopPropagation();
              select();
            }}
            onPointerEnter={() => setHoveredCable(id)}
            onPointerLeave={() => setHoveredCable(null)}
            style={{ opacity: dim, cursor: 'pointer' }}
          >
            {/* shadow stroke */}
            <path
              d={d}
              fill="none"
              stroke="rgba(0,0,0,0.55)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isFocused ? 5 : 4}
              transform="translate(0, 1.5)"
            />
            {/* wide invisible hit target */}
            <path
              d={d}
              fill="none"
              pointerEvents="stroke"
              stroke="transparent"
              strokeWidth={18}
            />
            <motion.path
              animate={{ pathLength: 1 }}
              d={d}
              fill="none"
              initial={{ pathLength: 0 }}
              role="button"
              stroke={stroke}
              strokeDasharray={warning ? '6 5' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isFocused ? 3.2 : 2.4}
              style={{
                filter: isFocused
                  ? `drop-shadow(0 0 6px ${stroke})`
                  : undefined,
              }}
              transition={{ duration: 0.24, ease: [0.3, 0, 0, 1] }}
            />
            {/* endpoint dots */}
          </g>
        );
      })}

      {/* ────────── Active draw-in-progress cable ────────── */}
      {start && pointer && pendingColor && (
        <g pointerEvents="none">
          <path
            d={cablePath(start, pointer)}
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeLinecap="round"
            strokeWidth="4"
            transform="translate(0, 1.5)"
          />
          <motion.path
            animate={{ pathLength: 1 }}
            d={cablePath(start, pointer)}
            fill="none"
            initial={{ pathLength: 0 }}
            stroke={pendingColor}
            strokeDasharray="6 5"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
        </g>
      )}

      {/* ────────── Ports — interactive ────────── */}
      {locations.map((location) => {
        const state = portState(location);
        const denseInfo = location.compact ? denseRows.get(location.y) : undefined;
        const labelY = location.y + LABEL_OFFSET;
        const trailing = denseInfo ? location.port.label.match(/(\d+)$/)?.[1] : undefined;
        const label = trailing ?? location.port.label;
        const glyphState =
          state === 'compatible' ? 'compatible' : state === 'invalid' ? 'invalid' : 'idle';
        const isSource = state === 'source';

        return (
          <g
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
            style={{ cursor: 'pointer' }}
            tabIndex={0}
          >
            {/* No <title> tooltip — design spec routes port info to the status bar */}
            {isSource ? (
              <circle
                cx={location.x}
                cy={location.y}
                fill="none"
                opacity="0.55"
                r="13"
                stroke="var(--accent)"
                strokeWidth="1.4"
                style={{ animation: 'pulse-ring 1.2s ease-out infinite' }}
              />
            ) : null}
            <foreignObject
              height={22}
              style={{ overflow: 'visible' }}
              width={22}
              x={location.x - 11}
              y={location.y - 11}
            >
              <PortGlyph
                kind={location.compact ? undefined : undefined}
                port={location.port}
                size={20}
                state={glyphState}
              />
            </foreignObject>
            {location.showLabel && (
              <text
                fill="var(--muted)"
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

      {/* Dense-row group headers */}
      {Array.from(denseRows.entries()).map(([y, info]) => (
        <text
          fill="var(--muted-2)"
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

      {/* Cable warning markers — render as small accent dots; details go to the status bar */}
      {routedCables.map(({ id, cable, midpoint }) => {
        if (cable.notices.length === 0) return null;
        const isFocused = selectedCableId === id || hoveredId === id;
        return (
          <g
            key={`${id}-notice`}
            onClick={(event) => {
              event.stopPropagation();
              selectCable(id);
            }}
            onPointerEnter={() => setHoveredCable(id)}
            onPointerLeave={() => setHoveredCable(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={midpoint.x}
              cy={midpoint.y}
              fill="var(--warning)"
              opacity={isFocused ? 1 : 0.85}
              r="5"
              stroke="var(--bg)"
              strokeWidth="1.5"
            />
            <text
              fill="var(--bg)"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="7"
              fontWeight="700"
              textAnchor="middle"
              x={midpoint.x}
              y={midpoint.y + 2.5}
            >
              !
            </text>
          </g>
        );
      })}
    </>
  );
}
