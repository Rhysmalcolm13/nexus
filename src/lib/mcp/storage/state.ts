import { prisma } from '@/lib/db/prisma';
import { Logger } from '../utils/logger';
import { LayerError, LayerErrorCode } from '../errors';
import type { Prisma } from '@prisma/client';

/**
 * Manages persistent state for layers
 */
export class LayerStateManager {
  private static instance: LayerStateManager;
  private logger = Logger.getInstance();

  static getInstance(): LayerStateManager {
    if (!this.instance) {
      this.instance = new LayerStateManager();
    }
    return this.instance;
  }

  /**
   * Saves layer state to database
   */
  async saveState(layerId: string, state: Record<string, unknown>): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "Layer"
        SET state = ${state as unknown as Prisma.JsonValue}
        WHERE id = ${layerId}
      `;
      this.logger.debug('Saved state for layer:', layerId);
    } catch (error) {
      this.logger.error('Failed to save layer state:', error as Error);
      throw new LayerError(
        LayerErrorCode.SYSTEM_ERROR,
        'Failed to save layer state',
        error as Error
      );
    }
  }

  /**
   * Loads layer state from database
   */
  async loadState(layerId: string): Promise<Record<string, unknown>> {
    try {
      const result = await prisma.$queryRaw<Array<{ state: Prisma.JsonValue }>>`
        SELECT state
        FROM "Layer"
        WHERE id = ${layerId}
      `;

      return (result[0]?.state as Record<string, unknown>) ?? {};
    } catch (error) {
      this.logger.error('Failed to load layer state:', error as Error);
      throw new LayerError(
        LayerErrorCode.SYSTEM_ERROR,
        'Failed to load layer state',
        error as Error
      );
    }
  }
} 