import type { Cable, CableEndpoint, ValidationLevel } from '../../../entities/cable/model/types';
import type {
  AudioProtocol,
  DeviceCategory,
  InstalledDevice,
  RackSize,
} from '../../../entities/device/model/types';

export type ViewMode = 'front' | 'rear';
export type DevicePanelMode = 'grid' | 'list';
export type DeviceSort = 'popularity' | 'name' | 'category';

export interface FilterState {
  query: string;
  categories: DeviceCategory[];
  rackUnits: 'all' | 1 | 2 | 3 | 4;
  protocols: AudioProtocol[];
  sort: DeviceSort;
  mode: DevicePanelMode;
}

export interface Notification {
  id: string;
  level: ValidationLevel;
  title: string;
  message: string;
  expiresAt?: number;
}

export interface RackSession {
  version: 1;
  rackSize: RackSize;
  installed: InstalledDevice[];
  cables: Cable[];
}

export interface RackStore {
  rackSize: RackSize;
  rackConfigured: boolean;
  installed: InstalledDevice[];
  cables: Cable[];
  activeCableStart: CableEndpoint | null;
  viewMode: ViewMode;
  selectedDeviceId: string | null;
  selectedCableId: string | null;
  hoveredPort: CableEndpoint | null;
  hoveredCableId: string | null;
  devicePanelFilter: FilterState;
  notifications: Notification[];
  setRackSize: (size: RackSize) => void;
  configureRack: (size: RackSize) => void;
  clearRack: () => void;
  placeDevice: (deviceId: string, slot: number) => void;
  placeDeviceInFirstAvailableSlot: (deviceId: string) => void;
  removeDevice: (instanceId: string) => void;
  moveDevice: (instanceId: string, slot: number) => void;
  startCable: (instanceId: string, portId: string) => void;
  completeCable: (instanceId: string, portId: string) => void;
  cancelCable: () => void;
  deleteCable: (cableId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  selectDevice: (instanceId: string | null) => void;
  selectCable: (cableId: string | null) => void;
  setHoveredPort: (endpoint: CableEndpoint | null) => void;
  setHoveredCable: (cableId: string | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  notify: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  loadSession: (session: RackSession) => void;
  getSession: () => RackSession;
  undo: () => void;
  redo: () => void;
}
