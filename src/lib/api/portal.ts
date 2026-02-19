'use server';

import { createClient } from '@/lib/supabase/server';
import type { Project, ProjectPhase, Task, Client } from '@/types/database';
import type { ClientReport } from './client-reports';
import { randomBytes } from 'crypto';

// ============================================
// Portal API - Public Project Access
// ============================================

const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

export interface PortalFinancials {
    budget: number;
    // Spent by designer (purchase orders + expenses) — out of budget
    totalSpent: number;
    remainingBudget: number;
    savedAmount: number;
    // Payments: client → designer (invoices)
    totalInvoiced: number;
    totalPaid: number;
    remainingToPay: number;
}

export interface PortalProject {
    project: Project & { client: Pick<Client, 'name'> | null };
    phases: ProjectPhase[];
    tasks: Array<Pick<Task, 'id' | 'title' | 'status' | 'phase_id'>>;
    stats: {
        totalTasks: number;
        completedTasks: number;
        progressPercent: number;
    };
    financials: PortalFinancials;
    report: ClientReport | null;
}

/**
 * Generate a unique access token for a project
 */
export async function generatePortalToken(projectId: string): Promise<string> {
    const supabase = await createClient();
    const token = randomBytes(32).toString('hex');

    // Store token in project metadata
    const { error } = await supabase
        .from('projects')
        .update({
            metadata: { portal_token: token, portal_token_created_at: new Date().toISOString() },
        })
        .eq('id', projectId);

    if (error) throw error;
    return token;
}

/**
 * Get project by portal token (public access - no auth required)
 */
export async function getProjectByToken(token: string): Promise<PortalProject | null> {
    const supabase = await createClient();

    // Find project with matching token
    const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select(`
            *,
            client:clients(name)
        `)
        .filter('metadata->>portal_token', 'eq', token)
        .limit(1);

    if (projectError) throw projectError;
    if (!projects || projects.length === 0) return null;

    const project = projects[0];

    // Get phases
    const { data: phases, error: phasesError } = await supabase
        .from('project_phases')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index');

    if (phasesError) throw phasesError;

    // Get tasks (limited info for public view)
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, status, phase_id')
        .eq('project_id', project.id)
        .order('order_index');

    if (tasksError) throw tasksError;

    // Fetch financial data (purchase orders + expenses + invoices)
    const [ordersResult, expensesResult, invoicesResult, reportResult] = await Promise.all([
        supabase
            .from('purchase_orders')
            .select('total_amount')
            .eq('project_id', project.id)
            .neq('status', 'cancelled'),
        supabase
            .from('expenses')
            .select('amount')
            .eq('project_id', project.id),
        supabase
            .from('invoices')
            .select('total, status')
            .eq('project_id', project.id),
        supabase
            .from('client_reports')
            .select('*')
            .eq('project_id', project.id)
            .maybeSingle(),
    ]);

    const budget = (project as Project).budget || 0;
    const totalPO = (ordersResult.data || []).reduce((s, o) => s + (o.total_amount || 0), 0);
    const totalExp = (expensesResult.data || []).reduce((s, e) => s + (e.amount || 0), 0);
    const totalSpent = totalPO + totalExp;
    const remainingBudget = budget - totalSpent;

    const invoices = invoicesResult.data || [];
    const totalInvoiced = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const remainingToPay = totalInvoiced - totalPaid;

    // Calculate stats
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
        project: project as Project & { client: Pick<Client, 'name'> | null },
        phases: phases || [],
        tasks: tasks || [],
        stats: {
            totalTasks,
            completedTasks,
            progressPercent,
        },
        financials: {
            budget,
            totalSpent,
            remainingBudget,
            savedAmount: Math.max(0, remainingBudget),
            totalInvoiced,
            totalPaid,
            remainingToPay,
        },
        report: (reportResult.data as ClientReport | null) ?? null,
    };
}

/**
 * Revoke portal access for a project
 */
export async function revokePortalToken(projectId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('projects')
        .update({
            metadata: { portal_token: null, portal_token_created_at: null },
        })
        .eq('id', projectId);

    if (error) throw error;
}

/**
 * Get portal link for a project (for sharing with clients)
 */
export async function getPortalLink(projectId: string, baseUrl: string): Promise<string | null> {
    const supabase = await createClient();

    const { data: project, error } = await supabase
        .from('projects')
        .select('metadata')
        .eq('id', projectId)
        .single();

    if (error || !project?.metadata?.portal_token) return null;

    return `${baseUrl}/portal/${project.metadata.portal_token}`;
}
