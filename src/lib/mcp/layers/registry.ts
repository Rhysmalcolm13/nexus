import { LayerMetadata, LayerConfig } from './types';

export interface LayerRegistry {
  id: string;
  url: string;  // URL to layer package
  manifest: {
    name: string;
    version: string;
    entrypoint: string;
    dependencies: string[];
    tools: string[];        // Add tools array
    category: string;       // Add category
    tags: string[];         // Add tags
    description?: string;   // Add optional description
    config: {
      schema: Record<string, unknown>;
      defaults: Record<string, unknown>;
    };
  };
}

export class UniversalMCPRegistry {
  private static instance: UniversalMCPRegistry;
  private registeredLayers: Map<string, LayerRegistry> = new Map();

  static getInstance(): UniversalMCPRegistry {
    if (!this.instance) {
      this.instance = new UniversalMCPRegistry();
    }
    return this.instance;
  }

  async registerLayer(manifest: LayerRegistry): Promise<void> {
    // Validate and register layer
    await this.validateLayer(manifest);
    this.registeredLayers.set(manifest.id, manifest);
  }

  async validateLayer(manifest: LayerRegistry): Promise<void> {
    // Validate layer compatibility and dependencies
  }

  async getLayer(id: string): Promise<LayerRegistry> {
    const layer = this.registeredLayers.get(id);
    if (!layer) {
      throw new Error(`Layer ${id} not found`);
    }
    return layer;
  }

  async getLayerByTool(toolName: string): Promise<LayerRegistry | undefined> {
    // Convert iterator to array for compatibility
    const layers = Array.from(this.registeredLayers.values());
    
    return layers.find(layer => 
      layer.manifest.tools?.includes(toolName)
    );
  }

  // Add methods for layer marketplace
  async listLayers(filters?: {
    category?: string;
    tags?: string[];
  }): Promise<LayerRegistry[]> {
    const layers = Array.from(this.registeredLayers.values());
    
    if (!filters) return layers;

    return layers.filter(layer => {
      if (filters.category && layer.manifest.category !== filters.category) {
        return false;
      }
      if (filters.tags?.length && !filters.tags.every(tag => layer.manifest.tags.includes(tag))) {
        return false;
      }
      return true;
    });
  }
} 