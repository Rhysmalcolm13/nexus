import type { Prisma } from '@prisma/client';
import type { LayerMetadata } from './layer';

// Define our extended Prisma types
export type LayerWithUser = Prisma.LayerGetPayload<{
  include: { user: true }
}>;

export type LayerWithPurchases = Prisma.LayerGetPayload<{
  include: { purchases: true }
}>;

// Define raw query result types
export interface RawLayerQueryResult {
  id: string;
  name: string;
  metadata: Prisma.JsonValue;
  config: Prisma.JsonValue;
  runtime: string;
  tools: Prisma.JsonValue;
  resources: Prisma.JsonValue;
  prompts: Prisma.JsonValue;
  state: Prisma.JsonValue;
  code: string;
  parameters: Prisma.JsonValue;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: any;
    name: string | null;
    email: string;
    userId: string;
  };
}