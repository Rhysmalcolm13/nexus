-- User Analytics
CREATE OR REPLACE FUNCTION calculate_user_metrics(
  p_user_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
) RETURNS TABLE (
  total_layers INT,
  total_usage BIGINT,
  total_compute_hours FLOAT,
  favorite_categories TEXT[],
  active_layers TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT l.id)::INT as total_layers,
    COUNT(u.id)::BIGINT as total_usage,
    SUM(CAST(u.metadata->>'compute_time' as FLOAT)) as total_compute_hours,
    ARRAY(
      SELECT category 
      FROM (
        SELECT l.category, COUNT(*) as count
        FROM "Layer" l
        WHERE l."userId" = p_user_id
        GROUP BY l.category
        ORDER BY count DESC
        LIMIT 3
      ) top_categories
    ) as favorite_categories,
    ARRAY(
      SELECT l.id
      FROM "Layer" l
      JOIN "Usage" u ON l.id = u."layerId"
      WHERE u."userId" = p_user_id
      AND u."createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY l.id
      ORDER BY COUNT(*) DESC
      LIMIT 5
    ) as active_layers
  FROM "Layer" l
  LEFT JOIN "Usage" u ON l.id = u."layerId"
  WHERE l."userId" = p_user_id
  AND (u."createdAt" BETWEEN p_start_date AND p_end_date OR u."createdAt" IS NULL);
END;
$$ LANGUAGE plpgsql;

-- Conversation Analytics
CREATE OR REPLACE FUNCTION analyze_conversations(
  p_user_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
) RETURNS TABLE (
  total_conversations INT,
  avg_messages_per_conversation FLOAT,
  tool_usage JSONB,
  resource_usage JSONB,
  layer_usage JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH conversation_stats AS (
    SELECT 
      c.id,
      COUNT(m.id) as message_count,
      COUNT(DISTINCT tc.name) as unique_tools,
      COUNT(DISTINCT r.id) as unique_resources
    FROM "Conversation" c
    LEFT JOIN "Message" m ON c.id = m."conversationId"
    LEFT JOIN "ToolCall" tc ON m.id = tc."messageId"
    LEFT JOIN "Resource" r ON m.id = r."messageId"
    WHERE c."userId" = p_user_id
    AND c."createdAt" BETWEEN p_start_date AND p_end_date
    GROUP BY c.id
  )
  SELECT 
    COUNT(*)::INT as total_conversations,
    AVG(message_count)::FLOAT as avg_messages_per_conversation,
    (
      SELECT jsonb_object_agg(name, count)
      FROM (
        SELECT tc.name, COUNT(*) as count
        FROM "ToolCall" tc
        JOIN "Message" m ON tc."messageId" = m.id
        JOIN "Conversation" c ON m."conversationId" = c.id
        WHERE c."userId" = p_user_id
        AND tc."createdAt" BETWEEN p_start_date AND p_end_date
        GROUP BY tc.name
        ORDER BY count DESC
        LIMIT 10
      ) tool_stats
    ) as tool_usage,
    (
      SELECT jsonb_object_agg(mime_type, count)
      FROM (
        SELECT r."mimeType", COUNT(*) as count
        FROM "Resource" r
        JOIN "Message" m ON r."messageId" = m.id
        JOIN "Conversation" c ON m."conversationId" = c.id
        WHERE c."userId" = p_user_id
        AND r."createdAt" BETWEEN p_start_date AND p_end_date
        GROUP BY r."mimeType"
      ) resource_stats
    ) as resource_usage,
    (
      SELECT jsonb_object_agg(layer_id, usage)
      FROM (
        SELECT 
          l.id as layer_id,
          jsonb_build_object(
            'name', l.name,
            'calls', COUNT(*),
            'success_rate', 
            AVG(CASE WHEN tc.status = 'success' THEN 1 ELSE 0 END)::FLOAT
          ) as usage
        FROM "Layer" l
        JOIN "ToolCall" tc ON tc.name = ANY(l.tools)
        JOIN "Message" m ON tc."messageId" = m.id
        JOIN "Conversation" c ON m."conversationId" = c.id
        WHERE c."userId" = p_user_id
        AND tc."createdAt" BETWEEN p_start_date AND p_end_date
        GROUP BY l.id, l.name
      ) layer_stats
    ) as layer_usage
  FROM conversation_stats;
END;
$$ LANGUAGE plpgsql; 