'use server';

import { createClient } from '@/lib/supabase/server';
import type { Meeting, MeetingType, MeetingStatus } from '@/types/database';

// ============================================
// Calendar API
// ============================================

const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

export type MeetingInsert = Omit<Meeting, 'id' | 'created_at' | 'updated_at'>;
export type MeetingUpdate = Partial<Omit<Meeting, 'id' | 'created_at' | 'updated_at'>>;

export interface CalendarFilters {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    clientId?: string;
    type?: MeetingType;
    status?: MeetingStatus;
}

/**
 * Get meetings with optional filtering
 */
export async function getMeetings(
    orgId: string = DEV_ORG_ID,
    filters: CalendarFilters = {}
): Promise<Meeting[]> {
    const supabase = await createClient();

    let query = supabase
        .from('meetings')
        .select('*')
        .eq('organization_id', orgId)
        .order('scheduled_at', { ascending: true });

    if (filters.startDate) {
        query = query.gte('scheduled_at', filters.startDate);
    }
    if (filters.endDate) {
        query = query.lte('scheduled_at', filters.endDate);
    }
    if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
    }
    if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
    }
    if (filters.type) {
        query = query.eq('type', filters.type);
    }
    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Get meetings for a specific month
 */
export async function getMeetingsForMonth(
    year: number,
    month: number,
    orgId: string = DEV_ORG_ID
): Promise<Meeting[]> {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    return getMeetings(orgId, { startDate, endDate });
}

/**
 * Get a single meeting by ID
 */
export async function getMeeting(id: string): Promise<Meeting | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

/**
 * Create a new meeting
 */
export async function createMeeting(meeting: MeetingInsert): Promise<Meeting> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('meetings')
        .insert({
            ...meeting,
            organization_id: meeting.organization_id || DEV_ORG_ID,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a meeting
 */
export async function updateMeeting(id: string, updates: MeetingUpdate): Promise<Meeting> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('meetings')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Update meeting status
 */
export async function updateMeetingStatus(id: string, status: MeetingStatus): Promise<Meeting> {
    return updateMeeting(id, { status });
}

/**
 * Get meetings for a specific project
 */
export async function getMeetingsByProject(projectId: string): Promise<Meeting[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('project_id', projectId)
        .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get today's meetings
 */
export async function getTodaysMeetings(orgId: string = DEV_ORG_ID): Promise<Meeting[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    return getMeetings(orgId, { startDate: startOfDay, endDate: endOfDay });
}

/**
 * Get upcoming meetings (next 7 days)
 */
export async function getUpcomingMeetings(orgId: string = DEV_ORG_ID, days: number = 7): Promise<Meeting[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return getMeetings(orgId, {
        startDate: today.toISOString(),
        endDate: futureDate.toISOString(),
    });
}
