-- Fix channel_members table dependency issue
-- Run this BEFORE running: npx prisma db push
-- This removes the dependent policies so Prisma can drop the table

-- Drop policies that depend on channel_members
DROP POLICY IF EXISTS "Channels are viewable by members" ON channels;
DROP POLICY IF EXISTS "Admins can update channels" ON channels;

-- Now you can run: npx prisma db push
