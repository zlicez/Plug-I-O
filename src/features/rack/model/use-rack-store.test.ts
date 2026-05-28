import { beforeEach, describe, expect, it } from 'vitest';
import type { RackSession } from './types';
import { useRackStore } from './use-rack-store';

const baseSession = (overrides: Partial<RackSession>): RackSession => ({
  version: 1,
  rackSize: 8,
  installed: [],
  cables: [],
  ...overrides,
});

describe('useRackStore.loadSession', () => {
  beforeEach(() => {
    useRackStore.getState().clearRack();
  });

  it('drops devices that are unknown or overflow the rack', () => {
    useRackStore.getState().loadSession(
      baseSession({
        installed: [
          { instanceId: 'ghost', deviceId: 'does-not-exist', slot: 0 },
          { instanceId: 'real', deviceId: 'wave-1073-a', slot: 0 },
        ],
      }),
    );
    const { installed } = useRackStore.getState();
    expect(installed).toHaveLength(1);
    expect(installed[0].deviceId).toBe('wave-1073-a');
  });

  it('removes cables whose endpoints are missing after sanitising', () => {
    useRackStore.getState().loadSession(
      baseSession({
        installed: [{ instanceId: 'real', deviceId: 'wave-1073-a', slot: 0 }],
        cables: [
          {
            id: 'orphan',
            from: { instanceId: 'real', portId: 'line-out' },
            to: { instanceId: 'gone', portId: 'mic-in' },
            color: '#fff',
            notices: [],
          },
        ],
      }),
    );
    expect(useRackStore.getState().cables).toHaveLength(0);
  });

  it('rejects two devices occupying the same slot', () => {
    useRackStore.getState().loadSession(
      baseSession({
        installed: [
          { instanceId: 'a', deviceId: 'wave-1073-a', slot: 0 },
          { instanceId: 'b', deviceId: 'dbx-160a', slot: 0 },
        ],
      }),
    );
    expect(useRackStore.getState().installed).toHaveLength(1);
  });
});
