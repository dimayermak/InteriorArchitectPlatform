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

export async function getProjectSuppliers(projectId: string): Promise<(Supplier & { role: string | null; notes: string | null })[]> {
    const supabase = createClient();

    // First get the junction table entries
    const { data: projectSuppliers, error } = await supabase
        .from('project_suppliers')
        .select('*')
        .eq('project_id', projectId);

    if (error) throw new Error(error.message);
    if (!projectSuppliers.length) return [];

    // Then get the actual supplier details
    // Note: In a real app we'd use a join, but for simplicity/safety with RLS we'll fetch separately 
    // or assume the user has access to both.
    // Let's try a join first in case the user has 'profiles' set up correctly now.

    const { data, error: joinError } = await supabase
        .from('project_suppliers')
        .select(`
            role,
            notes,
            supplier:suppliers(*)
        `)
        .eq('project_id', projectId);

    if (joinError) throw new Error(joinError.message);

    return data.map((item: any) => ({
        ...item.supplier,
        role: item.role,
        notes: item.notes
    }));
}

export async function addSupplierToProject(projectId: string, supplierId: string, role?: string, notes?: string): Promise<void> {
    const supabase = createClient();
    // Need org ID for RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch org id from profile
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    if (!profile) throw new Error('Profile not found');

    const { error } = await supabase
        .from('project_suppliers')
        .insert({
            organization_id: profile.organization_id,
            project_id: projectId,
            supplier_id: supplierId,
            role,
            notes
        });

    if (error) throw new Error(error.message);
}

export async function removeSupplierFromProject(projectId: string, supplierId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('project_suppliers')
        .delete()
        .eq('project_id', projectId)
        .eq('supplier_id', supplierId);

    if (error) throw new Error(error.message);
}
