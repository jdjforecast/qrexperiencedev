-- Migración para corregir las políticas RLS de la tabla profiles

-- 1. Asegurarse de que RLS está habilitado para la tabla profiles
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can insert all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- 3. Crear nuevas políticas más permisivas para la tabla profiles

-- Política para permitir que los usuarios vean su propio perfil
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para permitir que los usuarios creen su propio perfil
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para permitir que los administradores vean todos los perfiles
CREATE POLICY "Admin users can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para permitir que los administradores actualicen todos los perfiles
CREATE POLICY "Admin users can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para permitir que los administradores creen perfiles para otros usuarios
CREATE POLICY "Admin users can insert all profiles" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política especial para permitir que el servicio de autenticación cree perfiles
-- Esta es crucial para el proceso de registro/login automático
CREATE POLICY "Service role can manage all profiles" ON profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

