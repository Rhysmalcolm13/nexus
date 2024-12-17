import { EventEmitter } from 'events';
import type { 
  Layer, 
  LayerMetadata, 
  LayerConfig, 
  LayerRuntimeType,
  LayerRuntimeStatus,
  LayerProcess,
  Tool,
  Resource,
  Prompt,
  LayerRuntime,
  PrismaLayer
} from '../types';
import { RawLayerQueryResult } from '../types/prisma';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { MCPClient } from '../client';
import { LayerError, LayerErrorCode } from '../errors';
import { validationSchemas } from '../types/validation';
import { LayerCollaborator, LayerDeployment, LayerParameters } from '../types/layer';

// Add type for layer status
type LayerStatus = 'active' | 'inactive' | 'deprecated' | 'draft';
type LayerVisibility = 'private' | 'public' | 'organization';

/**
 * Manages MCP layer lifecycle and operations
 * 
 * Features:
 * - Layer installation and removal
 * - State management
 * - Tool validation and registration
 * - Resource management
 * - Error handling
 * 
 * @example
 * ```typescript
 * const manager = new LayerManager();
 * 
 * // Install a layer
 * await manager.installLayer('layer-id', 'user-id');
 * 
 * // Execute a tool
 * const result = await manager.executeTool('layer-id', 'tool-name', args);
 * ```
 */
export class LayerManager extends EventEmitter {
  private layers: Map<string, Layer> = new Map();
  private marketplace: Map<string, LayerMetadata> = new Map();
  private processes: Map<string, LayerProcess> = new Map();
  private clients: Map<string, MCPClient> = new Map();

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    await this.loadMarketplace();
  }

  private async loadMarketplace() {
    const result = await prisma.$queryRaw<RawLayerQueryResult[]>`
      SELECT 
        l.*,
        u.name,
        u.email,
        array_agg(lp."userId") as purchase_user_ids
      FROM "Layer" l
      JOIN "User" u ON l."userId" = u.id
      LEFT JOIN "LayerPurchase" lp ON l.id = lp."layerId"
      WHERE l.status = 'active'
      GROUP BY l.id, u.name, u.email
    `;
    
    result.forEach((layer) => {
      const metadata = this.validateMetadata(layer.metadata);
      this.marketplace.set(layer.id, {
        ...metadata,
        author: layer.user.name || layer.user.email || 'Unknown'
      });
    });
  }

  async listAvailableLayers(filters?: {
    category?: string;
    tags?: string[];
    priceRange?: { min: number; max: number };
  }): Promise<LayerMetadata[]> {
    const layers = Array.from(this.marketplace.values());
    
    if (!filters) {
      return layers;
    }

    return layers.filter(layer => {
      if (filters.category && layer.category !== filters.category) {
        return false;
      }
      if (filters.tags?.length && !filters.tags.every(tag => layer.tags.includes(tag))) {
        return false;
      }
      if (filters.priceRange && layer.price) {
        const { min, max } = filters.priceRange;
        if (layer.price.amount < min || layer.price.amount > max) {
          return false;
        }
      }
      return true;
    });
  }

  async purchaseLayer(layerId: string, userId: string): Promise<void> {
    const result = await prisma.$queryRaw<PrismaLayer[]>`
      SELECT l.*, array_agg(lp."userId") as purchase_user_ids
      FROM "Layer" l
      LEFT JOIN "LayerPurchase" lp ON l.id = lp."layerId"
      WHERE l.id = ${layerId}
      GROUP BY l.id
    `;

    const layer = result[0];
    if (!layer) {
      throw new Error('Layer not found');
    }

    const metadata = layer.metadata as LayerMetadata;
    if (!metadata.price) {
      throw new Error('Layer is not purchasable');
    }

    await prisma.$executeRaw`
      INSERT INTO "LayerPurchase" ("id", "layerId", "userId", "amount", "currency", "status")
      VALUES (gen_random_uuid(), ${layerId}, ${userId}, ${metadata.price.amount}, ${metadata.price.currency}, 'completed')
    `;
  }

  async installLayer(layerId: string, userId: string): Promise<void> {
    const result = await prisma.$queryRaw<PrismaLayer[]>`
      SELECT l.*, json_agg(lp.*) as purchases
      FROM "Layer" l
      LEFT JOIN "LayerPurchase" lp ON l.id = lp."layerId"
      WHERE l.id = ${layerId}
      GROUP BY l.id
    `;

    const layer = result[0];
    if (!layer) {
      throw new Error('Layer not found');
    }

    if ((layer.metadata as LayerMetadata).price) {
      const hasPurchase = layer.purchases.some((p: { userId: string }) => p.userId === userId);
      if (!hasPurchase) {
        throw new Error('Layer must be purchased first');
      }
    }

    const client = new MCPClient((layer.metadata as LayerMetadata).name);
    await client.connect();

    this.processes.set(layerId, {
      client,
      runtime: {
        type: 'node',
        status: 'active'
      },
      status: 'active',
      metrics: {
        requests: 0,
        errors: 0,
        latency: 0
      },
      resources: {
        cpu: 0,
        memory: 0
      }
    });

    await prisma.$executeRaw`
      UPDATE "Layer"
      SET status = 'active'
      WHERE id = ${layerId}
    `;
  }

  async getLayerMetrics(layerId: string): Promise<LayerRuntime> {
    const process = this.processes.get(layerId);
    if (!process) {
      throw new Error('Layer not installed');
    }

    return {
      type: process.runtime.type,
      status: process.status,
      lastError: process.error?.message,
      metrics: {
        requests: process.metrics?.requests || 0,
        errors: process.metrics?.errors || 0,
        latency: process.metrics?.latency || 0
      },
      resources: {
        cpu: process.resources?.cpu || 0,
        memory: process.resources?.memory || 0
      }
    };
  }

  async cleanup() {
    const processes = Array.from(this.processes.entries());
    for (const [layerId, process] of processes) {
      try {
        await process.client.close();
      } catch (error) {
        console.error(`Error stopping layer ${layerId}:`, error);
      }
    }
    this.processes.clear();
  }

  public getClient(layerId: string): MCPClient | undefined {
    return this.clients.get(layerId);
  }

  public async executeTool(
    layerId: string, 
    toolName: string, 
    args: Record<string, unknown>
  ): Promise<unknown> {
    const client = this.getClient(layerId);
    if (!client) {
      throw new LayerError(
        LayerErrorCode.NOT_FOUND,
        `Layer ${layerId} not found or not initialized`
      );
    }

    try {
      return await client.callTool(toolName, args);
    } catch (error) {
      throw new LayerError(
        LayerErrorCode.RUNTIME_ERROR,
        `Failed to execute tool ${toolName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Gets a layer by ID with full validation
   * @param layerId - ID of the layer to retrieve
   * @returns Promise resolving to Layer object or null if not found
   * @throws {LayerError} If layer data is invalid
   */
  async getLayer(layerId: string): Promise<Layer | null> {
    const result = await prisma.$queryRaw<RawLayerQueryResult[]>`
      SELECT 
        l.*,
        u.name,
        u.email,
        array_agg(lp."userId") as purchase_user_ids
      FROM "Layer" l
      JOIN "User" u ON l."userId" = u.id
      LEFT JOIN "LayerPurchase" lp ON l.id = lp."layerId"
      WHERE l.id = ${layerId}
      GROUP BY l.id, u.name, u.email
    `;
    
    const layer = result[0];
    return layer ? this.convertToLayer(layer) : null;
  }

  /**
   * Converts a raw layer query result into a validated Layer object
   * @param prismaLayer - Raw layer data from database
   * @returns Validated Layer object
   * @throws {LayerError} If validation fails
   */
  private convertToLayer(prismaLayer: RawLayerQueryResult): Layer {
    const metadata = this.validateMetadata(prismaLayer.metadata);
    return {
      id: prismaLayer.id,
      metadata,
      config: this.validateConfig(prismaLayer.config),
      runtime: this.validateRuntime(prismaLayer.runtime as LayerRuntimeType),
      tools: this.validateTools(prismaLayer.tools as unknown[]),
      resources: this.validateResources(prismaLayer.resources as unknown[]),
      prompts: this.validatePrompts(prismaLayer.prompts as unknown[]),
      state: prismaLayer.state as Record<string, unknown>,
      code: this.validateCode(prismaLayer.code),
      parameters: this.validateParameters(prismaLayer.parameters)
    };
  }

  private validateMetadata(metadata: unknown): LayerMetadata {
    const result = validationSchemas.layerMetadata.safeParse(metadata);
    if (!result.success) {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Invalid layer metadata',
        new Error(result.error.message)
      );
    }
    return result.data;
  }

  private validateConfig(config: unknown): LayerConfig {
    const defaultConfig: LayerConfig = {
      enabled: true,
      settings: {},
      credentials: {}
    };

    return {
      ...defaultConfig,
      ...(config as Partial<LayerConfig>)
    };
  }

  private validateRuntime(runtime: LayerRuntimeType): LayerRuntime {
    const validRuntimes: LayerRuntimeType[] = ['edge', 'docker', 'node'];
    
    if (!validRuntimes.includes(runtime)) {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Invalid runtime'
      );
    }

    return {
      type: runtime,
      status: 'pending'
    };
  }

  private validateTool(data: unknown): Tool {
    const result = validationSchemas.tool.safeParse(data);
    if (!result.success) {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Invalid tool data'
      );
    }
    return result.data as Tool;
  }

  private validateTools(tools: unknown[]): Tool[] {
    return tools.map((tool, index) => {
      try {
        return this.validateTool(tool);
      } catch (error) {
        throw new LayerError(
          LayerErrorCode.VALIDATION_ERROR,
          `Invalid tool at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private validateResource(data: unknown): Resource {
    const result = validationSchemas.resource.safeParse(data);
    if (!result.success) {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Invalid resource data'
      );
    }
    return result.data;
  }

  private validateResources(resources: unknown[]): Resource[] {
    return resources.map((resource, index) => {
      try {
        return this.validateResource(resource);
      } catch (error) {
        throw new LayerError(
          LayerErrorCode.VALIDATION_ERROR,
          `Invalid resource at index ${index}`
        );
      }
    });
  }

  private validatePrompt(data: unknown): Prompt {
    const result = validationSchemas.prompt.safeParse(data);
    if (!result.success) {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Invalid prompt data'
      );
    }
    return result.data;
  }

  private validatePrompts(prompts: unknown[]): Prompt[] {
    return prompts.map((prompt, index) => {
      try {
        return this.validatePrompt(prompt);
      } catch (error) {
        throw new LayerError(
          LayerErrorCode.VALIDATION_ERROR,
          `Invalid prompt at index ${index}`
        );
      }
    });
  }

  private async updateLayerState(
    layerId: string,
    state: Record<string, unknown>
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // First verify layer exists
        const layer = await tx.layer.findUnique({
          where: { id: layerId }
        });

        if (!layer) {
          throw new LayerError(
            LayerErrorCode.NOT_FOUND,
            `Layer ${layerId} not found`
          );
        }

        // Then update state
        await tx.layer.update({
          where: { id: layerId },
          data: {
            state: state as Prisma.JsonObject,
            updatedAt: new Date()
          }
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma-specific errors
        throw new LayerError(
          LayerErrorCode.DATABASE_ERROR,
          `Database error: ${error.message}`,
          error
        );
      }
      throw error;
    }
  }

  async addCollaborator(
    layerId: string,
    userId: string,
    role: string,
    permissions: string[]
  ): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO "LayerCollaborator" (
        id, "layerId", "userId", role, permissions, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${layerId}, ${userId}, ${role}, ${permissions}, NOW(), NOW()
      )
    `;

    await this.createAuditLog(layerId, userId, 'permission_changed', {
      role,
      permissions
    });
  }

  async deployLayer(
    layerId: string,
    environment: string,
    version: string,
    config: Record<string, unknown>
  ): Promise<void> {
    const deploymentId = await prisma.$executeRaw`
      INSERT INTO "LayerDeployment" (
        id, "layerId", environment, version, status, config, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${layerId}, ${environment}, ${version}, 'in_progress', 
        ${config as Prisma.JsonObject}, NOW(), NOW()
      )
      RETURNING id
    `;

    try {
      await prisma.$executeRaw`
        UPDATE "LayerDeployment"
        SET status = 'success', "updatedAt" = NOW()
        WHERE id = ${deploymentId}
      `;
    } catch (err) {
      const error = err as Error;
      await prisma.$executeRaw`
        UPDATE "LayerDeployment"
        SET 
          status = 'failed',
          metadata = ${JSON.stringify({ error: error.message }) as unknown as Prisma.JsonObject},
          "updatedAt" = NOW()
        WHERE id = ${deploymentId}
      `;
      throw error;
    }
  }

  private async createAuditLog(
    layerId: string,
    userId: string,
    action: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO "LayerAuditLog" (
        id, "layerId", "userId", action, details, "createdAt"
      ) VALUES (
        gen_random_uuid(), ${layerId}, ${userId}, ${action}, 
        ${details as Prisma.JsonObject}, NOW()
      )
    `;
  }

  async getCollaborators(layerId: string): Promise<LayerCollaborator[]> {
    const collaborators = await prisma.$queryRaw<LayerCollaborator[]>`
      SELECT 
        lc.id,
        lc."layerId",
        lc."userId",
        lc.role,
        lc.permissions,
        lc."createdAt",
        lc."updatedAt",
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as user
      FROM "LayerCollaborator" lc
      JOIN "User" u ON lc."userId" = u.id
      WHERE lc."layerId" = ${layerId}
    `;

    return collaborators;
  }

  async updateCollaborator(
    layerId: string,
    userId: string,
    updates: {
      role?: string;
      permissions?: string[];
    }
  ): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "LayerCollaborator"
      SET 
        role = COALESCE(${updates.role}, role),
        permissions = COALESCE(${updates.permissions}, permissions),
        "updatedAt" = NOW()
      WHERE "layerId" = ${layerId}
      AND "userId" = ${userId}
    `;

    await this.createAuditLog(layerId, userId, 'collaborator_updated', updates);
  }

  async removeCollaborator(layerId: string, userId: string): Promise<void> {
    await prisma.$executeRaw`
      DELETE FROM "LayerCollaborator"
      WHERE "layerId" = ${layerId}
      AND "userId" = ${userId}
    `;

    await this.createAuditLog(layerId, userId, 'collaborator_removed', {});
  }

  async getDeployments(layerId: string): Promise<LayerDeployment[]> {
    const deployments = await prisma.$queryRaw<LayerDeployment[]>`
      SELECT * FROM "LayerDeployment"
      WHERE "layerId" = ${layerId}
      ORDER BY "createdAt" DESC
    `;

    return deployments;
  }

  async rollbackDeployment(
    layerId: string,
    deploymentId: string
  ): Promise<void> {
    const deployment = await prisma.$queryRaw<LayerDeployment[]>`
      SELECT * FROM "LayerDeployment"
      WHERE id = ${deploymentId}
      AND "layerId" = ${layerId}
    `;

    if (!deployment[0]) {
      throw new LayerError(
        LayerErrorCode.NOT_FOUND,
        'Deployment not found'
      );
    }

    await this.deployLayer(
      layerId,
      deployment[0].environment,
      deployment[0].version,
      deployment[0].config as Record<string, unknown>
    );

    await this.createAuditLog(layerId, 'system', 'deployment_rollback', {
      deploymentId,
      version: deployment[0].version
    });
  }

  async getActiveLayers(): Promise<Layer[]> {
    const result = await prisma.$queryRaw<RawLayerQueryResult[]>`
      SELECT l.*, u.name, u.email
      FROM "Layer" l
      JOIN "User" u ON l."userId" = u.id
      WHERE l.status = 'active'
    `;
    
    return result.map(layer => this.convertToLayer(layer));
  }

  /**
   * Validates layer code content
   * @param code - Layer code to validate
   * @returns Validated code string
   * @throws {LayerError} If code is invalid
   */
  private validateCode(code: string): string {
    if (typeof code !== 'string') {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Layer code must be a string'
      );
    }
    return code;
  }

  /**
   * Validates layer parameters
   * @param parameters - Parameters to validate
   * @returns Validated LayerParameters object
   * @throws {LayerError} If parameters are invalid
   */
  private validateParameters(parameters: unknown): LayerParameters {
    if (!parameters || typeof parameters !== 'object') {
      return {};
    }
    
    try {
      // Validate each parameter is a valid JSON value
      Object.entries(parameters as Record<string, unknown>).forEach(([key, value]) => {
        JSON.stringify(value); // Will throw if value can't be serialized
      });
      return parameters as LayerParameters;
    } catch (error) {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Invalid layer parameters format',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Runtime type guard for Layer interface
   */
  private isValidLayer(layer: unknown): layer is Layer {
    if (!layer || typeof layer !== 'object') return false;
    
    const l = layer as Partial<Layer>;
    try {
      // First validate required fields exist
      if (!l.id || !l.code || !l.metadata || !l.config || !l.runtime) {
        return false;
      }

      // Then validate types and content
      return (
        typeof l.id === 'string' &&
        typeof l.code === 'string' &&
        this.validateMetadata(l.metadata) !== null &&
        this.validateConfig(l.config) !== null &&
        typeof l.runtime === 'object' && 
        typeof l.runtime.type === 'string' &&
        ['node', 'docker', 'edge'].includes(l.runtime.type) &&
        Array.isArray(l.tools) &&
        Array.isArray(l.resources) &&
        Array.isArray(l.prompts) &&
        (!l.state || typeof l.state === 'object') &&
        typeof l.parameters === 'object'
      );
    } catch {
      return false;
    }
  }

  /**
   * Performs runtime validation of a Layer object
   * @param layer - Layer object to validate
   * @throws {LayerError} If validation fails
   */
  private validateLayerRuntime(layer: unknown): void {
    if (!this.isValidLayer(layer)) {
      throw new LayerError(
        LayerErrorCode.VALIDATION_ERROR,
        'Invalid layer structure'
      );
    }
  }
} 