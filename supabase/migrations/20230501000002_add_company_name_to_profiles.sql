-- Esta migración añade la columna company_name a la tabla profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

