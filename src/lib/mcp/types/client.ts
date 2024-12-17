import type { MCPClient } from '../client';
import type { ServerCapability } from './server';

export interface MCPClientExtended extends MCPClient {
  getCapabilities(): Promise<ServerCapability>;
  registerTool(tool: ToolRegistration): Promise<void>;
  getState(): Promise<Record<string, unknown>>;
  setState(state: Record<string, unknown>): Promise<void>;
}

export interface ToolRegistration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
} 