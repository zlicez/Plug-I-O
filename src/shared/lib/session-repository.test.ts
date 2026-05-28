import { parseSessionImport } from './session-repository';

describe('parseSessionImport', () => {
  it('rejects malformed installed devices before rendering a session', () => {
    expect(() =>
      parseSessionImport(
        JSON.stringify({ version: 1, rackSize: 12, installed: [{ bad: true }], cables: [] }),
      ),
    ).toThrow('not a valid Plug-I/O rack session');
  });

  it('rejects malformed cable endpoints before rendering a session', () => {
    expect(() =>
      parseSessionImport(
        JSON.stringify({
          version: 1,
          rackSize: 12,
          installed: [],
          cables: [{ id: 'broken', color: '#fff', notices: [] }],
        }),
      ),
    ).toThrow('not a valid Plug-I/O rack session');
  });
});
