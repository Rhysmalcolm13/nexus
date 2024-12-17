export interface UniversalMCPConfig {
  layers: {
    [key: string]: {
      enabled: boolean;
      autoStart: boolean;
      config: Record<string, unknown>;
    };
  };
  routing: {
    rules: Array<{
      pattern: string;
      targetLayer: string;
    }>;
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    metrics: string[];
  };
} 