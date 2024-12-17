-- Layer Dependency Resolution
CREATE OR REPLACE FUNCTION resolve_layer_dependencies(
  layer_id TEXT,
  max_depth INT DEFAULT 10
) RETURNS TABLE (
  dependency_id TEXT,
  dependency_path TEXT[],
  depth INT
) AS $$
WITH RECURSIVE deps AS (
  -- Base case: direct dependencies
  SELECT 
    d.dependencyId,
    ARRAY[d.layerId, d.dependencyId] as path,
    1 as depth
  FROM "LayerDependency" d
  WHERE d.layerId = layer_id

  UNION ALL

  -- Recursive case: dependencies of dependencies
  SELECT 
    d.dependencyId,
    deps.path || d.dependencyId,
    deps.depth + 1
  FROM "LayerDependency" d
  JOIN deps ON d.layerId = deps.dependency_id
  WHERE 
    deps.depth < max_depth AND
    NOT d.dependencyId = ANY(deps.path) -- Prevent cycles
)
SELECT 
  dependency_id,
  dependency_path,
  depth
FROM deps
ORDER BY depth, dependency_id;
$$ LANGUAGE sql;

-- Layer Analytics
CREATE OR REPLACE FUNCTION calculate_layer_metrics(
  layer_id TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  interval_type TEXT DEFAULT 'day'
) RETURNS TABLE (
  period TIMESTAMP,
  api_calls INT,
  compute_hours FLOAT,
  storage_bytes BIGINT,
  unique_users INT,
  revenue FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH periods AS (
    SELECT 
      date_trunc(interval_type, generate_series(start_date, end_date, '1 ' || interval_type)) as period
  )
  SELECT
    p.period,
    COALESCE(COUNT(u.id) FILTER (WHERE u.type = 'api_call'), 0) as api_calls,
    COALESCE(SUM(u.quantity) FILTER (WHERE u.type = 'compute'), 0) as compute_hours,
    COALESCE(SUM(u.quantity) FILTER (WHERE u.type = 'storage'), 0) as storage_bytes,
    COUNT(DISTINCT u.userId) as unique_users,
    COALESCE(SUM(lp.amount), 0) as revenue
  FROM periods p
  LEFT JOIN "Usage" u ON 
    date_trunc(interval_type, u."createdAt") = p.period AND
    u."layerId" = layer_id
  LEFT JOIN "LayerPurchase" lp ON 
    date_trunc(interval_type, lp."createdAt") = p.period AND
    lp."layerId" = layer_id
  GROUP BY p.period
  ORDER BY p.period;
END;
$$ LANGUAGE plpgsql; 