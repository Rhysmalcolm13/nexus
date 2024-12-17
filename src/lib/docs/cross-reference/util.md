# Utils


## MCP

### `withErrorHandling` (src\lib\mcp\utils\errors.ts)
Wraps async operations with consistent error handling

**Signature:** `withErrorHandling(operation: () => Promise<T>, context: string, errorCode: LayerErrorCode): Promise<T>`

### `validateInput` (src\lib\mcp\utils\errors.ts)
Validates input against a schema with error handling

**Signature:** `validateInput(input: unknown, schema: z.ZodSchema<T>, context: string): T`

### `LogLevel` (src\lib\mcp\utils\logger.ts)


### `Logger` (src\lib\mcp\utils\logger.ts)



## TESTS

### `withErrorHandling` (src\lib\mcp\utils\errors.ts)
Wraps async operations with consistent error handling

**Signature:** `withErrorHandling(operation: () => Promise<T>, context: string, errorCode: LayerErrorCode): Promise<T>`

### `validateInput` (src\lib\mcp\utils\errors.ts)
Validates input against a schema with error handling

**Signature:** `validateInput(input: unknown, schema: z.ZodSchema<T>, context: string): T`

### `LogLevel` (src\lib\mcp\utils\logger.ts)


### `Logger` (src\lib\mcp\utils\logger.ts)
