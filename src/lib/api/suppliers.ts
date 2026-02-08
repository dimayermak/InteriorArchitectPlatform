import { createClient } from '@/lib/supabase/client';
import type { Supplier } from '@/types/database';

type SupplierInsert = Pick<Supplier, 'organization_id' | 'name'> & Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'name'>>;
type SupplierUpdate = Partial<Omit<Supplier, 'id'>>;

export async function getSuppliers(organizationId: string, category?: string): Promise<Supplier[]> {
    const supabase = createClient();

    let query = supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('name', { ascending: true });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }
    return data;
}

export async function createSupplier(supplier: SupplierInsert): Promise<Supplier> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('suppliers')
        .insert({
            ...supplier,
            is_preferred: supplier.is_preferred ?? false,
            metadata: supplier.metadata || {},
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateSupplier(id: string, updates: SupplierUpdate): Promise<Supplier> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('suppliers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteSupplier(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('suppliers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
}

export async function togglePreferred(id: string, isPreferred: boolean): Promise<Supplier> {
    return updateSupplier(id, { is_preferred: isPreferred });
}

export async function getSupplierCategories(organizationId: string): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('suppliers')
        .select('category')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .not('category', 'is', null);

    if (error) throw new Error(error.message);

    const categories = new Set((data || []).map((d) => d.category).filter(Boolean));
    return Array.from(categories) as string[];
}
