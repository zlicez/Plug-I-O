import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { devices } from '../../../data/devices';
import { cableColorForPort, validateConnection } from '../../../entities/cable/lib/validation';
import type { Cable, CableEndpoint } from '../../../entities/cable/model/types';
import {
  canPlaceDevice,
  getConnectablePorts,
  getDeviceById,
  resolveDeviceMove,
} from '../../../entities/device/lib/device-utils';
import type { InstalledDevice } from '../../../entities/device/model/types';
import type { FilterState, Notification, RackSession, RackStore } from './types';

const defaultFilters: FilterState = {
  query: '',
  categories: [],
  rackUnits: 'all',
  protocols: [],
  sort: 'popularity',
  mode: 'grid',
};

const tracked = (state: RackStore): RackSession => ({
  version: 1,
  rackSize: state.rackSize,
  installed: state.installed,
  cables: state.cables,
});

const newId = (): string => crypto.randomUUID();

function appendNotification(
  notifications: Notification[],
  level: Notification['level'],
  title: string,
  message: string,
): void {
  notifications.push({
    id: newId(),
    level,
    title,
    message,
    expiresAt: level === 'info' ? Date.now() + 4000 : undefined,
  });
}

function portAt(endpoint: CableEndpoint, installed: InstalledDevice[]) {
  const instance = installed.find((item) => item.instanceId === endpoint.instanceId);
  if (!instance) return undefined;
  const device = getDeviceById(devices, instance.deviceId);
  return device && getConnectablePorts(device).find(
    (port) => port.id === endpoint.portId,
  );
}

function sanitizeSession(session: RackSession): { session: RackSession; repaired: boolean } {
  const installed: InstalledDevice[] = [];
  const instanceIds = new Set<string>();
  session.installed.forEach((item) => {
    const device = getDeviceById(devices, item.deviceId);
    if (
      !device ||
      instanceIds.has(item.instanceId) ||
      !canPlaceDevice(installed, devices, device, item.slot, session.rackSize)
    ) {
      return;
    }
    installed.push(item);
    instanceIds.add(item.instanceId);
  });

  const cables: Cable[] = session.cables.flatMap((cable) => {
    const source = portAt(cable.from, installed);
    const destination = portAt(cable.to, installed);
    if (!source || !destination || cable.from.instanceId === cable.to.instanceId) return [];
    const validation = validateConnection(source, destination);
    if (!validation.allowed) return [];
    return [{
      ...cable,
      color: cableColorForPort(source),
      notices: validation.notices,
    }];
  });

  return {
    session: { ...session, installed, cables },
    repaired: installed.length !== session.installed.length || cables.length !== session.cables.length,
  };
}

export const useRackStore = create<RackStore>()(
  temporal(
    immer<RackStore>((set, get) => ({
      rackSize: 12,
      rackConfigured: false,
      installed: [],
      cables: [],
      activeCableStart: null,
      viewMode: 'front',
      selectedDeviceId: null,
      selectedCableId: null,
      hoveredPort: null,
      devicePanelFilter: defaultFilters,
      notifications: [],
      configureRack: (size) =>
        set((state) => {
          state.rackSize = size;
          state.rackConfigured = true;
        }),
      clearRack: () =>
        set((state) => {
          state.installed = [];
          state.cables = [];
          state.activeCableStart = null;
          state.selectedDeviceId = null;
          state.selectedCableId = null;
        }),
      setRackSize: (size) =>
        set((state) => {
          const overflow = state.installed.some((item) => {
            const device = getDeviceById(devices, item.deviceId);
            return device ? item.slot + device.rackUnits > size : false;
          });
          if (overflow) {
            appendNotification(
              state.notifications,
              'warning',
              'Resize blocked',
              'Move or remove devices outside the requested rack height first.',
            );
            return;
          }
          state.rackSize = size;
        }),
      placeDevice: (deviceId, slot) =>
        set((state) => {
          const device = getDeviceById(devices, deviceId);
          if (!device) return;
          if (!canPlaceDevice(state.installed, devices, device, slot, state.rackSize)) {
            appendNotification(
              state.notifications,
              'error',
              'No available space',
              `${device.name} needs ${device.rackUnits} contiguous rack units.`,
            );
            return;
          }
          const instanceId = newId();
          state.installed.push({ instanceId, deviceId, slot });
          state.selectedDeviceId = instanceId;
        }),
      placeDeviceInFirstAvailableSlot: (deviceId) => {
        const { installed, rackSize } = get();
        const device = getDeviceById(devices, deviceId);
        if (!device) return;
        const slot = Array.from({ length: rackSize }, (_, index) => index).find((index) =>
          canPlaceDevice(installed, devices, device, index, rackSize),
        );
        if (slot === undefined) {
          get().notify({
            level: 'error',
            title: 'No available space',
            message: `${device.name} needs ${device.rackUnits} contiguous rack units.`,
          });
          return;
        }
        get().placeDevice(deviceId, slot);
      },
      removeDevice: (instanceId) =>
        set((state) => {
          state.installed = state.installed.filter((device) => device.instanceId !== instanceId);
          state.cables = state.cables.filter(
            (cable) => cable.from.instanceId !== instanceId && cable.to.instanceId !== instanceId,
          );
          if (state.selectedDeviceId === instanceId) state.selectedDeviceId = null;
        }),
      moveDevice: (instanceId, slot) =>
        set((state) => {
          const item = state.installed.find((device) => device.instanceId === instanceId);
          const device = item && getDeviceById(devices, item.deviceId);
          if (!item || !device) return;
          const resolution = resolveDeviceMove(
            state.installed,
            devices,
            instanceId,
            slot,
            state.rackSize,
          );
          if (!resolution) {
            appendNotification(
              state.notifications,
              'error',
              'Move rejected',
              `${device.name} cannot fit at that rack position.`,
            );
            return;
          }
          item.slot = resolution.slot;
          if (resolution.swap) {
            const swapped = state.installed.find(
              (installedDevice) => installedDevice.instanceId === resolution.swap?.instanceId,
            );
            if (swapped) swapped.slot = resolution.swap.slot;
          }
        }),
      startCable: (instanceId, portId) =>
        set((state) => {
          const port = portAt({ instanceId, portId }, state.installed);
          if (!port || !['out', 'send', 'thru', 'bidirectional'].includes(port.direction)) {
            appendNotification(
              state.notifications,
              'error',
              'Select a source',
              'Begin a patch from an output, send, thru or bidirectional port.',
            );
            return;
          }
          state.activeCableStart = { instanceId, portId };
          state.selectedDeviceId = null;
          state.selectedCableId = null;
        }),
      completeCable: (instanceId, portId) =>
        set((state) => {
          const start = state.activeCableStart;
          if (!start) return;
          const source = portAt(start, state.installed);
          const destination = portAt({ instanceId, portId }, state.installed);
          if (!source || !destination || start.instanceId === instanceId) {
            appendNotification(
              state.notifications,
              'error',
              'Patch rejected',
              'Choose a compatible input on another installed device.',
            );
            return;
          }
          const validation = validateConnection(source, destination);
          validation.notices.forEach((notice) =>
            appendNotification(
              state.notifications,
              notice.level,
              notice.level === 'error' ? 'Connection blocked' : 'Patch notice',
              notice.message,
            ),
          );
          if (!validation.allowed) return;
          const cableId = newId();
          state.cables.push({
            id: cableId,
            from: start,
            to: { instanceId, portId },
            color: cableColorForPort(source),
            notices: validation.notices,
          });
          state.activeCableStart = null;
          state.selectedCableId = cableId;
          state.selectedDeviceId = null;
        }),
      cancelCable: () =>
        set((state) => {
          state.activeCableStart = null;
          state.selectedCableId = null;
        }),
      deleteCable: (cableId) =>
        set((state) => {
          state.cables = state.cables.filter((cable) => cable.id !== cableId);
          if (state.selectedCableId === cableId) state.selectedCableId = null;
        }),
      setViewMode: (mode) =>
        set((state) => {
          state.viewMode = mode;
          state.activeCableStart = null;
        }),
      selectDevice: (instanceId) =>
        set((state) => {
          state.selectedDeviceId = instanceId;
          if (instanceId) state.selectedCableId = null;
        }),
      selectCable: (cableId) =>
        set((state) => {
          state.selectedCableId = cableId;
          if (cableId) state.selectedDeviceId = null;
        }),
      setHoveredPort: (endpoint) =>
        set((state) => {
          state.hoveredPort = endpoint;
        }),
      setFilters: (filters) =>
        set((state) => {
          state.devicePanelFilter = { ...state.devicePanelFilter, ...filters };
        }),
      notify: (notification) =>
        set((state) => {
          state.notifications.push({ ...notification, id: newId() });
        }),
      dismissNotification: (id) =>
        set((state) => {
          state.notifications = state.notifications.filter(
            (notification) => notification.id !== id,
          );
        }),
      loadSession: (session) =>
        set((state) => {
          const sanitized = sanitizeSession(session);
          state.rackSize = sanitized.session.rackSize;
          state.installed = sanitized.session.installed;
          state.cables = sanitized.session.cables;
          state.rackConfigured = true;
          state.activeCableStart = null;
          state.selectedDeviceId = null;
          state.selectedCableId = null;
          if (sanitized.repaired) {
            appendNotification(
              state.notifications,
              'warning',
              'Session repaired',
              'Invalid devices or cable routes were removed while opening this session.',
            );
          }
        }),
      getSession: () => tracked(get()),
      undo: () => useRackStore.temporal.getState().undo(),
      redo: () => useRackStore.temporal.getState().redo(),
    })),
    {
      limit: 50,
      partialize: tracked,
      equality: (past, current) => JSON.stringify(past) === JSON.stringify(current),
    },
  ),
);
