import { LayerManager } from '../layers/manager';
import { MCPManager } from '../manager';
import { LayerError, LayerErrorCode } from '../errors';
import { Logger } from '../utils/logger';
import { prisma } from '@/lib/db/prisma';
import { MCPClientExtended } from '../types';

/**
 * Manages state synchronization between layers and servers
 */
export class LayerStateSync {
  private logger = Logger.getInstance();
  private layerManager: LayerManager;
  private mcpManager: MCPManager;

  constructor() {
    this.layerManager = new LayerManager();
    this.mcpManager = new MCPManager();
  }

  /**
   * Synchronizes layer state with server
   */
  async syncLayerState(layerId: string, serverId: string): Promise<void> {
    try {
      // Get current states
      const layerState = await this.getLayerState(layerId);
      const serverState = await this.getServerState(serverId);

      // Merge states
      const mergedState = this.mergeStates(layerState, serverState);

      // Update both layer and server
      await Promise.all([
        this.updateLayerState(layerId, mergedState),
        this.updateServerState(serverId, mergedState)
      ]);

      this.logger.info(`State synchronized for layer ${layerId} with server ${serverId}`);
    } catch (error) {
      this.logger.error('State synchronization failed:', error as Error);
      throw new LayerError(
        LayerErrorCode.SYNC_ERROR,
        'Failed to synchronize states',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Gets layer state from database
   */
  private async getLayerState(layerId: string): Promise<Record<string, unknown>> {
    const result = await prisma.$queryRaw<Array<{ state: unknown }>>`
      SELECT state FROM "Layer" WHERE id = ${layerId}
    `;
    return (result[0]?.state as Record<string, unknown>) ?? {};
  }

  /**
   * Gets server state
   */
  private async getServerState(serverId: string): Promise<Record<string, unknown>> {
    const server = this.mcpManager.getServer(serverId) as MCPClientExtended;
    if (!server) {
      throw new LayerError(
        LayerErrorCode.NOT_FOUND,
        `Server ${serverId} not found`
      );
    }
    return server.getState();
  }

  /**
   * Merges layer and server states
   */
  private mergeStates(
    layerState: Record<string, unknown>,
    serverState: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...layerState,
      ...serverState,
      // Add conflict resolution logic here
    };
  }

  private async updateLayerState(
    layerId: string, 
    state: Record<string, unknown>
  ): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "Layer"
      SET state = ${state as any}
      WHERE id = ${layerId}
    `;
  }

  private async updateServerState(
    serverId: string,
    state: Record<string, unknown>
  ): Promise<void> {
    const server = this.mcpManager.getServer(serverId) as MCPClientExtended;
    if (!server) {
      throw new LayerError(
        LayerErrorCode.NOT_FOUND,
        `Server ${serverId} not found`
      );
    }
    await server.setState(state);
  }
} 