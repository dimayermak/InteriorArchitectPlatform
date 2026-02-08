import { createClient } from '@/lib/supabase/client';

export interface DashboardStats {
    leads: {
        total: number;
        new: number;
        qualified: number;
    };
    clients: {
        total: number;
        active: number;
    };
    projects: {
        total: number;
        active: number;
        completed: number;
    };
    finance: {
        pendingInvoices: number;
        monthlyRevenue: number;
    };
}

export interface RecentActivity {
    id: string;
    type: 'lead' | 'client' | 'project' | 'task' | 'invoice';
    action: 'created' | 'updated' | 'completed' | 'converted';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

export async function getDashboardStats(organizationId: string): Promise<DashboardStats> {
    const supabase = createClient();

    // Parallel queries for performance
    const [leadsResult, clientsResult, projectsResult, invoicesResult] = await Promise.all([
        // Leads count
        supabase
            .from('leads')
            .select('status', { count: 'exact', head: false })
            .eq('organization_id', organizationId)
            .is('deleted_at', null),

        // Clients count
        supabase
            .from('clients')
            .select('status', { count: 'exact', head: false })
            .eq('organization_id', organizationId)
            .is('deleted_at', null),

        // Projects count
        supabase
            .from('projects')
            .select('status', { count: 'exact', head: false })
            .eq('organization_id', organizationId)
            .is('deleted_at', null),

        // Pending invoices
        supabase
            .from('invoices')
            .select('total, status')
            .eq('organization_id', organizationId)
            .in('status', ['sent', 'overdue']),
    ]);

    // Process leads
    const leads = leadsResult.data || [];
    const newLeads = leads.filter((l) => l.status === 'new').length;
    const qualifiedLeads = leads.filter((l) => l.status === 'qualified' || l.status === 'proposal').length;

    // Process clients
    const clients = clientsResult.data || [];
    const activeClients = clients.filter((c) => c.status === 'active').length;

    // Process projects
    const projects = projectsResult.data || [];
    const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'planning').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    // Process invoices
    const invoices = invoicesResult.data || [];
    const pendingTotal = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    return {
        leads: {
            total: leads.length,
            new: newLeads,
            qualified: qualifiedLeads,
        },
        clients: {
            total: clients.length,
            active: activeClients,
        },
        projects: {
            total: projects.length,
            active: activeProjects,
            completed: completedProjects,
        },
        finance: {
            pendingInvoices: pendingTotal,
            monthlyRevenue: 0, // TODO: Calculate from paid invoices this month
        },
    };
}

export async function getRecentActivity(
    organizationId: string,
    limit: number = 10
): Promise<RecentActivity[]> {
    const supabase = createClient();

    // Get recent items from multiple tables
    const [recentLeads, recentClients, recentProjects] = await Promise.all([
        supabase
            .from('leads')
            .select('id, name, status, created_at, updated_at')
            .eq('organization_id', organizationId)
            .order('updated_at', { ascending: false })
            .limit(5),

        supabase
            .from('clients')
            .select('id, name, status, created_at, updated_at')
            .eq('organization_id', organizationId)
            .order('updated_at', { ascending: false })
            .limit(5),

        supabase
            .from('projects')
            .select('id, name, status, created_at, updated_at')
            .eq('organization_id', organizationId)
            .order('updated_at', { ascending: false })
            .limit(5),
    ]);

    const activities: RecentActivity[] = [];

    // Process leads
    (recentLeads.data || []).forEach((lead) => {
        const isNew = new Date(lead.created_at).getTime() === new Date(lead.updated_at).getTime();
        activities.push({
            id: `lead-${lead.id}`,
            type: 'lead',
            action: lead.status === 'won' ? 'converted' : isNew ? 'created' : 'updated',
            title: lead.name,
            description: lead.status === 'won' ? 'הפך ללקוח' : isNew ? 'ליד חדש נוסף' : 'עודכן',
            timestamp: lead.updated_at,
            icon: '📋',
        });
    });

    // Process clients
    (recentClients.data || []).forEach((client) => {
        const isNew = new Date(client.created_at).getTime() === new Date(client.updated_at).getTime();
        activities.push({
            id: `client-${client.id}`,
            type: 'client',
            action: isNew ? 'created' : 'updated',
            title: client.name,
            description: isNew ? 'לקוח חדש נוסף' : 'פרטי לקוח עודכנו',
            timestamp: client.updated_at,
            icon: '👤',
        });
    });

    // Process projects
    (recentProjects.data || []).forEach((project) => {
        const isNew = new Date(project.created_at).getTime() === new Date(project.updated_at).getTime();
        activities.push({
            id: `project-${project.id}`,
            type: 'project',
            action: project.status === 'completed' ? 'completed' : isNew ? 'created' : 'updated',
            title: project.name,
            description: project.status === 'completed' ? 'פרויקט הושלם' : isNew ? 'פרויקט חדש נוצר' : 'פרויקט עודכן',
            timestamp: project.updated_at,
            icon: '🏗️',
        });
    });

    // Sort by timestamp and limit
    return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
}

export async function getUpcomingTasks(
    organizationId: string,
    limit: number = 5
): Promise<{ id: string; title: string; dueDate: string; project: string; priority: string }[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('tasks')
        .select(`
            id,
            title,
            due_date,
            priority,
            projects!inner(name)
        `)
        .eq('organization_id', organizationId)
        .not('due_date', 'is', null)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true })
        .limit(limit);

    return (data || []).map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.due_date!,
        project: (task.projects as unknown as { name: string })?.name || '',
        priority: task.priority,
    }));
}
