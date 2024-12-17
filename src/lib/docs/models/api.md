# API Documentation

## src\lib\models\index.ts

### ModelResponse



**Type:** interface

### ModelClient



**Type:** class

**Members:**
- `generateResponse(messages: ReadonlyArray<MessageParam>, tools: ReadonlyArray<MCPTool>, options: Readonly<ModelOptions>): Promise<ModelResponse>`
- `processResponse(response: Readonly<Message>): ModelResponse`