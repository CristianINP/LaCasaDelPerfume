-- ============================================================
-- MIGRACIÓN 004: Snapshot JSON de items en tabla pedidos
-- Opción B: guardar copia del detalle como JSON para que los
-- pedidos no se rompan si se eliminan productos del catálogo
-- ============================================================

-- Agregar columna de snapshot JSON al momento de la compra
ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS detalle_json TEXT DEFAULT NULL COMMENT 'Snapshot JSON de los items al momento del pago. Fallback si se eliminan productos.';
