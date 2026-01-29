-- Enable Realtime on messages table
-- Run this AFTER running Prisma migration (prisma db push)
-- Prisma creates tables with model names: Chat, Message, UserPresence
-- Run this in Supabase SQL Editor or via psql

-- First, check if tables exist (they should after Prisma migration)
-- If you get "relation does not exist" error, run: npx prisma db push first

-- Enable Realtime on Message table (Prisma model name becomes table name)
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";

-- Enable Row Level Security on Chat table
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on Message table
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view chats where they are user1 or user2
CREATE POLICY "Users can view their own chats"
ON "Chat"
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = "user1Id" OR 
  auth.uid()::text = "user2Id"
);

-- RLS Policy: Users can create chats where they are user1
CREATE POLICY "Users can create chats as user1"
ON "Chat"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = "user1Id"
);

-- RLS Policy: Users can view messages from chats they're part of
CREATE POLICY "Users can view messages from their chats"
ON "Message"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Chat"
    WHERE "Chat".id = "Message"."chatId"
    AND (
      "Chat"."user1Id" = auth.uid()::text OR
      "Chat"."user2Id" = auth.uid()::text
    )
  )
);

-- RLS Policy: Users can insert messages into chats they're part of
CREATE POLICY "Users can send messages to their chats"
ON "Message"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Chat"
    WHERE "Chat".id = "Message"."chatId"
    AND (
      "Chat"."user1Id" = auth.uid()::text OR
      "Chat"."user2Id" = auth.uid()::text
    )
  )
  AND "Message"."senderId" = auth.uid()::text
);

-- RLS Policy: Users can view their own presence
CREATE POLICY "Users can view their own presence"
ON "UserPresence"
FOR SELECT
TO authenticated
USING (auth.uid()::text = "userId");

-- RLS Policy: Users can update their own presence
CREATE POLICY "Users can update their own presence"
ON "UserPresence"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = "userId")
WITH CHECK (auth.uid()::text = "userId");

-- RLS Policy: Users can insert their own presence
CREATE POLICY "Users can insert their own presence"
ON "UserPresence"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "userId");
