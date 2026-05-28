import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Cable, Trash2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { devices } from '../../../data/devices';
import { validateConnection } from '../../../entities/cable/lib/validation';
import type { CableEndpoint } from '../../../entities/cable/model/types';
import { getConnectablePorts, getDeviceById } from '../../../entities/device/lib/device-utils';
import type { InstalledDevice, Port } from '../../../entities/device/model/types';
import { Button } from '../../../shared/ui/Button';
import { useRackStore } from '../../rack/model/use-rack-store';

interface PatchStatusBarProps {
  hoveredEndpoint: CableEndpoint | null;
}

interface EndpointInfo {
  deviceName: string;
  port: Port;
}

function endpointInfo(
  endpoint: CableEndpoint | null,
  installed: InstalledDevice[],
): EndpointInfo | undefined {
  if (!endpoint) return undefined;
  const instance = installed.find((item) => item.instanceId === endpoint.instanceId);
  const device = instance && getDeviceById(devices, instance.deviceId);
  const port = device && getConnectablePorts(device).find((item) => item.id === endpoint.portId);
  return device && port ? { deviceName: device.name, port } : undefined;
}

export function PatchStatusBar({ hoveredEndpoint }: PatchStatusBarProps) {
  const viewMode = useRackStore((state) => state.viewMode);
  const installed = useRackStore((state) => state.installed);
  const cables = useRackStore((state) => state.cables);
  const activeCableStart = useRackStore((state) => state.activeCableStart);
  const selectedCableId = useRackStore((state) => state.selectedCableId);
  const deleteCable = useRackStore((state) => state.deleteCable);
  const cancelCable = useRackStore((state) => state.cancelCable);
  const selectedCable = cables.find((cable) => cable.id === selectedCableId);
  const source = endpointInfo(selectedCable?.from ?? activeCableStart, installed);
  const destination = endpointInfo(selectedCable?.to ?? null, installed);
  const hovered = endpointInfo(hoveredEndpoint, installed);
  const routingTarget =
    activeCableStart &&
    hoveredEndpoint &&
    (activeCableStart.instanceId !== hoveredEndpoint.instanceId ||
      activeCableStart.portId !== hoveredEndpoint.portId)
      ? hovered
      : undefined;
  const targetAllowed =
    activeCableStart &&
    source &&
    routingTarget &&
    hoveredEndpoint?.instanceId !== activeCableStart.instanceId
      ? validateConnection(source.port, routingTarget.port).allowed
      : false;
  const open = viewMode === 'rear' && Boolean(selectedCable || activeCableStart || hovered);
  let content: ReactNode = null;

  if (selectedCable && source && destination) {
    content = (
      <>
        <div className="patch-status__title">
          <Cable size={15} />
          <span>SELECTED ROUTE</span>
        </div>
        <div className="patch-route">
          <strong>{source.port.label}</strong>
          <small>{source.deviceName}</small>
          <ArrowRight size={15} />
          <strong>{destination.port.label}</strong>
          <small>{destination.deviceName}</small>
        </div>
        <Button
          aria-label="Delete selected cable"
          onClick={() => deleteCable(selectedCable.id)}
          size="icon"
          variant="danger"
        >
          <Trash2 size={17} />
        </Button>
      </>
    );
  } else if (activeCableStart && source) {
    let routingClass = '';
    let routingLabel = 'SOURCE ARMED';
    let routingDetails: ReactNode = (
      <div className="patch-status__port">
        <strong>{source.port.label}</strong>
        <small>{source.deviceName} / SELECT DESTINATION</small>
      </div>
    );
    if (routingTarget) {
      routingClass = targetAllowed ? 'is-valid' : 'is-blocked';
      routingLabel = targetAllowed ? 'COMPATIBLE' : 'BLOCKED';
      routingDetails = (
        <div className="patch-route">
          <strong>{source.port.label}</strong>
          <small>{source.deviceName}</small>
          <ArrowRight size={15} />
          <strong>{routingTarget.port.label}</strong>
          <small>{routingTarget.deviceName}</small>
        </div>
      );
    }
    content = (
      <>
        <div className={`patch-status__title is-routing ${routingClass}`}>
          <Cable size={15} />
          <span>{routingLabel}</span>
        </div>
        {routingDetails}
        <Button aria-label="Cancel patch" onClick={cancelCable} size="icon" variant="ghost">
          <X size={17} />
        </Button>
      </>
    );
  } else if (hovered) {
    content = (
      <>
        <div className="patch-status__title">
          <span>PORT</span>
        </div>
        <div className="patch-status__port">
          <strong>{hovered.port.label}</strong>
          <small>
            {hovered.deviceName} / {hovered.port.direction.toUpperCase()} /{' '}
            {(hovered.port.protocol ?? hovered.port.type).toUpperCase()}
          </small>
        </div>
      </>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          animate={{ opacity: 1, x: '-50%', y: 0 }}
          className="patch-status-bar"
          exit={{ opacity: 0, x: '-50%', y: 12 }}
          initial={{ opacity: 0, x: '-50%', y: 12 }}
        >
          {content}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
