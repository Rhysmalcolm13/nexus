import { z } from 'zod';
import { LayerError, LayerErrorCode } from '../errors';

/**
 * Schema for layer configuration
 */
export const LayerConfigSchema = z.object({
  // Basic settings
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().optional(),
  
  // Runtime settings
  maxConcurrency: z.number().min(1).max(100).default(10),
  timeout: z.number().min(1000).max(300000).default(30000),
  retryAttempts: z.number().min(0).max(5).default(3),
  
  // Resource limits
  resources: z.object({
    maxMemoryMB: z.number().min(128).max(4096).default(512),
    maxCpuPercent: z.number().min(10).max(100).default(50),
    maxDiskGB: z.number().min(1).max(100).default(10)
  }),
  
  // Security settings
  security: z.object({
    enableSandbox: z.boolean().default(true),
    allowedDomains: z.array(z.string()).default([]),
    secretsAccess: z.boolean().default(false)
  })
});

/**
 * Validates layer configuration
 * @throws {LayerError} if validation fails
 */
export function validateLayerConfig(config: unknown): void {
  try {
    LayerConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Invalid layer configuration',
        error,
        { issues: error.issues }
      );
    }
    throw error;
  }
} 