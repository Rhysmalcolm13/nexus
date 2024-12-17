-- Calculate User Billing
CREATE OR REPLACE FUNCTION calculate_user_billing(
  p_user_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
) RETURNS TABLE (
  service_type TEXT,
  quantity FLOAT,
  unit_price FLOAT,
  total_amount FLOAT,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH usage_stats AS (
    SELECT
      u.type as service_type,
      SUM(u.quantity) as total_quantity,
      CASE 
        WHEN u.type = 'compute' THEN 0.10  -- $0.10 per compute hour
        WHEN u.type = 'storage' THEN 0.05  -- $0.05 per GB
        ELSE 0.001                         -- $0.001 per API call
      END as unit_price
    FROM "Usage" u
    WHERE 
      u."userId" = p_user_id
      AND u."createdAt" BETWEEN p_start_date AND p_end_date
    GROUP BY u.type
  )
  SELECT
    us.service_type,
    us.total_quantity as quantity,
    us.unit_price,
    us.total_quantity * us.unit_price as total_amount,
    jsonb_build_object(
      'period_start', p_start_date,
      'period_end', p_end_date,
      'breakdown', (
        SELECT jsonb_agg(jsonb_build_object(
          'date', date_trunc('day', u."createdAt"),
          'quantity', SUM(u.quantity)
        ))
        FROM "Usage" u
        WHERE 
          u."userId" = p_user_id
          AND u.type = us.service_type
          AND u."createdAt" BETWEEN p_start_date AND p_end_date
        GROUP BY date_trunc('day', u."createdAt")
      )
    ) as details
  FROM usage_stats us;
END;
$$ LANGUAGE plpgsql;

-- Calculate Layer Revenue
CREATE OR REPLACE FUNCTION calculate_layer_revenue(
  p_layer_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
) RETURNS TABLE (
  revenue_type TEXT,
  total_amount FLOAT,
  transaction_count INT,
  unique_users INT,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'purchases' as revenue_type,
    SUM(lp.amount) as total_amount,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT lp."userId") as unique_users,
    jsonb_build_object(
      'period_start', p_start_date,
      'period_end', p_end_date,
      'by_interval', (
        SELECT jsonb_object_agg(
          interval_type,
          jsonb_build_object(
            'amount', SUM(amount),
            'count', COUNT(*)
          )
        )
        FROM "LayerPurchase"
        WHERE 
          "layerId" = p_layer_id
          AND "createdAt" BETWEEN p_start_date AND p_end_date
        GROUP BY interval_type
      )
    ) as details
  FROM "LayerPurchase" lp
  WHERE 
    lp."layerId" = p_layer_id
    AND lp."createdAt" BETWEEN p_start_date AND p_end_date
  GROUP BY revenue_type;
END;
$$ LANGUAGE plpgsql; 