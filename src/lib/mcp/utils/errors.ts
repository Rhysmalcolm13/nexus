import { LayerError, LayerErrorCode } from '../errors';
import { Logger } from './logger';
import { z } from 'zod';

const logger = Logger.getInstance();

/**
 * Wraps async operations with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  errorCode: LayerErrorCode = LayerErrorCode.SYSTEM_ERROR
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(`${context}:`, error as Error);
    
    if (error instanceof LayerError) {
      throw error;
    }

    throw new LayerError(
      errorCode,
      `Operation failed: ${context}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Validates input against a schema with error handling
 */
export function validateInput<T>(
  input: unknown,
  schema: z.ZodSchema<T>,
  context: string
): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        `Invalid ${context}: ${zodError.errors.map((e: z.ZodIssue) => e.message).join(', ')}`,
        zodError
      );
    }
    throw error;
  }
} 