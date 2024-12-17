-- Full Text Search Indexes
CREATE INDEX IF NOT EXISTS idx_layer_search ON "Layer" USING gin(
  to_tsvector('english',
    coalesce(metadata->>'name', '') || ' ' ||
    coalesce(metadata->>'description', '') || ' ' ||
    array_to_string(tags, ' ')
  )
);

-- JSON Indexes
CREATE INDEX IF NOT EXISTS idx_layer_metadata ON "Layer" USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_layer_config ON "Layer" USING gin(config);
CREATE INDEX IF NOT EXISTS idx_layer_state ON "Layer" USING gin(state);
CREATE INDEX IF NOT EXISTS idx_usage_metadata ON "Usage" USING gin(metadata);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_layer_status_category ON "Layer" (status, category);
CREATE INDEX IF NOT EXISTS idx_layer_created_at ON "Layer" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_layer_purchase_status ON "LayerPurchase" (status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_layer_deployment_status ON "LayerDeployment" (status, "createdAt" DESC);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_usage_layer_date ON "Usage" ("layerId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_layer_analytics_date ON "LayerAnalytics" ("layerId", date DESC);
CREATE INDEX IF NOT EXISTS idx_layer_event_type ON "LayerEvent" ("layerId", type, "createdAt" DESC); 