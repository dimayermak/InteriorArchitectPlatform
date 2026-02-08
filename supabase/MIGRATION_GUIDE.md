# Running the Database Migration

## Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/ulmankwcywixowwsvujf/sql/new

## Step 2: Copy and Paste the Migration

1. Open the file: `supabase/migrations/001_initial_schema.sql`
2. Copy ALL the contents
3. Paste into the Supabase SQL Editor
4. Click "Run" button

## Step 3: Verify Tables Were Created

After running, go to the Table Editor to verify:
https://supabase.com/dashboard/project/ulmankwcywixowwsvujf/editor

You should see these tables:
- ✅ organizations
- ✅ profiles  
- ✅ leads
- ✅ clients
- ✅ projects
- ✅ tasks
- ✅ time_entries
- ✅ meetings
- ✅ suppliers
- ✅ invoices
- ✅ expenses
- ✅ templates
- ✅ questionnaires
- ✅ attendance

## Step 4: Confirm to Continue

Once you've run the migration and verified the tables exist, let me know and I'll proceed with fixing the auth forms!

## What This Migration Does

1. **Creates all database tables** - Complete schema for the CRM platform
2. **Sets up Row Level Security (RLS)** - Multi-tenant data isolation
3. **Auto-creates profiles** - When users register, profile + organization are auto-created
4. **Adds triggers** - Auto-updates timestamps
5. **Creates indexes** - Optimizes query performance
