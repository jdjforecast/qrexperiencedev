-- Remove code column from products table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'code'
    ) THEN
        ALTER TABLE products DROP COLUMN code;
    END IF;
END $$;

