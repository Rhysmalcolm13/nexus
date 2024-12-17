import { LayerManager } from '../layers/manager';
import { MCPManager } from '../manager';
import { LayerError, LayerErrorCode } from '../errors';
import { LayerContext, LayerMetadata, Layer, MCPClientExtended, ToolRegistration } from '../types';
import { Logger } from '../utils/logger';

/**
 * Manages integration between MCP.layers and MCP servers
 */
export class LayerIntegrationManager {
  private logger = Logger.getInstance();
  private layerManager: LayerManager;
  private mcpManager: MCPManager;

  constructor() {
    this.layerManager = new LayerManager();
    this.mcpManager = new MCPManager();
  }

  /**
   * Integrates a layer with an MCP server
   */
  async integrateLayer(
    layerId: string,
    serverId: string,
    context: LayerContext
  ): Promise<void> {
    try {
      const layer = await this.layerManager.getLayer(layerId);
      const server = this.mcpManager.getServer(serverId) as MCPClientExtended;

      if (!layer || !server) {
        throw new LayerError(
          LayerErrorCode.NOT_FOUND,
          'Layer or server not found'
        );
      }

      await this.validateCompatibility(layer.metadata, server);
      await this.registerLayerTools(layer, server);

      this.logger.info(`Layer ${layerId} integrated with server ${serverId}`);
    } catch (error) {
      this.logger.error('Layer integration failed:', error as Error);
      throw new LayerError(
        LayerErrorCode.INTEGRATION_ERROR,
        'Failed to integrate layer with server',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validates layer compatibility with server
   */
  private async validateCompatibility(
    metadata: LayerMetadata,
    server: MCPClientExtended
  ): Promise<void> {
    const capabilities = await server.getCapabilities();
    
    const missingFeatures = metadata.dependencies.filter(
      dep => !capabilities.features.includes(dep)
    );

    if (missingFeatures.length > 0) {
      throw new LayerError(
        LayerErrorCode.COMPATIBILITY_ERROR,
        `Server missing required features: ${missingFeatures.join(', ')}`
      );
    }
  }

  /**
   * Registers layer tools with server
   */
  private async registerLayerTools(
    layer: Layer,
    server: MCPClientExtended
  ): Promise<void> {
    for (const tool of layer.tools) {
      const registration: ToolRegistration = {
        name: tool.name,
        description: tool.description || tool.name,
        parameters: tool.parameters ?? Object.create(null),
        handler: async (args: Record<string, unknown>) => {
          return this.layerManager.executeTool(layer.id, tool.name, args);
        }
      };
      await server.registerTool(registration);
    }
  }
} 