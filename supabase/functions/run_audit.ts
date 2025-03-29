// Esta función se debe implementar como una función Edge en Supabase
// Para implementarla, sigue estos pasos:
// 1. Navega a la sección de Functions en el panel de Supabase
// 2. Crea una nueva función llamada "run_audit"
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

    // Script SQL para auditar la base de datos
    const auditSQL = `
    -- Función para recopilar información sobre la estructura de la base de datos
    CREATE OR REPLACE FUNCTION audit_database()
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
        result JSONB;
        tables_info JSONB;
        columns_info JSONB;
        constraints_info JSONB;
        indexes_info JSONB;
        policies_info JSONB;
        functions_info JSONB;
    BEGIN
        -- Recopilar información sobre tablas
        SELECT json_agg(json_build_object(
            'table_name', table_name,
            'column_count', (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name)
        ))
        INTO tables_info
        FROM information_schema.tables t
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

        -- Recopilar información sobre columnas
        SELECT json_agg(json_build_object(
            'table_name', table_name,
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        ))
        INTO columns_info
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;

        -- Recopilar información sobre restricciones
        SELECT json_agg(json_build_object(
            'table_name', tc.table_name,
            'constraint_name', tc.constraint_name,
            'constraint_type', tc.constraint_type,
            'column_name', kcu.column_name,
            'foreign_table_name', ccu.table_name,
            'foreign_column_name', ccu.column_name
        ))
        INTO constraints_info
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public';

        -- Recopilar información sobre índices
        SELECT json_agg(json_build_object(
            'table_name', tablename,
            'index_name', indexname,
            'index_definition', indexdef
        ))
        INTO indexes_info
        FROM pg_indexes
        WHERE schemaname = 'public';

        -- Recopilar información sobre políticas RLS
        SELECT json_agg(json_build_object(
            'table_name', c.relname,
            'policy_name', pol.polname,
            'permissive', CASE pol.polpermissive WHEN 't' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
            'role', CASE pol.polroles[0] WHEN 0 THEN 'PUBLIC' ELSE (SELECT rolname FROM pg_roles WHERE oid = pol.polroles[0]) END,
            'command', CASE pol.polcmd
                WHEN 'r' THEN 'SELECT'
                WHEN 'a' THEN 'INSERT'
                WHEN 'w' THEN 'UPDATE'
                WHEN 'd' THEN 'DELETE'
                WHEN '*' THEN 'ALL'
            END,
            'expression', pg_get_expr(pol.polqual, pol.polrelid),
            'with_check', pg_get_expr(pol.polwithcheck, pol.polrelid)
        ))
        INTO policies_info
        FROM pg_policy pol
        JOIN pg_class c ON c.oid = pol.polrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public';

        -- Recopilar información sobre funciones
        SELECT json_agg(json_build_object(
            'function_name', p.proname,
            'language', l.lanname,
            'return_type', pg_get_function_result(p.oid),
            'argument_types', pg_get_function_arguments(p.oid),
            'security_definer', p.prosecdef
        ))
        INTO functions_info
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_language l ON p.prolang = l.oid
        WHERE n.nspname = 'public';

        -- Construir el resultado final
        result := json_build_object(
            'tables', tables_info,
            'columns', columns_info,
            'constraints', constraints_info,
            'indexes', indexes_info,
            'policies', policies_info,
            'functions', functions_info
        );

        RETURN result;
    END;
    $$;

    -- Ejecutar la función de auditoría
    SELECT audit_database();
    `

    // Ejecutar el script SQL
    const { data, error } = await supabaseClient.rpc("exec_sql", { sql: auditSQL })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, data }), {
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

