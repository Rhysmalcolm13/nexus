import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { WebSocket } from 'ws';
import {
  CallToolRequestSchema,
  CallToolResultSchema,
  ListToolsRequestSchema,
  ListToolsResultSchema,
  Tool,
  CallToolResult,
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Resource,
  ResourceContents,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  Prompt,
  GetPromptResult
} from '@modelcontextprotocol/sdk/types.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { EventEmitter } from 'events';
import { z } from 'zod';

/**
 * Error codes used by the MCP client
 */
enum ErrorCode {
  /** Invalid parameters provided to a method */
  INVALID_PARAMS = 400,
  /** Internal client or server error */
  INTERNAL_ERROR = 500
}

/**
 * Events emitted by the MCPClient
 * 
 * @example
 * ```typescript
 * const client = new MCPClient('ws://localhost:3000');
 * 
 * // Connection events
 * client.on(MCPClientEvent.CONNECTED, () => {
 *   console.log('Connected to MCP server');
 * });
 * 
 * client.on(MCPClientEvent.DISCONNECTED, () => {
 *   console.log('Disconnected from MCP server');
 * });
 * 
 * // Error handling
 * client.on(MCPClientEvent.ERROR, (error) => {
 *   console.error('MCP client error:', error);
 * });
 * 
 * // Tool execution events
 * client.on(MCPClientEvent.TOOL_CALLED, ({ name, args, result }) => {
 *   console.log(`Tool ${name} called with args:`, args);
 *   console.log('Result:', result);
 * });
 * 
 * // Resource updates
 * client.on(MCPClientEvent.RESOURCE_UPDATED, ({ uri, contents }) => {
 *   console.log(`Resource ${uri} updated:`, contents);
 * });
 * ```
 */
export enum MCPClientEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  MESSAGE = 'message',
  TOOL_CALLED = 'tool_called',
  RESOURCE_UPDATED = 'resource_updated',
  RECONNECTING = 'reconnecting',
  RECONNECTED = 'reconnected',
  SUBSCRIPTION_UPDATED = 'subscription_updated'
}

/**
 * Connection states used by the MCP client
 * @example
 * ```typescript
 * const client = new MCPClient('ws://localhost:3000');
 * 
 * // Check connection state
 * console.log(client.getConnectionState()); // 'disconnected'
 * 
 * // Monitor state changes
 * client.on(MCPClientEvent.CONNECTING, () => {
 *   console.log(client.getConnectionState()); // 'connecting'
 * });
 * 
 * client.on(MCPClientEvent.RECONNECTING, ({ attempt, max }) => {
 *   console.log(`Reconnection attempt ${attempt}/${max}`);
 *   console.log(client.getConnectionState()); // 'reconnecting'
 * });
 * ```
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
  CONNECTED = 'connected'
}

/**
 * Client for connecting to Model Context Protocol (MCP) servers over WebSocket
 * 
 * Features:
 * - Automatic reconnection with configurable attempts
 * - Request timeouts for all operations
 * - Connection state management
 * - Resource subscription handling
 * - Event-based status updates
 * 
 * @example
 * ```typescript
 * const client = new MCPClient('ws://localhost:3000');
 * 
 * // Configure client behavior
 * client.maxReconnectAttempts = 5;     // Default: 3
 * client.reconnectDelay = 10000;       // Default: 5000ms
 * client.defaultTimeout = 60000;       // Default: 30000ms
 * 
 * // Handle connection events
 * client.on(MCPClientEvent.CONNECTING, () => {
 *   console.log('Connecting...');
 * });
 * 
 * client.on(MCPClientEvent.RECONNECTING, ({ attempt, max }) => {
 *   console.log(`Reconnection attempt ${attempt}/${max}`);
 * });
 * 
 * // Handle timeouts
 * try {
 *   await client.callTool('slow-tool', { data: 'test' });
 * } catch (error) {
 *   if (error.message === 'Request timeout') {
 *     console.log('Tool call timed out');
 *   }
 * }
 * 
 * // Resource subscriptions persist through reconnections
 * await client.subscribeToResource('file://example.txt');
 * client.on(MCPClientEvent.SUBSCRIPTION_UPDATED, ({ uri, contents }) => {
 *   console.log(`Resource ${uri} updated:`, contents);
 * });
 * ```
 */
export class MCPClient extends EventEmitter {
  private client: Client;
  private ws: WebSocket;
  private isConnected: boolean = false;
  private reconnectAttempts = 0;
  private _maxReconnectAttempts: number = 3;
  private readonly reconnectDelay = 5000; // 5 seconds
  private subscriptions = new Set<string>();
  private _defaultTimeout: number = 30000; // 30 seconds
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;

  /**
   * Creates a new MCP client instance
   * @param serverUrl WebSocket URL of the MCP server
   * @throws {McpError} If serverUrl is not provided
   */
  constructor(serverUrl: string) {
    super(); // Initialize EventEmitter
    if (!serverUrl) {
      throw new McpError(ErrorCode.INVALID_PARAMS, 'Server URL is required');
    }
    this.ws = new WebSocket(serverUrl);
    this.client = new Client(
      {
        name: 'nexus-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  /**
   * Gets the current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Wraps a promise with a timeout
   * @private
   */
  private async requestWithTimeout<T>(promise: Promise<T>, timeout: number = this._defaultTimeout): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new McpError(ErrorCode.INTERNAL_ERROR, 'Request timeout')), timeout);
    });
    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Establishes connection to the MCP server
   * @throws {McpError} If connection fails or times out
   * @returns Promise that resolves when connection is established
   */
  async connect(): Promise<void> {
    if (this.connectionState === ConnectionState.CONNECTED) return;
    
    this.connectionState = ConnectionState.CONNECTING;

    try {
      await this.requestWithTimeout(new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.emit(MCPClientEvent.ERROR, new McpError(ErrorCode.INTERNAL_ERROR, 'Connection timeout'));
          reject(new McpError(ErrorCode.INTERNAL_ERROR, 'Connection timeout'));
        }, 30000);

        this.ws.on('open', async () => {
          try {
            const transport: Transport = {
              send: async (message) => {
                if (this.ws.readyState !== WebSocket.OPEN) {
                  throw new McpError(ErrorCode.INTERNAL_ERROR, 'WebSocket is not connected');
                }
                this.ws.send(JSON.stringify(message));
              },
              onmessage: (message: any) => {
                this.ws.on('message', (data: Buffer | string) => {
                  try {
                    const parsed = JSON.parse(typeof data === 'string' ? data : data.toString());
                    message(parsed);
                  } catch (error) {
                    throw new McpError(ErrorCode.INTERNAL_ERROR, 'Failed to parse message');
                  }
                });
              },
              onerror: (error: Error) => {
                this.ws.onerror = () => { throw error; };
              },
              onclose: () => {
                this.ws.onclose = () => {};
              },
              close: async () => {
                if (this.ws.readyState === WebSocket.OPEN) {
                  this.ws.close();
                }
              },
              start: async () => {
                // Connection is handled in constructor
                return;
              }
            };

            await this.client.connect(transport);
            this.isConnected = true;
            this.connectionState = ConnectionState.CONNECTED;
            clearTimeout(timeout);
            this.emit(MCPClientEvent.CONNECTED);
            resolve();
          } catch (error) {
            clearTimeout(timeout);
            this.isConnected = false;
            this.emit(MCPClientEvent.ERROR, error);
            reject(error);
          }
        });

        this.ws.on('error', (error) => {
          clearTimeout(timeout);
          this.isConnected = false;
          this.emit(MCPClientEvent.ERROR, error);
          reject(error);
        });

        this.ws.on('close', () => {
          this.isConnected = false;
          this.emit(MCPClientEvent.DISCONNECTED);
        });
      }));

      this.reconnectAttempts = 0; // Reset counter on successful connection
    } catch (error) {
      if (this.reconnectAttempts < this._maxReconnectAttempts) {
        this.reconnectAttempts++;
        return this.reconnect(this.reconnectAttempts);
      }
      throw error;
    }
  }

  /**
   * Lists all available tools from the server
   * @throws {McpError} If client is not connected or request fails
   * @returns Array of available tools with their schemas
   */
  async listTools(): Promise<Tool[]> {
    if (!this.isConnected) {
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Client is not connected');
    }

    try {
      const response = await this.client.request(
        { method: 'tools/list', params: {} },
        ListToolsResultSchema
      );
      return (response as { tools: Tool[] }).tools;
    } catch (error) {
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to list tools: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calls a specific tool with provided arguments
   * @param name Name of the tool to call
   * @param args Arguments to pass to the tool
   * @throws {McpError} If client is not connected, tool doesn't exist, or call fails
   * @returns Result of the tool execution
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    if (!this.isConnected) {
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Client is not connected');
    }

    if (!name) {
      throw new McpError(ErrorCode.INVALID_PARAMS, 'Tool name is required');
    }
    
    try {
      const response = await this.requestWithTimeout(
        this.client.request(
          { method: 'tools/call', params: { name, arguments: args } },
          CallToolResultSchema
        )
      );
      this.emit(MCPClientEvent.TOOL_CALLED, { name, args, result: response });
      return response as CallToolResult;
    } catch (error) {
      this.emit(MCPClientEvent.ERROR, error);
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to call tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Closes the connection to the MCP server
   * @throws {McpError} If closing the connection fails
   */
  async close(): Promise<void> {
    try {
      await this.client.close();
      this.isConnected = false;
      this.emit(MCPClientEvent.DISCONNECTED);
    } catch (error) {
      this.emit(MCPClientEvent.ERROR, error);
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to close client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * List available resources from the MCP server
   * @returns Array of available resources
   * @throws {McpError} If client is not connected or request fails
   */
  async listResources(): Promise<Resource[]> {
    if (!this.isConnected) {
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Client is not connected');
    }

    try {
      const response = await this.client.request(
        { method: 'resources/list', params: {} },
        ListResourcesRequestSchema
      );
      return (response as unknown as { resources: Resource[] }).resources;
    } catch (error) {
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to list resources: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Read content from a specific resource
   * @param uri URI of the resource to read
   * @returns Array of resource contents
   * @throws {McpError} If client is not connected or request fails
   */
  async readResource(uri: string): Promise<ResourceContents[]> {
    if (!this.isConnected) {
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Client is not connected');
    }

    if (!uri) {
      throw new McpError(ErrorCode.INVALID_PARAMS, 'Resource URI is required');
    }

    try {
      const response = await this.client.request(
        { method: 'resources/read', params: { uri } },
        ReadResourceRequestSchema
      );
      return (response as unknown as { contents: ResourceContents[] }).contents;
    } catch (error) {
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to read resource ${uri}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * List available prompts from the MCP server
   * @returns Array of available prompts
   * @throws {McpError} If client is not connected or request fails
   */
  async listPrompts(): Promise<Prompt[]> {
    if (!this.isConnected) {
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Client is not connected');
    }

    try {
      const response = await this.client.request(
        { method: 'prompts/list', params: {} },
        ListPromptsRequestSchema
      );
      return (response as unknown as { prompts: Prompt[] }).prompts;
    } catch (error) {
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to list prompts: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get a specific prompt with optional arguments
   * @param name Name of the prompt to get
   * @param args Optional arguments for the prompt
   * @returns Prompt result containing messages
   * @throws {McpError} If client is not connected or request fails
   */
  async getPrompt(name: string, args?: Record<string, unknown>): Promise<GetPromptResult> {
    if (!this.isConnected) {
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Client is not connected');
    }

    if (!name) {
      throw new McpError(ErrorCode.INVALID_PARAMS, 'Prompt name is required');
    }

    try {
      const response = await this.client.request(
        { 
          method: 'prompts/get',
          params: {
            name,
            arguments: args
          }
        },
        GetPromptRequestSchema
      );
      return response as unknown as GetPromptResult;
    } catch (error) {
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to get prompt ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Attempts to reconnect to the server
   * @param attempt Current attempt number
   * @returns Promise that resolves when reconnected
   * @throws {McpError} If max attempts reached
   */
  public async reconnect(attempt: number = 0): Promise<void> {
    if (attempt >= this._maxReconnectAttempts) {
      this.connectionState = ConnectionState.DISCONNECTED;
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Max reconnection attempts reached');
    }

    this.connectionState = ConnectionState.RECONNECTING;
    this.emit(MCPClientEvent.RECONNECTING, { attempt: attempt + 1, max: this._maxReconnectAttempts });

    try {
      this.ws = new WebSocket(this.ws.url);
      await this.connect();
      this.emit(MCPClientEvent.RECONNECTED);

      // Resubscribe to resources
      const subscriptionArray = Array.from(this.subscriptions);
      for (const uri of subscriptionArray) {
        await this.requestWithTimeout(this.subscribeToResource(uri, false));
      }
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
      return this.reconnect(attempt + 1);
    }
  }

  /**
   * Subscribe to updates for a specific resource
   * @param uri URI of the resource to subscribe to
   * @param track Whether to track this subscription for reconnection
   * @throws {McpError} If client is not connected or subscription fails
   */
  async subscribeToResource(uri: string, track: boolean = true): Promise<void> {
    if (!this.isConnected) {
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Client is not connected');
    }

    if (!uri) {
      throw new McpError(ErrorCode.INVALID_PARAMS, 'Resource URI is required');
    }

    try {
      await this.client.request(
        { method: 'resources/subscribe', params: { uri } },
        ReadResourceRequestSchema
      );

      if (track) {
        this.subscriptions.add(uri);
      }

      // Set up notification handler
      this.client.setNotificationHandler(
        z.object({
          method: z.literal('notifications/resources/updated'),
          params: z.object({
            uri: z.string(),
            contents: z.unknown()
          })
        }),
        async (notification) => {
          const { uri, contents } = notification.params;
          this.emit(MCPClientEvent.SUBSCRIPTION_UPDATED, { uri, contents });
        }
      );

    } catch (error) {
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to subscribe to resource ${uri}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Unsubscribe from updates for a specific resource
   * @param uri URI of the resource to unsubscribe from
   * @throws {McpError} If client is not connected or unsubscription fails
   */
  async unsubscribeFromResource(uri: string): Promise<void> {
    if (!this.isConnected) {
      throw new McpError(ErrorCode.INTERNAL_ERROR, 'Client is not connected');
    }

    if (!uri) {
      throw new McpError(ErrorCode.INVALID_PARAMS, 'Resource URI is required');
    }

    try {
      await this.client.request(
        { method: 'resources/unsubscribe', params: { uri } },
        ReadResourceRequestSchema
      );
      this.subscriptions.delete(uri);
    } catch (error) {
      throw new McpError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to unsubscribe from resource ${uri}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public setTimeout(timeout: number): void {
    this._defaultTimeout = timeout;
  }

  public setRetryAttempts(attempts: number): void {
    this._maxReconnectAttempts = attempts;
  }

  public setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    // Implement logging levels
    switch (level) {
      case 'debug':
        console.debug = console.log;
        break;
      case 'info':
        console.info = console.log;
        break;
      case 'warn':
        console.warn = console.log;
        break;
      case 'error':
        console.error = console.log;
        break;
    }
  }

  get defaultTimeout(): number {
    return this._defaultTimeout;
  }

  get maxReconnectAttempts(): number {
    return this._maxReconnectAttempts;
  }

  public async hasTool(toolName: string): Promise<boolean> {
    try {
      const tools = await this.listTools();
      return tools.some(tool => tool.name === toolName);
    } catch (error) {
      return false;
    }
  }
}

/**
 * Common error scenarios and handling:
 * 
 * 1. Connection Errors:
 *    - Timeout: Occurs when server doesn't respond within 30 seconds
 *    - WebSocket Error: Network or protocol issues
 *    - Server Rejection: Server refuses connection
 * 
 * 2. Request Errors:
 *    - Invalid Parameters: Missing or incorrect arguments
 *    - Not Connected: Attempting operations before connecting
 *    - Tool/Resource Not Found: Requested item doesn't exist
 * 
 * 3. Response Errors:
 *    - Parse Error: Invalid JSON in response
 *    - Schema Validation: Response doesn't match expected format
 *    - Tool Execution: Tool-specific execution errors
 * 
 * All errors are wrapped in McpError with appropriate error codes
 */