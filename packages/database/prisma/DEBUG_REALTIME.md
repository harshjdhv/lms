# Debugging Realtime Delay Issues

If messages are taking 5-6 seconds to appear, check the following:

## 1. Verify Realtime is Enabled

Run this SQL in Supabase SQL Editor:
```sql
-- Check if Message table is in Realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('Message', 'message');
```

If no results, enable it:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
-- OR if your table is lowercase:
ALTER PUBLICATION supabase_realtime ADD TABLE "message";
```

## 2. Check Table Name Case

Prisma creates tables with exact model names. Check your actual table name:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Message', 'message');
```

Update `use-chat-realtime.ts` accordingly:
- If table is `Message` → use `"Message"`
- If table is `message` → use `"message"`

## 3. Check Column Names

Verify column names match Prisma's camelCase:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('Message', 'message')
ORDER BY ordinal_position;
```

The filter should use: `chatId=eq.{chatId}` (camelCase)

## 4. Test Realtime Connection

Open browser console and check for:
- `✅ Realtime subscribed to chat {id} - messages will appear instantly`
- `Realtime message received:` logs when a message is sent

## 5. Check RLS Policies

RLS policies might be blocking Realtime. Verify:
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('Message', 'message');
```

Make sure policies allow SELECT for authenticated users.

## 6. Network Issues

Check Supabase Dashboard → Settings → API → Realtime:
- Is Realtime enabled for your project?
- Are there any connection limits?
- Check the Realtime logs for errors

## 7. Alternative: Use Broadcast Instead

If Postgres Changes is slow, consider using Broadcast (faster but requires manual persistence):
- Use `channel.send()` for instant delivery
- Persist messages via API after sending
