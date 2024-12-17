-- Layer Search Function
CREATE OR REPLACE FUNCTION search_layers(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  tag_filters TEXT[] DEFAULT NULL,
  min_price FLOAT DEFAULT NULL,
  max_price FLOAT DEFAULT NULL
) RETURNS TABLE (
  id TEXT,
  metadata JSONB,
  metrics JSONB,
  rating FLOAT,
  downloads BIGINT,
  user_info JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH layer_metrics AS (
    SELECT 
      "layerId",
      COUNT(DISTINCT u.id) as unique_users,
      COUNT(*) as total_requests,
      AVG(CAST(u.metadata->>'latency' as FLOAT)) as avg_latency
    FROM "Usage" u
    GROUP BY "layerId"
  )
  SELECT 
    l.id,
    l.metadata,
    jsonb_build_object(
      'unique_users', COALESCE(lm.unique_users, 0),
      'total_requests', COALESCE(lm.total_requests, 0),
      'avg_latency', COALESCE(lm.avg_latency, 0)
    ) as metrics,
    COALESCE(AVG(lr.rating), 0) as rating,
    COUNT(DISTINCT lp.id) as downloads,
    jsonb_build_object(
      'name', u.name,
      'email', u.email
    ) as user_info
  FROM "Layer" l
  LEFT JOIN layer_metrics lm ON l.id = lm."layerId"
  LEFT JOIN "LayerReview" lr ON l.id = lr."layerId"
  LEFT JOIN "LayerPurchase" lp ON l.id = lp."layerId"
  LEFT JOIN "User" u ON l."userId" = u.id
  WHERE 
    l.status = 'active'
    AND (
      search_query IS NULL 
      OR l.name ILIKE '%' || search_query || '%'
      OR l.description ILIKE '%' || search_query || '%'
      OR search_query = ANY(l.tags)
    )
    AND (category_filter IS NULL OR l.category = category_filter)
    AND (tag_filters IS NULL OR l.tags && tag_filters)
    AND (
      min_price IS NULL 
      OR max_price IS NULL 
      OR (l.metadata->>'price')::jsonb->>'amount' BETWEEN min_price::text AND max_price::text
    )
  GROUP BY l.id, l.metadata, lm.unique_users, lm.total_requests, lm.avg_latency, u.name, u.email
  ORDER BY rating DESC, downloads DESC;
END;
$$ LANGUAGE plpgsql;

-- Layer Analytics Function
CREATE OR REPLACE FUNCTION aggregate_layer_metrics(
  p_layer_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP,
  p_interval TEXT DEFAULT 'day'
) RETURNS TABLE (
  period TIMESTAMP,
  metrics JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH time_periods AS (
    SELECT generate_series(
      date_trunc(p_interval, p_start_date),
      date_trunc(p_interval, p_end_date),
      ('1 ' || p_interval)::interval
    ) as period
  ),
  usage_metrics AS (
    SELECT 
      date_trunc(p_interval, u."createdAt") as period,
      COUNT(*) as requests,
      COUNT(DISTINCT u."userId") as unique_users,
      AVG(CAST(u.metadata->>'latency' as FLOAT)) as avg_latency,
      SUM(CAST(u.metadata->>'compute_time' as FLOAT)) as total_compute_time
    FROM "Usage" u
    WHERE 
      u."layerId" = p_layer_id
      AND u."createdAt" BETWEEN p_start_date AND p_end_date
    GROUP BY date_trunc(p_interval, u."createdAt")
  )
  SELECT 
    tp.period,
    jsonb_build_object(
      'requests', COALESCE(um.requests, 0),
      'unique_users', COALESCE(um.unique_users, 0),
      'avg_latency', COALESCE(um.avg_latency, 0),
      'total_compute_time', COALESCE(um.total_compute_time, 0)
    ) as metrics
  FROM time_periods tp
  LEFT JOIN usage_metrics um ON tp.period = um.period
  ORDER BY tp.period;
END;
$$ LANGUAGE plpgsql; 