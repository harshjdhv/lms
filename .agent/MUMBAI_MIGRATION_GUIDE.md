# Supabase Migration & Setup Guide (Mumbai Region)

I have updated your `.env` files with the new Mumbai server credentials. However, I could not apply the changes to the database because the password was not explicitly confirmed for use in the migration command.

Please follow these steps to finalize the setup:

## 1. Add Password to Environment Files
Open the following files and replace `[YOUR-PASSWORD]` with your actual database password:
- `apps/web/.env.local`
- `packages/database/.env`

## 2. Push Database Schema
Once the password is added, open your terminal and run the following command to create the tables in your new Supabase project:
```bash
npx prisma db push
```
*Note: This will connect to the Mumbai database and create all tables defined in your schema.*

## 3. Enable Realtime & Policies
To enable Realtime for chat features and set up necessary Row Level Security (RLS) policies, I have verified the existing setup script.

1.  Copy the content of this file:
    `packages/database/prisma/supabase-realtime-setup.sql`
    *(You can open it in your editor to copy)*

2.  Go to your **Supabase Dashboard** -> **SQL Editor**.
3.  Paste the SQL and click **Run**.
4.  **Verify Realtime**: Go to **Database** -> **Replication**. Ensure `supabase_realtime` publication exists and includes the `Message` table.

## 4. Setup Storage Bucket
Your application expects a specific storage bucket.

1.  Go to **Supabase Dashboard** -> **Storage**.
2.  Create a new bucket named: `ConnectX Bucket` (Exact name is important).
3.  **Toggle "Public"** to ON.
4.  **Add Policies** to the bucket:
    - **SELECT**: Enable for "All Users" (so file links work).
    - **INSERT**: Enable for "Authenticated" users (so students/teachers can upload).

## 5. S3 Compatible Keys (Optional)
I have added the S3 keys you provided to your `.env.local` as `SUPABASE_ACCESS_KEY_ID` and `SUPABASE_SECRET_ACCESS_KEY`. These are not currently used by the default upload component (which uses the Supabase client), but they are available if you decide to implement a direct S3 uploader later.

## 6. Restart Server
Finally, restart your development server to load the new environment variables:
```bash
# In the terminal running the dev server
Ctrl+C
bun run dev
```
