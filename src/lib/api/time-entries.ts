import { createClient } from '@/lib/supabase/client';

// DB columns: id, organization_id, project_id, task_id, user_id,
//             description, hours (numeric), date, billable, client_id,
//             created_at, updated_at

export interface TimeEntryRow {
    id: string;
    organization_id: string;
    project_id: string | null;
    task_id: string | null;
    user_id: string;
    client_id: string | null;
    description: string | null;
    hours: number;
    date: string;
    billable: boolean;
    created_at: string;
    updated_at: string;
}

type TimeEntryInsert = Pick<TimeEntryRow, 'organization_id' | 'user_id' | 'hours' | 'date'> &
    Partial<Omit<TimeEntryRow, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'user_id' | 'hours' | 'date'>>;

export async function getTimeEntries(
    organizationId: string,
    options?: {
        projectId?: string;
        clientId?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
    }
): Promise<TimeEntryRow[]> {
    const supabase = createClient();

    let query = supabase
        .from('time_entries')
        .select('*')
        .eq('organization_id', organizationId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (options?.projectId) query = query.eq('project_id', options.projectId);
    if (options?.clientId) query = query.eq('client_id', options.clientId);
    if (options?.userId) query = query.eq('user_id', options.userId);
    if (options?.startDate) query = query.gte('date', options.startDate);
    if (options?.endDate) query = query.lte('date', options.endDate);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as TimeEntryRow[];
}

export async function createTimeEntry(entry: TimeEntryInsert): Promise<TimeEntryRow> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('time_entries')
        .insert({
            ...entry,
            billable: entry.billable ?? true,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as TimeEntryRow;
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntryRow>): Promise<TimeEntryRow> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('time_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as TimeEntryRow;
}

export async function deleteTimeEntry(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('time_entries').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

export interface TimeStats {
    todayHours: number;
    weekHours: number;
    monthHours: number;
}

export async function getTimeStats(organizationId: string, userId: string): Promise<TimeStats> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('time_entries')
        .select('date, hours')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .gte('date', monthStartStr);

    if (error) throw new Error(error.message);
    const entries = (data || []) as { date: string; hours: number }[];

    return {
        todayHours: entries.filter(e => e.date === today).reduce((s, e) => s + (e.hours || 0), 0),
        weekHours: entries.filter(e => e.date >= weekStartStr).reduce((s, e) => s + (e.hours || 0), 0),
        monthHours: entries.reduce((s, e) => s + (e.hours || 0), 0),
    };
}
