import type { Port, PortDirection, PortType } from '../../entities/device/model/types';

/**
 * Design-system connector glyphs (visual shapes). The patchbay needs to draw
 * a different SVG for each physical connector, regardless of the protocol
 * carried over it. Mirrors design_handoff_plug_io/design_canvas/src/shared.jsx
 * `Connector` keys, plus a few extras for connectors absent there
 * (DB25, NEMA mains, terminal block, speakON).
 */
export type ConnectorKind =
  | 'xlrM'
  | 'xlrF'
  | 'trs'
  | 'ts'
  | 'rca'
  | 'bnc'
  | 'rj45'
  | 'optical'
  | 'usbA'
  | 'usbB'
  | 'usbC'
  | 'thunderbolt'
  | 'powerCon'
  | 'iec'
  | 'nema'
  | 'midi5'
  | 'db25'
  | 'speakon'
  | 'terminal';

/**
 * Maps the project's 27-member PortType union to a ConnectorKind shape.
 * XLR variants depend on direction (output → male, input → female), so
 * resolveConnector takes the full Port.
 */
export function resolveConnector(port: Port): ConnectorKind {
  return connectorForType(port.type, port.direction);
}

export function connectorForType(type: PortType, direction: PortDirection): ConnectorKind {
  switch (type) {
    case 'xlr_analog':
    case 'xlr_digital_aes':
    case 'xlr_combo':
      return isOutgoing(direction) ? 'xlrM' : 'xlrF';
    case 'jack_trs':
      return 'trs';
    case 'jack_ts':
      return 'ts';
    case 'rca':
    case 'coaxial_spdif':
      return 'rca';
    case 'bnc_wordclock':
    case 'bnc_madi':
      return 'bnc';
    case 'rj45_dante':
    case 'rj45_avb':
    case 'rj45_ethernet':
    case 'ethercon':
      return 'rj45';
    case 'opticalToslink':
    case 'optical_madi':
      return 'optical';
    case 'usb_a':
      return 'usbA';
    case 'usb_b':
      return 'usbB';
    case 'usb_c':
      return 'usbC';
    case 'thunderbolt':
      return 'thunderbolt';
    case 'powercon':
      return 'powerCon';
    case 'iec_c13':
      return 'iec';
    case 'nema_5_15':
      return 'nema';
    case 'midi_din':
      return 'midi5';
    case 'db25_dsub':
    case 'digilink':
      return 'db25';
    case 'speakon':
      return 'speakon';
    case 'terminal_block':
      return 'terminal';
    case 'remote_link':
      return 'trs';
    default: {
      // Exhaustiveness check — if a new PortType is added, TS will flag this.
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function isOutgoing(direction: PortDirection): boolean {
  return direction === 'out' || direction === 'send' || direction === 'thru';
}
