import type { Port } from '../../device/model/types';
import { validateConnection } from './validation';

const out: Port = {
  id: 'out',
  label: 'LINE OUT',
  type: 'xlr_analog',
  direction: 'out',
  protocol: 'analog',
  maxLevel: '+4dBu',
};

describe('validateConnection', () => {
  it('permits matching analog output and input', () => {
    const result = validateConnection(out, { ...out, id: 'in', direction: 'in' });
    expect(result.allowed).toBe(true);
    expect(result.notices).toHaveLength(0);
  });

  it('blocks output to output', () => {
    expect(validateConnection(out, { ...out, id: 'second-out' }).allowed).toBe(false);
  });

  it('blocks digital AES into analog XLR', () => {
    const aesOut: Port = { ...out, type: 'xlr_digital_aes', protocol: 'aes_ebu' };
    expect(validateConnection(aesOut, { ...out, id: 'analog-in', direction: 'in' }).allowed).toBe(
      false,
    );
  });

  it('warns when an S/PDIF connector is routed to word clock', () => {
    const spdif: Port = { ...out, type: 'coaxial_spdif', protocol: 'spdif' };
    const clock: Port = {
      ...out,
      id: 'clock',
      type: 'bnc_wordclock',
      protocol: 'wordclock',
      direction: 'in',
    };
    const result = validateConnection(spdif, clock);
    expect(result.allowed).toBe(true);
    expect(result.notices[0]?.level).toBe('warning');
  });
});
