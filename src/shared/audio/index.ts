export { Cable, type CablePoint, type CableState } from './Cable';
export {
  connectorForType,
  resolveConnector,
  type ConnectorKind,
} from './connectors';
export { PortGlyph, type PortGlyphState } from './PortGlyph';
export { ProtocolDot } from './ProtocolDot';
export {
  AUDIO_PROTOCOL_TO_KEY,
  arePortsProtocolCompatible,
  dashArray,
  isInverseDirection,
  PROTOCOLS,
  protocolMeta,
  resolveProtocolKey,
  type DashStyle,
  type ProtocolKey,
  type ProtocolMeta,
} from './protocols';
