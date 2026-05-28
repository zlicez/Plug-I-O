import { motion } from 'framer-motion';
import { memo } from 'react';
import type { Device, FrontControl } from '../model/types';

interface FrontPanelSvgProps {
  device: Device;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  animateMeters?: boolean;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

interface ControlContext {
  accent: string;
  knobFill: string;
  height: number;
  cy: number;
  step: number;
  animateMeters: boolean;
}

/** Renders a single front-panel control. Layout maths live in the parent. */
function ControlGlyph({
  control,
  cx,
  ctx,
}: {
  control: FrontControl;
  cx: number;
  ctx: ControlContext;
}) {
  const { accent, knobFill, height, cy, step, animateMeters } = ctx;

  if (control.type === 'meter') {
    const meterWidth = clamp(step * 0.7, 12, 24);
    const barWidth = meterWidth - 4;
    const barX = cx - meterWidth / 2 + 2;
    return (
      <g>
        <rect
          fill="#101510"
          height="13"
          rx="1"
          width={meterWidth}
          x={cx - meterWidth / 2}
          y={cy - 7}
        />
        {animateMeters ? (
          // Animate scaleX (transform) rather than the width attribute — framer-motion
          // briefly writes `width="undefined"` on keyframe transitions when animating
          // the attribute directly, polluting the console with SVG warnings.
          <motion.rect
            animate={{ scaleX: [0.25, 1, 0.45, 1.1, 0.3] }}
            fill="#c8ff00"
            height="3"
            style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
            transition={{ duration: 2.2, repeat: Infinity }}
            width={barWidth}
            x={barX}
            y={cy + 2}
          />
        ) : (
          <rect fill="#c8ff00" height="3" width={meterWidth * 0.6} x={barX} y={cy + 2} />
        )}
      </g>
    );
  }

  if (control.type === 'display') {
    const displayWidth = clamp(step * 0.82, 18, 42);
    return (
      <g>
        <rect
          fill="#0c1c2a"
          height={clamp(height * 0.5, 12, 20)}
          rx="1"
          stroke="#35657b"
          width={displayWidth}
          x={cx - displayWidth / 2}
          y={cy - clamp(height * 0.25, 6, 10)}
        />
        {[0, 1, 2].map((line) => (
          <line
            key={line}
            stroke="#1f93b8"
            strokeWidth="1"
            x1={cx - displayWidth / 2 + 3}
            x2={cx - displayWidth / 2 + 3 + (displayWidth - 8) * [0.85, 0.55, 0.7][line]}
            y1={cy - 3 + line * 3}
            y2={cy - 3 + line * 3}
          />
        ))}
      </g>
    );
  }

  if (control.type === 'sockets') {
    return null; // Patch fields are rendered as a dedicated full-width band.
  }

  if (control.type === 'fader') {
    const trackHeight = clamp(height - 12, 16, 40);
    const top = cy - trackHeight / 2;
    // Deterministic cap position mimics a graphic-EQ curve without runtime randomness.
    const offset = (Math.sin((control.id.length + cx) * 0.7) + 1) / 2;
    const capY = top + offset * (trackHeight - 6);
    return (
      <g>
        <rect fill="#0d0f12" height={trackHeight} rx="1.5" width="3" x={cx - 1.5} y={top} />
        <rect fill="#c3c8cf" height="4" rx="1" width="9" x={cx - 4.5} y={capY} />
      </g>
    );
  }

  if (control.type === 'button') {
    const buttonWidth = clamp(step * 0.5, 10, 16);
    return (
      <rect
        fill={control.accent ? accent : '#3a3f47'}
        height="8"
        rx="1.5"
        stroke={control.accent ? accent : '#4a505a'}
        width={buttonWidth}
        x={cx - buttonWidth / 2}
        y={cy - 4}
      />
    );
  }

  // knob
  const radius = clamp(Math.min(step * 0.34, height * 0.3), 3.5, 9);
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        fill={knobFill}
        r={radius}
        stroke={control.accent ? accent : '#15171b'}
        strokeWidth={control.accent ? 1.5 : 1}
      />
      <line
        stroke={control.accent ? accent : '#cfd3d9'}
        strokeWidth="1"
        x1={cx}
        x2={cx}
        y1={cy - radius + 1}
        y2={cy - 1}
      />
    </g>
  );
}

function PatchField({
  control,
  start,
  width,
  height,
  color,
}: {
  control: FrontControl;
  start: number;
  width: number;
  height: number;
  color: string;
}) {
  const count = control.count ?? 24;
  const rows = height >= 40 ? 2 : 1;
  const perRow = Math.ceil(count / rows);
  const usable = width - start - 14;
  const spacing = usable / perRow;
  const radius = clamp(Math.min(spacing * 0.32, height * 0.18), 1.6, 3.4);
  const rowYs =
    rows === 2 ? [height * 0.36, height * 0.66] : [height / 2];
  return (
    <g>
      {Array.from({ length: count }, (_, index) => {
        const row = Math.floor(index / perRow);
        const column = index % perRow;
        return (
          <circle
            cx={start + spacing * (column + 0.5)}
            cy={rowYs[row]}
            fill="#0d0f12"
            key={index}
            r={radius}
            stroke={color}
            strokeWidth="0.8"
          />
        );
      })}
    </g>
  );
}

function FrontPanelSvgComponent({
  device,
  x = 0,
  y = 0,
  width = 420,
  height = device.rackUnits * 24,
  animateMeters = true,
}: FrontPanelSvgProps) {
  const { controls, colorAccent } = device.frontPanel;
  const fontSize = height < 40 ? 7 : 9;
  const labelZone = Math.min(width * 0.4, 16 + device.name.length * fontSize * 0.58);
  const zoneStart = labelZone + 8;
  const cy = height / 2;
  const isPatchField = controls.length === 1 && controls[0].type === 'sockets';
  const zoneWidth = Math.max(width - 14 - zoneStart, 40);
  const step = zoneWidth / Math.max(controls.length, 1);
  const ctx: ControlContext = {
    accent: colorAccent,
    knobFill: `url(#knob-${device.id})`,
    height,
    cy,
    step,
    animateMeters,
  };

  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`panel-${device.id}`} x2="0" y2="1">
          <stop stopColor="#30343a" />
          <stop offset="1" stopColor="#17191c" />
        </linearGradient>
        <radialGradient id={`knob-${device.id}`}>
          <stop stopColor="#737984" />
          <stop offset="0.65" stopColor="#30343b" />
          <stop offset="1" stopColor="#111216" />
        </radialGradient>
      </defs>
      <rect fill={`url(#panel-${device.id})`} height={height - 1} rx="2" width={width} />
      <rect fill={colorAccent} height="2" width={width} />
      <text
        fill="#e4e6e8"
        fontFamily="IBM Plex Mono, monospace"
        fontSize={fontSize}
        fontWeight="500"
        x="12"
        y={cy + 3}
      >
        {device.name.toUpperCase()}
      </text>
      {isPatchField ? (
        <PatchField
          color={colorAccent}
          control={controls[0]}
          height={height}
          start={zoneStart}
          width={width}
        />
      ) : (
        controls.map((control, index) => (
          <ControlGlyph control={control} ctx={ctx} cx={zoneStart + step * (index + 0.5)} key={control.id} />
        ))
      )}
    </g>
  );
}

export const FrontPanelSvg = memo(FrontPanelSvgComponent);

function FrontPanelPreviewComponent({ device }: { device: Device }) {
  return (
    <svg
      aria-hidden
      className="front-preview"
      height={device.rackUnits * 24}
      viewBox={`0 0 420 ${device.rackUnits * 24}`}
      width="100%"
    >
      <FrontPanelSvg animateMeters={false} device={device} />
    </svg>
  );
}

export const FrontPanelPreview = memo(FrontPanelPreviewComponent);
