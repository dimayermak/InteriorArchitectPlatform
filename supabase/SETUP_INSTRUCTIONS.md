# 🚀 Supabase Setup - Action Required

## Step 1: Run Database Migration

### Go to Supabase SQL Editor
👉 **https://supabase.com/dashboard/project/ulmankwcywixowwsvujf/sql/new**

### Copy & Paste
1. Open file: `supabase/migrations/001_initial_schema.sql`
2. Copy ALL contents (it's a long file - make sure you get everything!)
3. Paste into SQL Editor  
4. Click **"Run"** button (bottom right)

### Expected Result
You should see: "Success. No rows returned"

---

## Step 2: Disable Email Confirmation (For Dev/Testing)

### Go to Authentication Settings
👉 **https://supabase.com/dashboard/project/ulmankwcywixowwsvujf/auth/url-configuration**

### Find "Email Confirmations" Section
- **Disable** "Enable email confirmations"
- Click Save

This allows immediate registration without email verification (good for development).

---

## Step 3: Verify Tables Created

### Go to Table Editor
👉 **https://supabase.com/dashboard/project/ulmankwcywixowwsvujf/editor**

### Check These Tables Exist:
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

---

## Step 4: Confirm to Proceed

Once you've completed Steps 1-3, reply with "done" and I'll test the registration!

## What Happens When You Register:
1. User account created in `auth.users`
2. **Automatic trigger** creates:
   - Organization (using studio name from form)
   - Profile (linked to user + organization)
3. You're logged in and redirected to dashboard
4. All CRM data will be organization-scoped (multi-tenant ready!)
