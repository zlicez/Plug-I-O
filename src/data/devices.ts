import type {
  Device,
  DeviceCategory,
  FrontControl,
  Port,
  PortType,
} from '../entities/device/model/types';

type Profile =
  | 'preamp'
  | 'analog'
  | 'eq'
  | 'digital'
  | 'dante'
  | 'madi'
  | 'patch-trs'
  | 'patch-xlr'
  | 'patch-db25'
  | 'effects'
  | 'monitor'
  | 'amplifier'
  | 'clock'
  | 'power'
  | 'di'
  | 'blank';

interface CatalogDefinition {
  id: string;
  name: string;
  manufacturer: string;
  category: DeviceCategory;
  rackUnits: 1 | 2 | 3 | 4;
  profile: Profile;
  accent: string;
  description: string;
  channels?: number;
  popularity?: number;
  /** Hand-tuned front-panel layout that overrides the category default. */
  controls?: FrontControl[];
  /** Bespoke rear connectors that override the profile default. */
  ports?: Port[];
  /** How the rear panel data was sourced; overrides the profile default. */
  verification?: Device['backPanel']['verification'];
  /** Per-device technical specifications merged over the profile defaults. */
  specs?: Partial<Device['specs']>;
  meterType?: Device['frontPanel']['meterType'];
}

const port = (
  id: string,
  label: string,
  type: PortType,
  direction: Port['direction'],
  protocol: Port['protocol'],
  extras: Partial<Port> = {},
): Port => ({ id, label, type, direction, protocol, ...extras });

const documented = (
  reference: string,
  note?: string,
): Device['backPanel']['verification'] => ({ basis: 'documented', reference, ...(note ? { note } : {}) });

const modeled = (
  reference: string,
  note?: string,
): Device['backPanel']['verification'] => ({ basis: 'modeled', reference, ...(note ? { note } : {}) });

const iecPower = (): Port => port('power', 'AC POWER', 'iec_c13', 'in', 'power');

function portsForProfile(profile: Profile, channels = 2): Port[] {
  const power = port('power', 'AC POWER', 'iec_c13', 'in', 'power');
  switch (profile) {
    case 'preamp':
      return [
        port('mic-in', 'MIC IN', 'xlr_combo', 'in', 'analog', {
          count: channels,
          impedance: 'Lo-Z',
          channels: 'multichannel',
        }),
        port('line-out', 'LINE OUT', 'xlr_analog', 'out', 'analog', {
          count: channels,
          maxLevel: '+4dBu',
          channels: 'multichannel',
        }),
        power,
      ];
    case 'analog':
      return [
        port('line-in', 'LINE IN L/R', 'xlr_analog', 'in', 'analog', {
          impedance: 'Lo-Z',
          channels: 'stereo',
        }),
        port('line-out', 'LINE OUT L/R', 'xlr_analog', 'out', 'analog', {
          maxLevel: '+4dBu',
          channels: 'stereo',
        }),
        port('side-send', 'SIDECHAIN SEND', 'jack_trs', 'send', 'analog'),
        port('side-return', 'SIDECHAIN RETURN', 'jack_trs', 'return', 'analog'),
        power,
      ];
    case 'eq':
      return [
        port('line-in', 'LINE IN L/R', 'xlr_analog', 'in', 'analog', {
          impedance: 'Lo-Z',
          channels: 'stereo',
        }),
        port('line-out', 'LINE OUT L/R', 'xlr_analog', 'out', 'analog', {
          maxLevel: '+4dBu',
          channels: 'stereo',
        }),
        port('insert-send', 'INSERT SEND', 'jack_trs', 'send', 'analog'),
        port('insert-return', 'INSERT RETURN', 'jack_trs', 'return', 'analog'),
        power,
      ];
    case 'digital':
      return [
        port('analog-in', 'ANALOG IN', 'db25_dsub', 'in', 'analog', { count: channels }),
        port('analog-out', 'ANALOG OUT', 'db25_dsub', 'out', 'analog', { count: channels }),
        port('aes-in', 'AES IN', 'xlr_digital_aes', 'in', 'aes_ebu'),
        port('aes-out', 'AES OUT', 'xlr_digital_aes', 'out', 'aes_ebu'),
        port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
        port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
        power,
      ];
    case 'dante':
      return [
        port('analog-in', 'ANALOG IN 1-16', 'db25_dsub', 'in', 'analog'),
        port('analog-out', 'ANALOG OUT 1-16', 'db25_dsub', 'out', 'analog'),
        port('primary', 'DANTE PRIMARY', 'ethercon', 'bidirectional', 'dante'),
        port('secondary', 'DANTE SECONDARY', 'rj45_dante', 'bidirectional', 'dante'),
        port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
        power,
      ];
    case 'madi':
      return [
        port('madi-in', 'MADI IN', 'coaxial_spdif', 'in', 'madi'),
        port('madi-out', 'MADI OUT', 'coaxial_spdif', 'out', 'madi'),
        port('adat-in', 'ADAT IN', 'opticalToslink', 'in', 'adat', { count: 8 }),
        port('adat-out', 'ADAT OUT', 'opticalToslink', 'out', 'adat', { count: 8 }),
        port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
        power,
      ];
    case 'patch-trs':
      return [
        port('top', 'TOP ROW 1-24', 'jack_trs', 'bidirectional', 'analog', {
          count: 24,
          individualSockets: true,
        }),
        port('bottom', 'BOTTOM ROW 1-24', 'jack_trs', 'bidirectional', 'analog', {
          count: 24,
          individualSockets: true,
        }),
      ];
    case 'patch-xlr':
      return [
        port('inputs', 'INPUTS 1-24', 'xlr_analog', 'in', 'analog', {
          count: 24,
          individualSockets: true,
        }),
        port('outputs', 'OUTPUTS 1-24', 'xlr_analog', 'out', 'analog', {
          count: 24,
          individualSockets: true,
        }),
      ];
    case 'patch-db25':
      return [
        port('inputs', 'INPUTS 1-48', 'db25_dsub', 'in', 'analog', { count: 48 }),
        port('outputs', 'OUTPUTS 1-48', 'db25_dsub', 'out', 'analog', { count: 48 }),
      ];
    case 'effects':
      return [
        port('analog-in', 'ANALOG IN L/R', 'xlr_analog', 'in', 'analog'),
        port('analog-out', 'ANALOG OUT L/R', 'xlr_analog', 'out', 'analog'),
        port('aes-in', 'AES IN', 'xlr_digital_aes', 'in', 'aes_ebu'),
        port('aes-out', 'AES OUT', 'xlr_digital_aes', 'out', 'aes_ebu'),
        port('midi-in', 'MIDI IN', 'midi_din', 'in', 'midi'),
        port('midi-thru', 'MIDI THRU', 'midi_din', 'thru', 'midi'),
        power,
      ];
    case 'monitor':
      return [
        port('mix-in', 'MIX IN L/R', 'xlr_analog', 'in', 'analog', { channels: 'stereo' }),
        port('speaker-out', 'SPEAKER OUT A', 'xlr_analog', 'out', 'analog', {
          channels: 'stereo',
          maxLevel: '+4dBu',
        }),
        port('cue-out', 'CUE OUT', 'jack_trs', 'out', 'analog'),
        power,
      ];
    case 'amplifier':
      return [
        port('input', 'INPUT A/B', 'xlr_analog', 'in', 'analog'),
        port('network', 'CONTROL', 'rj45_avb', 'bidirectional', 'milan_avb'),
        port('speaker', 'SPEAKER OUT', 'speakon', 'out', 'analog', { count: channels }),
        port('mains', 'MAINS', 'powercon', 'in', 'power'),
      ];
    case 'clock':
      return [
        port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
        port('wc-out', 'WC OUT 1-6', 'bnc_wordclock', 'out', 'wordclock', { count: 6 }),
        port('aes-out', 'AES SYNC OUT', 'xlr_digital_aes', 'out', 'aes_ebu'),
        power,
      ];
    case 'power':
      return [
        port('mains', 'MAINS INPUT', 'powercon', 'in', 'power'),
        port('outputs', 'CONDITIONED OUT', 'iec_c13', 'out', 'power', { count: 8 }),
      ];
    case 'di':
      return [
        port('instrument', 'INSTRUMENT IN', 'jack_ts', 'in', 'analog', {
          impedance: 'Hi-Z',
        }),
        port('through', 'THRU', 'jack_ts', 'thru', 'analog'),
        port('balanced', 'BALANCED OUT', 'xlr_analog', 'out', 'analog', {
          impedance: 'Lo-Z',
          channels: 'mono',
        }),
      ];
    case 'blank':
      return [];
    default:
      return [];
  }
}

const knob = (id: string, label: string, accent = false): FrontControl => ({
  id,
  type: 'knob',
  label,
  accent,
});
const button = (id: string, label: string, accent = false): FrontControl => ({
  id,
  type: 'button',
  label,
  accent,
});
const meter = (id: string, label: string): FrontControl => ({ id, type: 'meter', label });
const display = (id: string, label: string): FrontControl => ({ id, type: 'display', label });

/** Builds an evenly spaced bank of identical knobs (band EQs, channel preamps). */
const knobBank = (count: number, prefix: string): FrontControl[] =>
  Array.from({ length: count }, (_, index) => knob(`${prefix}-${index}`, `${index + 1}`));

/**
 * Category-aware default front panels. Each branch produces a recognisable control
 * vocabulary so a preamp never looks like a graphic EQ. Hand-tuned units override this
 * through `definition.controls`.
 */
function controlsFor(category: DeviceCategory, channels = 2): FrontControl[] {
  switch (category) {
    case 'patch_bay':
      return [{ id: 'points', type: 'sockets', label: 'PATCH POINTS', count: 24 }];
    case 'microphone_preamp':
      return [
        ...knobBank(Math.min(channels, 8), 'gain'),
        button('phantom', '48V', true),
        button('pad', 'PAD'),
        button('phase', 'Ø'),
        meter('level', 'LEVEL'),
      ];
    case 'compressor_limiter':
      return [
        knob('threshold', 'THRESH'),
        knob('ratio', 'RATIO'),
        knob('attack', 'ATTACK'),
        knob('release', 'RELEASE'),
        knob('makeup', 'MAKEUP', true),
        meter('gr', 'GR'),
        button('bypass', 'BYP'),
      ];
    case 'equalizer_parametric':
      return [
        knob('lf', 'LF'),
        knob('lmf', 'LMF'),
        knob('hmf', 'HMF'),
        knob('hf', 'HF'),
        knob('freq', 'FREQ', true),
        button('bypass', 'IN'),
      ];
    case 'equalizer_graphic':
      return [
        ...Array.from({ length: 15 }, (_, index): FrontControl => ({
          id: `band-${index}`,
          type: 'fader',
          label: `${index + 1}`,
        })),
        button('bypass', 'IN'),
      ];
    case 'audio_interface':
    case 'ad_da_converter':
    case 'dante_interface':
    case 'madi_interface':
    case 'adat_interface':
    case 'format_converter':
    case 'digital_mixer':
      return [
        display('meters', 'METERS'),
        button('sync', 'SYNC', true),
        button('rate', 'RATE'),
        button('dim', 'DIM'),
      ];
    case 'dynamics_multiband':
      return [display('graph', 'SPECTRUM'), knob('low', 'LOW'), knob('mid', 'MID'), knob('high', 'HIGH')];
    case 'reverb_effects':
    case 'delay_effects':
      return [display('program', 'PROGRAM'), knob('encoder', 'ADJUST', true), button('a', 'A'), button('b', 'B')];
    case 'monitor_controller':
      return [
        knob('volume', 'MONITOR', true),
        button('src-a', 'A'),
        button('src-b', 'B'),
        button('dim', 'DIM'),
        button('mono', 'MONO'),
      ];
    case 'analog_summing':
      return [knob('master', 'SUM', true), meter('left', 'L'), meter('right', 'R')];
    case 'noise_gate':
      return [
        knob('threshold', 'THRESH'),
        knob('range', 'RANGE'),
        knob('attack', 'ATTACK'),
        knob('release', 'RELEASE'),
        button('key', 'KEY'),
      ];
    case 'power_amplifier':
      return [
        ...knobBank(Math.min(channels, 4), 'level'),
        meter('out', 'OUT'),
        display('protect', 'PROTECT'),
      ];
    case 'power_conditioner':
      return [display('voltage', 'VOLTS'), button('lamp', 'LAMP'), button('power', 'POWER', true)];
    case 'clock_wordclock':
      return [display('rate', 'CLOCK'), button('source', 'SOURCE'), button('rate-btn', 'RATE', true)];
    case 'di_box':
      return [knob('level', 'LEVEL'), button('ground', 'GND'), button('pad', 'PAD')];
    default:
      return [knob('gain', 'GAIN'), meter('level', 'LEVEL'), knob('output', 'OUTPUT'), button('bypass', 'BYP')];
  }
}

function verificationForProfile(profile: Profile): Device['backPanel']['verification'] {
  switch (profile) {
    case 'blank':
      return { basis: 'modeled', reference: 'Generic ventilated filler panel.' };
    case 'patch-trs':
    case 'patch-xlr':
    case 'patch-db25':
      return { basis: 'configured', reference: 'Standard studio patch-field wiring.' };
    case 'preamp':
    case 'analog':
    case 'eq':
    case 'di':
    case 'monitor':
      return {
        basis: 'modeled',
        reference: 'Typical analog studio I/O layout.',
        note: 'Connector set is representative of the class, not a unit-specific schematic.',
      };
    case 'digital':
    case 'dante':
    case 'madi':
    case 'clock':
      return {
        basis: 'documented',
        reference: 'Manufacturer rear-panel documentation.',
      };
    default:
      return { basis: 'modeled', reference: 'Representative rear-panel layout.' };
  }
}

function specsForProfile(profile: Profile): Device['specs'] {
  switch (profile) {
    case 'digital':
    case 'dante':
    case 'madi':
      return { frequencyResponse: '20 Hz - 20 kHz', dynamicRange: '120 dB', thd: '0.0005%', powerConsumption: '25 W' };
    case 'amplifier':
      return { dynamicRange: '108 dB', thd: '0.05%', powerConsumption: '900 W' };
    case 'power':
      return { powerConsumption: '15 W' };
    case 'blank':
      return {};
    case 'clock':
      return { powerConsumption: '12 W' };
    case 'preamp':
      return { frequencyResponse: '10 Hz - 50 kHz', dynamicRange: '118 dB', inputGain: '+66 dB', powerConsumption: '30 W' };
    default:
      return { frequencyResponse: '20 Hz - 20 kHz', dynamicRange: '112 dB', thd: '0.001%', powerConsumption: '35 W' };
  }
}

/** Equalizers default to a sidechain-free analog I/O set unless ports are overridden. */
function resolveProfile(definition: CatalogDefinition): Profile {
  if (
    !definition.ports &&
    definition.profile === 'analog' &&
    definition.category.startsWith('equalizer')
  ) {
    return 'eq';
  }
  return definition.profile;
}

function buildDevice(definition: CatalogDefinition): Device {
  const isPatchBay = definition.category === 'patch_bay';
  const profile = resolveProfile(definition);
  return {
    id: definition.id,
    name: definition.name,
    manufacturer: definition.manufacturer,
    category: definition.category,
    rackUnits: definition.rackUnits,
    description: definition.description,
    popularity: definition.popularity ?? 50,
    frontPanel: {
      controls: definition.controls ?? controlsFor(definition.category, definition.channels),
      colorAccent: definition.accent,
      meterType: definition.meterType ?? (isPatchBay ? 'none' : 'led_bargraph'),
    },
    backPanel: {
      ports: definition.ports ?? portsForProfile(profile, definition.channels),
      verification: definition.verification ?? verificationForProfile(profile),
    },
    specs: { ...specsForProfile(profile), ...definition.specs },
    tags: [definition.profile, definition.category.replaceAll('_', ' ')],
  };
}

const catalog: CatalogDefinition[] = [
  {
    id: 'blank-panel',
    name: 'Blank Panel',
    manufacturer: 'RackWorks',
    category: 'patch_bay',
    rackUnits: 1,
    profile: 'blank',
    accent: '#30343b',
    description: 'Ventilated decorative filler panel.',
    popularity: 1,
  },
  {
    id: 'wave-1073-a',
    name: 'Wave 1073-A',
    manufacturer: 'Wave Audio',
    category: 'microphone_preamp',
    rackUnits: 1,
    profile: 'preamp',
    channels: 2,
    accent: '#b95f25',
    description: 'Dual transformer-style microphone preamplifier.',
    popularity: 96,
    ports: [
      port('mic-1', 'MIC IN 1', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('mic-2', 'MIC IN 2', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('line-1', 'LINE IN 1', 'jack_trs', 'in', 'analog', { impedance: 'Hi-Z' }),
      port('line-2', 'LINE IN 2', 'jack_trs', 'in', 'analog', { impedance: 'Hi-Z' }),
      port('out-1', 'LINE OUT 1', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-2', 'LINE OUT 2', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      iecPower(),
    ],
    verification: modeled('Class-compliant Neve 1073 channel-strip rear-panel layout.'),
  },
  {
    id: 'api-512-rack',
    name: 'API 512-Rack',
    manufacturer: 'API',
    category: 'microphone_preamp',
    rackUnits: 2,
    profile: 'preamp',
    channels: 8,
    accent: '#e34d25',
    description: 'Eight-channel discrete microphone front end.',
    popularity: 88,
    ports: [
      port('mic-in', 'MIC IN 1-8', 'xlr_analog', 'in', 'analog', {
        count: 8,
        impedance: 'Lo-Z',
        individualSockets: true,
      }),
      port('line-out-xlr', 'LINE OUT 1-8', 'xlr_analog', 'out', 'analog', {
        count: 8,
        maxLevel: '+4dBu',
        individualSockets: true,
      }),
      port('line-out-db25', 'LINE OUT DB25', 'db25_dsub', 'out', 'analog', { count: 8 }),
      iecPower(),
    ],
    verification: modeled('API 500-series 8-slot rack with discrete preamps.'),
  },
  {
    id: 'grace-m108',
    name: 'GraceDesign m108',
    manufacturer: 'Grace Design',
    category: 'microphone_preamp',
    rackUnits: 1,
    profile: 'preamp',
    channels: 8,
    accent: '#6fa8c9',
    description: 'Remote-controlled transparent eight-channel preamp.',
    popularity: 92,
    ports: [
      port('mic-in', 'MIC IN 1-8', 'xlr_analog', 'in', 'analog', {
        count: 8,
        impedance: 'Lo-Z',
        individualSockets: true,
      }),
      port('line-out-xlr', 'LINE OUT 1-8', 'xlr_analog', 'out', 'analog', {
        count: 8,
        maxLevel: '+4dBu',
        individualSockets: true,
      }),
      port('line-out-db25', 'LINE OUT DB25', 'db25_dsub', 'out', 'analog', { count: 8 }),
      port('aes-out', 'AES OUT', 'db25_dsub', 'out', 'aes_ebu', { count: 4 }),
      port('remote', 'REMOTE', 'remote_link', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: documented('Grace Design m108 owner’s manual rear-panel diagram.'),
  },
  {
    id: 'rupert-mp8',
    name: 'Rupert Acoustics MP8',
    manufacturer: 'Rupert Acoustics',
    category: 'microphone_preamp',
    rackUnits: 2,
    profile: 'preamp',
    channels: 8,
    accent: '#1c8b86',
    description: 'Eight channels of harmonically rich preamplification.',
    ports: [
      port('mic-in', 'MIC IN 1-8', 'xlr_analog', 'in', 'analog', {
        count: 8,
        impedance: 'Lo-Z',
        individualSockets: true,
      }),
      port('line-in', 'LINE IN 1-8', 'jack_trs', 'in', 'analog', {
        count: 8,
        impedance: 'Hi-Z',
        individualSockets: true,
      }),
      port('main-out', 'MAIN OUT 1-8', 'xlr_analog', 'out', 'analog', {
        count: 8,
        maxLevel: '+4dBu',
        individualSockets: true,
      }),
      port('db25-out', 'OUTPUT DB25', 'db25_dsub', 'out', 'analog', { count: 8 }),
      iecPower(),
    ],
    verification: modeled('Rupert Neve Designs Shelford-class 8-channel preamp.'),
  },
  {
    id: 'octopre-classic',
    name: 'Focusrite OctoPre Classic',
    manufacturer: 'Focusrite',
    category: 'microphone_preamp',
    rackUnits: 1,
    profile: 'preamp',
    channels: 8,
    accent: '#ba2431',
    description: 'Eight-channel preamp with optical output.',
    ports: [
      port('combo-in', 'INPUT 1-8', 'xlr_combo', 'in', 'analog', {
        count: 8,
        individualSockets: true,
      }),
      port('insert', 'INSERT 1-8', 'jack_trs', 'send', 'analog', {
        count: 8,
        individualSockets: true,
      }),
      port('line-out', 'LINE OUT 1-8', 'jack_trs', 'out', 'analog', {
        count: 8,
        maxLevel: '+4dBu',
        individualSockets: true,
      }),
      port('adat-out-a', 'ADAT OUT A', 'opticalToslink', 'out', 'adat', { count: 8 }),
      port('adat-out-b', 'ADAT OUT B', 'opticalToslink', 'out', 'adat', { count: 8 }),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      iecPower(),
    ],
    verification: documented('Focusrite OctoPre Classic Platinum rear-panel documentation.'),
  },
  {
    id: 'universal-4710d',
    name: 'Universal Acoustics 4-710d',
    manufacturer: 'Universal Acoustics',
    category: 'microphone_preamp',
    rackUnits: 1,
    profile: 'preamp',
    channels: 4,
    accent: '#535b68',
    description: 'Four-channel tube and solid-state blend preamp.',
    ports: [
      port('combo-in', 'INPUT 1-4', 'xlr_combo', 'in', 'analog', {
        count: 4,
        individualSockets: true,
      }),
      port('insert', 'INSERT 1-4', 'jack_trs', 'send', 'analog', {
        count: 4,
        individualSockets: true,
      }),
      port('line-out', 'LINE OUT 1-4', 'xlr_analog', 'out', 'analog', {
        count: 4,
        maxLevel: '+4dBu',
        individualSockets: true,
      }),
      port('adat-out', 'ADAT OUT', 'opticalToslink', 'out', 'adat', { count: 8 }),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      iecPower(),
    ],
    verification: modeled('Universal Audio 4-710d Twin-Finity rear-panel layout.'),
  },
  {
    id: 'solid-link-gbus',
    name: 'Solid Link G-Bus Compressor',
    manufacturer: 'Solid Link',
    category: 'compressor_limiter',
    rackUnits: 2,
    profile: 'analog',
    accent: '#3e8372',
    description: 'Stereo VCA bus compressor.',
    popularity: 98,
    controls: [
      { id: 'threshold', type: 'knob', label: 'THRESH' },
      { id: 'ratio', type: 'knob', label: 'RATIO' },
      { id: 'attack', type: 'knob', label: 'ATTACK' },
      { id: 'release', type: 'knob', label: 'RELEASE' },
      { id: 'makeup', type: 'knob', label: 'MAKEUP', accent: true },
      { id: 'vu', type: 'meter', label: 'GR' },
      { id: 'in', type: 'button', label: 'IN' },
    ],
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('key-in', 'EXT KEY IN', 'jack_trs', 'in', 'analog'),
      iecPower(),
    ],
    verification: modeled('SSL G-Series bus compressor (XR-727) rear panel.'),
  },
  {
    id: 'la2a-reissue',
    name: 'UREI LA-2A Reissue',
    manufacturer: 'UREI',
    category: 'compressor_limiter',
    rackUnits: 2,
    profile: 'analog',
    accent: '#d4a657',
    description: 'Optical leveling amplifier.',
    popularity: 94,
    controls: [
      { id: 'gain', type: 'knob', label: 'GAIN' },
      { id: 'peak', type: 'knob', label: 'PEAK RED', accent: true },
      { id: 'mode', type: 'button', label: 'COMP/LIM' },
      { id: 'vu', type: 'meter', label: 'VU' },
    ],
    ports: [
      port('input', 'INPUT', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
      port('output', 'OUTPUT', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu', channels: 'mono' }),
      iecPower(),
    ],
    verification: documented('Universal Audio LA-2A reissue owner’s manual.'),
  },
  {
    id: 'dbx-160a',
    name: 'dbx 160A',
    manufacturer: 'dbx',
    category: 'compressor_limiter',
    rackUnits: 1,
    profile: 'analog',
    accent: '#3f72cf',
    description: 'Mono VCA compressor and limiter.',
    ports: [
      port('in-xlr', 'INPUT XLR', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-trs', 'INPUT 1/4"', 'jack_trs', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-xlr', 'OUTPUT XLR', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-trs', 'OUTPUT 1/4"', 'jack_trs', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('detector', 'DETECTOR', 'jack_trs', 'send', 'analog'),
      port('link', 'STEREO LINK', 'jack_trs', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: documented('dbx 160A rear-panel specification.'),
  },
  {
    id: '1176ln',
    name: 'UREI 1176LN Reissue',
    manufacturer: 'UREI',
    category: 'compressor_limiter',
    rackUnits: 2,
    profile: 'analog',
    accent: '#7e848d',
    description: 'Fast FET peak limiter.',
    popularity: 95,
    controls: [
      { id: 'input', type: 'knob', label: 'INPUT' },
      { id: 'output', type: 'knob', label: 'OUTPUT' },
      { id: 'attack', type: 'knob', label: 'ATTACK' },
      { id: 'release', type: 'knob', label: 'RELEASE' },
      { id: 'r4', type: 'button', label: '4' },
      { id: 'r8', type: 'button', label: '8' },
      { id: 'r12', type: 'button', label: '12' },
      { id: 'r20', type: 'button', label: '20', accent: true },
      { id: 'vu', type: 'meter', label: 'GR' },
    ],
    ports: [
      port('input', 'INPUT', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
      port('output', 'OUTPUT', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu', channels: 'mono' }),
      iecPower(),
    ],
    verification: documented('Universal Audio 1176LN reissue owner’s manual.'),
  },
  {
    id: 'cl1b',
    name: 'TubeTech CL1B-Rack',
    manufacturer: 'TubeTech',
    category: 'compressor_limiter',
    rackUnits: 2,
    profile: 'analog',
    accent: '#3aa69a',
    description: 'Opto tube dynamics processor.',
    ports: [
      port('in-xlr', 'INPUT XLR', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-trs', 'INPUT 1/4"', 'jack_trs', 'in', 'analog'),
      port('out-xlr', 'OUTPUT XLR', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-trs', 'OUTPUT 1/4"', 'jack_trs', 'out', 'analog'),
      port('sc-send', 'SIDECHAIN SEND', 'jack_trs', 'send', 'analog'),
      port('sc-return', 'SIDECHAIN RETURN', 'jack_trs', 'return', 'analog'),
      port('link', 'STEREO LINK', 'jack_trs', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: documented('TubeTech CL 1B rear-panel specification.'),
  },
  {
    id: 'mc77',
    name: 'VCA Chain MC77',
    manufacturer: 'VCA Chain',
    category: 'compressor_limiter',
    rackUnits: 1,
    profile: 'analog',
    accent: '#393b47',
    description: 'Fast attack FET-style compressor.',
    ports: [
      port('input', 'INPUT', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
      port('output', 'OUTPUT', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu', channels: 'mono' }),
      port('link', 'STEREO LINK', 'jack_trs', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: modeled('1176-class FET compressor rear-panel layout.'),
  },
  {
    id: 'shadow-hills',
    name: 'Shadow Hills Mastering Comp',
    manufacturer: 'Shadow Hills',
    category: 'compressor_limiter',
    rackUnits: 2,
    profile: 'analog',
    accent: '#b39039',
    description: 'Dual-stage stereo mastering compressor.',
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('sc-l', 'SIDECHAIN L', 'xlr_analog', 'in', 'analog'),
      port('sc-r', 'SIDECHAIN R', 'xlr_analog', 'in', 'analog'),
      iecPower(),
    ],
    verification: documented('Shadow Hills Mastering Compressor rear panel.'),
  },
  {
    id: 'alan-smart-c2',
    name: 'Alan Smart C2+',
    manufacturer: 'Alan Smart',
    category: 'compressor_limiter',
    rackUnits: 2,
    profile: 'analog',
    accent: '#799e94',
    description: 'Stereo mix bus dynamics controller.',
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('key-in', 'EXT KEY IN', 'jack_trs', 'in', 'analog'),
      iecPower(),
    ],
    verification: modeled('Alan Smart Research C2-class stereo bus compressor.'),
  },
  {
    id: 'klempt-dyn3',
    name: 'Klempt Dyn3',
    manufacturer: 'Klempt',
    category: 'compressor_limiter',
    rackUnits: 2,
    profile: 'analog',
    accent: '#d4820a',
    description: 'Character dynamics and saturation unit.',
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('sc-send', 'SIDECHAIN SEND', 'jack_trs', 'send', 'analog'),
      port('sc-return', 'SIDECHAIN RETURN', 'jack_trs', 'return', 'analog'),
      port('link', 'STEREO LINK', 'jack_trs', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: modeled('Empirical Labs Distressor-class stereo dynamics processor.'),
  },
  {
    id: 'pultec-eqp',
    name: 'Pultec EQP-1A3',
    manufacturer: 'Pultec',
    category: 'equalizer_parametric',
    rackUnits: 2,
    profile: 'analog',
    accent: '#507ca0',
    description: 'Program equalizer with passive curves.',
    controls: [
      { id: 'low-boost', type: 'knob', label: 'LF BOOST' },
      { id: 'low-atten', type: 'knob', label: 'LF ATTEN' },
      { id: 'low-freq', type: 'knob', label: 'LF SEL', accent: true },
      { id: 'bandwidth', type: 'knob', label: 'BAND' },
      { id: 'high-boost', type: 'knob', label: 'HF BOOST' },
      { id: 'high-freq', type: 'knob', label: 'HF SEL', accent: true },
      { id: 'high-atten', type: 'knob', label: 'ATTEN SEL' },
    ],
    ports: [
      port('input', 'INPUT', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
      port('output', 'OUTPUT', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu', channels: 'mono' }),
      iecPower(),
    ],
    verification: documented('Pulse Techniques EQP-1A3 rear-panel specification.'),
  },
  {
    id: 'massive-passive',
    name: 'Manley Massive Passive',
    manufacturer: 'Manley',
    category: 'equalizer_parametric',
    rackUnits: 2,
    profile: 'analog',
    accent: '#9465ba',
    description: 'Stereo tube mastering equalizer.',
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      iecPower(),
    ],
    verification: documented('Manley Labs Massive Passive rear-panel diagram.'),
  },
  {
    id: 'wave-1084',
    name: 'Wave 1084-EQ',
    manufacturer: 'Wave Audio',
    category: 'equalizer_parametric',
    rackUnits: 1,
    profile: 'analog',
    accent: '#b95f25',
    description: 'Inductor-style channel equalizer.',
    ports: [
      port('mic-in', 'MIC IN', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('line-in', 'LINE IN', 'jack_trs', 'in', 'analog'),
      port('output', 'LINE OUT', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      iecPower(),
    ],
    verification: modeled('Neve 1084 channel-strip rear-panel layout.'),
  },
  {
    id: 'solid-4000e',
    name: 'Solid Link 4000E EQ',
    manufacturer: 'Solid Link',
    category: 'equalizer_parametric',
    rackUnits: 1,
    profile: 'analog',
    accent: '#3e8372',
    description: 'Four-band console-style equalizer.',
    ports: [
      port('input', 'INPUT', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
      port('output', 'OUTPUT', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu', channels: 'mono' }),
      port('insert-send', 'INSERT SEND', 'jack_trs', 'send', 'analog'),
      port('insert-return', 'INSERT RETURN', 'jack_trs', 'return', 'analog'),
      iecPower(),
    ],
    verification: modeled('SSL 4000E channel-EQ section rear panel.'),
  },
  {
    id: 'massenburg-mdw',
    name: 'Massenburg MDW EQ',
    manufacturer: 'Massenburg',
    category: 'equalizer_parametric',
    rackUnits: 1,
    profile: 'digital',
    accent: '#697786',
    description: 'Precision digital parametric EQ.',
    ports: [
      port('analog-in', 'ANALOG IN L/R', 'xlr_analog', 'in', 'analog', { channels: 'stereo' }),
      port('analog-out', 'ANALOG OUT L/R', 'xlr_analog', 'out', 'analog', { channels: 'stereo' }),
      port('aes-in', 'AES IN', 'xlr_digital_aes', 'in', 'aes_ebu'),
      port('aes-out', 'AES OUT', 'xlr_digital_aes', 'out', 'aes_ebu'),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      iecPower(),
    ],
    verification: documented('Massenburg DesignWorks MDW hardware processor.'),
  },
  {
    id: 'filterbank-p5',
    name: 'Filterbank P5',
    manufacturer: 'Filterbank',
    category: 'equalizer_parametric',
    rackUnits: 1,
    profile: 'analog',
    accent: '#e54f24',
    description: 'Five-band discrete equalizer.',
    ports: [
      port('input', 'INPUT', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
      port('output', 'OUTPUT', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu', channels: 'mono' }),
      iecPower(),
    ],
    verification: modeled('API 550-class discrete program EQ rear panel.'),
  },
  {
    id: 'gml-8200',
    name: 'GML 8200',
    manufacturer: 'GML',
    category: 'equalizer_parametric',
    rackUnits: 1,
    profile: 'analog',
    accent: '#4b806d',
    description: 'Stereo parametric reference equalizer.',
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      iecPower(),
    ],
    verification: documented('George Massenburg Labs 8200 rear-panel specification.'),
  },
  {
    id: 'dbx-2231',
    name: 'dbx DriveRack 2231',
    manufacturer: 'dbx',
    category: 'equalizer_graphic',
    rackUnits: 2,
    profile: 'analog',
    accent: '#4468d2',
    description: 'Dual 31-band graphic EQ.',
    ports: [
      port('in-a', 'INPUT A', 'xlr_combo', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-b', 'INPUT B', 'xlr_combo', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-a', 'OUTPUT A', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-b', 'OUTPUT B', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      iecPower(),
    ],
    verification: documented('dbx 2231 dual graphic EQ owner’s manual.'),
  },
  {
    id: 'dn360',
    name: 'Klark Teknik DN360',
    manufacturer: 'Klark Teknik',
    category: 'equalizer_graphic',
    rackUnits: 2,
    profile: 'analog',
    accent: '#bf7229',
    description: 'Dual-channel graphic equalizer.',
    ports: [
      port('in-a', 'INPUT A', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-b', 'INPUT B', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-a', 'OUTPUT A', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-b', 'OUTPUT B', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      iecPower(),
    ],
    verification: documented('Klark Teknik DN360 user manual.'),
  },
  {
    id: 'bss-fcs',
    name: 'BSS FCS-960',
    manufacturer: 'BSS',
    category: 'equalizer_graphic',
    rackUnits: 2,
    profile: 'analog',
    accent: '#528698',
    description: 'Professional constant-Q graphic EQ.',
    ports: [
      port('in-a', 'INPUT A', 'xlr_combo', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-b', 'INPUT B', 'xlr_combo', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-a', 'OUTPUT A', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-b', 'OUTPUT B', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      iecPower(),
    ],
    verification: documented('BSS FCS-960 user manual.'),
  },
  {
    id: 'prism-ada8',
    name: 'Prism Sound ADA-8XR',
    manufacturer: 'Prism Sound',
    category: 'ad_da_converter',
    rackUnits: 2,
    profile: 'digital',
    channels: 8,
    accent: '#506b8d',
    description: 'Modular reference AD/DA converter.',
    popularity: 89,
    ports: [
      port('analog-in', 'ANALOG IN 1-8', 'db25_dsub', 'in', 'analog', { count: 8 }),
      port('analog-out', 'ANALOG OUT 1-8', 'db25_dsub', 'out', 'analog', { count: 8 }),
      port('aes-in', 'AES IN 1-8', 'db25_dsub', 'in', 'aes_ebu', { count: 4 }),
      port('aes-out', 'AES OUT 1-8', 'db25_dsub', 'out', 'aes_ebu', { count: 4 }),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      port('firewire', 'FIREWIRE', 'usb_b', 'bidirectional', 'usb_audio'),
      iecPower(),
    ],
    verification: documented('Prism Sound ADA-8XR rear-panel specification.'),
  },
  {
    id: 'apogee-symphony',
    name: 'Apogee Symphony I/O Rack',
    manufacturer: 'Apogee',
    category: 'audio_interface',
    rackUnits: 2,
    profile: 'digital',
    channels: 16,
    accent: '#a2a8ad',
    description: 'High-channel-count studio interface.',
    ports: [
      port('analog-in', 'ANALOG IN 1-16', 'db25_dsub', 'in', 'analog', { count: 16 }),
      port('analog-out', 'ANALOG OUT 1-16', 'db25_dsub', 'out', 'analog', { count: 16 }),
      port('thunderbolt', 'THUNDERBOLT', 'thunderbolt', 'bidirectional', 'usb_audio'),
      port('digilink', 'PRO TOOLS HDX', 'digilink', 'bidirectional', 'pro_tools'),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      iecPower(),
    ],
    verification: documented('Apogee Symphony I/O Mk II rear-panel specification.'),
  },
  {
    id: 'lynx-aurora',
    name: 'Lynx Aurora(n) 16',
    manufacturer: 'Lynx',
    category: 'ad_da_converter',
    rackUnits: 1,
    profile: 'digital',
    channels: 16,
    accent: '#5576a4',
    description: 'Sixteen-channel converter interface.',
    ports: [
      port('analog-in', 'ANALOG IN 1-16', 'db25_dsub', 'in', 'analog', { count: 16 }),
      port('analog-out', 'ANALOG OUT 1-16', 'db25_dsub', 'out', 'analog', { count: 16 }),
      port('aes-in', 'AES IN 1-16', 'db25_dsub', 'in', 'aes_ebu', { count: 8 }),
      port('aes-out', 'AES OUT 1-16', 'db25_dsub', 'out', 'aes_ebu', { count: 8 }),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      port('lslot', 'LSLOT', 'remote_link', 'bidirectional', 'control'),
      port('usb', 'USB', 'usb_b', 'bidirectional', 'usb_audio'),
      iecPower(),
    ],
    verification: documented('Lynx Aurora (n) 16 rear-panel specification.'),
  },
  {
    id: 'rme-adi648',
    name: 'RME ADI-648 MADI',
    manufacturer: 'RME',
    category: 'madi_interface',
    rackUnits: 1,
    profile: 'madi',
    accent: '#5474ae',
    description: 'MADI and ADAT format converter.',
    ports: [
      port('adat-in', 'ADAT IN 1-8', 'opticalToslink', 'in', 'adat', { count: 8, individualSockets: true }),
      port('adat-out', 'ADAT OUT 1-8', 'opticalToslink', 'out', 'adat', { count: 8, individualSockets: true }),
      port('madi-opt-in', 'MADI OPT IN', 'optical_madi', 'in', 'madi'),
      port('madi-opt-out', 'MADI OPT OUT', 'optical_madi', 'out', 'madi'),
      port('madi-coax-in', 'MADI COAX IN', 'bnc_madi', 'in', 'madi'),
      port('madi-coax-out', 'MADI COAX OUT', 'bnc_madi', 'out', 'madi'),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      port('midi', 'MIDI I/O', 'midi_din', 'bidirectional', 'midi'),
      iecPower(),
    ],
    verification: documented('RME ADI-648 owner’s manual.'),
  },
  {
    id: 'rednet-a16r',
    name: 'Focusrite RedNet A16R',
    manufacturer: 'Focusrite',
    category: 'dante_interface',
    rackUnits: 1,
    profile: 'dante',
    channels: 16,
    accent: '#bb2931',
    description: 'Networked Dante analog interface.',
    ports: [
      port('analog-in', 'ANALOG IN 1-16', 'db25_dsub', 'in', 'analog', { count: 16 }),
      port('analog-out', 'ANALOG OUT 1-16', 'db25_dsub', 'out', 'analog', { count: 16 }),
      port('primary', 'DANTE PRIMARY', 'ethercon', 'bidirectional', 'dante'),
      port('secondary', 'DANTE SECONDARY', 'ethercon', 'bidirectional', 'dante'),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      port('power-a', 'AC POWER A', 'iec_c13', 'in', 'power'),
      port('power-b', 'AC POWER B', 'iec_c13', 'in', 'power'),
    ],
    verification: documented('Focusrite RedNet A16R rear-panel specification.'),
  },
  {
    id: 'avid-mtrx',
    name: 'Avid MTRX',
    manufacturer: 'Avid',
    category: 'audio_interface',
    rackUnits: 2,
    profile: 'dante',
    channels: 16,
    accent: '#614bb4',
    description: 'Studio routing and conversion interface.',
    popularity: 90,
    ports: [
      port('hdx-1', 'HDX 1 (DigiLink)', 'digilink', 'bidirectional', 'pro_tools'),
      port('hdx-2', 'HDX 2 (DigiLink)', 'digilink', 'bidirectional', 'pro_tools'),
      port('dante-1', 'DANTE PRIMARY', 'ethercon', 'bidirectional', 'dante'),
      port('dante-2', 'DANTE SECONDARY', 'ethercon', 'bidirectional', 'dante'),
      port('madi-in', 'MADI IN', 'optical_madi', 'in', 'madi'),
      port('madi-out', 'MADI OUT', 'optical_madi', 'out', 'madi'),
      port('analog-in', 'ANALOG IN 1-16', 'db25_dsub', 'in', 'analog', { count: 16 }),
      port('analog-out', 'ANALOG OUT 1-16', 'db25_dsub', 'out', 'analog', { count: 16 }),
      port('aes-in', 'AES IN', 'db25_dsub', 'in', 'aes_ebu', { count: 4 }),
      port('aes-out', 'AES OUT', 'db25_dsub', 'out', 'aes_ebu', { count: 4 }),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      port('eucon', 'EUCON / CONTROL', 'rj45_ethernet', 'bidirectional', 'ethernet'),
      port('power-a', 'AC POWER A', 'iec_c13', 'in', 'power'),
      port('power-b', 'AC POWER B', 'iec_c13', 'in', 'power'),
    ],
    verification: documented('Avid MTRX rear-panel specification (modular configuration).'),
  },
  {
    id: 'neutrik-patch',
    name: 'Neutrik NYS-SPP-L',
    manufacturer: 'Neutrik',
    category: 'patch_bay',
    rackUnits: 1,
    profile: 'patch-trs',
    accent: '#3b424a',
    description: '48-point TRS patch panel.',
  },
  {
    id: 'samson-patch',
    name: 'Samson S-patch Plus',
    manufacturer: 'Samson',
    category: 'patch_bay',
    rackUnits: 1,
    profile: 'patch-trs',
    accent: '#404853',
    description: 'Switchable-normalled TRS patch panel.',
  },
  {
    id: 'custom-xlr',
    name: 'Custom XLR Bay 24x24',
    manufacturer: 'RackWorks',
    category: 'patch_bay',
    rackUnits: 1,
    profile: 'patch-xlr',
    accent: '#373940',
    description: 'Balanced XLR studio tie-line panel.',
  },
  {
    id: 'db25-bay',
    name: 'DB25 Patchbay 2x48',
    manufacturer: 'RackWorks',
    category: 'patch_bay',
    rackUnits: 1,
    profile: 'patch-db25',
    accent: '#373940',
    description: 'High-density DB25 analog patch panel.',
  },
  {
    id: 'studio-fanout',
    name: 'Studio Fanout 8×XLR ↔ DB25',
    manufacturer: 'RackWorks',
    category: 'patch_bay',
    rackUnits: 1,
    profile: 'patch-xlr',
    accent: '#373940',
    description:
      'Passive breakout: 8× XLR sockets bridge an outboard chain to the DB25 snake that feeds a multi-channel interface.',
    popularity: 70,
    controls: [{ id: 'face', type: 'sockets', label: 'XLR I/O', count: 8 }],
    ports: [
      port('xlr-in', 'XLR IN 1-8', 'xlr_analog', 'in', 'analog', {
        count: 8,
        impedance: 'Lo-Z',
        individualSockets: true,
      }),
      port('xlr-out', 'XLR OUT 1-8', 'xlr_analog', 'out', 'analog', {
        count: 8,
        maxLevel: '+4dBu',
        individualSockets: true,
      }),
      port('db25-snd', 'DB25 SEND (to interface IN)', 'db25_dsub', 'out', 'analog', { count: 8 }),
      port('db25-rcv', 'DB25 RETURN (from interface OUT)', 'db25_dsub', 'in', 'analog', { count: 8 }),
    ],
    verification: documented('Mogami / Pro Co class passive XLR↔DB25 breakout panel.'),
  },
  {
    id: 'lexicon-480',
    name: 'Lexicon 480L Reissue',
    manufacturer: 'Lexicon',
    category: 'reverb_effects',
    rackUnits: 2,
    profile: 'effects',
    accent: '#3a75a5',
    description: 'Algorithmic studio reverb processor.',
    ports: [
      port('analog-in', 'ANALOG IN 1-4', 'xlr_analog', 'in', 'analog', { count: 4 }),
      port('analog-out', 'ANALOG OUT 1-4', 'xlr_analog', 'out', 'analog', { count: 4 }),
      port('aes-in', 'AES IN', 'xlr_digital_aes', 'in', 'aes_ebu'),
      port('aes-out', 'AES OUT', 'xlr_digital_aes', 'out', 'aes_ebu'),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('larc', 'LARC REMOTE', 'remote_link', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: documented('Lexicon 480L mainframe rear-panel specification.'),
  },
  {
    id: 'tc-m6000',
    name: 'TC Electronic M6000',
    manufacturer: 'TC Electronic',
    category: 'reverb_effects',
    rackUnits: 2,
    profile: 'effects',
    accent: '#325d88',
    description: 'Multichannel effects engine.',
    ports: [
      port('analog-in', 'ANALOG IN 1-8', 'db25_dsub', 'in', 'analog', { count: 8 }),
      port('analog-out', 'ANALOG OUT 1-8', 'db25_dsub', 'out', 'analog', { count: 8 }),
      port('aes-in', 'AES IN 1-8', 'db25_dsub', 'in', 'aes_ebu', { count: 4 }),
      port('aes-out', 'AES OUT 1-8', 'db25_dsub', 'out', 'aes_ebu', { count: 4 }),
      port('adat-in', 'ADAT IN', 'opticalToslink', 'in', 'adat', { count: 8 }),
      port('adat-out', 'ADAT OUT', 'opticalToslink', 'out', 'adat', { count: 8 }),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      port('icon', 'ICON CONTROL', 'rj45_ethernet', 'bidirectional', 'ethernet'),
      iecPower(),
    ],
    verification: documented('TC Electronic System 6000 Mk II rear-panel specification.'),
  },
  {
    id: 'eventide-h9000',
    name: 'Eventide H9000R',
    manufacturer: 'Eventide',
    category: 'reverb_effects',
    rackUnits: 2,
    profile: 'effects',
    accent: '#764cb6',
    description: 'Network-ready multi-effects processor.',
    ports: [
      port('analog-in', 'ANALOG IN 1-8', 'db25_dsub', 'in', 'analog', { count: 8 }),
      port('analog-out', 'ANALOG OUT 1-8', 'db25_dsub', 'out', 'analog', { count: 8 }),
      port('aes-in', 'AES IN 1-8', 'db25_dsub', 'in', 'aes_ebu', { count: 4 }),
      port('aes-out', 'AES OUT 1-8', 'db25_dsub', 'out', 'aes_ebu', { count: 4 }),
      port('madi-in', 'MADI OPT IN', 'optical_madi', 'in', 'madi'),
      port('madi-out', 'MADI OPT OUT', 'optical_madi', 'out', 'madi'),
      port('madi-coax-in', 'MADI BNC IN', 'bnc_madi', 'in', 'madi'),
      port('madi-coax-out', 'MADI BNC OUT', 'bnc_madi', 'out', 'madi'),
      port('dante-1', 'DANTE PRIMARY', 'rj45_dante', 'bidirectional', 'dante'),
      port('dante-2', 'DANTE SECONDARY', 'rj45_dante', 'bidirectional', 'dante'),
      port('ethernet', 'CONTROL ETH', 'rj45_ethernet', 'bidirectional', 'ethernet'),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT', 'bnc_wordclock', 'out', 'wordclock'),
      port('midi-in', 'MIDI IN', 'midi_din', 'in', 'midi'),
      port('midi-out', 'MIDI OUT', 'midi_din', 'out', 'midi'),
      port('usb', 'USB', 'usb_b', 'bidirectional', 'usb_audio'),
      iecPower(),
    ],
    verification: documented('Eventide H9000R rear-panel specification.'),
  },
  {
    id: 'bricasti-m7',
    name: 'Bricasti M7',
    manufacturer: 'Bricasti',
    category: 'reverb_effects',
    rackUnits: 2,
    profile: 'effects',
    accent: '#9ba0aa',
    description: 'Stereo reverb processor.',
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog'),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog'),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('aes-in', 'AES IN', 'xlr_digital_aes', 'in', 'aes_ebu'),
      port('aes-out', 'AES OUT', 'xlr_digital_aes', 'out', 'aes_ebu'),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('remote', 'REMOTE', 'remote_link', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: documented('Bricasti Design M7 rear-panel specification.'),
  },
  {
    id: 'fatso-jr',
    name: 'Klempt Fatso Jr',
    manufacturer: 'Klempt',
    category: 'compressor_limiter',
    rackUnits: 1,
    profile: 'analog',
    accent: '#d4820a',
    description: 'Tape-color dynamics processor.',
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('sc-in', 'SIDECHAIN IN', 'jack_trs', 'in', 'analog'),
      iecPower(),
    ],
    verification: modeled('Empirical Labs Fatso Jr rear-panel layout.'),
  },
  {
    id: 'trakker',
    name: 'Crane Song Trakker',
    manufacturer: 'Crane Song',
    category: 'compressor_limiter',
    rackUnits: 1,
    profile: 'analog',
    accent: '#689aaf',
    description: 'Flexible mono compressor.',
    ports: [
      port('input', 'INPUT', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
      port('output', 'OUTPUT', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu', channels: 'mono' }),
      port('sc-in', 'SIDECHAIN IN', 'jack_trs', 'in', 'analog'),
      port('link', 'STEREO LINK', 'jack_trs', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: documented('Crane Song Trakker rear-panel specification.'),
  },
  {
    id: 'dyn5',
    name: 'Multiband Dyn5',
    manufacturer: 'Signal Forge',
    category: 'dynamics_multiband',
    rackUnits: 1,
    profile: 'digital',
    accent: '#5a63d7',
    description: 'Five-band digital dynamics controller.',
    ports: [
      port('in-l', 'INPUT L', 'xlr_analog', 'in', 'analog'),
      port('in-r', 'INPUT R', 'xlr_analog', 'in', 'analog'),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '+4dBu' }),
      port('aes-in', 'AES IN', 'xlr_digital_aes', 'in', 'aes_ebu'),
      port('aes-out', 'AES OUT', 'xlr_digital_aes', 'out', 'aes_ebu'),
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      iecPower(),
    ],
    verification: modeled('Waves C6-class digital multiband dynamics processor.'),
  },
  {
    id: 'dangerous-monitor',
    name: 'Dangerous Monitor ST',
    manufacturer: 'Dangerous Music',
    category: 'monitor_controller',
    rackUnits: 1,
    profile: 'monitor',
    accent: '#c54435',
    description: 'Studio monitor routing controller.',
    ports: [
      port('source', 'SOURCE IN 1-3', 'db25_dsub', 'in', 'analog', { count: 6 }),
      port('speaker', 'SPEAKER OUT A/B', 'db25_dsub', 'out', 'analog', { count: 4 }),
      port('talkback', 'TALKBACK IN', 'xlr_analog', 'in', 'analog'),
      port('remote', 'REMOTE', 'remote_link', 'bidirectional', 'control'),
      iecPower(),
    ],
    verification: documented('Dangerous Music Monitor ST rear-panel specification.'),
  },
  {
    id: 'spl-mtc',
    name: 'SPL MTC',
    manufacturer: 'SPL',
    category: 'monitor_controller',
    rackUnits: 1,
    profile: 'monitor',
    accent: '#de3633',
    description: 'Monitoring and talkback controller.',
    ports: [
      port('source-1', 'SOURCE 1 L/R', 'xlr_analog', 'in', 'analog', { channels: 'stereo' }),
      port('source-2', 'SOURCE 2 L/R', 'xlr_analog', 'in', 'analog', { channels: 'stereo' }),
      port('source-3', 'SOURCE 3 L/R', 'xlr_analog', 'in', 'analog', { channels: 'stereo' }),
      port('source-4', 'SOURCE 4 L/R', 'xlr_analog', 'in', 'analog', { channels: 'stereo' }),
      port('speaker-a', 'SPEAKER A L/R', 'xlr_analog', 'out', 'analog', { channels: 'stereo' }),
      port('speaker-b', 'SPEAKER B L/R', 'xlr_analog', 'out', 'analog', { channels: 'stereo' }),
      port('headphone', 'HEADPHONE OUT', 'jack_trs', 'out', 'analog'),
      port('talkback', 'TALKBACK IN', 'xlr_analog', 'in', 'analog'),
      iecPower(),
    ],
    verification: documented('SPL Model 2381 MTC rear-panel specification.'),
  },
  {
    id: 'folcrom',
    name: 'Folcrom Summing',
    manufacturer: 'Roll Music',
    category: 'analog_summing',
    rackUnits: 1,
    profile: 'analog',
    accent: '#374856',
    description: 'Passive stereo summing mixer.',
    ports: [
      port('in-1-8', 'INPUT 1-8', 'db25_dsub', 'in', 'analog', { count: 8 }),
      port('in-9-16', 'INPUT 9-16', 'db25_dsub', 'in', 'analog', { count: 8 }),
      port('out-l', 'OUTPUT L', 'xlr_analog', 'out', 'analog', { maxLevel: '-10dBV' }),
      port('out-r', 'OUTPUT R', 'xlr_analog', 'out', 'analog', { maxLevel: '-10dBV' }),
    ],
    verification: documented('Roll Music Folcrom RMS216 passive summing rack.'),
  },
  {
    id: 'crown-dci',
    name: 'Crown DCi 4x300N',
    manufacturer: 'Crown',
    category: 'power_amplifier',
    rackUnits: 2,
    profile: 'amplifier',
    channels: 4,
    accent: '#35698b',
    description: 'Networked four-channel power amplifier.',
    ports: [
      port('input', 'INPUT 1-4', 'terminal_block', 'in', 'analog', { count: 4 }),
      port('aes-in', 'AES IN 1-2', 'xlr_digital_aes', 'in', 'aes_ebu', { count: 2 }),
      port('blu-link', 'BLU LINK', 'rj45_ethernet', 'bidirectional', 'blu_link'),
      port('control', 'NETWORK', 'rj45_ethernet', 'bidirectional', 'ethernet'),
      port('speaker', 'SPEAKER OUT 1-4', 'speakon', 'out', 'analog', { count: 2, individualSockets: true }),
      port('usb', 'USB CONFIG', 'usb_b', 'bidirectional', 'control'),
      port('mains', 'AC MAINS', 'powercon', 'in', 'power'),
    ],
    verification: documented('Crown DCi 4|300N rear-panel specification.'),
  },
  {
    id: 'lab-fp6400',
    name: 'Lab.Gruppen FP 6400',
    manufacturer: 'Lab.Gruppen',
    category: 'power_amplifier',
    rackUnits: 2,
    profile: 'amplifier',
    accent: '#49626d',
    description: 'High-output touring amplifier.',
    ports: [
      port('input-a', 'INPUT A', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('input-b', 'INPUT B', 'xlr_analog', 'in', 'analog', { impedance: 'Lo-Z' }),
      port('link-a', 'LINK OUT A', 'xlr_analog', 'thru', 'analog'),
      port('link-b', 'LINK OUT B', 'xlr_analog', 'thru', 'analog'),
      port('speaker', 'SPEAKER OUT A/B', 'speakon', 'out', 'analog', { count: 2, individualSockets: true }),
      port('mains', 'AC MAINS', 'powercon', 'in', 'power'),
    ],
    verification: documented('Lab.Gruppen FP 6400 rear-panel specification.'),
  },
  {
    id: 'qsc-plx',
    name: 'QSC PLX3602',
    manufacturer: 'QSC',
    category: 'power_amplifier',
    rackUnits: 2,
    profile: 'amplifier',
    accent: '#526d9a',
    description: 'Two-channel power amplifier.',
    ports: [
      port('input', 'INPUT A/B', 'xlr_combo', 'in', 'analog', { count: 2 }),
      port('speaker', 'SPEAKER OUT A/B', 'speakon', 'out', 'analog', { count: 2, individualSockets: true }),
      port('binding', 'BINDING POSTS', 'terminal_block', 'out', 'analog', { count: 2 }),
      port('mains', 'AC MAINS', 'iec_c13', 'in', 'power'),
    ],
    verification: documented('QSC PLX3602 rear-panel specification.'),
  },
  {
    id: 'antelope-ocx',
    name: 'Antelope Isochrone OCX',
    manufacturer: 'Antelope',
    category: 'clock_wordclock',
    rackUnits: 1,
    profile: 'clock',
    accent: '#c9a646',
    description: 'Word clock distribution generator.',
    ports: [
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT 1-8', 'bnc_wordclock', 'out', 'wordclock', { count: 8, individualSockets: true }),
      port('aes-out', 'AES SYNC OUT', 'xlr_digital_aes', 'out', 'aes_ebu', { count: 2, individualSockets: true }),
      port('spdif-out', 'S/PDIF OUT', 'coaxial_spdif', 'out', 'spdif'),
      iecPower(),
    ],
    verification: documented('Antelope Audio Isochrone OCX HD rear-panel specification.'),
  },
  {
    id: 'big-ben',
    name: 'Big Ben Master Clock',
    manufacturer: 'Signal Forge',
    category: 'clock_wordclock',
    rackUnits: 1,
    profile: 'clock',
    accent: '#526da5',
    description: 'Studio master clock and sync distributor.',
    ports: [
      port('wc-in', 'WC IN', 'bnc_wordclock', 'in', 'wordclock'),
      port('wc-out', 'WC OUT 1-6', 'bnc_wordclock', 'out', 'wordclock', { count: 6, individualSockets: true }),
      port('aes-out', 'AES SYNC OUT', 'xlr_digital_aes', 'out', 'aes_ebu', { count: 2, individualSockets: true }),
      iecPower(),
    ],
    verification: modeled('Apogee Big Ben-class studio master clock layout.'),
  },
  {
    id: 'furman-m8',
    name: 'Furman M-8Dx',
    manufacturer: 'Furman',
    category: 'power_conditioner',
    rackUnits: 1,
    profile: 'power',
    accent: '#c8ff00',
    description: 'Rack power conditioner with voltage display.',
    ports: [
      port('mains', 'AC INPUT', 'iec_c13', 'in', 'power'),
      port('outlet', 'IEC OUTPUT 1-8', 'iec_c13', 'out', 'power', { count: 8, individualSockets: true }),
    ],
    verification: documented('Furman M-8Dx rear-panel specification (lamp BNC omitted: not a routable signal).'),
  },
  {
    id: 'powerline',
    name: 'Powerline PL-PLUS C',
    manufacturer: 'Powerline',
    category: 'power_conditioner',
    rackUnits: 1,
    profile: 'power',
    accent: '#d4820a',
    description: 'Filtered power distribution unit.',
    ports: [
      port('mains', 'AC INPUT', 'iec_c13', 'in', 'power'),
      port('outlet', 'IEC OUTPUT 1-8', 'iec_c13', 'out', 'power', { count: 8, individualSockets: true }),
    ],
    verification: modeled('SurgeX-class rack power conditioner layout.'),
  },
  {
    id: 'dbx-904',
    name: 'dbx 904',
    manufacturer: 'dbx',
    category: 'noise_gate',
    rackUnits: 1,
    profile: 'analog',
    accent: '#4468d2',
    description: 'Quad noise gate processor.',
    ports: [
      port('input', 'INPUT 1-4', 'xlr_analog', 'in', 'analog', { count: 4, individualSockets: true }),
      port('output', 'OUTPUT 1-4', 'xlr_analog', 'out', 'analog', { count: 4, individualSockets: true, maxLevel: '+4dBu' }),
      port('key', 'KEY IN 1-4', 'jack_trs', 'in', 'analog', { count: 4, individualSockets: true }),
      iecPower(),
    ],
    verification: modeled('dbx 900-series gate hosted in 4-channel frame.'),
  },
  {
    id: 'bss-dpr',
    name: 'BSS DPR-504',
    manufacturer: 'BSS',
    category: 'noise_gate',
    rackUnits: 1,
    profile: 'analog',
    accent: '#528698',
    description: 'Four-channel dynamics gate.',
    ports: [
      port('input', 'INPUT 1-4', 'xlr_analog', 'in', 'analog', { count: 4, individualSockets: true }),
      port('output', 'OUTPUT 1-4', 'xlr_analog', 'out', 'analog', { count: 4, individualSockets: true, maxLevel: '+4dBu' }),
      port('key', 'KEY IN 1-4', 'jack_trs', 'in', 'analog', { count: 4, individualSockets: true }),
      port('link', 'LINK 1-4', 'jack_trs', 'bidirectional', 'control', { count: 4, individualSockets: true }),
      iecPower(),
    ],
    verification: documented('BSS Audio DPR-504 rear-panel specification.'),
  },
  {
    id: 'radial-prormp',
    name: 'Radial ProRMP',
    manufacturer: 'Radial',
    category: 'di_box',
    rackUnits: 1,
    profile: 'di',
    accent: '#efb122',
    description: 'Passive studio reamplifier.',
    ports: [
      port('input', 'BALANCED IN', 'xlr_analog', 'in', 'analog'),
      port('output', 'AMP OUT', 'jack_ts', 'out', 'analog', { impedance: 'Hi-Z', channels: 'mono' }),
    ],
    verification: documented('Radial ProRMP passive reamp box specification.'),
  },
  {
    id: 'radial-j48',
    name: 'Radial J48 Stereo DI',
    manufacturer: 'Radial',
    category: 'di_box',
    rackUnits: 1,
    profile: 'di',
    accent: '#edb328',
    description: 'Active stereo direct interface.',
    ports: [
      port('inst-l', 'INSTRUMENT L', 'jack_ts', 'in', 'analog', { impedance: 'Hi-Z' }),
      port('inst-r', 'INSTRUMENT R', 'jack_ts', 'in', 'analog', { impedance: 'Hi-Z' }),
      port('thru-l', 'THRU L', 'jack_ts', 'thru', 'analog'),
      port('thru-r', 'THRU R', 'jack_ts', 'thru', 'analog'),
      port('out-l', 'DI OUT L', 'xlr_analog', 'out', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
      port('out-r', 'DI OUT R', 'xlr_analog', 'out', 'analog', { impedance: 'Lo-Z', channels: 'mono' }),
    ],
    verification: documented('Radial J48 stereo active DI specification (P48 phantom-powered).'),
  },
  {
    id: 'spl-vitalizer',
    name: 'SPL Stereo Vitalizer Rack',
    manufacturer: 'SPL',
    category: 'equalizer_parametric',
    rackUnits: 1,
    profile: 'analog',
    accent: '#e03432',
    description: 'Stereo psychoacoustic enhancement processor.',
    ports: [
      port('in-xlr', 'INPUT L/R XLR', 'xlr_analog', 'in', 'analog', { channels: 'stereo' }),
      port('in-trs', 'INPUT L/R 1/4"', 'jack_trs', 'in', 'analog', { channels: 'stereo' }),
      port('out-xlr', 'OUTPUT L/R XLR', 'xlr_analog', 'out', 'analog', { channels: 'stereo', maxLevel: '+4dBu' }),
      port('out-trs', 'OUTPUT L/R 1/4"', 'jack_trs', 'out', 'analog', { channels: 'stereo' }),
      iecPower(),
    ],
    verification: documented('SPL Vitalizer Mk2-T rear-panel specification.'),
  },
];

export const devices: Device[] = catalog.map(buildDevice);
