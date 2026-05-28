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
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { devices } from '../../../data/devices';
import type { CableEndpoint } from '../../../entities/cable/model/types';
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
import { RearRackSvg } from '../../patchbay/ui/RearRackSvg';
import { PatchStatusBar } from '../../patchbay/ui/PatchStatusBar';
import { useRackStore } from '../model/use-rack-store';

interface DraggedItem {
  device: Device;
  instanceId?: string;
}

interface RackCanvasProps {
  draggedItem: DraggedItem | null;
}

function RackFrame({ rackSize, geometry }: { rackSize: number; geometry: RackGeometry }) {
  const { UNIT_HEIGHT, PANEL_WIDTH, PANEL_X, RACK_TOP, RACK_WIDTH, RACK_X } = geometry;
  const height = rackSize * UNIT_HEIGHT;
  const numberFontSize = Math.max(8, Math.round(UNIT_HEIGHT * 0.22));
  const numberX = Math.max(8, RACK_X - 22);
  return (
    <>
      <defs>
        <pattern height="5" id="empty-slot" patternUnits="userSpaceOnUse" width="5">
          <path d="M 0 5 L 5 0" stroke="#282c32" strokeWidth="1" />
        </pattern>
        <linearGradient id="rail" x2="1">
          <stop stopColor="#111316" />
          <stop offset="0.5" stopColor="#444950" />
          <stop offset="1" stopColor="#17191d" />
        </linearGradient>
      </defs>
      <rect fill="#0e1012" height={height + 12} rx="3" width={RACK_WIDTH} x={RACK_X} y={2} />
      <rect fill="url(#rail)" height={height} width="21" x={RACK_X + 7} y={RACK_TOP} />
      <rect
        fill="url(#rail)"
        height={height}
        width="21"
        x={RACK_X + RACK_WIDTH - 28}
        y={RACK_TOP}
      />
      {Array.from({ length: rackSize }, (_, index) => {
        const y = RACK_TOP + index * UNIT_HEIGHT;
        return (
          <g key={index}>
            <text
              fill="#727986"
              fontFamily="IBM Plex Mono, monospace"
              fontSize={numberFontSize}
              x={numberX}
              y={y + UNIT_HEIGHT / 2 + numberFontSize / 3}
            >
              {index + 1}U
            </text>
            <rect
              fill="url(#empty-slot)"
              height={UNIT_HEIGHT - 1}
              stroke="#2c3036"
              strokeDasharray="3 3"
              width={PANEL_WIDTH}
              x={PANEL_X}
              y={y}
            />
            {[RACK_X + 17, RACK_X + RACK_WIDTH - 17].map((x) => (
              <circle
                cx={x}
                cy={y + UNIT_HEIGHT / 2}
                fill="#0c0e10"
                key={x}
                r="4"
                stroke="#737981"
              />
            ))}
          </g>
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
  let status = 'NO SPACE';
  if (swapping) status = 'SWAP';
  else if (valid && draggedItem) status = `PLACE ${draggedItem.device.rackUnits}U`;
  return (
    <div
      className={cn(
        'drop-slot',
        isOver && (valid ? 'is-valid' : 'is-invalid'),
        isOver && swapping && 'is-swap',
      )}
      ref={setNodeRef}
      style={{
        height,
        left: FRONT_GEOMETRY.PANEL_X,
        top: FRONT_GEOMETRY.RACK_TOP + index * unit,
        width: FRONT_GEOMETRY.PANEL_WIDTH,
      }}
    >
      {isOver && draggedItem && <span>{status}</span>}
    </div>
  );
}

function SortableDevice({ instance }: { instance: InstalledDevice }) {
  const selectDevice = useRackStore((state) => state.selectDevice);
  const device = getDeviceById(devices, instance.deviceId);
  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({
    id: `rack:${instance.instanceId}`,
    data: { kind: 'installed', instanceId: instance.instanceId },
  });
  if (!device) return null;
  return (
    <button
      aria-label={`Move or inspect ${device.name}`}
      className={cn('installed-interaction', isDragging && 'is-dragging')}
      onClick={() => selectDevice(instance.instanceId)}
      ref={setNodeRef}
      style={{
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
  const viewMode = useRackStore((state) => state.viewMode);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPort, setHoveredPort] = useState<CableEndpoint | null>(null);
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
      (bounds.width - 40) / viewWidth,
      (bounds.height - 40) / (height + 28),
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

  return (
    <div
      className={cn('rack-viewport', isPanning && 'is-panning')}
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={stopPanning}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopPanning}
      onWheel={onWheel}
      ref={viewportRef}
    >
      <div className="canvas-controls">
        <Button
          aria-label="Zoom out"
          onClick={() => {
            hasManualCamera.current = true;
            setScale((value) => clampScale(value - 0.12));
          }}
          size="icon"
          variant="secondary"
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          aria-label="Reset camera"
          onClick={() => {
            hasManualCamera.current = false;
            fitView();
          }}
          size="icon"
          variant="secondary"
        >
          <Focus size={16} />
        </Button>
        <Button
          aria-label="Zoom in"
          onClick={() => {
            hasManualCamera.current = true;
            setScale((value) => clampScale(value + 0.12));
          }}
          size="icon"
          variant="secondary"
        >
          <ZoomIn size={16} />
        </Button>
      </div>
      <div
        className="rack-camera"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
      >
        <div className="rack-stage">
          <p className="rack-stage__label">
            {viewMode === 'front' ? 'FRONT PANEL' : 'REAR PATCHING'}
          </p>
          <motion.div
            animate={{ rotateY: 0, opacity: 1 }}
            className="rack-flip"
            initial={{ rotateY: viewMode === 'rear' ? -86 : 86, opacity: 0.35 }}
            key={viewMode}
            ref={ref}
            style={{ height, width: viewWidth }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
          >
            <svg
              aria-label={`${rackSize}U rack ${viewMode} view`}
              className="rack-svg"
              height={height}
              onPointerMove={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                setPointer({
                  x: ((event.clientX - bounds.left) / bounds.width) * viewWidth,
                  y: ((event.clientY - bounds.top) / bounds.height) * height,
                });
              }}
              role="img"
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
            {viewMode === 'front' && (
              <div className={cn('rack-hit-layer', draggedItem && 'is-dragging')}>
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
            )}
          </motion.div>
        </div>
      </div>
      <PatchStatusBar hoveredEndpoint={hoveredPort} />
    </div>
  );
});

RackCanvas.displayName = 'RackCanvas';
