-- MIGRACIÓN 005: Agregar columna password a usuarios para autenticación JWT
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT NULL AFTER telefono;
