-- Full Text Layer Search
CREATE OR REPLACE FUNCTION search_layers_full_text(
  search_query TEXT,
  filters JSONB DEFAULT NULL
) RETURNS TABLE (
  id TEXT,
  relevance FLOAT,
  layer_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    ts_rank_cd(
      to_tsvector('english',
        coalesce(l.name, '') || ' ' ||
        coalesce(l.description, '') || ' ' ||
        array_to_string(l.tags, ' ')
      ),
      plainto_tsquery('english', search_query)
    ) as relevance,
    jsonb_build_object(
      'metadata', l.metadata,
      'metrics', l.metrics,
      'rating', COALESCE(AVG(lr.rating), 0),
      'downloads', COUNT(DISTINCT lp.id)
    ) as layer_data
  FROM "Layer" l
  LEFT JOIN "LayerReview" lr ON l.id = lr."layerId"
  LEFT JOIN "LayerPurchase" lp ON l.id = lp."layerId"
  WHERE
    search_query IS NULL OR
    to_tsvector('english',
      coalesce(l.name, '') || ' ' ||
      coalesce(l.description, '') || ' ' ||
      array_to_string(l.tags, ' ')
    ) @@ plainto_tsquery('english', search_query)
  GROUP BY l.id
  ORDER BY relevance DESC, l."createdAt" DESC;
END;
$$ LANGUAGE plpgsql; 