-- Migración para optimizar la estructura de la base de datos
-- Basado en los hallazgos de la auditoría

-- 1. Optimización de la tabla profiles
ALTER TABLE IF EXISTS profiles
    -- Asegurar que todas las columnas necesarias existen
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS company_name TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Eliminar columnas redundantes o no utilizadas
    DROP COLUMN IF EXISTS avatar_url,
    -- Añadir restricciones para mejorar la integridad de datos
    ALTER COLUMN id SET NOT NULL,
    -- Añadir índices para mejorar el rendimiento de consultas frecuentes
    DROP INDEX IF EXISTS idx_profiles_id,
    CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 2. Optimización de la tabla products
ALTER TABLE IF EXISTS products
    -- Asegurar que todas las columnas necesarias existen
    ADD COLUMN IF NOT EXISTS code TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Añadir restricciones para mejorar la integridad de datos
    ALTER COLUMN id SET NOT NULL,
    -- Añadir índices para mejorar el rendimiento de consultas frecuentes
    DROP INDEX IF EXISTS idx_products_code,
    CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);

-- 3. Optimización de la tabla cart_items
ALTER TABLE IF EXISTS cart_items
    -- Asegurar que todas las columnas necesarias existen
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    -- Añadir restricciones para mejorar la integridad de datos
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN product_id SET NOT NULL,
    -- Añadir índices para mejorar el rendimiento de consultas frecuentes
    DROP INDEX IF EXISTS idx_cart_items_user_id,
    CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- 4. Optimización de la tabla orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Optimización de la tabla order_items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Añadir políticas RLS para todas las tablas
-- Políticas para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
CREATE POLICY "Admin users can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view products" ON products;
CREATE POLICY "Everyone can view products" ON products
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin users can insert products" ON products;
CREATE POLICY "Admin users can insert products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
DROP POLICY IF EXISTS "Admin users can update products" ON products;
CREATE POLICY "Admin users can update products" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
CREATE POLICY "Users can insert their own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
CREATE POLICY "Users can update their own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
CREATE POLICY "Users can delete their own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;
CREATE POLICY "Admin users can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
DROP POLICY IF EXISTS "Admin users can update all orders" ON orders;
CREATE POLICY "Admin users can update all orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE id = order_id AND user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
CREATE POLICY "Users can insert their own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE id = order_id AND user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Admin users can view all order items" ON order_items;
CREATE POLICY "Admin users can view all order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
DROP POLICY IF EXISTS "Admin users can update all order items" ON order_items;
CREATE POLICY "Admin users can update all order items" ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Crear funciones RPC para operaciones comunes
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

CREATE OR REPLACE FUNCTION add_to_cart(
    p_product_id UUID,
    p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_existing_item UUID;
    v_result JSONB;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    -- Check if the user is authenticated
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not authenticated');
    END IF;
    
    -- Check if the product exists
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
        RETURN json_build_object('success', false, 'message', 'Product not found');
    END IF;
    
    -- Check if the item is already in the cart
    SELECT id INTO v_existing_item
    FROM cart_items
    WHERE user_id = v_user_id AND product_id = p_product_id;
    
    IF v_existing_item IS NOT NULL THEN
        -- Update the existing item
        UPDATE cart_items
        SET quantity = quantity + p_quantity,
            updated_at = now()
        WHERE id = v_existing_item;
        
        v_result := json_build_object(
            'success', true,
            'message', 'Cart item updated',
            'id', v_existing_item
        );
    ELSE
        -- Insert a new item
        WITH new_item AS (
            INSERT INTO cart_items (user_id, product_id, quantity)
            VALUES (v_user_id, p_product_id, p_quantity)
            RETURNING id
        )
        SELECT json_build_object(
            'success', true,
            'message', 'Item added to cart',
            'id', id
        ) INTO v_result
        FROM new_item;
    END IF;
    
    RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION create_order_from_cart()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_order_id UUID;
    v_total DECIMAL;
    v_result JSONB;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    -- Check if the user is authenticated
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not authenticated');
    END IF;
    
    -- Check if the cart is empty
    IF NOT EXISTS (SELECT 1 FROM cart_items WHERE user_id = v_user_id) THEN
        RETURN json_build_object('success', false, 'message', 'Cart is empty');
    END IF;
    
    -- Calculate the total
    SELECT COALESCE(SUM(ci.quantity * p.price), 0)
    INTO v_total
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = v_user_id;
    
    -- Create the order
    INSERT INTO orders (user_id, total)
    VALUES (v_user_id, v_total)
    RETURNING id INTO v_order_id;
    
    -- Create the order items
    INSERT INTO order_items (order_id, product_id, quantity, price)
    SELECT 
        v_order_id,
        ci.product_id,
        ci.quantity,
        p.price
    FROM 
        cart_items ci
    JOIN 
        products p ON ci.product_id = p.id
    WHERE 
        ci.user_id = v_user_id;
    
    -- Clear the cart
    DELETE FROM cart_items
    WHERE user_id = v_user_id;
    
    -- Return the result
    v_result := json_build_object(
        'success', true,
        'message', 'Order created successfully',
        'order_id', v_order_id,
        'total', v_total
    );
    
    RETURN v_result;
END;
$$;

