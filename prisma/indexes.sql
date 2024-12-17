-- Layer Performance
CREATE INDEX IF NOT EXISTS idx_layer_performance 
ON "LayerAnalytics" (layerId, date DESC);

-- Usage Tracking
CREATE INDEX IF NOT EXISTS idx_usage_tracking 
ON "Usage" (userId, type, createdAt DESC);

-- Layer Dependencies
CREATE INDEX IF NOT EXISTS idx_layer_dependencies 
ON "LayerDependency" (layerId, dependencyId);

-- Layer Versions
CREATE INDEX IF NOT EXISTS idx_layer_versions 
ON "LayerVersion" (layerId, version DESC);

-- Full Text Search
CREATE INDEX IF NOT EXISTS idx_layer_search 
ON "Layer" USING gin(to_tsvector('english', 
  coalesce(name,'') || ' ' || 
  coalesce(description,'') || ' ' || 
  array_to_string(tags, ' ')
));

-- JSON Indexes
CREATE INDEX IF NOT EXISTS idx_layer_capabilities 
ON "Layer" USING gin(capabilities);

CREATE INDEX IF NOT EXISTS idx_layer_metrics 
ON "Layer" USING gin(metrics); 