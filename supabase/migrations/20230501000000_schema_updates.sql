-- Actualización del esquema de la base de datos para mejorar la estructura

-- Actualizar tabla de productos para incluir urlpage
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS urlpage TEXT;

-- Crear índice para búsqueda rápida por urlpage
CREATE INDEX IF NOT EXISTS idx_products_urlpage ON public.products (urlpage);

-- Actualizar tabla de códigos QR para mejorar el seguimiento
ALTER TABLE IF NOT EXISTS public.qr_codes
ADD COLUMN IF NOT EXISTS veces_escaneado INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP WITH TIME ZONE;

-- Función para incrementar contador de escaneos de QR
CREATE OR REPLACE FUNCTION public.increment_qr_scan_count(qr_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.qr_codes
  SET 
    veces_escaneado = COALESCE(veces_escaneado, 0) + 1,
    last_scanned_at = NOW()
  WHERE code = qr_code;
END;
$$;

-- Políticas de seguridad para acceso a productos
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access on products"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow admin insert on products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY IF NOT EXISTS "Allow admin update on products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Políticas de seguridad para códigos QR
ALTER TABLE IF EXISTS public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access on qr_codes"
  ON public.qr_codes
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow admin insert on qr_codes"
  ON public.qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Función para generar URL amigable para productos
CREATE OR REPLACE FUNCTION public.generate_product_url()
RETURNS TRIGGER AS $$
DECLARE
  base_url TEXT;
  final_url TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convertir nombre a slug
  base_url := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]', '-', 'g'));
  -- Eliminar guiones múltiples
  base_url := REGEXP_REPLACE(base_url, '-+', '-', 'g');
  -- Eliminar guiones al inicio y final
  base_url := TRIM(BOTH '-' FROM base_url);
  
  -- Limitar longitud
  IF LENGTH(base_url) > 50 THEN
    base_url := SUBSTRING(base_url, 1, 50);
  END IF;
  
  -- Añadir ID para garantizar unicidad
  final_url := base_url || '-' || NEW.id;
  
  -- Actualizar el registro
  NEW.urlpage := final_url;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar URL amigable al insertar un producto
CREATE TRIGGER IF NOT EXISTS generate_product_url_trigger
BEFORE INSERT ON public.products
FOR EACH ROW
WHEN (NEW.urlpage IS NULL)
EXECUTE FUNCTION public.generate_product_url();

