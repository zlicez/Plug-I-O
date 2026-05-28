import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Focus, ZoomIn, ZoomOut } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { devices } from '../../../data/devices';
import {
  canPlaceDevice,
  getDeviceById,
  resolveDeviceMove,
} from '../../../entities/device/lib/device-utils';
import type { Device, InstalledDevice } from '../../../entities/device/model/types';
import { FrontPanelSvg } from '../../../entities/device/ui/FrontPanelSvg';
import {
  FRONT_GEOMETRY,
  REAR_GEOMETRY,
  type RackGeometry,
} from '../../../shared/constants/rack-geometry';
import { cn } from '../../../shared/lib/cn';
import { Button } from '../../../shared/ui/Button';
import { Chip } from '../../../shared/ui/Chip';
import { Eyebrow } from '../../../shared/ui/Eyebrow';
import { Kbd } from '../../../shared/ui/Kbd';
import { Tooltip } from '../../../shared/ui/Tooltip';
import { RearRackSvg } from '../../patchbay/ui/RearRackSvg';
import { useRackStore } from '../model/use-rack-store';

interface DraggedItem {
  device: Device;
  instanceId?: string;
}

interface RackCanvasProps {
  draggedItem: DraggedItem | null;
}

// ─────────────────────────────────────────────────────────────
// Chassis chrome — 19" rack with ears, screws, U-indices.
// Drawn in SVG so it scales with the camera transform; matches the
// design-canvas chassis (gradient body, recessed inner cavity).
// ─────────────────────────────────────────────────────────────
function RackFrame({ rackSize, geometry }: { rackSize: number; geometry: RackGeometry }) {
  const { UNIT_HEIGHT, PANEL_WIDTH, PANEL_X, RACK_TOP, RACK_WIDTH, RACK_X } = geometry;
  const innerH = rackSize * UNIT_HEIGHT;
  const numberFontSize = Math.max(8, Math.round(UNIT_HEIGHT * 0.22));
  const numberX = Math.max(8, RACK_X - 22);
  const earWidth = (PANEL_X - RACK_X) - 2;
  const innerY = RACK_TOP;
  const screwR = Math.min(4, numberFontSize * 0.55);

  return (
    <>
      <defs>
        <linearGradient id="chassisGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1A1B1D" />
          <stop offset="1" stopColor="#141517" />
        </linearGradient>
        <radialGradient id="screwGradient">
          <stop offset="0.1" stopColor="#4a4d52" />
          <stop offset="0.7" stopColor="#1c1d1f" />
        </radialGradient>
        <pattern height={UNIT_HEIGHT} id="u-guide" patternUnits="userSpaceOnUse" width={PANEL_WIDTH}>
          <line stroke="#1A1B1D" strokeWidth="1" x1="0" x2={PANEL_WIDTH} y1="0" y2="0" />
          <line
            stroke="#15171A"
            strokeDasharray="2 5"
            x1="0"
            x2={PANEL_WIDTH}
            y1={UNIT_HEIGHT / 2}
            y2={UNIT_HEIGHT / 2}
          />
        </pattern>
      </defs>

      {/* outer chassis */}
      <rect
        fill="url(#chassisGradient)"
        height={innerH + 28}
        rx="6"
        stroke="#2A2C2F"
        width={RACK_WIDTH}
        x={RACK_X}
        y={innerY - 14}
      />

      {/* left mounting ear */}
      <rect
        fill="#0E0F11"
        height={innerH}
        rx="2"
        stroke="#2A2C2F"
        width={earWidth}
        x={RACK_X + 1}
        y={innerY}
      />
      {[innerY + 10, innerY + innerH - 10].map((cy) => (
        <g key={`L${cy}`}>
          <circle
            cx={RACK_X + earWidth / 2 + 1}
            cy={cy}
            fill="url(#screwGradient)"
            r={screwR}
            stroke="#050608"
            strokeWidth="0.5"
          />
          <line
            stroke="#2a2c2f"
            strokeWidth="0.6"
            transform={`rotate(45 ${RACK_X + earWidth / 2 + 1} ${cy})`}
            x1={RACK_X + earWidth / 2 + 1 - screwR + 0.6}
            x2={RACK_X + earWidth / 2 + 1 + screwR - 0.6}
            y1={cy}
            y2={cy}
          />
        </g>
      ))}

      {/* right mounting ear */}
      <rect
        fill="#0E0F11"
        height={innerH}
        rx="2"
        stroke="#2A2C2F"
        width={earWidth}
        x={RACK_X + RACK_WIDTH - earWidth - 1}
        y={innerY}
      />
      {[innerY + 10, innerY + innerH - 10].map((cy) => (
        <g key={`R${cy}`}>
          <circle
            cx={RACK_X + RACK_WIDTH - earWidth / 2 - 1}
            cy={cy}
            fill="url(#screwGradient)"
            r={screwR}
            stroke="#050608"
            strokeWidth="0.5"
          />
          <line
            stroke="#2a2c2f"
            strokeWidth="0.6"
            transform={`rotate(45 ${RACK_X + RACK_WIDTH - earWidth / 2 - 1} ${cy})`}
            x1={RACK_X + RACK_WIDTH - earWidth / 2 - 1 - screwR + 0.6}
            x2={RACK_X + RACK_WIDTH - earWidth / 2 - 1 + screwR - 0.6}
            y1={cy}
            y2={cy}
          />
        </g>
      ))}

      {/* inner cavity (recessed) */}
      <rect fill="#0E0F11" height={innerH} width={PANEL_WIDTH} x={PANEL_X} y={innerY} />
      <rect
        fill="url(#u-guide)"
        height={innerH}
        opacity="0.6"
        pointerEvents="none"
        width={PANEL_WIDTH}
        x={PANEL_X}
        y={innerY}
      />

      {/* U-index column (to the left of the ear) */}
      {Array.from({ length: rackSize }, (_, index) => {
        const y = innerY + index * UNIT_HEIGHT;
        return (
          <text
            fill="#5D636C"
            fontFamily="IBM Plex Mono, monospace"
            fontSize={numberFontSize}
            key={index}
            textAnchor="end"
            x={numberX}
            y={y + UNIT_HEIGHT / 2 + numberFontSize / 3}
          >
            {String(rackSize - index).padStart(2, '0')}
          </text>
        );
      })}
    </>
  );
}

function DropSlot({ index, draggedItem }: { index: number; draggedItem: DraggedItem | null }) {
  const installed = useRackStore((state) => state.installed);
  const rackSize = useRackStore((state) => state.rackSize);
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${index}`, data: { slot: index } });
  const directFit =
    draggedItem &&
    canPlaceDevice(installed, devices, draggedItem.device, index, rackSize, draggedItem.instanceId);
  const moveResolution = draggedItem?.instanceId
    ? resolveDeviceMove(installed, devices, draggedItem.instanceId, index, rackSize)
    : null;
  const valid = Boolean(directFit || moveResolution);
  const swapping = Boolean(moveResolution?.swap);
  const unit = FRONT_GEOMETRY.UNIT_HEIGHT;
  const height = isOver && draggedItem ? draggedItem.device.rackUnits * unit : unit;
  let statusLabel = 'NO SPACE';
  if (swapping) statusLabel = 'SWAP';
  else if (valid && draggedItem) statusLabel = `PLACE ${draggedItem.device.rackUnits}U`;

  const baseClasses =
    'absolute pointer-events-auto transition-colors duration-150 ease-standard';
  let stateClasses = '';
  if (isOver && draggedItem) {
    stateClasses = valid
      ? swapping
        ? 'border border-warning bg-warning-soft'
        : 'border border-accent bg-accent-soft animate-pulse'
      : 'border border-danger bg-danger-soft';
  }

  return (
    <div
      className={cn(baseClasses, stateClasses)}
      ref={setNodeRef}
      style={{
        height,
        left: FRONT_GEOMETRY.PANEL_X,
        top: FRONT_GEOMETRY.RACK_TOP + index * unit,
        width: FRONT_GEOMETRY.PANEL_WIDTH,
        borderRadius: 2,
      }}
    >
      {isOver && draggedItem ? (
        <span
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 rounded-pill px-2 py-0.5',
            'font-mono text-10 tracking-[0.12em]',
            valid
              ? swapping
                ? 'bg-warning text-bg'
                : 'bg-accent text-accent-text'
              : 'bg-danger text-copy',
          )}
        >
          {statusLabel}
        </span>
      ) : null}
    </div>
  );
}

function SortableDevice({ instance }: { instance: InstalledDevice }) {
  const selectDevice = useRackStore((state) => state.selectDevice);
  const selectedDeviceId = useRackStore((state) => state.selectedDeviceId);
  const device = getDeviceById(devices, instance.deviceId);
  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({
    id: `rack:${instance.instanceId}`,
    data: { kind: 'installed', instanceId: instance.instanceId },
  });
  if (!device) return null;
  const isSelected = selectedDeviceId === instance.instanceId;
  return (
    <button
      aria-label={`Move or inspect ${device.name}`}
      className={cn(
        'absolute installed-interaction rounded-xs focus-visible:outline-none',
        isDragging && 'opacity-0',
      )}
      onClick={() => selectDevice(instance.instanceId)}
      ref={setNodeRef}
      style={{
        boxShadow: isSelected
          ? '0 0 0 1px var(--accent), 0 0 28px -4px rgba(200,255,0,0.32)'
          : undefined,
        height: device.rackUnits * FRONT_GEOMETRY.UNIT_HEIGHT,
        left: FRONT_GEOMETRY.PANEL_X,
        top: FRONT_GEOMETRY.RACK_TOP + instance.slot * FRONT_GEOMETRY.UNIT_HEIGHT,
        transform: CSS.Transform.toString(transform),
        transition,
        width: FRONT_GEOMETRY.PANEL_WIDTH,
      }}
      type="button"
      {...attributes}
      {...listeners}
    />
  );
}

export const RackCanvas = forwardRef<HTMLDivElement, RackCanvasProps>(({ draggedItem }, ref) => {
  const rackSize = useRackStore((state) => state.rackSize);
  const installed = useRackStore((state) => state.installed);
  const cables = useRackStore((state) => state.cables);
  const viewMode = useRackStore((state) => state.viewMode);
  const activeCableStart = useRackStore((state) => state.activeCableStart);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const setHoveredPort = useRackStore((state) => state.setHoveredPort);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasManualCamera = useRef(false);
  const panStart = useRef<{ clientX: number; clientY: number; x: number; y: number } | null>(null);
  const geometry: RackGeometry = viewMode === 'rear' ? REAR_GEOMETRY : FRONT_GEOMETRY;
  const viewWidth = geometry.VIEW_WIDTH;
  const height = rackSize * geometry.UNIT_HEIGHT + 16;
  const installedWithDevices = useMemo(
    () =>
      installed.flatMap((instance) => {
        const device = getDeviceById(devices, instance.deviceId);
        return device ? [{ instance, device }] : [];
      }),
    [installed],
  );
  const clampScale = (value: number) => Math.max(0.32, Math.min(2.6, value));
  const fitView = useCallback(() => {
    const bounds = viewportRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;
    const fitted = Math.min(
      1.42,
      (bounds.width - 80) / viewWidth,
      (bounds.height - 80) / (height + 28),
    );
    setPan({ x: 0, y: 0 });
    setScale(clampScale(fitted));
  }, [height, viewWidth]);

  useEffect(() => {
    hasManualCamera.current = false;
    fitView();
  }, [fitView, rackSize, viewMode]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const observer = new ResizeObserver(() => {
      if (!hasManualCamera.current) fitView();
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [fitView]);

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    hasManualCamera.current = true;
    setScale((value) => clampScale(value - event.deltaY * 0.0015));
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const touchTarget = (event.target as Element).closest(
      '.installed-interaction, .rack-port, button, select, input',
    );
    const canPan =
      event.button === 1 || event.button === 2 || (event.pointerType === 'touch' && !touchTarget);
    if (!canPan) return;
    event.preventDefault();
    hasManualCamera.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    panStart.current = { clientX: event.clientX, clientY: event.clientY, ...pan };
    setIsPanning(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!panStart.current) return;
    setPan({
      x: panStart.current.x + event.clientX - panStart.current.clientX,
      y: panStart.current.y + event.clientY - panStart.current.clientY,
    });
  };
  const stopPanning = (event: PointerEvent<HTMLDivElement>) => {
    if (!panStart.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    panStart.current = null;
    setIsPanning(false);
  };

  // Dot-grid background — matches design canvas.
  const viewportStyle: CSSProperties = {
    backgroundColor: 'var(--bg)',
    backgroundImage: 'radial-gradient(circle, #1A1B1D 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    cursor: isPanning ? 'grabbing' : undefined,
  };

  return (
    <div
      className={cn(
        'relative flex-1 min-h-0 overflow-hidden touch-none select-none',
        isPanning && 'cursor-grabbing',
      )}
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={stopPanning}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopPanning}
      onWheel={onWheel}
      ref={viewportRef}
      style={viewportStyle}
    >
      {/* Top-left chips */}
      <div className="pointer-events-auto absolute left-3 top-3 z-10 flex items-center gap-2">
        <Eyebrow>Canvas</Eyebrow>
        <Chip active>{viewMode === 'front' ? 'FRONT' : 'REAR'} VIEW</Chip>
        {activeCableStart ? (
          <span
            className={cn(
              'inline-flex h-5.5 items-center gap-1.5 rounded-pill border border-accent px-2',
              'font-mono text-11 text-accent',
            )}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-pill bg-accent"
              style={{ animation: 'pulse-ring 1.2s infinite' }}
            />
            Drawing cable
          </span>
        ) : null}
      </div>

      {/* Top-right zoom toolbar */}
      <div className="pointer-events-auto absolute right-3 top-3 z-10 flex items-center gap-1">
        <Tooltip content="Zoom out">
          <Button
            aria-label="Zoom out"
            onClick={() => {
              hasManualCamera.current = true;
              setScale((value) => clampScale(value - 0.12));
            }}
            size="icon"
            variant="ghost"
          >
            <ZoomOut size={14} />
          </Button>
        </Tooltip>
        <Chip>{Math.round(scale * 100)}%</Chip>
        <Tooltip content="Zoom in">
          <Button
            aria-label="Zoom in"
            onClick={() => {
              hasManualCamera.current = true;
              setScale((value) => clampScale(value + 0.12));
            }}
            size="icon"
            variant="ghost"
          >
            <ZoomIn size={14} />
          </Button>
        </Tooltip>
        <Tooltip content="Reset camera (Fit)">
          <Button
            aria-label="Reset camera"
            onClick={() => {
              hasManualCamera.current = false;
              fitView();
            }}
            size="icon"
            variant="ghost"
          >
            <Focus size={14} />
          </Button>
        </Tooltip>
      </div>

      {/* Camera */}
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        <div className="flex flex-col items-center" style={{ perspective: 1600 }}>
          <div className="mb-2 font-mono text-10 uppercase tracking-[0.14em] text-muted-2">
            {viewMode === 'front' ? 'FRONT PANEL' : 'REAR PATCHING'}
          </div>
          <motion.div
            animate={{ rotateY: 0, opacity: 1 }}
            initial={{ rotateY: viewMode === 'rear' ? -86 : 86, opacity: 0.35 }}
            key={viewMode}
            ref={ref}
            style={{ height, transformStyle: 'preserve-3d', width: viewWidth }}
            transition={{ duration: 0.48, ease: [0.3, 0, 0, 1] }}
          >
            <svg
              aria-label={`${rackSize}U rack ${viewMode} view`}
              height={height}
              onPointerMove={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                setPointer({
                  x: ((event.clientX - bounds.left) / bounds.width) * viewWidth,
                  y: ((event.clientY - bounds.top) / bounds.height) * height,
                });
              }}
              role="img"
              style={{ display: 'block' }}
              viewBox={`0 0 ${viewWidth} ${height}`}
              width={viewWidth}
            >
              <RackFrame geometry={geometry} rackSize={rackSize} />
              {viewMode === 'front' &&
                installedWithDevices.map(({ instance, device }) => (
                  <g
                    key={instance.instanceId}
                    opacity={draggedItem?.instanceId === instance.instanceId ? 0.28 : 1}
                  >
                    <FrontPanelSvg
                      device={device}
                      height={device.rackUnits * FRONT_GEOMETRY.UNIT_HEIGHT}
                      width={FRONT_GEOMETRY.PANEL_WIDTH}
                      x={FRONT_GEOMETRY.PANEL_X}
                      y={FRONT_GEOMETRY.RACK_TOP + instance.slot * FRONT_GEOMETRY.UNIT_HEIGHT}
                    />
                  </g>
                ))}
              {viewMode === 'rear' && (
                <RearRackSvg onPortHover={setHoveredPort} pointer={pointer} />
              )}
            </svg>

            {viewMode === 'front' ? (
              <div
                className={cn(
                  'absolute inset-0',
                  draggedItem && 'pointer-events-auto',
                  !draggedItem && 'pointer-events-none',
                )}
                style={{ pointerEvents: draggedItem ? 'auto' : 'none' }}
              >
                {Array.from({ length: rackSize }, (_, index) => (
                  <DropSlot draggedItem={draggedItem} index={index} key={index} />
                ))}
                <SortableContext
                  items={installed.map((item) => `rack:${item.instanceId}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {installed.map((instance) => (
                    <SortableDevice instance={instance} key={instance.instanceId} />
                  ))}
                </SortableContext>
              </div>
            ) : null}

            {/* Empty rack hint */}
            {installed.length === 0 && !draggedItem ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
                style={{
                  left: FRONT_GEOMETRY.PANEL_X,
                  top: FRONT_GEOMETRY.RACK_TOP,
                  width: FRONT_GEOMETRY.PANEL_WIDTH,
                  height: rackSize * FRONT_GEOMETRY.UNIT_HEIGHT,
                }}
              >
                <svg
                  fill="none"
                  height="40"
                  style={{ marginBottom: 14 }}
                  viewBox="0 0 56 40"
                  width="56"
                >
                  <rect
                    height="36"
                    rx="2"
                    stroke="var(--line-2)"
                    strokeDasharray="3 4"
                    strokeWidth="1"
                    width="52"
                    x="2"
                    y="2"
                  />
                  <line stroke="var(--line-2)" strokeDasharray="2 3" x1="8" x2="48" y1="20" y2="20" />
                  <circle cx="14" cy="14" fill="var(--accent)" r="2" />
                  <circle cx="14" cy="26" fill="var(--accent)" opacity="0.4" r="2" />
                </svg>
                <Eyebrow>Empty rack</Eyebrow>
                <div className="mt-1 text-14 font-medium text-copy-2">
                  Drag a device from the library
                </div>
                <div className="mt-1 font-mono text-12 text-muted-2">
                  or press <Kbd>⌘K</Kbd> to search
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Bottom hint bar */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-11 text-muted-2">
          <Kbd>V</Kbd>
          <span>front</span>
          <span className="mx-1">·</span>
          <Kbd>R</Kbd>
          <span>rear</span>
          <span className="mx-1">·</span>
          <Kbd>⌘Z</Kbd>
          <span>undo</span>
        </div>
        <div className="font-mono text-11 text-muted-2">
          {rackSize}U · {installed.length} devices · {cables.length} cables
        </div>
      </div>

    </div>
  );
});

RackCanvas.displayName = 'RackCanvas';
