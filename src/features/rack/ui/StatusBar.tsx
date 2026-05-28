import { ArrowRight, Circle, Pencil, X } from 'lucide-react';
import { devices } from '../../../data/devices';
import {
  getConnectablePorts,
  getDeviceById,
  CATEGORY_LABELS,
} from '../../../entities/device/lib/device-utils';
import type { CableEndpoint } from '../../../entities/cable/model/types';
import type { InstalledDevice, Port } from '../../../entities/device/model/types';
import { protocolMeta } from '../../../shared/audio';
import { PortGlyph } from '../../../shared/audio/PortGlyph';
import { Kbd } from '../../../shared/ui/Kbd';
import { useRackStore } from '../model/use-rack-store';

interface EndpointInfo {
  deviceName: string;
  port: Port;
}

function endpointInfo(
  endpoint: CableEndpoint | null | undefined,
  installed: InstalledDevice[],
): EndpointInfo | undefined {
  if (!endpoint) return undefined;
  const instance = installed.find((item) => item.instanceId === endpoint.instanceId);
  const device = instance && getDeviceById(devices, instance.deviceId);
  const port = device && getConnectablePorts(device).find((item) => item.id === endpoint.portId);
  return device && port ? { deviceName: device.name, port } : undefined;
}

/**
 * Global, always-visible 32px status bar.
 *
 * Per the design canvas spec:
 *  - LEFT  : context-aware copy. Order of priority:
 *      1) routing in progress (activeCableStart) — pulsing dot, source ID,
 *         "click compatible port" + Esc kbd.
 *      2) hovered port — glyph + device.name · label · PROTOCOL DIR
 *      3) selected cable — protocol stroke + src ⇄ dst
 *      4) selected device — name · mfr · U · category
 *      5) default — "Front/Rear view · Hover any port for details"
 *  - RIGHT : counts (devices, patches) + autosaved flag.
 *
 * Tooltips on ports are intentionally suppressed elsewhere — this is the
 * canonical surface for port info while patching.
 */
export function StatusBar() {
  const viewMode = useRackStore((s) => s.viewMode);
  const installed = useRackStore((s) => s.installed);
  const cables = useRackStore((s) => s.cables);
  const activeCableStart = useRackStore((s) => s.activeCableStart);
  const hoveredPort = useRackStore((s) => s.hoveredPort);
  const selectedDeviceId = useRackStore((s) => s.selectedDeviceId);
  const selectedCableId = useRackStore((s) => s.selectedCableId);

  const source = endpointInfo(activeCableStart, installed);
  const hovered = endpointInfo(hoveredPort, installed);
  const selectedCable = cables.find((c) => c.id === selectedCableId);
  const cableSrc = selectedCable && endpointInfo(selectedCable.from, installed);
  const cableDst = selectedCable && endpointInfo(selectedCable.to, installed);
  const selectedInstance = installed.find((i) => i.instanceId === selectedDeviceId);
  const selectedDevice = selectedInstance && getDeviceById(devices, selectedInstance.deviceId);

  return (
    <div
      aria-live="polite"
      className="flex h-8 shrink-0 items-center border-t border-line bg-surface px-3 font-mono text-12 text-muted"
      role="status"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {activeCableStart && source ? (
          <>
            <span className="flex items-center gap-1.5 text-accent">
              <Circle className="animate-pulse" fill="currentColor" size={8} strokeWidth={0} />
              ROUTING
            </span>
            <Dot />
            <span>
              Source: <span className="text-copy">{source.deviceName}</span> · {source.port.label}
            </span>
            <Dot />
            <span className="text-copy-2">Click compatible port to complete</span>
            <Kbd>Esc</Kbd>
          </>
        ) : hovered ? (
          <>
            <PortGlyph port={hovered.port} size={16} />
            <span className="text-copy">{hovered.deviceName}</span>
            <Dot />
            <span>{hovered.port.label}</span>
            <Dot />
            <span style={{ color: protocolMeta(hovered.port.protocol).color }}>
              {protocolMeta(hovered.port.protocol).label} {hovered.port.direction.toUpperCase()}
            </span>
          </>
        ) : selectedCable && cableSrc && cableDst ? (
          <>
            <span style={{ color: protocolMeta(cableSrc.port.protocol).color }}>━━</span>
            <span className="text-copy">{cableSrc.deviceName}</span>
            <Dot />
            <span>{cableSrc.port.label}</span>
            <ArrowRight color="var(--muted-2)" size={11} />
            <span className="text-copy">{cableDst.deviceName}</span>
            <Dot />
            <span>{cableDst.port.label}</span>
          </>
        ) : selectedDevice ? (
          <>
            <span className="flex items-center gap-1.5 text-accent">
              <Pencil size={11} />
              DEVICE
            </span>
            <Dot />
            <span className="text-copy-2">{selectedDevice.name}</span>
            <Dot />
            <span>{selectedDevice.manufacturer}</span>
            <Dot />
            <span>
              {selectedDevice.rackUnits}U · {CATEGORY_LABELS[selectedDevice.category]}
            </span>
          </>
        ) : (
          <span>
            {viewMode === 'front' ? 'Front view' : 'Rear view'} · Hover any port for details
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="hidden items-center gap-3.5 md:flex">
        <span>
          <span className="text-copy-2">{installed.length}</span> devices
        </span>
        <Separator />
        <span>
          <span className="text-copy-2">{cables.length}</span> patches
        </span>
        <Separator />
        <span>1.0 · autosaved</span>
        {activeCableStart ? <CancelHint /> : null}
      </div>
    </div>
  );
}

function Dot() {
  return <span className="text-muted-2">·</span>;
}

function Separator() {
  return <span className="text-line-strong">│</span>;
}

function CancelHint() {
  const cancel = useRackStore((s) => s.cancelCable);
  return (
    <button
      aria-label="Cancel routing"
      className="ml-1 inline-flex h-5 items-center gap-1 rounded-1 border border-line-2 px-1.5 text-11 text-muted-2 hover:bg-control hover:text-copy"
      onClick={cancel}
      type="button"
    >
      <X size={11} />
      Cancel
    </button>
  );
}
