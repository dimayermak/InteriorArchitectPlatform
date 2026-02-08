'use server';

import { createClient } from '@/lib/supabase/server';
import type { ProjectTemplate } from '@/types/database';

// ============================================
// Templates API
// ============================================

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';

export type TemplateInsert = Omit<ProjectTemplate, 'id' | 'created_at' | 'updated_at'>;
export type TemplateUpdate = Partial<Omit<ProjectTemplate, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Get all templates for an organization (including system templates)
 */
export async function getTemplates(orgId: string = DEV_ORG_ID): Promise<ProjectTemplate[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .or(`organization_id.eq.${orgId},is_system.eq.true`)
        .eq('is_active', true)
        .order('is_system', { ascending: false })
        .order('name');

    if (error) throw error;
    return data || [];
}

/**
 * Get a single template by ID
 */
export async function getTemplate(id: string): Promise<ProjectTemplate | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('project_templates')
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
 * Create a new template
 */
export async function createTemplate(template: TemplateInsert): Promise<ProjectTemplate> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('project_templates')
        .insert({
            ...template,
            organization_id: template.organization_id || DEV_ORG_ID,
            is_system: false,
            is_active: true,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a template
 */
export async function updateTemplate(id: string, updates: TemplateUpdate): Promise<ProjectTemplate> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('project_templates')
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
 * Soft delete a template (mark as inactive)
 */
export async function deleteTemplate(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from('project_templates')
        .update({ is_active: false })
        .eq('id', id)
        .eq('is_system', false); // Cannot delete system templates

    if (error) throw error;
}

/**
 * Apply a template to a project - creates phases and tasks
 */
export async function applyTemplate(
    templateId: string,
    projectId: string
): Promise<{ phasesCreated: number; tasksCreated: number }> {
    const supabase = await createClient();

    // Get the template
    const template = await getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    let phasesCreated = 0;
    let tasksCreated = 0;

    // Create phases from template
    if (template.default_phases && Array.isArray(template.default_phases)) {
        for (const phase of template.default_phases as Array<{ name: string; order: number; description?: string }>) {
            const { data: phaseData, error: phaseError } = await supabase
                .from('project_phases')
                .insert({
                    project_id: projectId,
                    name: phase.name,
                    order_index: phase.order,
                    description: phase.description || null,
                })
                .select()
                .single();

            if (phaseError) throw phaseError;
            phasesCreated++;

            // Create tasks for this phase from template
            if (template.default_tasks && Array.isArray(template.default_tasks)) {
                const phaseTasks = (template.default_tasks as Array<{
                    phase_order: number;
                    title: string;
                    priority?: string;
                    order?: number;
                }>).filter(t => t.phase_order === phase.order);

                for (const task of phaseTasks) {
                    const { error: taskError } = await supabase
                        .from('tasks')
                        .insert({
                            organization_id: DEV_ORG_ID,
                            project_id: projectId,
                            phase_id: phaseData.id,
                            title: task.title,
                            priority: task.priority || 'medium',
                            status: 'todo',
                            order_index: task.order || 0,
                        });

                    if (taskError) throw taskError;
                    tasksCreated++;
                }
            }
        }
    }

    return { phasesCreated, tasksCreated };
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(
    id: string,
    newName: string,
    orgId: string = DEV_ORG_ID
): Promise<ProjectTemplate> {
    const template = await getTemplate(id);
    if (!template) throw new Error('Template not found');

    return createTemplate({
        organization_id: orgId,
        name: newName,
        description: template.description,
        type: template.type,
        is_system: false,
        is_active: true,
        default_phases: template.default_phases,
        default_tasks: template.default_tasks,
        default_meetings: template.default_meetings,
        created_by: null,
    });
}
