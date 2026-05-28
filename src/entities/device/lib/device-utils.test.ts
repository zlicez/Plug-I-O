import { devices } from '../../../data/devices';
import { getConnectablePorts, resolveDeviceMove } from './device-utils';

describe('resolveDeviceMove', () => {
  it('swaps devices of different rack heights when the released positions fit', () => {
    const resolution = resolveDeviceMove(
      [
        { instanceId: 'two-u', deviceId: 'solid-link-gbus', slot: 0 },
        { instanceId: 'one-u', deviceId: 'dbx-160a', slot: 3 },
      ],
      devices,
      'two-u',
      3,
      8,
    );

    expect(resolution).toEqual({
      slot: 3,
      swap: { instanceId: 'one-u', slot: 0 },
    });
  });

  it('does not swap when the replaced device would collide at the source position', () => {
    const resolution = resolveDeviceMove(
      [
        { instanceId: 'one-u', deviceId: 'dbx-160a', slot: 0 },
        { instanceId: 'two-u', deviceId: 'solid-link-gbus', slot: 3 },
        { instanceId: 'blocker', deviceId: 'furman-m8', slot: 1 },
      ],
      devices,
      'one-u',
      3,
      8,
    );

    expect(resolution).toBeNull();
  });
});

describe('getConnectablePorts', () => {
  it('exposes each physical TRS patch point independently', () => {
    const patchbay = devices.find((device) => device.id === 'neutrik-patch');

    expect(patchbay).toBeDefined();
    expect(getConnectablePorts(patchbay!).length).toBe(48);
    expect(getConnectablePorts(patchbay!).map((port) => port.id)).toContain('top:24');
  });

  it('does not expand a multipin DB25 connector into sockets', () => {
    const patchbay = devices.find((device) => device.id === 'db25-bay');

    expect(patchbay).toBeDefined();
    expect(getConnectablePorts(patchbay!).length).toBe(2);
  });
});
