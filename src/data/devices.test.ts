import { describe, expect, it } from 'vitest';
import { devices } from './devices';

describe('device catalog', () => {
  it('gives every device a rear-panel verification basis', () => {
    devices.forEach((device) => {
      expect(device.backPanel.verification.basis).toMatch(/documented|configured|modeled/);
      expect(device.backPanel.verification.reference.length).toBeGreaterThan(0);
    });
  });

  it('routes equalizers to a sidechain-free analog I/O set', () => {
    const equalizers = devices.filter((device) => device.category.startsWith('equalizer'));
    expect(equalizers.length).toBeGreaterThan(0);
    equalizers.forEach((device) => {
      const hasSidechain = device.backPanel.ports.some((port) =>
        port.label.includes('SIDECHAIN'),
      );
      expect(hasSidechain).toBe(false);
    });
  });

  it('renders hand-tuned panels without the legacy four-control cap', () => {
    const oneSeventySix = devices.find((device) => device.id === '1176ln');
    expect(oneSeventySix?.frontPanel.controls.length).toBe(9);
  });

  it('models patch bays as socket fields', () => {
    const patchBays = devices.filter((device) => device.category === 'patch_bay');
    patchBays
      .filter((device) => device.backPanel.ports.length > 0)
      .forEach((device) => {
        expect(device.frontPanel.controls.some((control) => control.type === 'sockets')).toBe(true);
      });
  });

  it('keeps unique device ids', () => {
    const ids = new Set(devices.map((device) => device.id));
    expect(ids.size).toBe(devices.length);
  });
});
