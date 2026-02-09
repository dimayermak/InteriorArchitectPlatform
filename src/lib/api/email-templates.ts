import { createClient } from '@/lib/supabase/client';
import { EmailTemplate } from '@/types/database';

export async function getEmailTemplates(organizationId: string, category?: string): Promise<EmailTemplate[]> {
    const supabase = createClient();

    let query = supabase
        .from('email_templates')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching email templates:', error);
        return [];
    }

    return data;
}

export async function createEmailTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const supabase = createClient();

    // We need to get the org ID if not passed, but let's assume the caller passes properties including org_id
    // or we fetch it similarly to other functions. 
    // For consistency with client-side calls, we'll expect organization_id in the payload or handle it in component.

    const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single();

    if (error) {
        console.error('Error creating email template:', error);
        throw error;
    }

    return data;
}

export async function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating email template:', error);
        throw error;
    }

    return data;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting email template:', error);
        throw error;
    }
}
