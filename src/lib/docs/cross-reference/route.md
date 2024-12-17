# Routes


## API

### `POST` (src\app\api\conversations\route.ts)


**Signature:** `POST(req: Request)`

### `GET` (src\app\api\conversations\route.ts)


**Signature:** `GET(req: Request)`

### `POST` (src\app\api\conversations\[conversationId]\messages\route.ts)


**Signature:** `POST(req: Request, { params }: { params: { conversationId: string } })`

### `GET` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `GET(req: Request, { params }: { params: { conversationId: string } })`

### `PATCH` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `PATCH(req: Request, { params }: { params: { conversationId: string } })`

### `DELETE` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `DELETE(req: Request, { params }: { params: { conversationId: string } })`

### `GET` (src\app\api\layers\route.ts)


**Signature:** `GET(req: Request)`

### `GET` (src\app\api\marketplace\route.ts)


**Signature:** `GET(req: Request)`

### `POST` (src\app\api\marketplace\route.ts)


**Signature:** `POST(req: Request)`

### `GET` (src\app\api\search\route.ts)


**Signature:** `GET(req: Request)`

### `GET` (src\app\api\settings\route.ts)


**Signature:** `GET()`

### `PATCH` (src\app\api\settings\route.ts)


**Signature:** `PATCH(req: Request)`

### `GET` (src\app\api\stats\route.ts)


**Signature:** `GET()`

### `GET` (src\app\api\tools\route.ts)
// Get all enabled tools for the user

**Signature:** `GET()`

### `GET` (src\app\api\user\profile\route.ts)


**Signature:** `GET()`

### `PATCH` (src\app\api\user\profile\route.ts)


**Signature:** `PATCH(req: Request)`

### `CustomSession` (src\app\api\ws\route.ts)
// Add interface to extend Session type

### `CustomServer` (src\app\api\ws\route.ts)


### `UserContext` (src\app\api\ws\route.ts)


### `WSMessage` (src\app\api\ws\route.ts)


### `WSResponse` (src\app\api\ws\route.ts)


### `sendWSResponse` (src\app\api\ws\route.ts)


**Signature:** `sendWSResponse(ws: WebSocket, response: WSResponse): void`

### `GET` (src\app\api\ws\route.ts)
// Move health check inside the request handler

**Signature:** `GET(req: Request)`

### `handleToolCall` (src\app\api\ws\route.ts)


**Signature:** `handleToolCall(message: WSMessage, userContext: UserContext, ws: WebSocket): Promise<void>`

### `handleListTools` (src\app\api\ws\route.ts)


**Signature:** `handleListTools(userContext: UserContext, ws: WebSocket): Promise<void>`

### `findClientForTool` (src\app\api\ws\route.ts)
// Helper functions

**Signature:** `findClientForTool(toolName: string): MCPClient | undefined`

### `getAllAvailableTools` (src\app\api\ws\route.ts)


**Signature:** `getAllAvailableTools(): Promise<Tool[]>`


## PAGES

### `POST` (src\app\api\conversations\route.ts)


**Signature:** `POST(req: Request)`

### `GET` (src\app\api\conversations\route.ts)


**Signature:** `GET(req: Request)`

### `POST` (src\app\api\conversations\[conversationId]\messages\route.ts)


**Signature:** `POST(req: Request, { params }: { params: { conversationId: string } })`

### `GET` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `GET(req: Request, { params }: { params: { conversationId: string } })`

### `PATCH` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `PATCH(req: Request, { params }: { params: { conversationId: string } })`

### `DELETE` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `DELETE(req: Request, { params }: { params: { conversationId: string } })`

### `GET` (src\app\api\layers\route.ts)


**Signature:** `GET(req: Request)`

### `GET` (src\app\api\marketplace\route.ts)


**Signature:** `GET(req: Request)`

### `POST` (src\app\api\marketplace\route.ts)


**Signature:** `POST(req: Request)`

### `GET` (src\app\api\search\route.ts)


**Signature:** `GET(req: Request)`

### `GET` (src\app\api\settings\route.ts)


**Signature:** `GET()`

### `PATCH` (src\app\api\settings\route.ts)


**Signature:** `PATCH(req: Request)`

### `GET` (src\app\api\stats\route.ts)


**Signature:** `GET()`

### `GET` (src\app\api\tools\route.ts)
// Get all enabled tools for the user

**Signature:** `GET()`

### `GET` (src\app\api\user\profile\route.ts)


**Signature:** `GET()`

### `PATCH` (src\app\api\user\profile\route.ts)


**Signature:** `PATCH(req: Request)`

### `CustomSession` (src\app\api\ws\route.ts)
// Add interface to extend Session type

### `CustomServer` (src\app\api\ws\route.ts)


### `UserContext` (src\app\api\ws\route.ts)


### `WSMessage` (src\app\api\ws\route.ts)


### `WSResponse` (src\app\api\ws\route.ts)


### `sendWSResponse` (src\app\api\ws\route.ts)


**Signature:** `sendWSResponse(ws: WebSocket, response: WSResponse): void`

### `GET` (src\app\api\ws\route.ts)
// Move health check inside the request handler

**Signature:** `GET(req: Request)`

### `handleToolCall` (src\app\api\ws\route.ts)


**Signature:** `handleToolCall(message: WSMessage, userContext: UserContext, ws: WebSocket): Promise<void>`

### `handleListTools` (src\app\api\ws\route.ts)


**Signature:** `handleListTools(userContext: UserContext, ws: WebSocket): Promise<void>`

### `findClientForTool` (src\app\api\ws\route.ts)
// Helper functions

**Signature:** `findClientForTool(toolName: string): MCPClient | undefined`

### `getAllAvailableTools` (src\app\api\ws\route.ts)


**Signature:** `getAllAvailableTools(): Promise<Tool[]>`


## TESTS

### `POST` (src\app\api\conversations\route.ts)


**Signature:** `POST(req: Request)`

### `GET` (src\app\api\conversations\route.ts)


**Signature:** `GET(req: Request)`

### `POST` (src\app\api\conversations\[conversationId]\messages\route.ts)


**Signature:** `POST(req: Request, { params }: { params: { conversationId: string } })`

### `GET` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `GET(req: Request, { params }: { params: { conversationId: string } })`

### `PATCH` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `PATCH(req: Request, { params }: { params: { conversationId: string } })`

### `DELETE` (src\app\api\conversations\[conversationId]\route.ts)


**Signature:** `DELETE(req: Request, { params }: { params: { conversationId: string } })`

### `GET` (src\app\api\layers\route.ts)


**Signature:** `GET(req: Request)`

### `GET` (src\app\api\marketplace\route.ts)


**Signature:** `GET(req: Request)`

### `POST` (src\app\api\marketplace\route.ts)


**Signature:** `POST(req: Request)`

### `GET` (src\app\api\search\route.ts)


**Signature:** `GET(req: Request)`

### `GET` (src\app\api\settings\route.ts)


**Signature:** `GET()`

### `PATCH` (src\app\api\settings\route.ts)


**Signature:** `PATCH(req: Request)`

### `GET` (src\app\api\stats\route.ts)


**Signature:** `GET()`

### `GET` (src\app\api\tools\route.ts)
// Get all enabled tools for the user

**Signature:** `GET()`

### `GET` (src\app\api\user\profile\route.ts)


**Signature:** `GET()`

### `PATCH` (src\app\api\user\profile\route.ts)


**Signature:** `PATCH(req: Request)`

### `CustomSession` (src\app\api\ws\route.ts)
// Add interface to extend Session type

### `CustomServer` (src\app\api\ws\route.ts)


### `UserContext` (src\app\api\ws\route.ts)


### `WSMessage` (src\app\api\ws\route.ts)


### `WSResponse` (src\app\api\ws\route.ts)


### `sendWSResponse` (src\app\api\ws\route.ts)


**Signature:** `sendWSResponse(ws: WebSocket, response: WSResponse): void`

### `GET` (src\app\api\ws\route.ts)
// Move health check inside the request handler

**Signature:** `GET(req: Request)`

### `handleToolCall` (src\app\api\ws\route.ts)


**Signature:** `handleToolCall(message: WSMessage, userContext: UserContext, ws: WebSocket): Promise<void>`

### `handleListTools` (src\app\api\ws\route.ts)


**Signature:** `handleListTools(userContext: UserContext, ws: WebSocket): Promise<void>`

### `findClientForTool` (src\app\api\ws\route.ts)
// Helper functions

**Signature:** `findClientForTool(toolName: string): MCPClient | undefined`

### `getAllAvailableTools` (src\app\api\ws\route.ts)


**Signature:** `getAllAvailableTools(): Promise<Tool[]>`