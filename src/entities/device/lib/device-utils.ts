import type {
  AudioProtocol,
  Device,
  DeviceCategory,
  InstalledDevice,
  Port,
  RackSize,
} from '../model/types';

export const RACK_SIZES: RackSize[] = [4, 8, 12, 16, 20, 24];

export const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  microphone_preamp: 'Microphone Preamp',
  compressor_limiter: 'Compressor / Limiter',
  equalizer_parametric: 'Parametric EQ',
  equalizer_graphic: 'Graphic EQ',
  audio_interface: 'Audio Interface',
  ad_da_converter: 'AD/DA Converter',
  digital_mixer: 'Digital Mixer',
  analog_summing: 'Analog Summing',
  patch_bay: 'Patch Bay',
  power_conditioner: 'Power Conditioner',
  power_amplifier: 'Power Amplifier',
  headphone_amp: 'Headphone Amp',
  di_box: 'DI / Reamp',
  dynamics_multiband: 'Multiband Dynamics',
  reverb_effects: 'Reverb / Effects',
  delay_effects: 'Delay Effects',
  noise_gate: 'Noise Gate',
  expander: 'Expander',
  crossover: 'Crossover',
  monitor_controller: 'Monitor Controller',
  clock_wordclock: 'Master Clock',
  format_converter: 'Format Converter',
  distribution_amp: 'Distribution Amp',
  dante_interface: 'Dante Interface',
  madi_interface: 'MADI Interface',
  adat_interface: 'ADAT Interface',
  spectrum_analyzer: 'Spectrum Analyzer',
  test_measurement: 'Test & Measurement',
};

export function getDeviceById(devices: Device[], deviceId: string): Device | undefined {
  return devices.find((device) => device.id === deviceId);
}

/**
 * Materializes only ports represented by independent physical sockets.
 * Multipin or digital connectors keep their aggregated channel metadata.
 */
export function getConnectablePorts(device: Device): Port[] {
  return device.backPanel.ports.flatMap((port) => {
    if (!port.individualSockets || !port.count || port.count < 2) return [port];
    const baseLabel = port.label.replace(/\s+\d+-\d+$/, '');
    return Array.from({ length: port.count }, (_, index) => ({
      ...port,
      id: `${port.id}:${index + 1}`,
      label: `${baseLabel} ${String(index + 1).padStart(2, '0')}`,
      count: undefined,
    }));
  });
}

export function occupiedSlots(installed: InstalledDevice[], devices: Device[]): Set<number> {
  const occupied = new Set<number>();
  installed.forEach((item) => {
    const device = getDeviceById(devices, item.deviceId);
    if (!device) return;
    for (let index = item.slot; index < item.slot + device.rackUnits; index += 1) {
      occupied.add(index);
    }
  });
  return occupied;
}

export function canPlaceDevice(
  installed: InstalledDevice[],
  devices: Device[],
  device: Device,
  slot: number,
  rackSize: RackSize,
  ignoredInstanceId?: string,
): boolean {
  if (slot < 0 || slot + device.rackUnits > rackSize) return false;
  return !installed.some((item) => {
    if (item.instanceId === ignoredInstanceId) return false;
    const existing = getDeviceById(devices, item.deviceId);
    if (!existing) return false;
    return slot < item.slot + existing.rackUnits && slot + device.rackUnits > item.slot;
  });
}

export interface DeviceMoveResolution {
  slot: number;
  swap?: {
    instanceId: string;
    slot: number;
  };
}

export function resolveDeviceMove(
  installed: InstalledDevice[],
  devices: Device[],
  instanceId: string,
  requestedSlot: number,
  rackSize: RackSize,
): DeviceMoveResolution | null {
  const moving = installed.find((item) => item.instanceId === instanceId);
  const movingDevice = moving && getDeviceById(devices, moving.deviceId);
  if (!moving || !movingDevice) return null;
  if (canPlaceDevice(installed, devices, movingDevice, requestedSlot, rackSize, instanceId)) {
    return { slot: requestedSlot };
  }

  const conflicts = installed.filter((item) => {
    if (item.instanceId === instanceId) return false;
    const device = getDeviceById(devices, item.deviceId);
    return (
      device &&
      requestedSlot < item.slot + device.rackUnits &&
      requestedSlot + movingDevice.rackUnits > item.slot
    );
  });
  if (conflicts.length !== 1) return null;

  const [replaced] = conflicts;
  const replacedDevice = getDeviceById(devices, replaced.deviceId);
  if (!replacedDevice) return null;
  const withoutPair = installed.filter(
    (item) => item.instanceId !== moving.instanceId && item.instanceId !== replaced.instanceId,
  );
  if (!canPlaceDevice(withoutPair, devices, movingDevice, replaced.slot, rackSize)) return null;
  const withMovingAtTarget = [...withoutPair, { ...moving, slot: replaced.slot }];
  if (!canPlaceDevice(withMovingAtTarget, devices, replacedDevice, moving.slot, rackSize)) {
    return null;
  }
  return {
    slot: replaced.slot,
    swap: { instanceId: replaced.instanceId, slot: moving.slot },
  };
}

export function protocolsForDevice(device: Device): AudioProtocol[] {
  return Array.from(
    new Set(
      device.backPanel.ports
        .map((port: Port) => port.protocol)
        .filter((protocol): protocol is AudioProtocol => Boolean(protocol)),
    ),
  );
}
