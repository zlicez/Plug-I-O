export type PortType =
  | 'xlr_analog'
  | 'xlr_digital_aes'
  | 'jack_trs'
  | 'jack_ts'
  | 'rca'
  | 'rj45_dante'
  | 'rj45_avb'
  | 'bnc_wordclock'
  | 'midi_din'
  | 'usb_a'
  | 'usb_b'
  | 'usb_c'
  | 'db25_dsub'
  | 'opticalToslink'
  | 'coaxial_spdif'
  | 'ethercon'
  | 'rj45_ethernet'
  | 'bnc_madi'
  | 'optical_madi'
  | 'speakon'
  | 'powercon'
  | 'iec_c13'
  | 'nema_5_15'
  | 'terminal_block'
  | 'thunderbolt'
  | 'digilink'
  | 'remote_link'
  | 'xlr_combo';

export type PortDirection = 'in' | 'out' | 'thru' | 'send' | 'return' | 'bidirectional';

export type AudioProtocol =
  | 'analog'
  | 'aes_ebu'
  | 'spdif'
  | 'adat'
  | 'dante'
  | 'madi'
  | 'milan_avb'
  | 'usb_audio'
  | 'midi'
  | 'wordclock'
  | 'ethernet'
  | 'blu_link'
  | 'pro_tools'
  | 'control'
  | 'power';

export interface Port {
  id: string;
  label: string;
  type: PortType;
  direction: PortDirection;
  protocol?: AudioProtocol;
  impedance?: string;
  maxLevel?: string;
  sampleRates?: number[];
  count?: number;
  channels?: 'mono' | 'stereo' | 'multichannel';
  individualSockets?: boolean;
}

export type DeviceCategory =
  | 'microphone_preamp'
  | 'compressor_limiter'
  | 'equalizer_parametric'
  | 'equalizer_graphic'
  | 'audio_interface'
  | 'ad_da_converter'
  | 'digital_mixer'
  | 'analog_summing'
  | 'patch_bay'
  | 'power_conditioner'
  | 'power_amplifier'
  | 'headphone_amp'
  | 'di_box'
  | 'dynamics_multiband'
  | 'reverb_effects'
  | 'delay_effects'
  | 'noise_gate'
  | 'expander'
  | 'crossover'
  | 'monitor_controller'
  | 'clock_wordclock'
  | 'format_converter'
  | 'distribution_amp'
  | 'dante_interface'
  | 'madi_interface'
  | 'adat_interface'
  | 'spectrum_analyzer'
  | 'test_measurement';

export type FrontControlType = 'knob' | 'fader' | 'button' | 'display' | 'meter' | 'sockets';

export interface FrontControl {
  id: string;
  type: FrontControlType;
  label: string;
  /** Highlights the control with the device accent colour (e.g. armed switches, VU meters). */
  accent?: boolean;
  /** Socket / band count for `sockets` and `fader` rows. */
  count?: number;
}

export interface Device {
  id: string;
  name: string;
  manufacturer: string;
  category: DeviceCategory;
  rackUnits: 1 | 2 | 3 | 4;
  description: string;
  popularity: number;
  frontPanel: {
    controls: FrontControl[];
    colorAccent: string;
    meterType?: 'vu' | 'ppm' | 'led_bargraph' | 'none';
  };
  backPanel: {
    ports: Port[];
    verification: {
      basis: 'documented' | 'configured' | 'modeled';
      reference: string;
      note?: string;
    };
  };
  specs: {
    frequencyResponse?: string;
    dynamicRange?: string;
    thd?: string;
    inputGain?: string;
    powerConsumption?: string;
  };
  tags: string[];
}

export type RackSize = 4 | 8 | 12 | 16 | 20 | 24;

export interface InstalledDevice {
  instanceId: string;
  deviceId: string;
  slot: number;
}
