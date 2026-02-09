'use server';

import { createClient } from '@/lib/supabase/server';
import { PurchaseOrder } from '@/types/database';
import { getCurrentOrganizationId } from '@/lib/auth/user';

export async function getPurchaseOrders(projectId: string): Promise<PurchaseOrder[]> {
    const supabase = await createClient();
    const orgId = await getCurrentOrganizationId();

    if (!orgId) return [];

    const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('organization_id', orgId)
        .eq('project_id', projectId)
        .order('order_date', { ascending: false });

    if (error) {
        console.error('Error fetching purchase orders:', error);
        return [];
    }

    return data;
}

export async function createPurchaseOrder(order: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    const supabase = await createClient();
    const orgId = await getCurrentOrganizationId();

    if (!orgId) throw new Error('Organization not found');

    const { data, error } = await supabase
        .from('purchase_orders')
        .insert({
            ...order,
            organization_id: orgId,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating purchase order:', error);
        throw error;
    }

    return data;
}

export async function updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating purchase order:', error);
        throw error;
    }

    return data;
}

export async function deletePurchaseOrder(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting purchase order:', error);
        throw error;
    }
}
