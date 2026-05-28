import { describe, expect, it } from 'vitest';
import { devices } from '../../../data/devices';
import { getDeviceById } from '../../../entities/device/lib/device-utils';
import type { InstalledDevice } from '../../../entities/device/model/types';
import { layoutPorts } from './port-geometry';

function place(deviceId: string, slot = 0): { device: ReturnType<typeof getDeviceById>; instance: InstalledDevice } {
  const device = getDeviceById(devices, deviceId);
  if (!device) throw new Error(`Missing fixture device ${deviceId}`);
  return { device, instance: { instanceId: `${deviceId}-test`, deviceId, slot } };
}

describe('layoutPorts', () => {
  it('renders pure regular ports along a single centred row', () => {
    const { device, instance } = place('1176ln');
    const locations = layoutPorts(instance, device!);
    expect(locations).toHaveLength(device!.backPanel.ports.length);
    expect(locations.every((location) => location.compact !== true)).toBe(true);
  });

  it('renders pure individual-socket bays as stacked compact rows', () => {
    const { device, instance } = place('neutrik-patch');
    const locations = layoutPorts(instance, device!);
    expect(locations).toHaveLength(48);
    expect(locations.every((location) => location.compact === true)).toBe(true);
  });

  it('renders BOTH individual sockets and multi-pin connectors on mixed devices', () => {
    const { device, instance } = place('studio-fanout');
    const locations = layoutPorts(instance, device!);
    // 16 individual XLR sockets (8 in + 8 out) plus 2 multi-pin DB25 connectors.
    expect(locations).toHaveLength(16 + 2);
    const portTypes = new Set(locations.map((location) => location.port.type));
    expect(portTypes.has('xlr_analog')).toBe(true);
    expect(portTypes.has('db25_dsub')).toBe(true);
  });

  it('keeps every Crown DCi connector visible (regression for the individual-only bug)', () => {
    const { device, instance } = place('crown-dci');
    const locations = layoutPorts(instance, device!);
    const portTypes = new Set(locations.map((location) => location.port.type));
    ['terminal_block', 'xlr_digital_aes', 'rj45_ethernet', 'speakon', 'usb_b', 'powercon'].forEach(
      (expected) => expect(portTypes.has(expected as never)).toBe(true),
    );
  });
});
