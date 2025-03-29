-- Script para consolidar las tablas profiles y users

-- 1. Primero, analicemos la estructura de ambas tablas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- 2. Verificar si hay relaciones entre las tablas
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND (tc.table_name = 'profiles' OR tc.table_name = 'users');

-- 3. Función para migrar datos de users a profiles si es necesario
CREATE OR REPLACE FUNCTION migrate_users_to_profiles()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    profile_exists BOOLEAN;
BEGIN
    -- Iterar sobre cada registro en la tabla users
    FOR user_record IN SELECT * FROM public.users LOOP
        -- Verificar si ya existe un perfil para este usuario
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_record.id) INTO profile_exists;
        
        -- Si no existe un perfil, crear uno nuevo
        IF NOT profile_exists THEN
            INSERT INTO public.profiles (id, role, full_name)
            VALUES (
                user_record.id, 
                'customer', -- Rol predeterminado
                user_record.name -- Asumiendo que la tabla users tiene una columna name
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para verificar y corregir inconsistencias
CREATE OR REPLACE FUNCTION check_user_consistency()
RETURNS TABLE(user_id UUID, auth_exists BOOLEAN, profile_exists BOOLEAN, users_exists BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    WITH auth_users AS (
        SELECT id FROM auth.users
    ),
    profile_users AS (
        SELECT id FROM public.profiles
    ),
    custom_users AS (
        SELECT id FROM public.users
    )
    SELECT 
        COALESCE(au.id, pu.id, cu.id) AS user_id,
        au.id IS NOT NULL AS auth_exists,
        pu.id IS NOT NULL AS profile_exists,
        cu.id IS NOT NULL AS users_exists
    FROM 
        auth_users au
        FULL OUTER JOIN profile_users pu ON au.id = pu.id
        FULL OUTER JOIN custom_users cu ON au.id = cu.id OR pu.id = cu.id
    WHERE 
        NOT (au.id IS NOT NULL AND pu.id IS NOT NULL AND cu.id IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- 5. Función para hacer administrador a un usuario específico
CREATE OR REPLACE FUNCTION make_user_admin(email_address TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Obtener el ID del usuario desde auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = email_address;
    
    IF user_id IS NULL THEN
        RETURN 'Error: Usuario no encontrado con el email ' || email_address;
    END IF;
    
    -- Verificar si existe un perfil para este usuario
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
    
    -- Si existe un perfil, actualizarlo; si no, crear uno nuevo
    IF profile_exists THEN
        UPDATE public.profiles SET role = 'admin' WHERE id = user_id;
    ELSE
        INSERT INTO public.profiles (id, role) VALUES (user_id, 'admin');
    END IF;
    
    -- También actualizar la tabla users si existe el usuario
    IF EXISTS(SELECT 1 FROM public.users WHERE id = user_id) THEN
        -- Asumiendo que la tabla users tiene una columna role
        UPDATE public.users SET role = 'admin' WHERE id = user_id;
    END IF;
    
    RETURN 'Usuario con email ' || email_address || ' ahora es administrador';
END;
$$ LANGUAGE plpgsql;

-- 6. Ejecutar la función para hacer administrador a ncastilo@outlook.com
SELECT make_user_admin('ncastilo@outlook.com');

