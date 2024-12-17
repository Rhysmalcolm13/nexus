import { LayerManager } from '../layers/manager';
import { LayerError, LayerErrorCode } from '../errors';
import { LayerMetadata, PrismaLayer } from '../types';
import { Logger } from '../utils/logger';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { validationSchemas } from '../types';

interface MarketplaceLayer {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  downloads: number;
  rating: number;
  price?: {
    amount: number;
    currency: string;
    interval?: 'monthly' | 'yearly' | 'one-time';
  };
  tags: string[];
  category: string;
}

/**
 * MCP Layer Marketplace
 * 
 * Provides functionality for discovering, purchasing, and installing MCP layers.
 * 
 * Features:
 * - Layer search and discovery
 * - Layer purchase management
 * - Layer installation
 * - Validation and error handling
 * 
 * @example
 * ```typescript
 * const marketplace = new LayerMarketplace();
 * 
 * // Search for layers
 * const layers = await marketplace.searchLayers('database');
 * 
 * // Purchase a layer
 * await marketplace.purchaseLayer(layerId, userId);
 * 
 * // Install a layer
 * await marketplace.installLayer(layerId, userId);
 * ```
 */
export class LayerMarketplace {
  private logger = Logger.getInstance();
  private layerManager: LayerManager;

  constructor() {
    this.layerManager = new LayerManager();
  }

  async searchLayers(query: string): Promise<MarketplaceLayer[]> {
    try {
      const result = await prisma.$queryRaw<PrismaLayer[]>`
        SELECT 
          l.*,
          COUNT(lp.id) as download_count,
          jsonb_build_object(
            'name', l.metadata->>'name',
            'description', l.metadata->>'description',
            'author', l.metadata->>'author',
            'rating', COALESCE((l.metadata->>'rating')::numeric, 0),
            'price', l.metadata->'price',
            'tags', l.metadata->'tags',
            'category', l.metadata->>'category'
          ) as metadata_parsed
        FROM "Layer" l
        LEFT JOIN "LayerPurchase" lp ON l.id = lp."layerId"
        WHERE l.status = 'active'
          AND (
            l.metadata->>'name' ILIKE ${`%${query}%`} OR
            l.metadata->>'description' ILIKE ${`%${query}%`}
          )
        GROUP BY l.id
      `;

      return result.map(layer => {
        const metadata = layer.metadata_parsed as Record<string, unknown>;
        return {
          id: layer.id,
          name: String(metadata.name || ''),
          version: String(metadata.version || '1.0.0'),
          description: String(metadata.description || ''),
          author: String(metadata.author || ''),
          downloads: Number(layer.download_count || 0),
          rating: Number(metadata.rating || 0),
          price: metadata.price as MarketplaceLayer['price'],
          tags: Array.isArray(metadata.tags) ? metadata.tags : [],
          category: String(metadata.category || 'other')
        };
      });
    } catch (error) {
      this.logger.error('Failed to search layers:', error as Error);
      throw new LayerError(
        LayerErrorCode.SYSTEM_ERROR,
        'Failed to search marketplace layers',
        error instanceof Error ? error : undefined
      );
    }
  }

  async installLayer(layerId: string, userId: string): Promise<void> {
    try {
      const layer = await prisma.layer.findUnique({
        where: { id: layerId },
        include: { purchases: true }
      });

      if (!layer) {
        throw new LayerError(
          LayerErrorCode.NOT_FOUND,
          `Layer ${layerId} not found`
        );
      }

      const metadata = validationSchemas.layerMetadata.parse(layer.metadata);
      
      // Check if purchase required
      if (metadata.price && !layer.purchases.some(p => p.userId === userId)) {
        throw new LayerError(
          LayerErrorCode.UNAUTHORIZED,
          'Layer must be purchased before installation'
        );
      }

      await this.layerManager.installLayer(layerId, userId);
    } catch (error) {
      this.logger.error('Failed to install layer:', error as Error);
      throw new LayerError(
        LayerErrorCode.INSTALLATION_ERROR,
        'Failed to install layer',
        error instanceof Error ? error : undefined
      );
    }
  }

  async purchaseLayer(layerId: string, userId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const layer = await tx.layer.findUnique({
          where: { id: layerId }
        });

        if (!layer) {
          throw new LayerError(
            LayerErrorCode.NOT_FOUND,
            `Layer ${layerId} not found`
          );
        }

        const metadata = validationSchemas.layerMetadata.parse(layer.metadata);
        if (!metadata.price) {
          throw new LayerError(
            LayerErrorCode.VALIDATION_ERROR,
            'Layer is not purchasable'
          );
        }

        await tx.layerPurchase.create({
          data: {
            layerId,
            userId,
            amount: metadata.price.amount,
            currency: metadata.price.currency,
            status: 'completed'
          }
        });
      });
    } catch (error) {
      this.logger.error('Failed to purchase layer:', error as Error);
      throw new LayerError(
        LayerErrorCode.PAYMENT_ERROR,
        'Failed to purchase layer',
        error instanceof Error ? error : undefined
      );
    }
  }
} 