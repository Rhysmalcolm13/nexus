import { Logger } from '../utils/logger';

/**
 * Metrics collected for layer operations
 */
export interface LayerMetrics {
  requests: {
    total: number;
    success: number;
    failed: number;
    latency: number[];
  };
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
  errors: {
    count: number;
    types: Record<string, number>;
  };
}

/**
 * Tracks and manages layer performance metrics
 */
export class MetricsTracker {
  private static instance: MetricsTracker;
  private metrics: Map<string, LayerMetrics> = new Map();
  private logger = Logger.getInstance();

  static getInstance(): MetricsTracker {
    if (!this.instance) {
      this.instance = new MetricsTracker();
    }
    return this.instance;
  }

  /**
   * Records a request metric for a layer
   */
  recordRequest(layerId: string, success: boolean, latencyMs: number): void {
    const metrics = this.getOrCreateMetrics(layerId);
    metrics.requests.total++;
    if (success) {
      metrics.requests.success++;
    } else {
      metrics.requests.failed++;
    }
    metrics.requests.latency.push(latencyMs);
    this.metrics.set(layerId, metrics);
  }

  /**
   * Records resource usage for a layer
   */
  recordResourceUsage(layerId: string, cpu: number, memory: number, disk: number): void {
    const metrics = this.getOrCreateMetrics(layerId);
    metrics.resources.cpu = cpu;
    metrics.resources.memory = memory;
    metrics.resources.disk = disk;
    this.metrics.set(layerId, metrics);
  }

  /**
   * Records an error occurrence for a layer
   */
  recordError(layerId: string, errorType: string): void {
    const metrics = this.getOrCreateMetrics(layerId);
    metrics.errors.count++;
    metrics.errors.types[errorType] = (metrics.errors.types[errorType] || 0) + 1;
    this.metrics.set(layerId, metrics);
  }

  /**
   * Gets metrics for a specific layer
   */
  getMetrics(layerId: string): LayerMetrics | undefined {
    return this.metrics.get(layerId);
  }

  private getOrCreateMetrics(layerId: string): LayerMetrics {
    return this.metrics.get(layerId) || {
      requests: { total: 0, success: 0, failed: 0, latency: [] },
      resources: { cpu: 0, memory: 0, disk: 0 },
      errors: { count: 0, types: {} }
    };
  }
} 