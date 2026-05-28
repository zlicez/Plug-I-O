import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownToLine, Cable as CableIcon, Copy, MousePointerClick, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { devices } from '../../../data/devices';
import {
  CATEGORY_LABELS,
  getConnectablePorts,
  getDeviceById,
} from '../../../entities/device/lib/device-utils';
import type { Port } from '../../../entities/device/model/types';
import { PROTOCOLS, protocolMeta, resolveProtocolKey } from '../../../shared/audio';
import { PortGlyph } from '../../../shared/audio/PortGlyph';
import { ProtocolDot } from '../../../shared/audio/ProtocolDot';
import { cn } from '../../../shared/lib/cn';
import { Button } from '../../../shared/ui/Button';
import { Chip } from '../../../shared/ui/Chip';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Eyebrow } from '../../../shared/ui/Eyebrow';
import { Modal } from '../../../shared/ui/Modal';
import { useRackStore } from '../../rack/model/use-rack-store';

// Tabs available per selection mode.
type DeviceTab = 'overview' | 'ports' | 'connections' | 'specs';
type CableTab = 'route' | 'meta';
const DEVICE_TABS: DeviceTab[] = ['overview', 'ports', 'connections', 'specs'];
const CABLE_TABS: CableTab[] = ['route', 'meta'];

export function DeviceInfoPanel() {
  const installed = useRackStore((state) => state.installed);
  const cables = useRackStore((state) => state.cables);
  const selectedDeviceId = useRackStore((state) => state.selectedDeviceId);
  const selectedCableId = useRackStore((state) => state.selectedCableId);
  const selectDevice = useRackStore((state) => state.selectDevice);
  const selectCable = useRackStore((state) => state.selectCable);
  const removeDevice = useRackStore((state) => state.removeDevice);
  const deleteCable = useRackStore((state) => state.deleteCable);

  const instance = installed.find((i) => i.instanceId === selectedDeviceId);
  const device = instance && getDeviceById(devices, instance.deviceId);
  const cable = cables.find((c) => c.id === selectedCableId);

  const mode: 'device' | 'cable' | 'empty' = device ? 'device' : cable ? 'cable' : 'empty';

  const [deviceTab, setDeviceTab] = useState<DeviceTab>('overview');
  const [cableTab, setCableTab] = useState<CableTab>('route');
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Reset to the first tab whenever selection changes.
  useEffect(() => {
    setDeviceTab('overview');
  }, [selectedDeviceId]);
  useEffect(() => {
    setCableTab('route');
  }, [selectedCableId]);

  return (
    <AnimatePresence initial={false} mode="wait">
      {mode === 'empty' ? null : (
        <motion.aside
          animate={{ opacity: 1, x: 0 }}
          aria-label="Inspector"
          className={cn(
            'relative flex h-full w-85 min-h-0 shrink-0 flex-col overflow-hidden',
            'border-l border-line bg-surface',
          )}
          exit={{ opacity: 0, x: 24 }}
          initial={{ opacity: 0, x: 24 }}
          key={mode === 'device' ? `d:${instance?.instanceId}` : `c:${cable?.id}`}
          transition={{ duration: 0.24, ease: [0.05, 0.7, 0.1, 1] }}
        >
          <InspectorHeader
            mode={mode}
            cableProtocolKey={cable ? resolveProtocolKey(cable.from && portOf(installed, cable.from)?.protocol) : undefined}
            deviceCategoryLabel={device ? CATEGORY_LABELS[device.category] : undefined}
            deviceMfr={device?.manufacturer}
            deviceName={device?.name}
            deviceU={device?.rackUnits}
            onClose={() => {
              selectDevice(null);
              selectCable(null);
            }}
          />

          {mode === 'device' ? (
            <TabRow
              active={deviceTab}
              onChange={(tab) => setDeviceTab(tab as DeviceTab)}
              tabs={DEVICE_TABS}
            />
          ) : (
            <TabRow
              active={cableTab}
              onChange={(tab) => setCableTab(tab as CableTab)}
              tabs={CABLE_TABS}
            />
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5">
            {mode === 'device' && device ? (
              <DeviceBody cables={cables} device={device} installed={installed} tab={deviceTab} instanceId={instance!.instanceId} />
            ) : null}
            {mode === 'cable' && cable ? (
              <CableBody cable={cable} installed={installed} tab={cableTab} />
            ) : null}
          </div>

          <footer className="flex gap-1.5 border-t border-line px-3.5 py-3">
            {mode === 'device' && instance ? (
              <>
                <Button className="flex-1" size="sm">
                  <Copy size={13} />
                  Duplicate
                </Button>
                <Button onClick={() => setConfirmRemove(true)} size="sm" variant="danger">
                  <Trash2 size={13} />
                  Remove
                </Button>
              </>
            ) : null}
            {mode === 'cable' && cable ? (
              <Button
                className="flex-1"
                onClick={() => deleteCable(cable.id)}
                size="sm"
                variant="danger"
              >
                <Trash2 size={13} />
                Disconnect cable
              </Button>
            ) : null}
          </footer>

          {mode === 'device' && device && instance ? (
            <Modal
              eyebrow="Confirm"
              footer={
                <>
                  <Button onClick={() => setConfirmRemove(false)}>Cancel</Button>
                  <Button
                    onClick={() => {
                      removeDevice(instance.instanceId);
                      setConfirmRemove(false);
                    }}
                    variant="danger"
                  >
                    Remove device
                  </Button>
                </>
              }
              onOpenChange={setConfirmRemove}
              open={confirmRemove}
              title={`Remove ${device.name}?`}
              width={420}
            >
              <p className="text-13 leading-snug text-muted">
                Associated patch cables will be removed too. You can undo this from the toolbar.
              </p>
            </Modal>
          ) : null}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────
function InspectorHeader({
  mode,
  deviceName,
  deviceMfr,
  deviceCategoryLabel,
  deviceU,
  cableProtocolKey,
  onClose,
}: {
  mode: 'device' | 'cable' | 'empty';
  deviceName?: string;
  deviceMfr?: string;
  deviceCategoryLabel?: string;
  deviceU?: number;
  cableProtocolKey?: string;
  onClose: () => void;
}) {
  return (
    <div className="border-b border-line px-3.5 pb-0 pt-3.5">
      <div className="flex items-start justify-between gap-2">
        <Eyebrow>Inspector</Eyebrow>
        <button
          aria-label="Close inspector"
          className="rounded-1 p-0.5 text-muted-2 hover:bg-control hover:text-copy"
          onClick={onClose}
          type="button"
        >
          <ArrowDownToLine size={14} />
        </button>
      </div>
      {mode === 'device' ? (
        <>
          <div className="mt-1 text-16 font-semibold leading-tight">{deviceName}</div>
          <div className="mt-0.5 font-mono text-11 text-muted-2">
            {deviceMfr} · {deviceCategoryLabel} · {deviceU}U
          </div>
        </>
      ) : null}
      {mode === 'cable' && cableProtocolKey ? (
        <>
          <div className="mt-1 text-15 font-semibold leading-tight">Audio patch</div>
          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-11">
            <ProtocolDot protocol={cableProtocolKey as keyof typeof PROTOCOLS} />
            <span style={{ color: PROTOCOLS[cableProtocolKey as keyof typeof PROTOCOLS].color }}>
              {PROTOCOLS[cableProtocolKey as keyof typeof PROTOCOLS].label}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab row
// ─────────────────────────────────────────────────────────────
function TabRow({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex border-b border-line">
      {tabs.map((tab) => (
        <button
          className={cn(
            'mb-px px-3 py-2 font-mono text-11 uppercase tracking-[0.06em] transition-colors duration-150 ease-standard',
            active === tab
              ? 'border-b-2 border-accent text-copy'
              : 'border-b-2 border-transparent text-muted hover:text-copy',
          )}
          key={tab}
          onClick={() => onChange(tab)}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Device body
// ─────────────────────────────────────────────────────────────
function DeviceBody({
  device,
  installed,
  cables,
  tab,
  instanceId,
}: {
  device: NonNullable<ReturnType<typeof getDeviceById>>;
  installed: ReturnType<typeof useRackStore.getState>['installed'];
  cables: ReturnType<typeof useRackStore.getState>['cables'];
  tab: DeviceTab;
  instanceId: string;
}) {
  const connections = useMemo(
    () => cables.filter((c) => c.from.instanceId === instanceId || c.to.instanceId === instanceId),
    [cables, instanceId],
  );

  if (tab === 'overview') {
    const protocolsUsed = Array.from(
      new Set(device.backPanel.ports.map((p) => p.protocol).filter(Boolean)),
    );
    return (
      <div>
        <p className="text-13 leading-relaxed text-copy-2">{device.description}</p>
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <Chip>{CATEGORY_LABELS[device.category]}</Chip>
          <Chip>{device.rackUnits}U</Chip>
          {protocolsUsed.slice(0, 4).map((proto) => (
            <Chip key={proto}>
              <ProtocolDot audioProtocol={proto} />
              {protocolMeta(proto).label}
            </Chip>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'ports') {
    const ports = device.backPanel.ports;
    return (
      <div>
        <Eyebrow className="mb-2">{ports.length} Ports</Eyebrow>
        <div className="flex flex-col gap-1">
          {ports.map((port) => (
            <div
              className="flex items-center gap-2.5 rounded-2 border border-line bg-surface-2 px-2.5 py-2"
              key={port.id}
            >
              <PortGlyph port={port} size={20} />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-12 text-copy">{port.label}</div>
                <div
                  className="font-mono text-10 opacity-85"
                  style={{ color: protocolMeta(port.protocol).color }}
                >
                  {protocolMeta(port.protocol).label} · {port.direction.toUpperCase()}
                  {port.count ? ` · ×${port.count}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'connections') {
    if (connections.length === 0) {
      return (
        <EmptyState
          body="Switch to rear view and click any port to start patching."
          icon={CableIcon}
          title="No cables connected"
        />
      );
    }
    return (
      <div>
        <Eyebrow className="mb-2">{connections.length} Connections</Eyebrow>
        <div className="flex flex-col gap-1">
          {connections.map((cable) => {
            const isOut = cable.from.instanceId === instanceId;
            const localPort = (isOut ? cable.from : cable.to).portId;
            const port = device.backPanel.ports.find((p) => p.id === localPort);
            const otherInst = installed.find(
              (i) => i.instanceId === (isOut ? cable.to : cable.from).instanceId,
            );
            const otherDev = otherInst ? getDeviceById(devices, otherInst.deviceId) : undefined;
            const otherPortId = (isOut ? cable.to : cable.from).portId;
            const proto = port?.protocol;
            return (
              <div
                className="rounded-2 border border-line bg-surface-2 px-2.5 py-2"
                key={cable.id}
              >
                <div className="flex items-center gap-2 font-mono text-12">
                  <span className="text-muted">{port?.label}</span>
                  <span style={{ color: protocolMeta(proto).color }}>{isOut ? '→' : '←'}</span>
                  <span className="text-copy">
                    {otherDev?.name} · {otherPortId}
                  </span>
                </div>
                <div
                  className="mt-1 flex items-center gap-1.5 font-mono text-10"
                  style={{ color: protocolMeta(proto).color }}
                >
                  <ProtocolDot audioProtocol={proto} />
                  {protocolMeta(proto).label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // specs
  const entries = Object.entries(device.specs).filter(([, v]) => Boolean(v));
  return (
    <div>
      {entries.length === 0 ? (
        <EmptyState body="No specifications available." icon={MousePointerClick} title="No specs" />
      ) : (
        entries.map(([key, value]) => (
          <div
            className="flex items-center justify-between border-b border-line py-2 font-mono text-12"
            key={key}
          >
            <span className="text-muted">{prettifyKey(key)}</span>
            <span className="text-copy">{value}</span>
          </div>
        ))
      )}
    </div>
  );
}

function prettifyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

// ─────────────────────────────────────────────────────────────
// Cable body
// ─────────────────────────────────────────────────────────────
function CableBody({
  cable,
  installed,
  tab,
}: {
  cable: ReturnType<typeof useRackStore.getState>['cables'][number];
  installed: ReturnType<typeof useRackStore.getState>['installed'];
  tab: CableTab;
}) {
  const sourcePort = portOf(installed, cable.from);
  const destinationPort = portOf(installed, cable.to);
  const sourceInst = installed.find((i) => i.instanceId === cable.from.instanceId);
  const destInst = installed.find((i) => i.instanceId === cable.to.instanceId);
  const sourceDev = sourceInst && getDeviceById(devices, sourceInst.deviceId);
  const destDev = destInst && getDeviceById(devices, destInst.deviceId);
  const proto = sourcePort?.protocol;

  if (tab === 'route') {
    return (
      <div className="rounded-3 border border-line bg-surface-2 p-3">
        <Eyebrow className="mb-1.5">Source</Eyebrow>
        <div className="mb-3 flex items-center gap-2">
          {sourcePort ? <PortGlyph port={sourcePort} size={18} /> : null}
          <div>
            <div className="text-13 font-medium">{sourceDev?.name}</div>
            <div className="font-mono text-11 text-muted">{sourcePort?.label}</div>
          </div>
        </div>
        <div className="my-1 flex justify-center">
          <svg height="20" viewBox="0 0 40 20" width="40">
            <path
              d="M 4 4 Q 20 16 36 4"
              fill="none"
              stroke={protocolMeta(proto).color}
              strokeWidth="1.8"
            />
            <polygon
              fill={protocolMeta(proto).color}
              points="32,2 38,4 32,7"
            />
          </svg>
        </div>
        <Eyebrow className="mb-1.5">Destination</Eyebrow>
        <div className="flex items-center gap-2">
          {destinationPort ? <PortGlyph port={destinationPort} size={18} /> : null}
          <div>
            <div className="text-13 font-medium">{destDev?.name}</div>
            <div className="font-mono text-11 text-muted">{destinationPort?.label}</div>
          </div>
        </div>
      </div>
    );
  }

  // meta tab
  const meta = protocolMeta(proto);
  return (
    <div>
      <SpecRow label="Protocol" value={meta.label} />
      <SpecRow
        label="Color code"
        value={
          <span className="inline-flex items-center gap-1.5">
            <ProtocolDot audioProtocol={proto} />
            {meta.hex}
          </span>
        }
      />
      <SpecRow label="Pattern" value={meta.dash} />
      <SpecRow label="Length" value="—" />
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2 font-mono text-12">
      <span className="text-muted">{label}</span>
      <span className="text-copy">{value}</span>
    </div>
  );
}

function portOf(
  installed: ReturnType<typeof useRackStore.getState>['installed'],
  endpoint: { instanceId: string; portId: string },
): Port | undefined {
  const inst = installed.find((i) => i.instanceId === endpoint.instanceId);
  if (!inst) return undefined;
  const device = getDeviceById(devices, inst.deviceId);
  return device && getConnectablePorts(device).find((p) => p.id === endpoint.portId);
}
