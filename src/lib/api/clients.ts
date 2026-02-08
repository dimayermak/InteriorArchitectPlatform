import { createClient as getSupabaseClient } from '@/lib/supabase/client';
import type { Client } from '@/types/database';

// ClientInsert includes all fields that may be needed for insert
type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
type ClientUpdate = Partial<Omit<Client, 'id'>>;


export async function getClients(organizationId: string): Promise<Client[]> {
    const supabase = getSupabaseClient();


    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
}

export async function getClientById(id: string): Promise<Client | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }
    return data;
}

export async function createClient(client: ClientInsert): Promise<Client> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateClient(id: string, updates: ClientUpdate): Promise<Client> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteClient(id: string): Promise<void> {
    const supabase = getSupabaseClient();

    // Hard delete
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}

export async function getClientWithProjects(id: string): Promise<Client & { projects: unknown[] }> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('clients')
        .select(`
            *,
            projects (*)
        `)
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}
