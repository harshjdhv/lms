-- Check actual table names created by Prisma
-- Run this in Supabase SQL Editor to see what tables exist

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Chat', 'chat', 'Message', 'message', 'UserPresence', 'userpresence')
ORDER BY table_name;

-- Also check column names for Message table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('Message', 'message')
ORDER BY ordinal_position;
