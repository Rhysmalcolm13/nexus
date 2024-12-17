import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';

export enum LayerEventType {
  LAYER_INSTALLED = 'layer:installed',
  LAYER_UPDATED = 'layer:updated',
  LAYER_REMOVED = 'layer:removed',
  LAYER_ERROR = 'layer:error',
  STATE_CHANGED = 'state:changed',
  TOOL_EXECUTED = 'tool:executed'
}

export interface LayerEvent {
  type: LayerEventType;
  layerId: string;
  timestamp: Date;
  data?: unknown;
}

/**
 * Central event bus for layer-related events
 */
export class LayerEventBus extends EventEmitter {
  private static instance: LayerEventBus;
  private logger = Logger.getInstance();

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): LayerEventBus {
    if (!this.instance) {
      this.instance = new LayerEventBus();
    }
    return this.instance;
  }

  /**
   * Emits a layer event
   */
  emitLayerEvent(event: LayerEvent): void {
    this.logger.debug('Layer event emitted:', event);
    this.emit(event.type, event);
  }

  /**
   * Subscribes to layer events
   */
  onLayerEvent(
    type: LayerEventType,
    handler: (event: LayerEvent) => void
  ): void {
    this.on(type, handler);
  }
} 