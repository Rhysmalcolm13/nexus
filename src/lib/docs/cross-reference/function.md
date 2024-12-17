# Functions


## MCP

### `setupCLI` (src\lib\mcp\cli\commands.ts)


**Signature:** `setupCLI(): Command`

### `validateLayerConfig` (src\lib\mcp\validation\config.ts)
Validates layer configuration

**Signature:** `validateLayerConfig(config: unknown): void`


## PAGES

### `RootLayout` (src\app\layout.tsx)


**Signature:** `RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)`

### `Home` (src\app\page.tsx)


**Signature:** `Home()`


## PRISMA

### `main` (prisma\seed.ts)


**Signature:** `main()`


## DB

### `createConversation` (src\lib\db\utils.ts)


**Signature:** `createConversation(userId: string, title: string)`

### `addMessageToConversation` (src\lib\db\utils.ts)


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

### `getUserSettings` (src\lib\db\utils.ts)


**Signature:** `getUserSettings(userId: string)`


## TESTS

### `RootLayout` (src\app\layout.tsx)


**Signature:** `RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)`

### `Home` (src\app\page.tsx)


**Signature:** `Home()`

### `createConversation` (src\lib\db\utils.ts)


**Signature:** `createConversation(userId: string, title: string)`

### `addMessageToConversation` (src\lib\db\utils.ts)


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

### `getUserSettings` (src\lib\db\utils.ts)


**Signature:** `getUserSettings(userId: string)`

### `setupCLI` (src\lib\mcp\cli\commands.ts)


**Signature:** `setupCLI(): Command`

### `validateLayerConfig` (src\lib\mcp\validation\config.ts)
Validates layer configuration

**Signature:** `validateLayerConfig(config: unknown): void`

### `getCurrentUser` (src\lib\session.ts)
Get the current user from session

**Signature:** `getCurrentUser()`

### `verifyPermissions` (src\lib\session.ts)
Verify user has required permissions

**Signature:** `verifyPermissions(requiredPermissions: string[])`

### `cn` (src\lib\utils.ts)


**Signature:** `cn(inputs: ClassValue[])`

### `middleware` (src\middleware.ts)


**Signature:** `middleware(request: NextRequest)`