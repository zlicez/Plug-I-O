import type { AudioProtocol, PortDirection } from '../../entities/device/model/types';

/**
 * Design-system protocol keys (11 + bluetooth). Each protocol carries a
 * color AND a dash pattern, so the same hue can repeat across protocols
 * without losing colorblind distinction.
 *
 * Mirrors design_handoff_plug_io/design_canvas/src/shared.jsx PROTOCOLS.
 */
export type ProtocolKey =
  | 'analog'
  | 'aes'
  | 'spdif'
  | 'adat'
  | 'dante'
  | 'madi'
  | 'midi'
  | 'wclock'
  | 'usb'
  | 'thunderbolt'
  | 'power'
  | 'bluetooth'
  | 'ethernet'
  | 'control';

export type DashStyle = 'solid' | 'dashed' | 'dotted';

export interface ProtocolMeta {
  /** Human-readable label, e.g. "AES/EBU". */
  label: string;
  /** CSS variable reference, e.g. `var(--p-analog)`. */
  color: string;
  /** Direct hex value for SVG `stroke` / `fill` where var() can't be used. */
  hex: string;
  /** Stroke pattern paired with the color for color-blind safety. */
  dash: DashStyle;
  /** 3-letter shortcode shown next to port glyphs, e.g. "ANA". */
  short: string;
}

export const PROTOCOLS: Record<ProtocolKey, ProtocolMeta> = {
  analog:      { label: 'Analog',      color: 'var(--p-analog)',      hex: '#E0A458', dash: 'solid',  short: 'ANA' },
  aes:         { label: 'AES/EBU',     color: 'var(--p-aes)',         hex: '#6EE7FF', dash: 'dashed', short: 'AES' },
  spdif:       { label: 'S/PDIF',      color: 'var(--p-spdif)',       hex: '#F2A93B', dash: 'dotted', short: 'SPD' },
  adat:        { label: 'ADAT',        color: 'var(--p-adat)',        hex: '#B58CFF', dash: 'dashed', short: 'ADT' },
  dante:       { label: 'Dante',       color: 'var(--p-dante)',       hex: '#6366F1', dash: 'solid',  short: 'DNT' },
  madi:        { label: 'MADI',        color: 'var(--p-madi)',        hex: '#FF7AB6', dash: 'dashed', short: 'MAD' },
  midi:        { label: 'MIDI',        color: 'var(--p-midi)',        hex: '#4ADE80', dash: 'dotted', short: 'MID' },
  wclock:      { label: 'Wordclock',   color: 'var(--p-wclock)',      hex: '#9DA4AF', dash: 'solid',  short: 'WCK' },
  usb:         { label: 'USB',         color: 'var(--p-usb)',         hex: '#6EE7FF', dash: 'dashed', short: 'USB' },
  thunderbolt: { label: 'Thunderbolt', color: 'var(--p-thunderbolt)', hex: '#B58CFF', dash: 'solid',  short: 'TB'  },
  power:       { label: 'Power',       color: 'var(--p-power)',       hex: '#E05454', dash: 'solid',  short: 'PWR' },
  bluetooth:   { label: 'Bluetooth',   color: 'var(--p-bluetooth)',   hex: '#4093D6', dash: 'solid',  short: 'BT'  },
  // Extras to cover the richer AudioProtocol union without losing visual identity.
  ethernet:    { label: 'Ethernet',    color: 'var(--p-dante)',       hex: '#6366F1', dash: 'dotted', short: 'ETH' },
  control:     { label: 'Control',     color: 'var(--p-wclock)',      hex: '#9DA4AF', dash: 'dotted', short: 'CTL' },
};

/**
 * Map the project's 15-member AudioProtocol union onto the 14 design-system
 * protocol keys. Missing variants fold into their closest analog so the
 * palette stays at 11 + extras and the cable color remains distinguishable.
 */
export const AUDIO_PROTOCOL_TO_KEY: Record<AudioProtocol, ProtocolKey> = {
  analog:     'analog',
  aes_ebu:    'aes',
  spdif:      'spdif',
  adat:       'adat',
  dante:      'dante',
  madi:       'madi',
  milan_avb:  'dante',     // closest network audio peer
  usb_audio:  'usb',
  midi:       'midi',
  wordclock:  'wclock',
  ethernet:   'ethernet',
  blu_link:   'ethernet',  // BLU-Link rides Ethernet-like uTP
  pro_tools:  'thunderbolt', // Digilink/HDX shares the lavender hue
  control:    'control',
  power:      'power',
};

/**
 * Compute the SVG `stroke-dasharray` value for a protocol. Returns
 * `undefined` for solid lines so the SVG attribute can be omitted.
 */
export function dashArray(dash: DashStyle): string | undefined {
  if (dash === 'dashed') return '6 4';
  if (dash === 'dotted') return '2 3';
  return undefined;
}

/**
 * Resolve a project AudioProtocol (rich) into the design-system protocol
 * key (11 + extras). Falls back to `analog` for unknown values.
 */
export function resolveProtocolKey(protocol: AudioProtocol | undefined): ProtocolKey {
  if (!protocol) return 'analog';
  return AUDIO_PROTOCOL_TO_KEY[protocol] ?? 'analog';
}

/**
 * Convenience getter for the protocol metadata, given a possibly-undefined
 * AudioProtocol value (port.protocol is optional in the rich model).
 */
export function protocolMeta(protocol: AudioProtocol | undefined): ProtocolMeta {
  return PROTOCOLS[resolveProtocolKey(protocol)];
}

/**
 * "Compatibility" — two ports are eligible to be cabled together if their
 * resolved protocol key matches and their directions are inverse.
 * This is the design-canvas rule. The project's full validation
 * (`validateConnection`) layers additional checks on top.
 */
export function arePortsProtocolCompatible(
  a: { protocol?: AudioProtocol; direction: PortDirection },
  b: { protocol?: AudioProtocol; direction: PortDirection },
): boolean {
  if (resolveProtocolKey(a.protocol) !== resolveProtocolKey(b.protocol)) return false;
  return isInverseDirection(a.direction, b.direction);
}

export function isInverseDirection(a: PortDirection, b: PortDirection): boolean {
  const outish: PortDirection[] = ['out', 'send', 'thru', 'bidirectional'];
  const inish: PortDirection[] = ['in', 'return', 'bidirectional'];
  return (outish.includes(a) && inish.includes(b)) || (outish.includes(b) && inish.includes(a));
}
