export type ValidationLevel = 'error' | 'warning' | 'info';

export interface CableEndpoint {
  instanceId: string;
  portId: string;
}

export interface Cable {
  id: string;
  from: CableEndpoint;
  to: CableEndpoint;
  color: string;
  notices: CableNotice[];
}

export interface CableNotice {
  level: ValidationLevel;
  message: string;
}

export interface CableValidation {
  allowed: boolean;
  notices: CableNotice[];
}
