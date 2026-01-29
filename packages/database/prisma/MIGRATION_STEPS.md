# Migration Steps for Chat Feature

## Step-by-Step Instructions

### 1. Fix Existing Table Dependencies (if needed)

If you encounter an error about `channel_members` when running `prisma db push`:

1. Open Supabase Dashboard → SQL Editor
2. Run the SQL from `fix-channel-members.sql`:
   ```sql
   DROP POLICY IF EXISTS "Channels are viewable by members" ON channels;
   DROP POLICY IF EXISTS "Admins can update channels" ON channels;
   ```

### 2. Run Prisma Migration

```bash
cd packages/database
npx prisma db push
npx prisma generate
```

**If migration fails:**
- Check the error message
- The tables might already exist - that's okay, Prisma will update them
- If there are foreign key conflicts, you may need to drop existing tables first (be careful!)

### 3. Verify Table Names

Run `check-table-names.sql` in Supabase SQL Editor to see what table names Prisma created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Chat', 'chat', 'Message', 'message', 'UserPresence', 'userpresence')
ORDER BY table_name;
```

**Important:** Note the exact table names (case-sensitive):
- If tables are `Chat`, `Message`, `UserPresence` → Use the SQL as-is
- If tables are `chat`, `message`, `userpresence` → Update the SQL file to use lowercase

### 4. Enable Realtime and RLS

1. Open Supabase Dashboard → SQL Editor
2. Run the SQL from `supabase-realtime-setup.sql`
3. **If your tables are lowercase**, update the SQL:
   - Replace `"Chat"` with `"chat"`
   - Replace `"Message"` with `"message"`
   - Replace `"UserPresence"` with `"userpresence"`

### 5. Update Realtime Hook (if needed)

If your table names are lowercase, update `apps/web/hooks/use-chat-realtime.ts`:

```typescript
const tableName = "message"; // Change from "Message" to "message"
```

### 6. Test the Implementation

1. Start your dev server
2. Navigate to `/dashboard/community`
3. Try creating a chat
4. Send a message
5. Open in another browser/tab to test real-time updates

## Troubleshooting

### Error: "relation does not exist"
- Tables haven't been created yet → Run `npx prisma db push`
- Wrong table name case → Check actual table names and update SQL/hook

### Error: "Failed to fetch chats"
- Check browser console for detailed error
- Verify API route is working: `curl http://localhost:3000/api/chat`
- Check that user is authenticated
- Verify tables exist in database

### Realtime not working
- Check Supabase Dashboard → Database → Publications → `supabase_realtime` has `Message` table enabled
- Check browser console for Realtime connection errors
- Verify RLS policies are active
- Check table name matches in hook (case-sensitive)

### Infinite loop errors
- Should be fixed with the updated code
- If still happening, check React DevTools for component re-renders
- Verify `useEffect` dependencies are correct
