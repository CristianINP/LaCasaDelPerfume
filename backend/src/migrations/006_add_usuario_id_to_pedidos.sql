-- MIGRACIÓN 006: Vincular pedidos con usuarios para historial de compras
ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS usuario_id INT DEFAULT NULL AFTER id,
    ADD INDEX IF NOT EXISTS idx_usuario_id (usuario_id);
