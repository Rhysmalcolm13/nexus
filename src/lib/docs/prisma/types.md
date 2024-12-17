# Type Definitions


## SQL

### `functions.sql`

-- Layer Dependency Resolution

### `IF`

-- Layer Performance

### `IF`

-- Layer Performance

### `IF`

-- Layer Performance

### `IF`

-- Layer Performance

### `IF`

-- Layer Performance

### `IF`

-- Layer Performance

### `IF`

-- Layer Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `IF`

-- Conversation Performance

### `trg_update_layer_rating`

-- Auto-update Layer ratings

### `trg_track_layer_version`

-- Auto-update Layer ratings

### `analytics_functions.sql`

-- User Analytics

### `billing_functions.sql`

-- Calculate User Usage Costs

### `analytics.sql`

-- Layer Usage Analytics

### `billing.sql`

-- Calculate User Billing

### `search.sql`

-- Full Text Layer Search

### `functions.sql`

-- Layer Search Function

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `IF`

-- Full Text Search Indexes

### `trg_layer_state_change`

-- Layer State Change Trigger

### `trg_layer_access`

-- Layer State Change Trigger

### `trg_update_layer_metrics`

-- Auto-update Layer metrics


## TYPE

### `User`

Prisma model for User

**Properties:**
- `id`: String
- `email`: String
- `name`: String?
- `settings`: UserSettings?
- `conversations`: Conversation[]
- `layers`: Layer[]
- `purchases`: LayerPurchase[]
- `apiKeys`: ApiKey[]
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `subscriptions`: Subscription[]
- `usages`: Usage[]
- `collaborations`: LayerCollaborator[]
- `auditLogs`: LayerAuditLog[]

### `UserSettings`

Prisma model for UserSettings

**Properties:**
- `id`: String
- `userId`: String
- `user`: User
- `defaultModel`: String
- `defaultMaxTokens`: Int
- `defaultTemperature`: Float
- `enabledTools`: String[]
- `enabledResources`: String[]
- `enabledLayers`: String[]

### `Conversation`

Prisma model for Conversation

**Properties:**
- `id`: String
- `title`: String
- `userId`: String
- `user`: User
- `messages`: Message[]
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `isArchived`: Boolean
- `metadata`: Json?

### `Message`

Prisma model for Message

**Properties:**
- `id`: String
- `conversationId`: String
- `conversation`: Conversation
- `role`: String
- `content`: String
- `toolCalls`: ToolCall[]
- `resources`: Resource[]
- `metadata`: Json?
- `createdAt`: DateTime

### `ToolCall`

Prisma model for ToolCall

**Properties:**
- `id`: String
- `messageId`: String
- `message`: Message
- `name`: String
- `args`: Json
- `result`: Json?
- `status`: String
- `error`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `Resource`

Prisma model for Resource

**Properties:**
- `id`: String
- `messageId`: String
- `message`: Message
- `uri`: String
- `content`: String
- `mimeType`: String?
- `metadata`: Json?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `Layer`

Prisma model for Layer

**Properties:**
- `id`: String
- `name`: String
- `version`: String
- `description`: String?
- `author`: String
- `category`: String
- `tags`: String[]
- `status`: LayerStatus
- `runtime`: String
- `entry`: String
- `dependencies`: String[]
- `tools`: Json
- `resources`: Json
- `prompts`: Json
- `config`: Json
- `metadata`: Json
- `state`: Json?
- `capabilities`: Json
- `metrics`: Json?
- `price`: Json?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `userId`: String
- `user`: User
- `purchases`: LayerPurchase[]
- `integrations`: LayerIntegration[]
- `events`: LayerEvent[]
- `reviews`: LayerReview[]
- `analytics`: LayerAnalytics[]
- `versions`: LayerVersion[]
- `dependsOn`: LayerDependency[]
- `dependedOnBy`: LayerDependency[]
- `usages`: Usage[]
- `collaborators`: LayerCollaborator[]
- `deployments`: LayerDeployment[]
- `auditLogs`: LayerAuditLog[]
- `visibility`: LayerVisibility
- `organizationId`: String?
- `settings`: Json?
- `code`: String
- `parameters`: Json

### `LayerPurchase`

Prisma model for LayerPurchase

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `userId`: String
- `user`: User
- `amount`: Float
- `currency`: String
- `interval`: String?
- `status`: LayerPurchaseStatus
- `validUntil`: DateTime?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `LayerIntegration`

Prisma model for LayerIntegration

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `serverId`: String
- `config`: Json
- `status`: String
- `error`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `LayerEvent`

Prisma model for LayerEvent

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `type`: String
- `data`: Json?
- `createdAt`: DateTime

### `LayerReview`

Prisma model for LayerReview

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `userId`: String
- `rating`: Int
- `comment`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `LayerAnalytics`

Prisma model for LayerAnalytics

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `date`: DateTime
- `metrics`: Json

### `ApiKey`

Prisma model for ApiKey

**Properties:**
- `id`: String
- `userId`: String
- `user`: User
- `key`: String
- `name`: String?
- `permissions`: String[]
- `lastUsed`: DateTime?
- `createdAt`: DateTime
- `expiresAt`: DateTime?

### `Subscription`

Prisma model for Subscription

**Properties:**
- `id`: String
- `userId`: String
- `user`: User
- `planId`: String
- `plan`: Plan
- `status`: String
- `currentPeriodStart`: DateTime
- `currentPeriodEnd`: DateTime
- `cancelAt`: DateTime?
- `metadata`: Json?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `Plan`

Prisma model for Plan

**Properties:**
- `id`: String
- `name`: String
- `description`: String?
- `price`: Float
- `currency`: String
- `interval`: String
- `features`: String[]
- `limits`: Json
- `isActive`: Boolean
- `subscriptions`: Subscription[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `LayerVersion`

Prisma model for LayerVersion

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `version`: String
- `changelog`: String?
- `source`: Json
- `isPublic`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `LayerDependency`

Prisma model for LayerDependency

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `dependencyId`: String
- `dependency`: Layer
- `version`: String
- `isOptional`: Boolean
- `createdAt`: DateTime

### `Usage`

Prisma model for Usage

**Properties:**
- `id`: String
- `userId`: String
- `user`: User
- `layerId`: String?
- `layer`: Layer?
- `type`: String
- `quantity`: Float
- `metadata`: Json?
- `createdAt`: DateTime

### `LayerCollaborator`

Prisma model for LayerCollaborator

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `userId`: String
- `user`: User
- `role`: LayerCollaboratorRole
- `permissions`: String[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `LayerDeployment`

Prisma model for LayerDeployment

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `environment`: LayerEnvironment
- `version`: String
- `status`: LayerDeploymentStatus
- `config`: Json
- `metadata`: Json?
- `logs`: Json?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### `LayerAuditLog`

Prisma model for LayerAuditLog

**Properties:**
- `id`: String
- `layerId`: String
- `layer`: Layer
- `userId`: String
- `user`: User
- `action`: String
- `details`: Json
- `createdAt`: DateTime