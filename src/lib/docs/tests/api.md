# API Documentation

## src\app\api\conversations\route.ts

### POST



**Type:** route

**Signature:** `POST(req: Request)`

### GET



**Type:** route

**Signature:** `GET(req: Request)`

## src\app\api\conversations\[conversationId]\messages\route.ts

### POST



**Type:** route

**Signature:** `POST(req: Request, { params }: { params: { conversationId: string } })`

## src\app\api\conversations\[conversationId]\route.ts

### GET



**Type:** route

**Signature:** `GET(req: Request, { params }: { params: { conversationId: string } })`

### PATCH



**Type:** route

**Signature:** `PATCH(req: Request, { params }: { params: { conversationId: string } })`

### DELETE



**Type:** route

**Signature:** `DELETE(req: Request, { params }: { params: { conversationId: string } })`

## src\app\api\layers\route.ts

### GET



**Type:** route

**Signature:** `GET(req: Request)`

## src\app\api\marketplace\route.ts

### GET



**Type:** route

**Signature:** `GET(req: Request)`

### POST



**Type:** route

**Signature:** `POST(req: Request)`

## src\app\api\search\route.ts

### GET



**Type:** route

**Signature:** `GET(req: Request)`

## src\app\api\settings\route.ts

### GET



**Type:** route

**Signature:** `GET()`

### PATCH



**Type:** route

**Signature:** `PATCH(req: Request)`

## src\app\api\stats\route.ts

### GET



**Type:** route

**Signature:** `GET()`

## src\app\api\tools\route.ts

### GET

// Get all enabled tools for the user

**Type:** route

**Signature:** `GET()`

## src\app\api\user\profile\route.ts

### GET



**Type:** route

**Signature:** `GET()`

### PATCH



**Type:** route

**Signature:** `PATCH(req: Request)`

## src\app\api\ws\route.ts

### GET

// Move health check inside the request handler

**Type:** route

**Signature:** `GET(req: Request)`

## src\app\globals.css

### globals

Stylesheet

**Type:** style

## src\app\layout.tsx

### RootLayout



**Type:** function

**Signature:** `RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)`

## src\app\page.tsx

### Home



**Type:** function

**Signature:** `Home()`

## src\components\auth\Protected.tsx

### Protected



**Type:** component

**Signature:** `Protected({ children, permissions = [] }: ProtectedProps)`

## src\components\layers\marketplace.tsx

### LayerMarketplace



**Type:** component

**Signature:** `LayerMarketplace()`

## src\components\ui\badge.tsx

### BadgeProps



**Type:** component

## src\components\ui\button.tsx

### ButtonProps



**Type:** component

## src\components\ui\calendar.tsx

### CalendarProps



**Type:** component

## src\components\ui\chart.tsx

### ChartConfig



**Type:** component

## src\components\ui\toaster.tsx

### Toaster



**Type:** component

**Signature:** `Toaster()`

## src\hooks\use-mobile.tsx

### useIsMobile



**Type:** hook

**Signature:** `useIsMobile()`

## src\hooks\useSession.ts

### useSession



**Type:** hook

**Signature:** `useSession({ required = true }: any)`

## src\lib\db\utils.ts

### createConversation



**Type:** function

**Signature:** `createConversation(userId: string, title: string)`

### addMessageToConversation



**Type:** function

**Signature:** `addMessageToConversation(conversationId: string, content: string, role: string, toolCalls: Array<{
    name: string;
    args: Prisma.InputJsonValue;
    result?: Prisma.InputJsonValue;
    status: string;
    error?: string;
  }>, resources: Array<{
    uri: string;
    content: string;
    mimeType?: string;
    metadata?: Prisma.InputJsonValue;
  }>)`

### getUserSettings



**Type:** function

**Signature:** `getUserSettings(userId: string)`

## src\lib\docs\api\api.md

### api

API Documentation

**Type:** documentation

## src\lib\docs\api\integration.md

### integration

Integration Points

**Type:** documentation

## src\lib\docs\api\validation.md

### validation

Validation Rules

**Type:** documentation

## src\lib\docs\components\api.md

### api

API Documentation

**Type:** documentation

## src\lib\docs\components\validation.md

### validation

Validation Rules

**Type:** documentation

## src\lib\docs\db\api.md

### api

API Documentation

**Type:** documentation

## src\lib\docs\db\validation.md

### validation

Validation Rules

**Type:** documentation

## src\lib\docs\hooks\api.md

### api

API Documentation

**Type:** documentation

## src\lib\docs\hooks\validation.md

### validation

Validation Rules

**Type:** documentation

## src\lib\docs\mcp\api.md

### api

API Documentation

**Type:** documentation

## src\lib\docs\mcp\integration.md

### integration

Integration Points

**Type:** documentation

## src\lib\docs\mcp\types.md

### types

Type Definitions

**Type:** documentation

## src\lib\docs\mcp\validation.md

### validation

Validation Rules

**Type:** documentation

## src\lib\docs\models\api.md

### api

API Documentation

**Type:** documentation

## src\lib\docs\models\types.md

### types

Type Definitions

**Type:** documentation

## src\lib\docs\models\validation.md

### validation

Validation Rules

**Type:** documentation

## src\lib\docs\pages\api.md

### api

API Documentation

**Type:** documentation

## src\lib\docs\pages\integration.md

### integration

Integration Points

**Type:** documentation

## src\lib\docs\pages\validation.md

### validation

Validation Rules

**Type:** documentation

## src\lib\docs\prisma\api.md

### api

API Documentation

**Type:** documentation

## src\lib\docs\prisma\types.md

### types

Type Definitions

**Type:** documentation

## src\lib\docs\prisma\validation.md

### validation

Validation Rules

**Type:** documentation

## src\lib\mcp\cli\commands.ts

### setupCLI



**Type:** function

**Signature:** `setupCLI(): Command`

## src\lib\mcp\client.ts

### MCPClient

Client for connecting to Model Context Protocol (MCP) servers over WebSocket

**Type:** class

**Members:**
- `getConnectionState(): ConnectionState` - Gets the current connection state
- `requestWithTimeout(promise: Promise<T>, timeout: number): Promise<T>` - Wraps a promise with a timeout
- `connect(): Promise<void>` - Establishes connection to the MCP server
- `listTools(): Promise<Tool[]>` - Lists all available tools from the server
- `callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult>` - Calls a specific tool with provided arguments
- `close(): Promise<void>` - Closes the connection to the MCP server
- `listResources(): Promise<Resource[]>` - List available resources from the MCP server
- `readResource(uri: string): Promise<ResourceContents[]>` - Read content from a specific resource
- `listPrompts(): Promise<Prompt[]>` - List available prompts from the MCP server
- `getPrompt(name: string, args: Record<string, unknown>): Promise<GetPromptResult>` - Get a specific prompt with optional arguments
- `reconnect(attempt: number): Promise<void>` - Attempts to reconnect to the server
- `subscribeToResource(uri: string, track: boolean): Promise<void>` - Subscribe to updates for a specific resource
- `unsubscribeFromResource(uri: string): Promise<void>` - Unsubscribe from updates for a specific resource
- `setTimeout(timeout: number): void`
- `setRetryAttempts(attempts: number): void`
- `setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void`
- `hasTool(toolName: string): Promise<boolean>`

**Example:**
```typescript
```typescript
  const client = new MCPClient('ws://localhost:3000');
  
  // Configure client behavior
  client.maxReconnectAttempts = 5;     // Default: 3
  client.reconnectDelay = 10000;       // Default: 5000ms
  client.defaultTimeout = 60000;       // Default: 30000ms
  
  // Handle connection events
  client.on(MCPClientEvent.CONNECTING, () => {
    console.log('Connecting...');
  });
  
  client.on(MCPClientEvent.RECONNECTING, ({ attempt, max }) => {
    console.log(`Reconnection attempt ${attempt}/${max}`);
  });
  
  // Handle timeouts
  try {
    await client.callTool('slow-tool', { data: 'test' });
  } catch (error) {
    if (error.message === 'Request timeout') {
      console.log('Tool call timed out');
    }
  }
  
  // Resource subscriptions persist through reconnections
  await client.subscribeToResource('file://example.txt');
  client.on(MCPClientEvent.SUBSCRIPTION_UPDATED, ({ uri, contents }) => {
    console.log(`Resource ${uri} updated:`, contents);
  });
  ```
```

## src\lib\mcp\config\layer.ts

### LayerConfiguration



**Type:** config

## src\lib\mcp\config\universal.ts

### UniversalMCPConfig



**Type:** config

## src\lib\mcp\errors.ts

### LayerError

Base error class for MCP layer operations

**Type:** class

**Members:**
- `toJSON(): Record<string, unknown>` - Creates a formatted error message including metadata

### LayerDatabaseError



**Type:** class

## src\lib\mcp\events\bus.ts

### LayerEvent



**Type:** interface

### LayerEventBus

Central event bus for layer-related events

**Type:** class

**Members:**
- `getInstance(): LayerEventBus`
- `emitLayerEvent(event: LayerEvent): void` - Emits a layer event
- `onLayerEvent(type: LayerEventType, handler: (event: LayerEvent) => void): void` - Subscribes to layer events

## src\lib\mcp\integration\layer-server.ts

### LayerServer



**Type:** class

**Members:**
- `registerWithMCP(mcpClient: MCPClient): Promise<void>`

## src\lib\mcp\integration\manager.ts

### LayerIntegrationManager

Manages integration between MCP.layers and MCP servers

**Type:** class

**Members:**
- `integrateLayer(layerId: string, serverId: string, context: LayerContext): Promise<void>` - Integrates a layer with an MCP server
- `validateCompatibility(metadata: LayerMetadata, server: MCPClientExtended): Promise<void>` - Validates layer compatibility with server
- `registerLayerTools(layer: Layer, server: MCPClientExtended): Promise<void>` - Registers layer tools with server

## src\lib\mcp\layers\manager.ts

### LayerManager

Manages MCP layer lifecycle and operations

**Type:** class

**Members:**
- `initialize()`
- `loadMarketplace()`
- `listAvailableLayers(filters: {
    category?: string;
    tags?: string[];
    priceRange?: { min: number; max: number };
  }): Promise<LayerMetadata[]>`
- `purchaseLayer(layerId: string, userId: string): Promise<void>`
- `installLayer(layerId: string, userId: string): Promise<void>`
- `getLayerMetrics(layerId: string): Promise<LayerRuntime>`
- `cleanup()`
- `getClient(layerId: string): MCPClient | undefined`
- `executeTool(layerId: string, toolName: string, args: Record<string, unknown>): Promise<unknown>`
- `getLayer(layerId: string): Promise<Layer | null>` - Gets a layer by ID with full validation
- `convertToLayer(prismaLayer: RawLayerQueryResult): Layer` - Converts a raw layer query result into a validated Layer object
- `validateMetadata(metadata: unknown): LayerMetadata`
- `validateConfig(config: unknown): LayerConfig`
- `validateRuntime(runtime: LayerRuntimeType): LayerRuntime`
- `validateTool(data: unknown): Tool`
- `validateTools(tools: unknown[]): Tool[]`
- `validateResource(data: unknown): Resource`
- `validateResources(resources: unknown[]): Resource[]`
- `validatePrompt(data: unknown): Prompt`
- `validatePrompts(prompts: unknown[]): Prompt[]`
- `updateLayerState(layerId: string, state: Record<string, unknown>): Promise<void>`
- `addCollaborator(layerId: string, userId: string, role: string, permissions: string[]): Promise<void>`
- `deployLayer(layerId: string, environment: string, version: string, config: Record<string, unknown>): Promise<void>`
- `createAuditLog(layerId: string, userId: string, action: string, details: Record<string, unknown>): Promise<void>`
- `getCollaborators(layerId: string): Promise<LayerCollaborator[]>`
- `updateCollaborator(layerId: string, userId: string, updates: {
      role?: string;
      permissions?: string[];
    }): Promise<void>`
- `removeCollaborator(layerId: string, userId: string): Promise<void>`
- `getDeployments(layerId: string): Promise<LayerDeployment[]>`
- `rollbackDeployment(layerId: string, deploymentId: string): Promise<void>`
- `getActiveLayers(): Promise<Layer[]>`
- `validateCode(code: string): string` - Validates layer code content
- `validateParameters(parameters: unknown): LayerParameters` - Validates layer parameters
- `isValidLayer(layer: unknown): layer is Layer` - Runtime type guard for Layer interface
- `validateLayerRuntime(layer: unknown): void` - Performs runtime validation of a Layer object

**Example:**
```typescript
```typescript
  const manager = new LayerManager();
  
  // Install a layer
  await manager.installLayer('layer-id', 'user-id');
  
  // Execute a tool
  const result = await manager.executeTool('layer-id', 'tool-name', args);
  ```
```

## src\lib\mcp\layers\marketplace.ts

### LayerPackage

Represents a package in the MCP layer marketplace

**Type:** interface

### LayerMarketplace

Manages the MCP layer marketplace functionality

**Type:** class

**Members:**
- `getInstance(): LayerMarketplace` - Gets the singleton instance of LayerMarketplace
- `searchLayers(query: string): Promise<LayerPackage[]>` - Searches for layers in the marketplace
- `installLayer(packageId: string): Promise<void>` - Installs a layer from the marketplace
- `addPackage(pkg: LayerPackage): Promise<void>` - Adds a new package to the marketplace

## src\lib\mcp\layers\orchestrator.ts

### LayerOrchestrator



**Type:** class

**Members:**
- `startLayer(layerId: string, userId: string): Promise<void>`
- `ensureLayerRunning(layerId: string, userId: string): Promise<void>`
- `findLayerForTool(toolName: string): Promise<ActiveLayer>`
- `routeRequest(toolName: string, args: Record<string, unknown>): Promise<unknown>`
- `cleanup(): Promise<void>`

## src\lib\mcp\layers\registry.ts

### LayerRegistry



**Type:** interface

### UniversalMCPRegistry



**Type:** class

**Members:**
- `getInstance(): UniversalMCPRegistry`
- `registerLayer(manifest: LayerRegistry): Promise<void>`
- `validateLayer(manifest: LayerRegistry): Promise<void>`
- `getLayer(id: string): Promise<LayerRegistry>`
- `getLayerByTool(toolName: string): Promise<LayerRegistry | undefined>`
- `listLayers(filters: {
    category?: string;
    tags?: string[];
  }): Promise<LayerRegistry[]>` - // Add methods for layer marketplace

## src\lib\mcp\layers\sandbox.ts

### LayerSandbox



**Type:** class

**Members:**
- `executeLayer(layerId: string, code: string, runtime: LayerRuntimeType, args: Record<string, unknown>): Promise<unknown>`
- `executeInEdge(code: string, args: Record<string, unknown>): Promise<unknown>`
- `executeInDocker(layerId: string, code: string, args: Record<string, unknown>): Promise<unknown>`

## src\lib\mcp\layers\types.ts

### LayerMetadata



**Type:** interface

### LayerConfig



**Type:** interface

### LayerRuntime



**Type:** interface

### LayerCapabilities



**Type:** interface

### LayerMetrics



**Type:** interface

### Layer



**Type:** interface

## src\lib\mcp\manager.ts

### MCPManager



**Type:** class

**Members:**
- `connectToServer(config: MCPServerConfig)`
- `applyInitOptions(client: MCPClient, options: ServerInitOptions)`
- `startHealthMonitoring(serverName: string, options: ServerHealthCheck)`
- `attemptRecovery(serverName: string)`
- `getServerHealth(serverName: string): Promise<Map<string, ServerHealth>>`
- `disconnectAll()`
- `getClient(name: string)`
- `getConnectedCount(): number`
- `getClients(): Map<string, MCPClient>`
- `findClientForTool(toolName: string): MCPClient | undefined` - // Find the appropriate client for a given tool
- `getToolsByCategory(category: string): Promise<Tool[]>` - // Get all tools by category
- `cleanup()`
- `getServer(serverId: string): MCPClient | undefined`

## src\lib\mcp\marketplace\index.ts

### LayerMarketplace

MCP Layer Marketplace

**Type:** class

**Members:**
- `searchLayers(query: string): Promise<MarketplaceLayer[]>`
- `installLayer(layerId: string, userId: string): Promise<void>`
- `purchaseLayer(layerId: string, userId: string): Promise<void>`

**Example:**
```typescript
```typescript
  const marketplace = new LayerMarketplace();
  
  // Search for layers
  const layers = await marketplace.searchLayers('database');
  
  // Purchase a layer
  await marketplace.purchaseLayer(layerId, userId);
  
  // Install a layer
  await marketplace.installLayer(layerId, userId);
  ```
```

## src\lib\mcp\metrics\tracker.ts

### LayerMetrics

Metrics collected for layer operations

**Type:** interface

### MetricsTracker

Tracks and manages layer performance metrics

**Type:** class

**Members:**
- `getInstance(): MetricsTracker`
- `recordRequest(layerId: string, success: boolean, latencyMs: number): void` - Records a request metric for a layer
- `recordResourceUsage(layerId: string, cpu: number, memory: number, disk: number): void` - Records resource usage for a layer
- `recordError(layerId: string, errorType: string): void` - Records an error occurrence for a layer
- `getMetrics(layerId: string): LayerMetrics | undefined` - Gets metrics for a specific layer
- `getOrCreateMetrics(layerId: string): LayerMetrics`

## src\lib\mcp\middleware\validation.ts

### validateBody

Validates request body against a schema

**Type:** middleware

**Signature:** `validateBody(schema: z.ZodSchema<T>)`

## src\lib\mcp\sandbox\manager.ts

### SandboxManager



**Type:** class

**Members:**
- `executeLayer(layerId: string, context: LayerContext, inputs: Record<string, unknown>): Promise<unknown>`
- `executeEdgeFunction(entry: string, inputs: Record<string, unknown>): Promise<unknown>`
- `executeDockerContainer(context: LayerContext, inputs: Record<string, unknown>): Promise<unknown>`
- `executeNodeScript(context: LayerContext, inputs: Record<string, unknown>): Promise<unknown>`

## src\lib\mcp\server.ts

### NexusMCPServer



**Type:** class

**Members:**
- `initializeTools()`
- `initializePrompts()`
- `initializeResources()`
- `setupHandlers()`
- `notifyResourceUpdate(subscriberId: string, uri: string, contents: ResourceContents[])`
- `executeTool(name: string, args: Record<string, unknown>): Promise<CallToolResult>`
- `readResource(uri: string)`
- `getPrompt(name: string, args: Record<string, unknown>): Promise<GetPromptResult>`
- `searchConversations({ query, type }: { query: string; type: string }): Promise<CallToolResult>`
- `getConversation({ conversationId }: { conversationId: string }): Promise<CallToolResult>`
- `analyzeConversation({ conversationId, analysisType }: { 
    conversationId: string; 
    analysisType: string 
  }): Promise<CallToolResult>` - // New tool implementations
- `extractKnowledge({ conversationId, format }: {
    conversationId: string;
    format: string;
  }): Promise<CallToolResult>`
- `createSummary({ conversationId, style }: {
    conversationId: string;
    style: string;
  }): Promise<CallToolResult>` - // Add missing tool implementations
- `manageResources({ action, resourceUri, metadata }: {
    action: string;
    resourceUri: string;
    metadata?: Record<string, unknown>;
  }): Promise<CallToolResult>`
- `start()` - // ... rest of the class implementation ...

## src\lib\mcp\storage\state.ts

### LayerStateManager

Manages persistent state for layers

**Type:** class

**Members:**
- `getInstance(): LayerStateManager`
- `saveState(layerId: string, state: Record<string, unknown>): Promise<void>` - Saves layer state to database
- `loadState(layerId: string): Promise<Record<string, unknown>>` - Loads layer state from database

## src\lib\mcp\sync\state.ts

### LayerStateSync

Manages state synchronization between layers and servers

**Type:** class

**Members:**
- `syncLayerState(layerId: string, serverId: string): Promise<void>` - Synchronizes layer state with server
- `getLayerState(layerId: string): Promise<Record<string, unknown>>` - Gets layer state from database
- `getServerState(serverId: string): Promise<Record<string, unknown>>` - Gets server state
- `mergeStates(layerState: Record<string, unknown>, serverState: Record<string, unknown>): Record<string, unknown>` - Merges layer and server states
- `updateLayerState(layerId: string, state: Record<string, unknown>): Promise<void>`
- `updateServerState(serverId: string, state: Record<string, unknown>): Promise<void>`

## src\lib\mcp\types\client.ts

### MCPClientExtended



**Type:** interface

### ToolRegistration



**Type:** interface

## src\lib\mcp\types\layer-types.ts

### LayerCollaborator

// Layer collaboration interfaces

**Type:** interface

### LayerDeployment



**Type:** interface

### LayerAuditLog



**Type:** interface

## src\lib\mcp\types\layer.ts

### LayerRuntimeType

// Runtime Types

**Type:** type

### LayerRuntimeStatus



**Type:** type

### LayerParameters

// Core Layer Types

**Type:** interface

### Layer



**Type:** interface

### LayerMetadata



**Type:** interface

### LayerMetrics

// Shared Types

**Type:** interface

### LayerResources



**Type:** interface

### LayerPrice



**Type:** interface

### LayerCategory



**Type:** type

### LayerConfig



**Type:** interface

### LayerProcess

// Process Types

**Type:** interface

### LayerCollaborator

// Collaboration Types

**Type:** interface

### LayerDeployment

// Deployment Types

**Type:** interface

### LayerAuditLog

// Audit Types

**Type:** interface

### LayerRuntime



**Type:** interface

## src\lib\mcp\types\prisma.ts

### LayerWithUser

// Define our extended Prisma types

**Type:** type

### LayerWithPurchases



**Type:** type

### RawLayerQueryResult

// Define raw query result types

**Type:** interface

## src\lib\mcp\types\server.ts

### ServerCapability



**Type:** interface

### ServerHealth



**Type:** interface

### ServerConfig



**Type:** interface

### ServerInitOptions



**Type:** interface

### ServerHealthCheck



**Type:** interface

### MCPTool



**Type:** interface

### MCPServer



**Type:** interface

### MCPClient



**Type:** interface

## src\lib\mcp\types\validation.ts

### ValidationSchemas



**Type:** type

## src\lib\mcp\utils\errors.ts

### withErrorHandling

Wraps async operations with consistent error handling

**Type:** util

**Signature:** `withErrorHandling(operation: () => Promise<T>, context: string, errorCode: LayerErrorCode): Promise<T>`

### validateInput

Validates input against a schema with error handling

**Type:** util

**Signature:** `validateInput(input: unknown, schema: z.ZodSchema<T>, context: string): T`

## src\lib\mcp\utils\logger.ts

### Logger



**Type:** util

**Members:**
- `getInstance(): Logger`
- `setLevel(level: LogLevel): void`
- `debug(message: string, args: unknown[]): void`
- `info(message: string, args: unknown[]): void`
- `warn(message: string, args: unknown[]): void`
- `error(message: string, error: Error, args: unknown[]): void`
- `shouldLog(level: LogLevel): boolean`

## src\lib\mcp\validation\config.ts

### validateLayerConfig

Validates layer configuration

**Type:** function

**Signature:** `validateLayerConfig(config: unknown): void`

## src\lib\mcp\workflow\chain.ts

### LayerChain



**Type:** class

**Members:**
- `execute(steps: WorkflowStep[]): Promise<unknown[]>`
- `interpolateArgs(args: Record<string, unknown>, previousResult: unknown): Record<string, unknown>`

## src\lib\models\index.ts

### ModelResponse



**Type:** interface

### ModelClient



**Type:** class

**Members:**
- `generateResponse(messages: ReadonlyArray<MessageParam>, tools: ReadonlyArray<MCPTool>, options: Readonly<ModelOptions>): Promise<ModelResponse>`
- `processResponse(response: Readonly<Message>): ModelResponse`

## src\lib\session.ts

### getCurrentUser

Get the current user from session

**Type:** function

**Signature:** `getCurrentUser()`

### verifyPermissions

Verify user has required permissions

**Type:** function

**Signature:** `verifyPermissions(requiredPermissions: string[])`

## src\lib\tools\tsconfig.docs.json

### tsconfig.docs

Configuration file

**Type:** config

## src\lib\utils.ts

### cn



**Type:** function

**Signature:** `cn(inputs: ClassValue[])`

## src\middleware.ts

### middleware



**Type:** function

**Signature:** `middleware(request: NextRequest)`