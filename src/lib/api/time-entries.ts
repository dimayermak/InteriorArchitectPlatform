import { createClient } from '@/lib/supabase/client';
import type { TimeEntry } from '@/types/database';

type TimeEntryInsert = Pick<TimeEntry, 'organization_id' | 'user_id' | 'duration_minutes' | 'date'> & Partial<Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'user_id' | 'duration_minutes' | 'date'>>;
type TimeEntryUpdate = Partial<Omit<TimeEntry, 'id'>>;

export async function getTimeEntries(
    organizationId: string,
    options?: {
        projectId?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
    }
): Promise<TimeEntry[]> {
    const supabase = createClient();

    let query = supabase
        .from('time_entries')
        .select('*')
        .eq('organization_id', organizationId)
        .order('date', { ascending: false });

    if (options?.projectId) {
        query = query.eq('project_id', options.projectId);
    }
    if (options?.userId) {
        query = query.eq('user_id', options.userId);
    }
    if (options?.startDate) {
        query = query.gte('date', options.startDate);
    }
    if (options?.endDate) {
        query = query.lte('date', options.endDate);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
}

export async function getActiveTimer(organizationId: string, userId: string): Promise<TimeEntry | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .eq('is_running', true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }
    return data;
}

export async function startTimer(entry: TimeEntryInsert): Promise<TimeEntry> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('time_entries')
        .insert({
            ...entry,
            is_running: true,
            started_at: new Date().toISOString(),
            duration_minutes: 0,
            date: new Date().toISOString().split('T')[0],
            is_billable: entry.is_billable ?? true,
            metadata: entry.metadata || {},
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function stopTimer(id: string): Promise<TimeEntry> {
    const supabase = createClient();

    // First get the running entry
    const { data: entry, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!entry.started_at) throw new Error('Timer was not started');

    const startedAt = new Date(entry.started_at);
    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

    const { data, error } = await supabase
        .from('time_entries')
        .update({
            is_running: false,
            ended_at: endedAt.toISOString(),
            duration_minutes: durationMinutes,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function createManualEntry(entry: TimeEntryInsert): Promise<TimeEntry> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('time_entries')
        .insert({
            ...entry,
            is_running: false,
            is_billable: entry.is_billable ?? true,
            metadata: entry.metadata || {},
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateTimeEntry(id: string, updates: TimeEntryUpdate): Promise<TimeEntry> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('time_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteTimeEntry(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}

export async function getWeeklyTimesheet(
    organizationId: string,
    userId: string,
    weekStart: string
): Promise<{ date: string; totalMinutes: number; entries: TimeEntry[] }[]> {
    const supabase = createClient();

    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .gte('date', weekStart)
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

    if (error) throw new Error(error.message);

    // Group by date
    const grouped: Record<string, { totalMinutes: number; entries: TimeEntry[] }> = {};

    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        grouped[dateStr] = { totalMinutes: 0, entries: [] };
    }

    (data || []).forEach((entry) => {
        if (grouped[entry.date]) {
            grouped[entry.date].entries.push(entry);
            grouped[entry.date].totalMinutes += entry.duration_minutes;
        }
    });

    return Object.entries(grouped).map(([date, data]) => ({
        date,
        ...data,
    }));
}

export async function getTimeStats(organizationId: string, userId: string): Promise<{
    todayMinutes: number;
    weekMinutes: number;
    monthMinutes: number;
}> {
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
        .select('date, duration_minutes')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .gte('date', monthStartStr);

    if (error) throw new Error(error.message);

    const entries = data || [];

    return {
        todayMinutes: entries.filter((e) => e.date === today).reduce((sum, e) => sum + e.duration_minutes, 0),
        weekMinutes: entries.filter((e) => e.date >= weekStartStr).reduce((sum, e) => sum + e.duration_minutes, 0),
        monthMinutes: entries.reduce((sum, e) => sum + e.duration_minutes, 0),
    };
}
