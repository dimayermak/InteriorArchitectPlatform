-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Supervision Reports Table
create table if not exists supervision_reports (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id),
  project_id uuid not null references projects(id),
  date date not null,
  attendees text[] default '{}',
  notes text,
  images text[] default '{}',
  status text check (status in ('draft', 'sent')) default 'draft',
  next_visit_date date,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Purchase Orders Table
create table if not exists purchase_orders (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id),
  project_id uuid not null references projects(id),
  supplier_id uuid references suppliers(id),
  order_number text,
  order_date date not null default CURRENT_DATE,
  status text check (status in ('draft', 'ordered', 'shipped', 'delivered', 'installed', 'cancelled')) default 'draft',
  items jsonb default '[]'::jsonb,
  total_amount numeric(10, 2) default 0,
  currency text default 'ILS',
  pdf_url text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Email Templates Table
create table if not exists email_templates (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id),
  name text not null,
  subject text not null,
  body text not null,
  category text check (category in ('general', 'supervision', 'meeting_summary', 'onboarding', 'quote')) default 'general',
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Project Suppliers Table (Junction Table)
create table if not exists project_suppliers (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id),
  project_id uuid not null references projects(id),
  supplier_id uuid not null references suppliers(id),
  role text, -- e.g., 'Kitchen', 'Flooring', 'Sanitary'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, supplier_id)
);

-- Enable RLS
alter table supervision_reports enable row level security;
alter table purchase_orders enable row level security;
alter table email_templates enable row level security;
alter table project_suppliers enable row level security;

-- RLS Policies (Assuming organization_id isolation)

-- Helper function to get organization_id (optional, but cleaner)
-- But sticking to subqueries for simplicity and portability

-- Supervision Reports
create policy "Users can view supervision reports for their organization"
  on supervision_reports for select
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can insert supervision reports for their organization"
  on supervision_reports for insert
  with check (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can update supervision reports for their organization"
  on supervision_reports for update
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can delete supervision reports for their organization"
  on supervision_reports for delete
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

-- Purchase Orders
create policy "Users can view purchase orders for their organization"
  on purchase_orders for select
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can insert purchase orders for their organization"
  on purchase_orders for insert
  with check (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can update purchase orders for their organization"
  on purchase_orders for update
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can delete purchase orders for their organization"
  on purchase_orders for delete
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

-- Email Templates
create policy "Users can view email templates for their organization"
  on email_templates for select
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can insert email templates for their organization"
  on email_templates for insert
  with check (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can update email templates for their organization"
  on email_templates for update
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can delete email templates for their organization"
  on email_templates for delete
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

-- Project Suppliers
create policy "Users can view project suppliers for their organization"
  on project_suppliers for select
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can insert project suppliers for their organization"
  on project_suppliers for insert
  with check (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can update project suppliers for their organization"
  on project_suppliers for update
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users can delete project suppliers for their organization"
  on project_suppliers for delete
  using (organization_id = (select organization_id from profiles where id = auth.uid()));
