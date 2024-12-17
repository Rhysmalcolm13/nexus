import { EventEmitter } from 'events';
import { MCPClient } from './client';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { 
  MCPServerConfig, 
  ServerHealth, 
  ServerInitOptions,
  ServerHealthCheck 
} from './types';

export class MCPManager extends EventEmitter {
  private clients: Map<string, MCPClient> = new Map();
  private toolRegistry: Map<string, string> = new Map();
  private healthStatus: Map<string, ServerHealth> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timer> = new Map();

  constructor() {
    super();
  }

  async connectToServer(config: MCPServerConfig) {
    try {
      const client = new MCPClient(config.name);
      
      // Apply initialization options
      if (config.initOptions) {
        this.applyInitOptions(client, config.initOptions);
      }

      await client.connect();
      
      // Register server's tools and capabilities
      const tools = await client.listTools();
      tools.forEach(tool => {
        this.toolRegistry.set(tool.name, config.name);
      });

      this.clients.set(config.name, client);
      
      // Start health monitoring
      if (config.healthCheck) {
        this.startHealthMonitoring(config.name, config.healthCheck);
      }

      this.emit('server:connected', { name: config.name });
      return client;
    } catch (error) {
      this.emit('server:error', { name: config.name, error });
      throw error;
    }
  }

  private applyInitOptions(client: MCPClient, options: ServerInitOptions) {
    if (options.timeout) client.setTimeout(options.timeout);
    if (options.retryAttempts) client.setRetryAttempts(options.retryAttempts);
    if (options.logLevel) client.setLogLevel(options.logLevel);
  }

  private async startHealthMonitoring(
    serverName: string, 
    options: ServerHealthCheck
  ) {
    const interval = options.interval || 30000;
    const timeout = options.timeout || 5000;

    const checkHealth = async () => {
      const startTime = Date.now();
      try {
        const client = this.clients.get(serverName);
        if (!client) return;

        await Promise.race([
          client.listTools(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), timeout)
          )
        ]);

        const health: ServerHealth = {
          status: 'healthy',
          lastCheck: new Date(),
          latency: Date.now() - startTime
        };

        this.healthStatus.set(serverName, health);
        this.emit('server:health', { name: serverName, health });
      } catch (error) {
        const health: ServerHealth = {
          status: 'unhealthy',
          lastCheck: new Date(),
          latency: Date.now() - startTime,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        };

        this.healthStatus.set(serverName, health);
        this.emit('server:health', { name: serverName, health });

        // Attempt recovery if needed
        if (options.autoReconnect) {
          await this.attemptRecovery(serverName);
        }
      }
    };

    // Start periodic health checks
    const intervalId = setInterval(checkHealth, interval);
    this.healthCheckIntervals.set(serverName, intervalId);

    // Run initial health check
    await checkHealth();
  }

  private async attemptRecovery(serverName: string) {
    const client = this.clients.get(serverName);
    if (!client) return;

    try {
      // Use public reconnect method
      await (client as any).reconnect();
      this.emit('server:recovered', { name: serverName });
    } catch (error) {
      this.emit('server:recovery_failed', { name: serverName, error });
    }
  }

  async getServerHealth(serverName?: string): Promise<Map<string, ServerHealth>> {
    if (serverName) {
      const health = this.healthStatus.get(serverName);
      return new Map([[serverName, health!]]);
    }
    return new Map(this.healthStatus);
  }

  async disconnectAll() {
    const clientArray = Array.from(this.clients.values());
    for (const client of clientArray) {
      await client.close();
    }
    this.clients.clear();
    this.toolRegistry.clear();
  }

  getClient(name: string) {
    return this.clients.get(name);
  }

  getConnectedCount(): number {
    return this.clients.size;
  }

  getClients(): Map<string, MCPClient> {
    return this.clients;
  }

  // Find the appropriate client for a given tool
  findClientForTool(toolName: string): MCPClient | undefined {
    const serverName = this.toolRegistry.get(toolName);
    if (serverName) {
      return this.clients.get(serverName);
    }
    return undefined;
  }

  // Get all tools by category
  async getToolsByCategory(category?: string): Promise<Tool[]> {
    const tools: Tool[] = [];
    const clients = Array.from(this.clients.values());
    
    for (const client of clients) {
      const clientTools = await client.listTools();
      if (category) {
        tools.push(...clientTools.filter(tool => tool.category === category));
      } else {
        tools.push(...clientTools);
      }
    }
    return tools;
  }

  async cleanup() {
    // Convert to array before iteration
    const intervals = Array.from(this.healthCheckIntervals.values());
    for (const intervalId of intervals) {
      clearInterval(intervalId as NodeJS.Timeout);
    }
    this.healthCheckIntervals.clear();

    await this.disconnectAll();
  }

  getServer(serverId: string): MCPClient | undefined {
    return this.clients.get(serverId);
  }
} 