'use server';

import { createClient } from '@/lib/supabase/server';
import { SupervisionReport } from '@/types/database';
import { getCurrentOrganizationId } from '@/lib/auth/user';

export async function getSupervisionReports(projectId: string): Promise<SupervisionReport[]> {
    const supabase = await createClient();
    const orgId = await getCurrentOrganizationId();

    if (!orgId) return [];

    const { data, error } = await supabase
        .from('supervision_reports')
        .select('*')
        .eq('organization_id', orgId)
        .eq('project_id', projectId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching supervision reports:', error);
        return [];
    }

    return data;
}

export async function createSupervisionReport(report: Partial<SupervisionReport>): Promise<SupervisionReport | null> {
    const supabase = await createClient();
    const orgId = await getCurrentOrganizationId();

    if (!orgId) throw new Error('Organization not found');

    const { data, error } = await supabase
        .from('supervision_reports')
        .insert({
            ...report,
            organization_id: orgId,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating supervision report:', error);
        throw error;
    }

    return data;
}

export async function updateSupervisionReport(id: string, updates: Partial<SupervisionReport>): Promise<SupervisionReport | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('supervision_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating supervision report:', error);
        throw error;
    }

    return data;
}

export async function deleteSupervisionReport(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from('supervision_reports')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting supervision report:', error);
        throw error;
    }
}
