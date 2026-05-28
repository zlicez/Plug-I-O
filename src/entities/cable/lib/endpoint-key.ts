import type { CableEndpoint } from '../model/types';

export function endpointKey(endpoint: CableEndpoint): string {
  return `${endpoint.instanceId}:${endpoint.portId}`;
}
