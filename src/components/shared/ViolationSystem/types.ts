export interface Violation {
  id: string;
  icon: string;
  message: string;
  severity: ViolationSeverity;
  color: string;
  timestamp: number;
}

export type ViolationSeverity = 'error' | 'warning' | 'info' | 'success';
