import { z } from 'zod';
import { LayerMetadata, LayerRuntime } from '../types';

export const LayerConfigSchema = z.object({
  runtime: z.enum(['edge', 'docker', 'node']),
  entry: z.string().url(),
  dependencies: z.array(z.string()),
  environment: z.record(z.string()).optional(),
  resources: z.object({
    memory: z.string().optional(),
    cpu: z.string().optional(),
    timeout: z.number().optional()
  }).optional(),
  inputs: z.record(z.object({
    type: z.string(),
    description: z.string().optional(),
    required: z.boolean().optional(),
    default: z.unknown().optional()
  })),
  outputs: z.record(z.object({
    type: z.string(),
    description: z.string().optional()
  }))
});

export interface LayerConfiguration {
  enabled: boolean;
  runtime: LayerRuntime;
  settings: Record<string, unknown>;
  environment?: Record<string, string>;
  resources?: {
    memory?: string;
    cpu?: string;
    timeout?: number;
  };
} 