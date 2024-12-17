import { z } from 'zod';
import type { LayerCategory } from './layer';

export const validationSchemas = {
  tool: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    inputSchema: z.object({
      type: z.literal('object'),
      properties: z.record(z.unknown()).optional()
    }),
    parameters: z.record(z.unknown()).default({})
  }),

  resource: z.object({
    name: z.string().min(1),
    uri: z.string(),
    type: z.string(),
    description: z.string().optional(),
    mimeType: z.string().optional(),
    data: z.record(z.unknown()).optional()
  }),

  prompt: z.object({
    name: z.string().min(1),
    template: z.string(),
    description: z.string().optional(),
    variables: z.record(z.unknown()).optional(),
    arguments: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      required: z.boolean().optional()
    })).optional()
  }),

  layerMetadata: z.object({
    id: z.string(),
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    description: z.string().optional(),
    author: z.string(),
    price: z.object({
      amount: z.number().min(0),
      currency: z.enum(['USD', 'EUR', 'GBP']),
      interval: z.enum(['monthly', 'yearly', 'one-time']).optional()
    }).optional(),
    category: z.enum([
      'ai', 'database', 'development', 'productivity',
      'security', 'communication', 'analytics', 'integration'
    ]),
    tags: z.array(z.string()),
    tools: z.array(z.string()),
    rating: z.number().min(0).max(5).optional(),
    dependencies: z.array(z.string())
  }),

  layerValidation: {
    deployment: z.object({
      environment: z.enum(['production', 'staging', 'development']),
      version: z.string().regex(/^\d+\.\d+\.\d+$/),
      config: z.record(z.unknown()),
      metadata: z.record(z.unknown()).optional()
    }),

    collaborator: z.object({
      role: z.enum(['owner', 'editor', 'viewer']),
      permissions: z.array(z.string()),
      metadata: z.record(z.unknown()).optional()
    }),

    auditLog: z.object({
      action: z.enum([
        'created',
        'updated',
        'deleted',
        'deployed',
        'rolled_back',
        'collaborator_added',
        'collaborator_updated',
        'collaborator_removed',
        'permission_changed'
      ]),
      details: z.record(z.unknown())
    })
  }
} as const;

export type ValidationSchemas = typeof validationSchemas; 