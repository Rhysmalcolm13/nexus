// Layer collaboration interfaces
export interface LayerCollaborator {
  id: string;
  layerId: string;
  userId: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

export interface LayerDeployment {
  id: string;
  layerId: string;
  environment: string;
  version: string;
  status: string;
  config: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  logs?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayerAuditLog {
  id: string;
  layerId: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  createdAt: Date;
} 