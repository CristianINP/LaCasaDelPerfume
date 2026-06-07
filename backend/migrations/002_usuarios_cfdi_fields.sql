-- Migración: Agregar campos fiscales SAT al registro de usuarios
-- Ejecutar en MariaDB: mysql -u root -p tienda < 002_usuarios_cfdi_fields.sql
ALTER TABLE usuarios
  ADD COLUMN rfc VARCHAR(13) NULL AFTER telefono,
  ADD COLUMN regimen_fiscal VARCHAR(200) NULL AFTER rfc,
  ADD COLUMN uso_cfdi VARCHAR(200) NULL AFTER regimen_fiscal;
