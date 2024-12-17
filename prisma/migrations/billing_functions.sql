-- Calculate User Usage Costs
CREATE OR REPLACE FUNCTION calculate_usage_costs(
  p_user_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
) RETURNS TABLE (
  layer_costs JSONB,
  compute_costs JSONB,
  storage_costs JSONB,
  total_cost FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH layer_usage AS (
    SELECT 
      l.id,
      l.name,
      COUNT(*) as calls,
      SUM(CAST(u.metadata->>'compute_time' as FLOAT)) as compute_time,
      l.price as price_info
    FROM "Usage" u
    JOIN "Layer" l ON u."layerId" = l.id
    WHERE u."userId" = p_user_id
    AND u."createdAt" BETWEEN p_start_date AND p_end_date
    GROUP BY l.id, l.name, l.price
  )
  SELECT 
    (
      SELECT jsonb_object_agg(id, cost_info)
      FROM (
        SELECT 
          id,
          jsonb_build_object(
            'name', name,
            'calls', calls,
            'compute_time', compute_time,
            'cost', 
            CASE 
              WHEN price_info->>'type' = 'per_call' 
              THEN calls * (price_info->>'amount')::FLOAT
              ELSE compute_time * (price_info->>'amount')::FLOAT
            END
          ) as cost_info
        FROM layer_usage
      ) layer_costs
    ) as layer_costs,
    (
      SELECT jsonb_build_object(
        'total_hours', SUM(compute_time),
        'cost', SUM(compute_time * 0.10) -- $0.10 per compute hour
      )
      FROM layer_usage
    ) as compute_costs,
    (
      SELECT jsonb_build_object(
        'total_gb', SUM(CAST(metadata->>'storage_gb' as FLOAT)),
        'cost', SUM(CAST(metadata->>'storage_gb' as FLOAT) * 0.05) -- $0.05 per GB
      )
      FROM "Usage" u
      WHERE u."userId" = p_user_id
      AND u."createdAt" BETWEEN p_start_date AND p_end_date
    ) as storage_costs,
    (
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN price_info->>'type' = 'per_call' 
            THEN calls * (price_info->>'amount')::FLOAT
            ELSE compute_time * (price_info->>'amount')::FLOAT
          END
        ), 0) +
        COALESCE(SUM(compute_time * 0.10), 0) +
        COALESCE(SUM(CAST(u.metadata->>'storage_gb' as FLOAT) * 0.05), 0)
      FROM layer_usage
      CROSS JOIN "Usage" u
      WHERE u."userId" = p_user_id
      AND u."createdAt" BETWEEN p_start_date AND p_end_date
    ) as total_cost;
END;
$$ LANGUAGE plpgsql; 