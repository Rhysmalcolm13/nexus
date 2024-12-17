import { Tool, Resource, Prompt } from '@modelcontextprotocol/sdk/types.js';

export interface LayerMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  price?: {
    amount: number;
    currency: string;
    interval?: 'monthly' | 'yearly' | 'one-time';
  };
  category: string;
  tags: string[];
  dependencies?: string[];
  repository?: string;
}

export interface LayerConfig {
  enabled: boolean;
  settings: Record<string, unknown>;
  credentials?: Record<string, string>;
}

export interface LayerRuntime {
  status: 'active' | 'inactive' | 'error' | 'starting' | 'stopping';
  lastError?: string;
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

export interface LayerCapabilities {
  tools: boolean;
  resources: boolean;
  prompts: boolean;
  subscriptions: boolean;
}

export interface LayerMetrics {
  requests: number;
  errors: number;
  latency: number;
}

export interface Layer {
  metadata: LayerMetadata;
  config: LayerConfig;
  runtime?: LayerRuntime;
  tools: Tool[];
  resources: Resource[];
  prompts: Prompt[];
} 