-- ============================================================
-- MIGRACIÓN 002: Tablas de pedidos y enlace con tickets
-- Ejecutar en phpMyAdmin o MySQL CLI sobre la BD 'tienda'
-- ============================================================

-- 1. Tabla de pedidos (cabecera de la orden)
CREATE TABLE IF NOT EXISTS pedidos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    folio       VARCHAR(100) NOT NULL,
    paypal_orden_id VARCHAR(100),
    paypal_estado   VARCHAR(50),
    subtotal    DECIMAL(10,2) NOT NULL DEFAULT 0,
    iva         DECIMAL(10,2) NOT NULL DEFAULT 0,
    total       DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_folio (folio),
    INDEX idx_paypal_orden (paypal_orden_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Detalle de productos por pedido
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       INT NOT NULL,
    producto_id     INT,
    nombre_producto VARCHAR(255) NOT NULL,
    categoria       VARCHAR(100),
    cantidad        INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    importe         DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Agregar columna pedido_id a tickets para enlazar con sus productos
--    (usa IF NOT EXISTS para que sea seguro correr más de una vez)
ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS pedido_id INT DEFAULT NULL,
    ADD INDEX IF NOT EXISTS idx_pedido_id (pedido_id);
