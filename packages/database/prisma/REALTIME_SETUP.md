# Supabase Realtime Chat Setup Instructions

## Prerequisites

### Step 1: Fix Existing Table Dependencies (if needed)

If you get an error about `channel_members` table when running `prisma db push`:

1. Run the SQL script `fix-channel-members.sql` in Supabase SQL Editor:
   ```sql
   -- Drop policies that depend on channel_members
   DROP POLICY IF EXISTS "Channels are viewable by members" ON channels;
   DROP POLICY IF EXISTS "Admins can update channels" ON channels;
   ```

2. Then proceed with Prisma migration

### Step 2: Run Prisma Migration

1. Run Prisma migration to create the new tables:
   ```bash
   cd packages/database
   npx prisma db push
   # OR
   npx prisma migrate dev --name add_chat_models
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. **Important**: After migration, check the actual table names in Supabase Dashboard:
   - Go to Database → Tables
   - Note the exact table names (they should be `Chat`, `Message`, `UserPresence` with capital letters)
   - If they're lowercase (`chat`, `message`, `userpresence`), update the SQL file accordingly

## Supabase Configuration

### 1. Enable Realtime on Messages Table

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Publications** → `supabase_realtime`
3. Toggle on the `messages` table
4. OR run this SQL in the SQL Editor:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ```

### 2. Enable Row Level Security and Create Policies

Run the SQL file `supabase-realtime-setup.sql` in your Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy and paste the contents of `supabase-realtime-setup.sql`
4. Run the query

This will:
- Enable RLS on `chats` and `messages` tables
- Create policies allowing users to:
  - View chats they're part of
  - Create chats
  - View and send messages in their chats
  - Manage their own presence

## Verification

After setup, verify that:

1. ✅ Tables `chats`, `messages`, and `UserPresence` exist in your database
2. ✅ Realtime is enabled on the `messages` table
3. ✅ RLS policies are created and active
4. ✅ You can create chats via the API
5. ✅ Messages appear in real-time when sent

## Troubleshooting

### Realtime not working?

- Check that Realtime is enabled on the `messages` table in Publications
- Verify RLS policies are active (Database → Tables → messages → Policies)
- Check browser console for Realtime connection errors
- Ensure your Supabase project has Realtime enabled (Settings → API)

### RLS Policy Errors?

- Verify that user IDs in your database match Supabase auth UIDs
- Check that column names match exactly (case-sensitive in PostgreSQL)
- Ensure policies are created for the correct role (`authenticated`)

### Messages not appearing?

- Check that the Realtime subscription is active (check browser console)
- Verify the chat ID matches between client and server
- Ensure the user is authenticated and has access to the chat
