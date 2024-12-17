import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * Comprehensive error codes for MCP operations
 */
export enum LayerErrorCode {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',

  // Runtime Errors
  NOT_FOUND = 'NOT_FOUND',
  INSTALLATION_ERROR = 'INSTALLATION_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  INTEGRATION_ERROR = 'INTEGRATION_ERROR',
  COMPATIBILITY_ERROR = 'COMPATIBILITY_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  STATE_ERROR = 'STATE_ERROR',

  // Authorization Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  LICENSE_ERROR = 'LICENSE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',

  // Resource Errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ACCESS_DENIED = 'RESOURCE_ACCESS_DENIED',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',

  // System Errors
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  VERSION_MISMATCH = 'VERSION_MISMATCH',

  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR'
}

/**
 * Base error class for MCP layer operations
 */
export class LayerError extends Error {
  constructor(
    public code: LayerErrorCode,
    message: string,
    public cause?: Error,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LayerError';
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Creates a formatted error message including metadata
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      cause: this.cause?.message,
      metadata: this.metadata,
      stack: this.stack
    };
  }
}

export class LayerDatabaseError extends LayerError {
  constructor(
    message: string,
    public cause?: PrismaClientKnownRequestError
  ) {
    super(LayerErrorCode.DATABASE_ERROR, message, cause);
    this.name = 'LayerDatabaseError';
  }
} 