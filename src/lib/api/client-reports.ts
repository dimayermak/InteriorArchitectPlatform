'use server';

import { createClient } from '@/lib/supabase/server';

export interface UnexpectedEvent {
    id: string;
    title: string;
    description: string;
    resolution: string;
    status: 'handled' | 'in_progress';
    date: string;
}

export interface DeliveryEstimate {
    id: string;
    item: string;
    estimated_date: string;
    status: 'pending' | 'ordered' | 'delivered';
    notes: string;
}

export interface ClientReport {
    id: string;
    project_id: string;
    organization_id: string;
    unexpected_events: UnexpectedEvent[];
    delivery_estimates: DeliveryEstimate[];
    general_notes: string | null;
    created_at: string;
    updated_at: string;
}

export async function getClientReport(projectId: string): Promise<ClientReport | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('client_reports')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching client report:', error);
        return null;
    }

    return data as ClientReport | null;
}

export async function upsertClientReport(
    projectId: string,
    organizationId: string,
    updates: {
        unexpected_events?: UnexpectedEvent[];
        delivery_estimates?: DeliveryEstimate[];
        general_notes?: string | null;
    }
): Promise<ClientReport> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('client_reports')
        .upsert(
            {
                project_id: projectId,
                organization_id: organizationId,
                ...updates,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'project_id' }
        )
        .select()
        .single();

    if (error) throw error;
    return data as ClientReport;
}
