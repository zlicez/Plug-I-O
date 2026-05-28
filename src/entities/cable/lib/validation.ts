import type { Port, PortDirection, PortType } from '../../device/model/types';
import type { CableValidation } from '../model/types';

export const COMPATIBILITY_MATRIX: Record<PortType, PortType[]> = {
  xlr_analog: ['xlr_analog', 'xlr_combo'],
  xlr_digital_aes: ['xlr_digital_aes'],
  jack_trs: ['jack_trs', 'jack_ts', 'xlr_combo'],
  jack_ts: ['jack_ts', 'jack_trs', 'xlr_combo'],
  rca: ['rca'],
  rj45_dante: ['rj45_dante', 'ethercon', 'rj45_avb'],
  rj45_avb: ['rj45_avb', 'ethercon', 'rj45_dante'],
  bnc_wordclock: ['bnc_wordclock', 'coaxial_spdif'],
  midi_din: ['midi_din'],
  usb_a: ['usb_b', 'usb_c'],
  usb_b: ['usb_a', 'usb_c'],
  usb_c: ['usb_a', 'usb_b', 'usb_c'],
  db25_dsub: ['db25_dsub'],
  opticalToslink: ['opticalToslink'],
  coaxial_spdif: ['coaxial_spdif', 'bnc_wordclock'],
  ethercon: ['ethercon', 'rj45_dante', 'rj45_avb'],
  rj45_ethernet: ['rj45_ethernet'],
  bnc_madi: ['bnc_madi'],
  optical_madi: ['optical_madi'],
  speakon: ['speakon'],
  powercon: ['powercon'],
  iec_c13: ['iec_c13', 'nema_5_15'],
  nema_5_15: ['nema_5_15', 'iec_c13'],
  terminal_block: ['terminal_block'],
  thunderbolt: ['thunderbolt'],
  digilink: ['digilink'],
  remote_link: ['remote_link'],
  xlr_combo: ['xlr_analog', 'jack_trs', 'jack_ts', 'xlr_combo'],
};

function canSource(direction: PortDirection): boolean {
  return ['out', 'send', 'thru', 'bidirectional'].includes(direction);
}

function canReceive(direction: PortDirection): boolean {
  return ['in', 'return', 'bidirectional'].includes(direction);
}

function isLineLevelMismatch(source: Port, destination: Port): boolean {
  return source.maxLevel === '+4dBu' && destination.maxLevel === '-10dBV';
}

/** Validates a patch connection without changing rack state. */
export function validateConnection(source: Port, destination: Port): CableValidation {
  const notices: CableValidation['notices'] = [];

  if (!canSource(source.direction) || !canReceive(destination.direction)) {
    return {
      allowed: false,
      notices: [{ level: 'error', message: 'Connect an output or send to an input or return.' }],
    };
  }

  if (
    (source.type === 'xlr_digital_aes' && destination.type === 'xlr_analog') ||
    (source.type === 'xlr_analog' && destination.type === 'xlr_digital_aes')
  ) {
    return {
      allowed: false,
      notices: [{ level: 'error', message: 'AES/EBU cannot be connected to analog XLR.' }],
    };
  }

  if (!COMPATIBILITY_MATRIX[source.type].includes(destination.type)) {
    return {
      allowed: false,
      notices: [
        {
          level: 'error',
          message: `Physical connector mismatch: ${source.type} cannot patch to ${destination.type}.`,
        },
      ],
    };
  }

  if (
    (source.protocol === 'spdif' && destination.protocol === 'wordclock') ||
    (source.protocol === 'wordclock' && destination.protocol === 'spdif')
  ) {
    notices.push({ level: 'warning', message: 'S/PDIF and word clock use different signals.' });
  }

  if (
    (source.protocol === 'dante' && destination.protocol === 'milan_avb') ||
    (source.protocol === 'milan_avb' && destination.protocol === 'dante')
  ) {
    notices.push({
      level: 'warning',
      message: 'Dante and AVB need an audio-over-IP bridge for interoperability.',
    });
  }

  if (source.impedance === 'Hi-Z' && destination.impedance === 'Lo-Z') {
    notices.push({ level: 'warning', message: 'Hi-Z source is feeding a Lo-Z input.' });
  }
  if (isLineLevelMismatch(source, destination)) {
    notices.push({ level: 'warning', message: '+4dBu output may overload a -10dBV input.' });
  }
  if (source.channels === 'mono' && destination.channels === 'stereo') {
    notices.push({ level: 'warning', message: 'Mono source is connected to a stereo input.' });
  }
  if (source.direction === 'send' && destination.direction === 'return') {
    notices.push({ level: 'info', message: 'Analog insert loop established.' });
  }
  if (source.direction === 'thru' && source.protocol === 'midi') {
    notices.push({ level: 'info', message: 'MIDI THRU is forwarding the upstream signal.' });
  }

  return { allowed: true, notices };
}

/**
 * Resolve the canonical hex color for a cable carrying this port's signal.
 * Mirrors the design-system protocol palette (src/shared/audio/protocols.ts)
 * so cables drawn on the rear view share visual identity with port glyphs,
 * inspector dots, and library protocol chips.
 *
 * Note: this is a thin re-statement of protocolMeta(port.protocol).hex —
 * kept inline (rather than imported) so the cable entity has no
 * dependency on the shared/audio layer (entities cannot depend on shared
 * domain visuals — only entities, lib, model are allowed).
 */
export function cableColorForPort(port: Port): string {
  const protocol = port.protocol;
  if (!protocol) return '#E0A458'; // analog fallback
  switch (protocol) {
    case 'analog':
      return '#E0A458';
    case 'aes_ebu':
      return '#6EE7FF';
    case 'spdif':
      return '#F2A93B';
    case 'adat':
      return '#B58CFF';
    case 'dante':
    case 'milan_avb':
      return '#6366F1';
    case 'madi':
      return '#FF7AB6';
    case 'midi':
      return '#4ADE80';
    case 'wordclock':
      return '#9DA4AF';
    case 'usb_audio':
      return '#6EE7FF';
    case 'ethernet':
    case 'blu_link':
      return '#6366F1';
    case 'pro_tools':
      return '#B58CFF';
    case 'control':
      return '#9DA4AF';
    case 'power':
      return '#E05454';
    default:
      return '#E0A458';
  }
}
