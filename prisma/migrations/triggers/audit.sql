-- Layer State Change Trigger
CREATE OR REPLACE FUNCTION log_layer_state_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "LayerAuditLog" (
    id,
    "layerId",
    "userId",
    action,
    details,
    "createdAt"
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW."userId",
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      ELSE 'deleted'
    END,
    CASE
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'old_version', OLD.version,
        'new_version', NEW.version
      )
      ELSE '{}'::jsonb
    END,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_layer_state_change
AFTER INSERT OR UPDATE OR DELETE ON "Layer"
FOR EACH ROW
EXECUTE FUNCTION log_layer_state_change();

-- Layer Access Trigger
CREATE OR REPLACE FUNCTION log_layer_access() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "Usage" (
    id,
    "userId",
    "layerId",
    type,
    quantity,
    metadata,
    "createdAt"
  ) VALUES (
    gen_random_uuid(),
    NEW."userId",
    NEW."layerId",
    'access',
    1,
    jsonb_build_object(
      'action', TG_OP,
      'role', NEW.role
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_layer_access
AFTER INSERT ON "LayerCollaborator"
FOR EACH ROW
EXECUTE FUNCTION log_layer_access(); 