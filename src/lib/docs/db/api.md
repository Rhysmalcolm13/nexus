# API Documentation

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