import { LayerManager } from './manager';
import { UniversalMCPRegistry } from './registry';
import { MCPClient } from '../client';

interface ActiveLayer {
  client: MCPClient;
  handleRequest: (toolName: string, args: Record<string, unknown>) => Promise<unknown>;
}

export class LayerOrchestrator {
  private layerManager: LayerManager;
  private registry: UniversalMCPRegistry;
  private activeLayers: Map<string, ActiveLayer> = new Map();

  constructor() {
    this.layerManager = new LayerManager();
    this.registry = UniversalMCPRegistry.getInstance();
  }

  async startLayer(layerId: string, userId: string): Promise<void> {
    // Auto-install dependencies
    const layer = await this.registry.getLayer(layerId);
    for (const depId of layer.manifest.dependencies) {
      await this.ensureLayerRunning(depId, userId);
    }

    // Start the layer
    await this.layerManager.installLayer(layerId, userId);

    // Create active layer entry
    const client = new MCPClient(layer.manifest.name);
    await client.connect();

    this.activeLayers.set(layerId, {
      client,
      handleRequest: async (toolName: string, args: Record<string, unknown>) => {
        return client.callTool(toolName, args);
      }
    });
  }

  async ensureLayerRunning(layerId: string, userId: string): Promise<void> {
    if (!this.activeLayers.has(layerId)) {
      await this.startLayer(layerId, userId);
    }
  }

  private async findLayerForTool(toolName: string): Promise<ActiveLayer> {
    const layers = Array.from(this.activeLayers.values());
    
    for (const layer of layers) {
      const tools = await layer.client.listTools();
      if (tools.some(tool => tool.name === toolName)) {
        return layer;
      }
    }
    
    throw new Error(`No layer found providing tool: ${toolName}`);
  }

  async routeRequest(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const layer = await this.findLayerForTool(toolName);
    return layer.handleRequest(toolName, args);
  }

  async cleanup(): Promise<void> {
    const layers = Array.from(this.activeLayers.values());
    await Promise.all(
      layers.map(layer => layer.client.close())
    );
    this.activeLayers.clear();
  }
} 