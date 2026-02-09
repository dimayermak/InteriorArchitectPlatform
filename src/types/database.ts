// Database Types for Supabase
// These types mirror the database schema for type-safe operations

export type UserRole = 'owner' | 'admin' | 'employee';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export type ClientType = 'individual' | 'business';
export type ClientStatus = 'active' | 'inactive' | 'archived';
export type ProjectType = 'interior_design' | 'architecture' | 'combined';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type MeetingType = 'office' | 'site_supervision' | 'shopping' | 'consultation';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';
export type InvoiceType = 'client_invoice' | 'supplier_quote' | 'supplier_order';
export type InvoiceStatus = 'draft' | 'sent' | 'approved' | 'paid' | 'cancelled';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

// ============================================
// Core Tables
// ============================================

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    settings: Record<string, unknown>;
    subscription_tier: SubscriptionTier;
    subscription_status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    preferences: {
        language: 'he' | 'en';
        theme: 'light' | 'dark' | 'system';
    };
    last_active_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrganizationMember {
    id: string;
    organization_id: string;
    user_id: string;
    role: UserRole;
    permissions: Record<string, boolean>;
    invited_by: string | null;
    invited_at: string | null;
    accepted_at: string | null;
    created_at: string;
}

// ============================================
// CRM Module
// ============================================

export interface Lead {
    id: string;
    organization_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    source: string | null;
    status: LeadStatus;
    score: number;
    notes: string | null;
    assigned_to: string | null;
    last_contacted_at: string | null;
    converted_at: string | null;
    converted_to_client_id: string | null;
    metadata: Record<string, unknown>;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface Client {
    id: string;
    organization_id: string;
    lead_id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    address: string | null;
    // city: string | null;
    // postal_code: string | null;
    // type: ClientType; // Removed due to missing column in DB
    status: ClientStatus;
    notes: string | null;
    portal_enabled: boolean;
    portal_token: string | null;
    metadata: Record<string, unknown>;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

// ============================================
// Project Management Module
// ============================================

export interface Project {
    id: string;
    organization_id: string;
    client_id: string;
    name: string;
    description: string | null;
    project_number: string | null;
    type: ProjectType;
    status: ProjectStatus;
    priority: Priority;
    start_date: string | null;
    estimated_end_date: string | null;
    actual_end_date: string | null;
    budget: number | null;
    site_address: string | null;
    site_city: string | null;
    meetings_office_quota: number;
    meetings_office_used: number;
    meetings_site_quota: number;
    meetings_site_used: number;
    meetings_shopping_quota: number;
    meetings_shopping_used: number;
    manager_id: string | null;
    metadata: Record<string, unknown>;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ProjectPhase {
    id: string;
    project_id: string;
    name: string;
    description: string | null;
    order_index: number;
    status: 'pending' | 'in_progress' | 'completed';
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    organization_id: string;
    project_id: string | null;
    phase_id: string | null;
    parent_task_id: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    assigned_to: string | null;
    due_date: string | null;
    completed_at: string | null;
    estimated_hours: number | null;
    actual_hours: number | null;
    order_index: number;
    template_task_id: string | null;
    metadata: Record<string, unknown>;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

// ============================================
// Time Tracking Module
// ============================================

export interface TimeEntry {
    id: string;
    organization_id: string;
    project_id: string | null;
    task_id: string | null;
    user_id: string;
    description: string | null;
    duration_minutes: number;
    date: string;
    started_at: string | null;
    ended_at: string | null;
    is_running: boolean;
    is_billable: boolean;
    hourly_rate: number | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface Meeting {
    id: string;
    organization_id: string;
    project_id: string | null;
    client_id: string | null;
    title: string;
    type: MeetingType;
    description: string | null;
    scheduled_at: string;
    duration_minutes: number;
    location: string | null;
    status: MeetingStatus;
    attendees: string[];
    summary: string | null;
    action_items: string | null;
    google_event_id: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================
// Financial Module
// ============================================

export interface Supplier {
    id: string;
    organization_id: string;
    name: string;
    category: string | null;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    rating: number | null;
    notes: string | null;
    is_preferred: boolean;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface Invoice {
    id: string;
    organization_id: string;
    project_id: string | null;
    client_id: string | null;
    supplier_id: string | null;
    invoice_number: string;
    type: InvoiceType;
    status: InvoiceStatus;
    subtotal: number;
    tax_rate: number;
    tax_amount: number | null;
    total: number;
    currency: string;
    issue_date: string;
    due_date: string | null;
    paid_date: string | null;
    notes: string | null;
    items: InvoiceItem[];
    attachments: string[];
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface Expense {
    id: string;
    organization_id: string;
    project_id: string | null;
    supplier_id: string | null;
    invoice_id: string | null;
    description: string;
    category: string;
    amount: number;
    currency: string;
    date: string;
    receipt_url: string | null;
    status: ExpenseStatus;
    approved_by: string | null;
    approved_at: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================
// Templates Module
// ============================================

export interface ProjectTemplate {
    id: string;
    organization_id: string | null;
    name: string;
    description: string | null;
    type: ProjectType;
    is_system: boolean;
    is_active: boolean;
    default_phases: unknown[];
    default_tasks: unknown[];
    default_meetings: Record<string, number>;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface QuestionnaireField {
    id: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'date';
    label: string;
    required: boolean;
    options?: string[];
}

export interface Questionnaire {
    id: string;
    organization_id: string | null;
    name: string;
    type: 'program' | 'electrical' | 'plumbing' | 'custom';
    description: string | null;
    fields: QuestionnaireField[];
    is_system: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface QuestionnaireResponse {
    id: string;
    organization_id: string;
    questionnaire_id: string;
    project_id: string | null;
    client_id: string | null;
    responses: Record<string, unknown>;
    submitted_at: string;
    created_at: string;
}

// ============================================
// Employee Module
// ============================================

export interface Attendance {
    id: string;
    organization_id: string;
    user_id: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    total_hours: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================
// Database Type for Supabase Client
// ============================================

export interface Database {
    public: {
        Tables: {
            organizations: {
                Row: Organization;
                Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Organization, 'id'>>;
            };
            users: {
                Row: User;
                Insert: Omit<User, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<User, 'id'>>;
            };
            organization_members: {
                Row: OrganizationMember;
                Insert: Omit<OrganizationMember, 'id' | 'created_at'>;
                Update: Partial<Omit<OrganizationMember, 'id'>>;
            };
            leads: {
                Row: Lead;
                Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Lead, 'id'>>;
            };
            clients: {
                Row: Client;
                Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Client, 'id'>>;
            };
            projects: {
                Row: Project;
                Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Project, 'id'>>;
            };
            project_phases: {
                Row: ProjectPhase;
                Insert: Omit<ProjectPhase, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ProjectPhase, 'id'>>;
            };
            tasks: {
                Row: Task;
                Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Task, 'id'>>;
            };
            time_entries: {
                Row: TimeEntry;
                Insert: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<TimeEntry, 'id'>>;
            };
            meetings: {
                Row: Meeting;
                Insert: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Meeting, 'id'>>;
            };
            suppliers: {
                Row: Supplier;
                Insert: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Supplier, 'id'>>;
            };
            invoices: {
                Row: Invoice;
                Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Invoice, 'id'>>;
            };
            expenses: {
                Row: Expense;
                Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Expense, 'id'>>;
            };
            project_templates: {
                Row: ProjectTemplate;
                Insert: Omit<ProjectTemplate, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ProjectTemplate, 'id'>>;
            };
            questionnaires: {
                Row: Questionnaire;
                Insert: Omit<Questionnaire, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Questionnaire, 'id'>>;
            };
            questionnaire_responses: {
                Row: QuestionnaireResponse;
                Insert: Omit<QuestionnaireResponse, 'id' | 'created_at'>;
                Update: Partial<Omit<QuestionnaireResponse, 'id'>>;
            };
            attendance: {
                Row: Attendance;
                Insert: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Attendance, 'id'>>;
            };
        };
    };
}
