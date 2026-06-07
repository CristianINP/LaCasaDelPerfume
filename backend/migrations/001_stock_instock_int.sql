-- Migración: Cambiar inStock de tinyint(1) a int para representar cantidad en stock
-- Ejecutar en MariaDB: mysql -u root -p tienda < 001_stock_instock_int.sql
ALTER TABLE productos MODIFY COLUMN inStock int(11) NOT NULL DEFAULT 0;
