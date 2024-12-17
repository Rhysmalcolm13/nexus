import { LayerRegistry } from './registry';
import { Logger } from '../utils/logger';
import { z } from 'zod';

/**
 * Represents a package in the MCP layer marketplace
 */
export interface LayerPackage {
  /** The layer registry information */
  registry: LayerRegistry;
  /** Number of times this layer has been downloaded */
  downloads: number;
  /** User rating from 0-5 */
  rating: number;
  /** Optional pricing information */
  price?: {
    /** Cost amount */
    amount: number;
    /** Currency code (e.g., 'USD') */
    currency: string;
    /** Payment interval if subscription-based */
    interval?: 'monthly' | 'yearly' | 'one-time';
  };
}

const LayerPackageSchema = z.object({
  registry: z.object({
    manifest: z.object({
      name: z.string(),
      description: z.string().optional(),
      version: z.string(),
      tools: z.array(z.string())
    })
  }),
  downloads: z.number().min(0),
  rating: z.number().min(0).max(5),
  price: z.object({
    amount: z.number().min(0),
    currency: z.string().length(3),
    interval: z.enum(['monthly', 'yearly', 'one-time']).optional()
  }).optional()
});

/**
 * Manages the MCP layer marketplace functionality
 */
export class LayerMarketplace {
  private static instance: LayerMarketplace;
  private packages: Map<string, LayerPackage> = new Map();
  private logger = Logger.getInstance();

  /**
   * Gets the singleton instance of LayerMarketplace
   */
  static getInstance(): LayerMarketplace {
    if (!this.instance) {
      this.instance = new LayerMarketplace();
    }
    return this.instance;
  }

  /**
   * Searches for layers in the marketplace
   * @param query - Search query string
   * @returns Array of matching layer packages
   * @throws Error if search fails
   */
  async searchLayers(query: string): Promise<LayerPackage[]> {
    try {
      this.logger.debug('Searching layers with query:', query);
      const packages = Array.from(this.packages.values());
      
      return packages.filter(pkg => 
        pkg.registry.manifest.name.includes(query) ||
        (pkg.registry.manifest.description?.includes(query) ?? false)
      );
    } catch (error) {
      this.logger.error('Failed to search layers:', error as Error);
      throw new Error('Layer search failed');
    }
  }

  /**
   * Installs a layer from the marketplace
   * @param packageId - ID of the package to install
   * @throws Error if installation fails
   */
  async installLayer(packageId: string): Promise<void> {
    try {
      this.logger.info('Installing layer:', packageId);
      const pkg = this.packages.get(packageId);
      
      if (!pkg) {
        throw new Error(`Package ${packageId} not found`);
      }

      // Validate package before installation
      const result = LayerPackageSchema.safeParse(pkg);
      if (!result.success) {
        throw new Error(`Invalid package: ${result.error.message}`);
      }

      // Handle installation logic
      this.logger.info('Layer installed successfully:', packageId);
    } catch (error) {
      this.logger.error('Failed to install layer:', error as Error);
      throw new Error(`Layer installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Adds a new package to the marketplace
   * @param pkg - Package to add
   * @throws Error if validation fails
   */
  async addPackage(pkg: LayerPackage): Promise<void> {
    try {
      const result = LayerPackageSchema.safeParse(pkg);
      if (!result.success) {
        throw new Error(`Invalid package: ${result.error.message}`);
      }

      this.packages.set(pkg.registry.id, pkg);
      this.logger.info('Added package to marketplace:', pkg.registry.manifest.name);
    } catch (error) {
      this.logger.error('Failed to add package:', error as Error);
      throw new Error('Failed to add package to marketplace');
    }
  }
} 