import { createClient } from '@/lib/supabase/client';
import type { Lead } from '@/types/database';

type LeadInsert = Pick<Lead, 'organization_id' | 'name'> & Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'name'>>;
type LeadUpdate = Partial<Omit<Lead, 'id'>>;


export async function getLeads(organizationId: string): Promise<Lead[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Lead[];
}

export async function getLeadById(id: string): Promise<Lead | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }
    return data as Lead;
}

export async function createLead(lead: LeadInsert): Promise<Lead> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as Lead;
}

export async function updateLead(id: string, updates: LeadUpdate): Promise<Lead> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
    const supabase = createClient();

    // Hard delete
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}

export async function convertLeadToClient(leadId: string): Promise<string> {
    const supabase = createClient();

    // Get the lead
    const lead = await getLeadById(leadId);
    if (!lead) throw new Error('Lead not found');

    // Create client from lead data
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
            organization_id: lead.organization_id,
            lead_id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            // type: 'individual' as const, // Missing in DB
            status: 'active' as const,
            portal_enabled: false,
            metadata: {},
            notes: lead.notes,
            created_by: lead.assigned_to,
        })
        .select('id, organization_id, name, email, phone, status')
        .single();

    if (clientError) throw new Error(clientError.message);

    // Update lead status to won and link to client
    await updateLead(leadId, {
        status: 'won',
        converted_at: new Date().toISOString(),
        converted_to_client_id: client.id,
    });

    return client.id;
}
