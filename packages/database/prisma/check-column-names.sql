-- Check actual column names in Message table
-- This will help us fix the Realtime filter

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'Message'
ORDER BY ordinal_position;

-- Also check if there are any constraints or indexes that might affect the column name
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    a.attname AS column_name
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
WHERE t.relname = 'Message'
ORDER BY a.attname;
