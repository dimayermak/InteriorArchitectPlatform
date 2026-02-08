import { createClient } from '@/lib/supabase/client';
import type { Project, ProjectPhase } from '@/types/database';

type ProjectInsert = Pick<Project, 'organization_id' | 'client_id' | 'name'> & Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'client_id' | 'name'>>;
type ProjectUpdate = Partial<Omit<Project, 'id'>>;

export async function getProjects(organizationId: string): Promise<Project[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Project[];
}

export async function getProjectById(id: string): Promise<Project | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }
    return data as Project;
}

export async function getProjectWithDetails(id: string): Promise<Project & { client: { name: string } | null; phases: ProjectPhase[] }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            clients(name),
            project_phases(*)
        `)
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);

    return {
        ...data,
        client: Array.isArray(data.clients) ? data.clients[0] : data.clients,
        phases: data.project_phases || [],
    };
}

export async function createProject(project: ProjectInsert): Promise<Project> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('projects')
        .insert({
            ...project,
            status: project.status || 'planning',
            priority: project.priority || 'medium',
            type: project.type || 'interior_design',
            currency: project.currency || 'ILS',
            meetings_office_quota: project.meetings_office_quota ?? 5,
            meetings_office_used: 0,
            meetings_site_quota: project.meetings_site_quota ?? 10,
            meetings_site_used: 0,
            meetings_shopping_quota: project.meetings_shopping_quota ?? 3,
            meetings_shopping_used: 0,
            metadata: project.metadata || {},
        })
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as Project;
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
    const supabase = createClient();

    // Soft delete
    const { error } = await supabase
        .from('projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
}

// Phase Management
export async function getProjectPhases(projectId: string): Promise<ProjectPhase[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('project_phases')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

export async function createProjectPhase(phase: Omit<ProjectPhase, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectPhase> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('project_phases')
        .insert(phase)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateProjectPhase(id: string, updates: Partial<ProjectPhase>): Promise<ProjectPhase> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('project_phases')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// Stats
export async function getProjectStats(projectId: string): Promise<{
    tasksTotal: number;
    tasksCompleted: number;
    hoursLogged: number;
    budget: number;
    spent: number;
}> {
    const supabase = createClient();

    const [tasksResult, timeResult, expensesResult, projectResult] = await Promise.all([
        supabase
            .from('tasks')
            .select('status', { count: 'exact' })
            .eq('project_id', projectId),
        supabase
            .from('time_entries')
            .select('duration_minutes')
            .eq('project_id', projectId),
        supabase
            .from('expenses')
            .select('amount')
            .eq('project_id', projectId)
            .eq('status', 'approved'),
        supabase
            .from('projects')
            .select('budget')
            .eq('id', projectId)
            .single(),
    ]);

    const tasks = tasksResult.data || [];
    const timeEntries = timeResult.data || [];
    const expenses = expensesResult.data || [];

    return {
        tasksTotal: tasks.length,
        tasksCompleted: tasks.filter((t) => t.status === 'completed').length,
        hoursLogged: timeEntries.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60,
        budget: projectResult.data?.budget || 0,
        spent: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    };
}
