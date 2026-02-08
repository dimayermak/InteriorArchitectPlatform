# 🚨 Critical Fix: RLS & Schema Update

We found an "infinite recursion" error in the database security policies and a missing column. Use this new migration to fix it.

## Instructions

1. **Go to Supabase SQL Editor**
   👉 https://supabase.com/dashboard/project/ulmankwcywixowwsvujf/sql/new

2. **Run the Fix**
   Copy and paste the code below and click **Run**:

```sql
-- Fix RLS Recursion and Add Missing Columns

-- 1. Create a secure function to get the current user's organization ID
CREATE OR REPLACE FUNCTION public.get_auth_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Loop in Profiles Policies
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can view organization profiles"
    ON profiles FOR SELECT
    USING (organization_id = get_auth_user_organization_id());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- 3. Add Missing Columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. Optimize Leads Policies
DROP POLICY IF EXISTS "Users can view data in their organization" ON leads;
CREATE POLICY "Users can view leads in their organization"
    ON leads FOR SELECT
    USING (organization_id = get_auth_user_organization_id());

DROP POLICY IF EXISTS "Users can insert data in their organization" ON leads;
CREATE POLICY "Users can insert leads in their organization"
    ON leads FOR INSERT
    WITH CHECK (organization_id = get_auth_user_organization_id());

DROP POLICY IF EXISTS "Users can update data in their organization" ON leads;
CREATE POLICY "Users can update leads in their organization"
    ON leads FOR UPDATE
    USING (organization_id = get_auth_user_organization_id());
```

3. **Reply "Done"** when finished, and I'll verify the Leads page fixes!
