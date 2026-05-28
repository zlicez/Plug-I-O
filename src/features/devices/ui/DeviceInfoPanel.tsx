import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Cable, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { devices } from '../../../data/devices';
import {
  CATEGORY_LABELS,
  getConnectablePorts,
  getDeviceById,
} from '../../../entities/device/lib/device-utils';
import { portColor } from '../../../entities/device/ui/PortGlyph';
import { Button } from '../../../shared/ui/Button';
import { useRackStore } from '../../rack/model/use-rack-store';

export function DeviceInfoPanel() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const selected = useRackStore((state) => state.selectedDeviceId);
  const installed = useRackStore((state) => state.installed);
  const cables = useRackStore((state) => state.cables);
  const selectDevice = useRackStore((state) => state.selectDevice);
  const removeDevice = useRackStore((state) => state.removeDevice);
  const instance = installed.find((item) => item.instanceId === selected);
  const device = instance && getDeviceById(devices, instance.deviceId);
  const connections = selected
    ? cables.filter(
        (cable) => cable.from.instanceId === selected || cable.to.instanceId === selected,
      )
    : [];
  const routeInfo = connections.flatMap((connection) => {
    const sourceInstance = installed.find((item) => item.instanceId === connection.from.instanceId);
    const destinationInstance = installed.find(
      (item) => item.instanceId === connection.to.instanceId,
    );
    const sourceDevice = sourceInstance && getDeviceById(devices, sourceInstance.deviceId);
    const destinationDevice =
      destinationInstance && getDeviceById(devices, destinationInstance.deviceId);
    const sourcePort =
      sourceDevice &&
      getConnectablePorts(sourceDevice).find((port) => port.id === connection.from.portId);
    const destinationPort =
      destinationDevice &&
      getConnectablePorts(destinationDevice).find((port) => port.id === connection.to.portId);
    return sourceDevice && destinationDevice && sourcePort && destinationPort
      ? [{ connection, sourceDevice, destinationDevice, sourcePort, destinationPort }]
      : [];
  });

  return (
    <AnimatePresence initial={false} mode="wait">
      {device && instance && (
        <motion.aside
          animate={{ opacity: 1, x: 0 }}
          className="device-inspector"
          exit={{ opacity: 0, x: 30 }}
          initial={{ opacity: 0, x: 30 }}
          key={instance.instanceId}
        >
          <header>
            <p className="eyebrow">INSTALLED DEVICE</p>
            <Button
              aria-label="Close device inspector"
              onClick={() => selectDevice(null)}
              size="icon"
              variant="ghost"
            >
              <X size={17} />
            </Button>
          </header>
          <h2>{device.name}</h2>
          <p className="inspector-meta">
            {device.manufacturer} / {CATEGORY_LABELS[device.category]} / {device.rackUnits}U
          </p>
          <p className="inspector-description">{device.description}</p>
          <section>
            <h3>Ports</h3>
            <p className="port-verification" title={device.backPanel.verification.reference}>
              Rear panel: {device.backPanel.verification.basis}
            </p>
            <div className="port-list">
              {device.backPanel.ports.map((port) => (
                <div key={port.id}>
                  <i style={{ background: portColor(port) }} />
                  <span>{port.label}</span>
                  <small>
                    {port.count
                      ? `${port.direction.toUpperCase()} / ${port.count} ${port.individualSockets ? 'PORTS' : 'CH'}`
                      : port.direction.toUpperCase()}
                  </small>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3>Connections</h3>
            {routeInfo.length === 0 ? (
              <p className="empty-copy">No current patching.</p>
            ) : (
              routeInfo.map(
                ({ connection, sourceDevice, destinationDevice, sourcePort, destinationPort }) => (
                  <div className="connection" key={connection.id}>
                    <Cable size={13} />
                    <div>
                      <span>
                        {sourcePort.label} <ArrowRight size={11} /> {destinationPort.label}
                      </span>
                      <small>
                        {sourceDevice.name} / {destinationDevice.name}
                      </small>
                    </div>
                  </div>
                ),
              )
            )}
          </section>
          <dl className="specs">
            {Object.entries(device.specs).map(
              ([label, value]) =>
                value && (
                  <div key={label}>
                    <dt>{label.replaceAll(/([A-Z])/g, ' $1')}</dt>
                    <dd>{value}</dd>
                  </div>
                ),
            )}
          </dl>
          <Dialog.Root onOpenChange={setConfirmOpen} open={confirmOpen}>
            <Dialog.Trigger asChild>
              <Button className="remove-device" variant="danger">
                <Trash2 size={16} /> Remove device
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="confirm-dialog">
                <Dialog.Title>Remove {device.name}?</Dialog.Title>
                <Dialog.Description>
                  Associated patch cables will also be removed from this rack.
                </Dialog.Description>
                <div>
                  <Dialog.Close asChild>
                    <Button variant="secondary">Cancel</Button>
                  </Dialog.Close>
                  <Button
                    onClick={() => {
                      removeDevice(instance.instanceId);
                      setConfirmOpen(false);
                    }}
                    variant="danger"
                  >
                    Remove
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
