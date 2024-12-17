-- Conversation Performance
CREATE INDEX IF NOT EXISTS idx_conversation_user_date 
ON "Conversation" ("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_message_conversation 
ON "Message" ("conversationId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_toolcall_message 
ON "ToolCall" ("messageId", status);

-- Resource Management
CREATE INDEX IF NOT EXISTS idx_resource_type 
ON "Resource" ("mimeType", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_resource_message 
ON "Resource" ("messageId", "createdAt" DESC);

-- Layer Version Control
CREATE INDEX IF NOT EXISTS idx_layer_version_layer 
ON "LayerVersion" ("layerId", version DESC);

-- Full Text Search on Messages
CREATE INDEX IF NOT EXISTS idx_message_content ON "Message" 
USING gin(to_tsvector('english', content));

-- JSON Indexes for Metadata
CREATE INDEX IF NOT EXISTS idx_conversation_metadata 
ON "Conversation" USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_message_metadata 
ON "Message" USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_toolcall_args 
ON "ToolCall" USING gin(args);

CREATE INDEX IF NOT EXISTS idx_toolcall_result 
ON "ToolCall" USING gin(result); 