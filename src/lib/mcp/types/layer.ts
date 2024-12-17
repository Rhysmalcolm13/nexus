import type { Tool, Resource, Prompt } from '@modelcontextprotocol/sdk/types.js';
import type { MCPClient } from '../client';

// Runtime Types
export type LayerRuntimeType = 'node' | 'docker' | 'edge';
export type LayerRuntimeStatus = 'pending' | 'active' | 'error' | 'stopped';

// Core Layer Types
export interface LayerParameters {
  [key: string]: unknown;
}

export interface Layer {
  id: string;
  name: string;
  metadata: LayerMetadata;
  config: LayerConfig;
  runtime: LayerRuntime;
  tools: Tool[];
  resources: Resource[];
  prompts: Prompt[];
  state?: Record<string, unknown>;
  code: string;
  parameters: LayerParameters;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayerMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author: string;
  price?: LayerPrice;
  category: LayerCategory;
  tags: string[];
  tools: string[];
  rating?: number;
  dependencies: string[];
}

// Shared Types
export interface LayerMetrics {
  requests: number;
  errors: number;
  latency: number;
}

export interface LayerResources {
  cpu: number;
  memory: number;
}

export interface LayerPrice {
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  interval?: 'monthly' | 'yearly' | 'one-time';
}

export type LayerCategory = 
  | 'ai'
  | 'database'
  | 'development'
  | 'productivity'
  | 'security'
  | 'communication'
  | 'analytics'
  | 'integration';

export interface LayerConfig {
  enabled: boolean;
  settings: Record<string, unknown>;
  credentials?: Record<string, string>;
}

// Process Types
export interface LayerProcess {
  client: MCPClient;
  runtime: {
    type: LayerRuntimeType;
    status: LayerRuntimeStatus;
  };
  status: LayerRuntimeStatus;
  error?: Error;
  metrics: {
    requests: number;
    errors: number;
    latency: number;
  };
  resources: {
    cpu: number;
    memory: number;
  };
}

// Collaboration Types
export interface LayerCollaborator {
  id: string;
  layerId: string;
  userId: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

// Deployment Types
export interface LayerDeployment {
  id: string;
  layerId: string;
  environment: string;
  version: string;
  status: string;
  config: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  logs?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Types
export interface LayerAuditLog {
  id: string;
  layerId: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

export interface LayerRuntime {
  type: LayerRuntimeType;
  status: LayerRuntimeStatus;
  metrics?: {
    requests: number;
    errors: number;
    latency: number;
  };
  resources?: {
    cpu: number;
    memory: number;
  };
}