-- Asegurar que la tabla profiles tenga la estructura correcta
-- Esta migración consolida la estructura de la tabla profiles

-- Verificar si la tabla existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Crear la tabla si no existe
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      full_name TEXT,
      role TEXT DEFAULT 'customer'
    );

    -- Comentarios de la tabla
    COMMENT ON TABLE public.profiles IS 'Perfiles de usuario con información adicional';
    COMMENT ON COLUMN public.profiles.id IS 'ID del usuario, referencia a auth.users';
    COMMENT ON COLUMN public.profiles.created_at IS 'Fecha de creación del perfil';
    COMMENT ON COLUMN public.profiles.updated_at IS 'Fecha de última actualización del perfil';
    COMMENT ON COLUMN public.profiles.full_name IS 'Nombre completo del usuario';
    COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario (customer, admin, etc.)';

  ELSE
    -- La tabla ya existe, verificar y añadir columnas si es necesario
    
    -- Verificar columna full_name
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
      ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- Verificar columna role
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
      ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer';
    END IF;
    
    -- Verificar columna created_at
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
      ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Verificar columna updated_at
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
      ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Crear o reemplazar el trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar el trigger si ya existe
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;

-- Crear el trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Configurar políticas de seguridad RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar duplicados
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Administradores pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Administradores pueden actualizar todos los perfiles" ON public.profiles;

-- Crear políticas
CREATE POLICY "Usuarios pueden ver sus propios perfiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar sus propios perfiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Administradores pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Administradores pueden actualizar todos los perfiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

