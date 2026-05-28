import type { Device, InstalledDevice, Port } from '../../../entities/device/model/types';
import { getConnectablePorts } from '../../../entities/device/lib/device-utils';
import {
  FRONT_GEOMETRY,
  type Point,
  type RackGeometry,
} from '../../../shared/constants/rack-geometry';

export interface PortLocation extends Point {
  port: Port;
  instanceId: string;
  compact?: boolean;
  showLabel?: boolean;
}

/**
 * Lays out every rear-panel port. Individually-socketed groups (patch fields, multi-channel
 * speakon banks, etc.) form compact rows along the top; remaining multi-pin / single
 * connectors are placed alongside so mixed devices like the fanout or Crown DCi don't drop
 * ports off the panel. The function is parameterised by `geometry` so the same logic serves
 * the compact front view and the expanded rear schematic view.
 */
export function layoutPorts(
  instance: InstalledDevice,
  device: Device,
  geometry: RackGeometry = FRONT_GEOMETRY,
): PortLocation[] {
  const { UNIT_HEIGHT, RACK_TOP, PANEL_WIDTH, PANEL_X, NAME_STRIP, ROW_GAP, showLabels } = geometry;
  const allPorts = getConnectablePorts(device);
  const individualBaseIds = new Set(
    device.backPanel.ports
      .filter((port) => port.individualSockets && (port.count ?? 0) >= 2)
      .map((port) => port.id),
  );
  const individualGroups = device.backPanel.ports.filter((port) =>
    individualBaseIds.has(port.id),
  );
  const regularPorts = allPorts.filter((port) => {
    const baseId = port.id.includes(':') ? port.id.split(':')[0] : port.id;
    return !individualBaseIds.has(baseId);
  });

  const slotTop = RACK_TOP + instance.slot * UNIT_HEIGHT;
  const panelTop = slotTop + NAME_STRIP;
  const panelHeight = device.rackUnits * UNIT_HEIGHT - NAME_STRIP;
  const mixed = individualGroups.length > 0 && regularPorts.length > 0;
  const padX = Math.max(16, Math.round(PANEL_WIDTH * 0.04));
  // For 1U mixed devices reserve a right-edge band so DB25 / power / network don't get
  // crushed under the individual socket rows. Width grows with port count up to a cap.
  const regularBandWidth =
    mixed && device.rackUnits === 1
      ? Math.min(Math.round(PANEL_WIDTH * 0.26), 40 + regularPorts.length * 28)
      : 0;
  const individualSpace = PANEL_WIDTH - padX * 2 - regularBandWidth;
  const locations: PortLocation[] = [];

  individualGroups.forEach((sourcePort, rowIndex) => {
    const row = allPorts.filter((port) => port.id.startsWith(`${sourcePort.id}:`));
    const step = row.length > 1 ? individualSpace / (row.length - 1) : 0;
    const rowY = panelTop + Math.round(ROW_GAP * 0.55) + rowIndex * ROW_GAP;
    row.forEach((port, index) => {
      locations.push({
        instanceId: instance.instanceId,
        port,
        x: PANEL_X + padX + step * index,
        y: rowY,
        compact: true,
        showLabel: showLabels,
      });
    });
  });

  if (regularPorts.length === 0) return locations;

  if (mixed && device.rackUnits === 1) {
    // Tight right-edge column. Splits into a 2-column grid past three ports.
    const cols = regularPorts.length > 2 ? 2 : 1;
    const colWidth = regularBandWidth / cols;
    const bandStartX = PANEL_X + PANEL_WIDTH - regularBandWidth;
    const rows = Math.ceil(regularPorts.length / cols);
    const yStep = rows > 1 ? (panelHeight - 14) / (rows - 1) : 0;
    regularPorts.forEach((port, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      locations.push({
        instanceId: instance.instanceId,
        port,
        x: bandStartX + colWidth * (col + 0.5),
        y: panelTop + 7 + row * yStep,
        compact: true,
        showLabel: showLabels,
      });
    });
    return locations;
  }

  // 2U+ mixed devices: regular ports occupy a row beneath the compact groups.
  // Pure-regular devices fall through to the centred single-row layout.
  const usable = PANEL_WIDTH - padX * 2 - 16;
  const step = regularPorts.length > 1 ? usable / (regularPorts.length - 1) : 0;
  const y = mixed
    ? panelTop + Math.round(ROW_GAP * 0.55) + individualGroups.length * ROW_GAP
    : panelTop + panelHeight / 2;
  regularPorts.forEach((port, index) => {
    locations.push({
      instanceId: instance.instanceId,
      port,
      x: PANEL_X + padX + 8 + step * index,
      y,
      showLabel: showLabels,
    });
  });

  return locations;
}

export function cablePath(from: Point, to: Point): string {
  const bend = Math.max(Math.abs(to.x - from.x) * 0.42, 34);
  return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y + 30}, ${to.x - bend} ${to.y + 30}, ${to.x} ${to.y}`;
}
