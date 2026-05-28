import type { RackSession } from '../../features/rack/model/types';
import type { Cable, CableEndpoint, CableNotice } from '../../entities/cable/model/types';
import type { InstalledDevice } from '../../entities/device/model/types';

const SESSION_KEY = 'plug-io:rack-session:v1';

export interface SessionRepository {
  load: () => RackSession | null;
  save: (session: RackSession) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isInstalledDevice(value: unknown): value is InstalledDevice {
  if (!isRecord(value)) return false;
  return (
    typeof value.instanceId === 'string' &&
    typeof value.deviceId === 'string' &&
    Number.isInteger(value.slot) &&
    Number(value.slot) >= 0
  );
}

function isCableEndpoint(value: unknown): value is CableEndpoint {
  if (!isRecord(value)) return false;
  return typeof value.instanceId === 'string' && typeof value.portId === 'string';
}

function isCableNotice(value: unknown): value is CableNotice {
  if (!isRecord(value)) return false;
  return (
    ['error', 'warning', 'info'].includes(String(value.level)) &&
    typeof value.message === 'string'
  );
}

function isCable(value: unknown): value is Cable {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.color === 'string' &&
    isCableEndpoint(value.from) &&
    isCableEndpoint(value.to) &&
    Array.isArray(value.notices) &&
    value.notices.every(isCableNotice)
  );
}

function isRackSession(value: unknown): value is RackSession {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RackSession>;
  return (
    candidate.version === 1 &&
    [4, 8, 12, 16, 20, 24].includes(candidate.rackSize ?? 0) &&
    Array.isArray(candidate.installed) &&
    candidate.installed.every(isInstalledDevice) &&
    Array.isArray(candidate.cables) &&
    candidate.cables.every(isCable)
  );
}

export const localSessionRepository: SessionRepository = {
  load: () => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    try {
      const parsed: unknown = JSON.parse(saved);
      return isRackSession(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  save: (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session)),
};

export function parseSessionImport(content: string): RackSession {
  const value: unknown = JSON.parse(content);
  if (!isRackSession(value)) {
    throw new Error('The selected file is not a valid Plug-I/O rack session.');
  }
  return value;
}
