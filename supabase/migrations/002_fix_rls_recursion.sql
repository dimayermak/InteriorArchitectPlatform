-- Fix RLS Recursion and Add Missing Columns

-- 1. Create a secure function to get the current user's organization ID
-- This avoids infinite recursion by bypassing RLS (SECURITY DEFINER)
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

-- 2. Drop the recursive policies on profiles
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- 3. Create new, non-recursive policies for profiles
-- Allow users to view their own profile (simple check)
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

-- Allow users to view other profiles in their organization (uses the secure function)
CREATE POLICY "Users can view organization profiles"
    ON profiles FOR SELECT
    USING (organization_id = get_auth_user_organization_id());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- 4. Add missing deleted_at columns to support soft delete
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 5. Optimize policies on other tables to use the new function (optional but recommended for performance)
-- Re-creating Leads policy as an example of optimization
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
