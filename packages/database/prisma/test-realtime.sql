-- Test Realtime by inserting a message directly
-- Run this while you have the chat open in your browser
-- You should see the message appear instantly (within milliseconds)

-- Replace these values with actual IDs from your database:
-- 1. Get a chat ID: SELECT id FROM "Chat" LIMIT 1;
-- 2. Get a user ID: SELECT id FROM "User" LIMIT 1;

-- Example (replace with your actual IDs):
/*
INSERT INTO "Message" ("id", "chatId", "senderId", "content", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'YOUR_CHAT_ID_HERE',
    'YOUR_USER_ID_HERE',
    'Test message from SQL - should appear instantly!',
    NOW(),
    NOW()
);
*/

-- If the message appears instantly, Realtime is working!
-- If it takes 5-6 seconds, there's a configuration issue.
