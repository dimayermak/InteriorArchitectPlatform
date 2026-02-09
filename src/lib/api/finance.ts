import { createClient } from '@/lib/supabase/client';
import type { Invoice, Expense } from '@/types/database';

type InvoiceInsert = Pick<Invoice, 'organization_id' | 'invoice_number' | 'type' | 'subtotal' | 'total' | 'issue_date'> & Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'invoice_number' | 'type' | 'subtotal' | 'total' | 'issue_date'>>;
type InvoiceUpdate = Partial<Omit<Invoice, 'id'>>;

type ExpenseInsert = Pick<Expense, 'organization_id' | 'description' | 'category' | 'amount' | 'date'> & Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'description' | 'category' | 'amount' | 'date'>>;
type ExpenseUpdate = Partial<Omit<Expense, 'id'>>;

// ============================================
// Invoice Functions
// ============================================

export async function getInvoices(
    organizationId: string,
    options?: { status?: string; type?: string; projectId?: string }
): Promise<Invoice[]> {
    const supabase = createClient();

    let query = supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('issue_date', { ascending: false });

    if (options?.status) query = query.eq('status', options.status);
    if (options?.type) query = query.eq('type', options.type);
    if (options?.projectId) query = query.eq('project_id', options.projectId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }
    return data;
}

export async function createInvoice(invoice: InvoiceInsert): Promise<Invoice> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('invoices')
        .insert({
            ...invoice,
            status: invoice.status || 'draft',
            currency: invoice.currency || 'ILS',
            tax_rate: invoice.tax_rate ?? 17,
            tax_amount: invoice.tax_amount ?? (invoice.subtotal * 0.17),
            items: invoice.items || [],
            attachments: invoice.attachments || [],
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateInvoice(id: string, updates: InvoiceUpdate): Promise<Invoice> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('invoices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function markInvoiceAsPaid(id: string): Promise<Invoice> {
    return updateInvoice(id, {
        status: 'paid',
        paid_date: new Date().toISOString(),
    });
}

export async function getNextInvoiceNumber(organizationId: string): Promise<string> {
    const supabase = createClient();

    const { data } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].invoice_number.replace(/\D/g, '')) || 0;
        return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
    }
    return 'INV-0001';
}

// ============================================
// Expense Functions
// ============================================

export async function getExpenses(
    organizationId: string,
    options?: { status?: string; category?: string; projectId?: string }
): Promise<Expense[]> {
    const supabase = createClient();

    let query = supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', organizationId)
        .order('date', { ascending: false });

    if (options?.status) query = query.eq('status', options.status);
    if (options?.category) query = query.eq('category', options.category);
    if (options?.projectId) query = query.eq('project_id', options.projectId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
}

export async function createExpense(expense: ExpenseInsert): Promise<Expense> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('expenses')
        .insert({
            ...expense,
            status: expense.status || 'pending',
            currency: expense.currency || 'ILS',
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateExpense(id: string, updates: ExpenseUpdate): Promise<Expense> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function approveExpense(id: string, approverId: string): Promise<Expense> {
    return updateExpense(id, {
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
    });
}

export async function deleteExpense(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}

// ============================================
// Finance Stats
// ============================================

export async function getFinanceStats(organizationId: string): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
    totalExpenses: number;
    approvedExpenses: number;
}> {
    const supabase = createClient();

    const [invoicesResult, expensesResult] = await Promise.all([
        supabase.from('invoices').select('status, total').eq('organization_id', organizationId),
        supabase.from('expenses').select('status, amount').eq('organization_id', organizationId),
    ]);

    const invoices = invoicesResult.data || [];
    const expenses = expensesResult.data || [];

    return {
        totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
        totalPaid: invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0),
        totalPending: invoices.filter((inv) => inv.status === 'sent').reduce((sum, inv) => sum + (inv.total || 0), 0),
        totalExpenses: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
        approvedExpenses: expenses.filter((exp) => exp.status === 'approved').reduce((sum, exp) => sum + (exp.amount || 0), 0),
    };
}
