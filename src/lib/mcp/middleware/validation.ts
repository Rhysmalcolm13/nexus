import { NextResponse } from 'next/server';
import { z } from 'zod';
import { LayerError, LayerErrorCode } from '../errors';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

/**
 * Validates request body against a schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (req: Request) => {
    try {
      const body = await req.json();
      return schema.parse(body);
    } catch (error) {
      const validationError = error instanceof Error ? error : new Error('Unknown error');
      logger.error('Request validation failed:', validationError);
      
      if (error instanceof z.ZodError) {
        throw new LayerError(
          LayerErrorCode.VALIDATION_ERROR,
          'Invalid request body',
          error
        );
      }
      throw error;
    }
  };
}

/**
 * Request schemas for marketplace operations
 */
export const InstallLayerSchema = z.object({
  layerId: z.string().uuid(),
  action: z.literal('install')
}) satisfies z.ZodType<{
  layerId: string;
  action: 'install';
}>;

export const PurchaseLayerSchema = z.object({
  layerId: z.string().uuid(),
  action: z.literal('purchase')
}) satisfies z.ZodType<{
  layerId: string;
  action: 'purchase';
}>;

export const SearchLayersSchema = z.object({
  query: z.string().max(100),
  category: z.enum([
    'ai', 'database', 'development', 'productivity',
    'security', 'communication', 'analytics', 'integration'
  ]).optional(),
  tags: z.array(z.string()).max(5).optional()
}) satisfies z.ZodType<{
  query: string;
  category?: string;
  tags?: string[];
}>; 