import type { Layer, LayerParameters } from './layer';

export interface ServerCapability {
  name: string;
  version: string;
  features: string[];
  limits?: Record<string, number>;
}

export interface ServerHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  latency: number;
  errors?: string[];
}

export interface ServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  category: string;
  capabilities?: ServerCapability[];
  initOptions?: ServerInitOptions;
  healthCheck?: ServerHealthCheck;
}

export interface ServerInitOptions {
  retryAttempts?: number;
  timeout?: number;
  healthCheckInterval?: number;
  autoReconnect?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface ServerHealthCheck {
  endpoint?: string;
  interval?: number;
  timeout?: number;
  autoReconnect?: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: LayerParameters;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface MCPServer {
  registerWithMCP(mcpClient: MCPClient): Promise<void>;
}

export interface MCPClient {
  registerTool(tool: MCPTool): Promise<void>;
} 