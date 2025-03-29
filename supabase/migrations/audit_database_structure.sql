-- Script de auditoría para analizar la estructura actual de la base de datos
-- Este script genera información sobre todas las tablas, columnas, índices y relaciones

-- Listar todas las tablas en el esquema public
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) AS column_count
FROM 
    information_schema.tables t
WHERE 
    table_schema = 'public' AND 
    table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- Listar todas las columnas de cada tabla
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name, ordinal_position;

-- Listar todas las restricciones (claves primarias, foráneas, etc.)
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints tc
JOIN 
    information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
LEFT JOIN 
    information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.table_schema = 'public'
ORDER BY 
    tc.table_name, tc.constraint_name;

-- Listar todos los índices
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename, indexname;

-- Listar todas las políticas RLS
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    pol.polname AS policy_name,
    CASE pol.polpermissive WHEN 't' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END AS permissive,
    CASE pol.polroles[0] WHEN 0 THEN 'PUBLIC' ELSE (SELECT rolname FROM pg_roles WHERE oid = pol.polroles[0]) END AS role_name,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command,
    pg_get_expr(pol.polqual, pol.polrelid) AS expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check
FROM
    pg_policy pol
JOIN
    pg_class c ON c.oid = pol.polrelid
JOIN
    pg_namespace n ON n.oid = c.relnamespace
WHERE
    n.nspname = 'public'
ORDER BY
    n.nspname, c.relname, pol.polname;

