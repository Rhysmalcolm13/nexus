-- Layer Usage Analytics
CREATE OR REPLACE FUNCTION calculate_layer_usage(
  p_layer_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
) RETURNS TABLE (
  date DATE,
  total_requests BIGINT,
  unique_users BIGINT,
  avg_latency FLOAT,
  error_rate FLOAT,
  compute_hours FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT
      date_trunc('day', u."createdAt")::date as date,
      COUNT(*) as requests,
      COUNT(DISTINCT u."userId") as users,
      AVG(CAST(u.metadata->>'latency' as FLOAT)) as latency,
      SUM(CASE WHEN u.metadata->>'error' IS NOT NULL THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as errors,
      SUM(CAST(u.metadata->>'compute_time' as FLOAT)) / 3600 as compute
    FROM "Usage" u
    WHERE 
      u."layerId" = p_layer_id
      AND u."createdAt" BETWEEN p_start_date AND p_end_date
    GROUP BY date_trunc('day', u."createdAt")::date
  )
  SELECT
    ds.date,
    ds.requests as total_requests,
    ds.users as unique_users,
    ds.latency as avg_latency,
    ds.errors as error_rate,
    ds.compute as compute_hours
  FROM daily_stats ds
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql; 