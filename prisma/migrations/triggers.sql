-- Auto-update Layer metrics
CREATE OR REPLACE FUNCTION update_layer_metrics() RETURNS TRIGGER AS $$
BEGIN
  WITH layer_stats AS (
    SELECT 
      COUNT(*) as total_requests,
      COUNT(DISTINCT "userId") as unique_users,
      AVG(CAST(metadata->>'latency' as FLOAT)) as avg_latency
    FROM "Usage"
    WHERE "layerId" = NEW."layerId"
    AND "createdAt" >= NOW() - INTERVAL '24 hours'
  )
  UPDATE "Layer"
  SET metrics = jsonb_build_object(
    'daily_requests', layer_stats.total_requests,
    'daily_users', layer_stats.unique_users,
    'avg_latency', layer_stats.avg_latency,
    'updated_at', NOW()
  )
  FROM layer_stats
  WHERE id = NEW."layerId";
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_layer_metrics
AFTER INSERT ON "Usage"
FOR EACH ROW
EXECUTE FUNCTION update_layer_metrics(); 