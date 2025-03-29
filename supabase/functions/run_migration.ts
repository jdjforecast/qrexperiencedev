// Esta función se debe implementar como una función Edge en Supabase
// Para implementarla, sigue estos pasos:
// 1. Navega a la sección de Functions en el panel de Supabase
// 2. Crea una nueva función llamada "run_migration"
// 3. Copia y pega este código
// 4. Despliega la función

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Manejar solicitudes OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Crear un cliente Supabase usando las credenciales de servicio
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Ejecutar el script de migración
    // Nota: Este es un ejemplo simplificado. En un entorno real, deberías
    // implementar un sistema más robusto para ejecutar migraciones.
    const migrationSQL = `
    -- 1. Optimización de la tabla profiles
    ALTER TABLE IF EXISTS profiles
        ADD COLUMN IF NOT EXISTS full_name TEXT,
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS company_name TEXT,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

    -- 2. Optimización de la tabla products
    ALTER TABLE IF EXISTS products
        ADD COLUMN IF NOT EXISTS code TEXT,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

    -- 3. Optimización de la tabla cart_items
    ALTER TABLE IF EXISTS cart_items
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

    -- 4. Crear índices para mejorar el rendimiento
    CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
    CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
    CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

    -- 5. Crear o actualizar funciones RPC
    CREATE OR REPLACE FUNCTION get_user_profile()
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
        profile_data JSONB;
    BEGIN
        SELECT json_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'role', p.role,
            'company_name', p.company_name,
            'created_at', p.created_at,
            'updated_at', p.updated_at
        ) INTO profile_data
        FROM profiles p
        WHERE p.id = auth.uid();
        
        RETURN profile_data;
    END;
    $$;

    CREATE OR REPLACE FUNCTION get_user_cart()
    RETURNS TABLE (
        id UUID,
        product_id UUID,
        user_id UUID,
        quantity INTEGER,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        product_name TEXT,
        product_description TEXT,
        product_price DECIMAL,
        product_image TEXT,
        product_code TEXT
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            ci.id,
            ci.product_id,
            ci.user_id,
            ci.quantity,
            ci.created_at,
            ci.updated_at,
            p.name AS product_name,
            p.description AS product_description,
            p.price AS product_price,
            p.image AS product_image,
            p.code AS product_code
        FROM 
            cart_items ci
        JOIN 
            products p ON ci.product_id = p.id
        WHERE 
            ci.user_id = auth.uid();
    END;
    $$;
    `

    // Ejecutar el script SQL
    const { error } = await supabaseClient.rpc("exec_sql", { sql: migrationSQL })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, message: "Migración ejecutada correctamente" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})

