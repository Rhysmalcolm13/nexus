# Architecture Overview

## System Components


### mcp
- Path: `src/lib/mcp`
- Submodules:
  - layers
  - integration
  - sandbox
  - marketplace
  - cli
  - config
  - db
  - events
  - metrics
  - middleware
  - state
  - storage
  - sync
  - types
  - utils
  - validation
  - workflow


### ai
- Path: `src/lib/ai`
- Submodules:
  - models
  - tools
  - prompts


### auth
- Path: `src/lib/auth`
- Submodules:
  - providers
  - middleware


### api
- Path: `src/app/api`
- Submodules:
  - auth
  - conversations
  - layers
  - marketplace
  - messages
  - search
  - settings
  - stats
  - tools
  - user
  - ws


### components
- Path: `src/components`
- Submodules:
  - auth
  - chat
  - layers
  - servers
  - tools
  - ui


### pages
- Path: `src/app`
- Submodules:
  - chat
  - servers
  - (auth)


### hooks
- Path: `src/hooks`



### utils
- Path: `src/utils`



### prisma
- Path: `prisma`
- Submodules:
  - migrations/functions
  - migrations/triggers


### config
- Path: `src/lib/config`



### db
- Path: `src/lib/db`



### types
- Path: `src/types`



### models
- Path: `src/lib/models`



### tests
- Path: `src`
- Submodules:
  - **/__tests__
  - **/*.test.ts
  - **/*.spec.ts


## Key Concepts

1. MCP (Multi-Component Platform)
2. Layer Management
3. Authentication & Authorization
4. API Structure
5. Database Schema
6. Frontend Architecture

## Technology Stack

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- WebSocket
- TailwindCSS
