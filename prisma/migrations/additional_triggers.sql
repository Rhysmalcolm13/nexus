-- Auto-update Layer ratings
CREATE OR REPLACE FUNCTION update_layer_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Layer"
  SET metadata = jsonb_set(
    metadata,
    '{rating}',
    (
      SELECT to_jsonb(AVG(rating))
      FROM "LayerReview"
      WHERE "layerId" = NEW."layerId"
    )
  )
  WHERE id = NEW."layerId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_layer_rating
AFTER INSERT OR UPDATE ON "LayerReview"
FOR EACH ROW
EXECUTE FUNCTION update_layer_rating();

-- Track Layer Version History
CREATE OR REPLACE FUNCTION track_layer_version() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.version <> NEW.version THEN
    INSERT INTO "LayerVersion" (
      "layerId",
      version,
      source,
      "createdAt",
      "updatedAt"
    ) VALUES (
      NEW.id,
      NEW.version,
      jsonb_build_object(
        'metadata', NEW.metadata,
        'config', NEW.config,
        'tools', NEW.tools,
        'resources', NEW.resources,
        'prompts', NEW.prompts
      ),
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_track_layer_version
AFTER UPDATE ON "Layer"
FOR EACH ROW
EXECUTE FUNCTION track_layer_version(); 