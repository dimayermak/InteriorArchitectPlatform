-- Seed Data for Development (matches Dev Bypass UUIDs)

-- Use the specific Dev Organization UUID
DO $$
DECLARE
    dev_org_id UUID := '00000000-0000-0000-0000-000000000000';
    -- dev_user_id is not needed in DB because Dev Bypass mocks the profile in code
    -- Inserting it into 'profiles' fails because it doesn't exist in 'auth.users'
    
    client1_id UUID := gen_random_uuid();
    client2_id UUID := gen_random_uuid();
BEGIN
    -- 1. Ensure the Dev Organization exists (idempotent)
    -- We CAN insert this because organizations table doesn't link to auth.users
    INSERT INTO public.organizations (id, name, created_at, updated_at)
    VALUES (dev_org_id, 'Demo Studio', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- SKIPPING Profile insert to avoid FK violation with auth.users
    -- The app's Dev Login returns a mock profile object directly.

    -- 2. Insert Sample Clients
    INSERT INTO public.clients (id, organization_id, name, email, phone, address, status, created_at, updated_at)
    VALUES 
        (client1_id, dev_org_id, 'Sarah Cohen', 'sarah@example.com', '050-111-2222', 'Tel Aviv, Rothschild 10', 'active', NOW() - INTERVAL '5 days', NOW()),
        (client2_id, dev_org_id, 'David Levi', 'david@example.com', '052-333-4444', 'Herzliya, Pituach', 'active', NOW() - INTERVAL '10 days', NOW()),
        (gen_random_uuid(), dev_org_id, 'StartUp Office Ltd', 'office@startup.com', '054-555-6666', 'Ramat Gan, Bursa', 'inactive', NOW() - INTERVAL '20 days', NOW());

    -- 3. Insert Sample Leads
    INSERT INTO public.leads (organization_id, name, email, phone, company, source, status, score, notes, created_at, updated_at)
    VALUES 
        (dev_org_id, 'Dana White', 'dana@design.com', '050-999-8888', NULL, 'Instagram', 'new', 60, 'Interested in full home renovation', NOW(), NOW()),
        (dev_org_id, 'Michael Green', 'mike@green.com', '052-777-6666', 'Green Enterprises', 'Website', 'contacted', 75, 'Looking for office design', NOW() - INTERVAL '2 days', NOW()),
        (dev_org_id, 'Yael Brown', 'yael@brown.com', '054-333-2222', NULL, 'Referral', 'qualified', 90, 'High budget, urgent start', NOW() - INTERVAL '3 days', NOW()),
        (dev_org_id, 'Ron Black', 'ron@black.com', '050-000-1111', NULL, 'Facebook', 'proposal', 80, 'Sent proposal yesterday', NOW() - INTERVAL '5 days', NOW()),
        (dev_org_id, 'Won Deal Example', 'success@won.com', '052-123-4567', NULL, 'Google', 'won', 100, 'Project starting next month', NOW() - INTERVAL '10 days', NOW());

END $$;
