import type { MCPServer, MCPClient } from '../types/server';
import type { Layer, LayerParameters } from '../types/layer';
import { LayerManager } from '../layers/manager';
import { LayerSandbox } from '../layers/sandbox';

export class LayerServer implements MCPServer {
  private layerManager: LayerManager;
  private sandbox: LayerSandbox;

  constructor() {
    this.layerManager = new LayerManager();
    this.sandbox = new LayerSandbox();
  }

  async registerWithMCP(mcpClient: MCPClient): Promise<void> {
    const layers = await this.layerManager.getActiveLayers();
    
    for (const layer of layers) {
      if (!['node', 'docker'].includes(layer.runtime.type)) {
        continue; // Skip unsupported runtimes
      }

      await mcpClient.registerTool({
        name: layer.metadata.name,
        description: layer.metadata.description || layer.metadata.name,
        parameters: layer.parameters as LayerParameters,
        handler: async (args: Record<string, unknown>) => {
          return this.sandbox.executeLayer(
            layer.id,
            layer.code,
            layer.runtime.type,
            args
          );
        }
      });
    }
  }
} 