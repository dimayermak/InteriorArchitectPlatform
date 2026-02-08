import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/types/database';

type TaskInsert = Pick<Task, 'organization_id' | 'title'> & Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'organization_id' | 'title'>>;
type TaskUpdate = Partial<Omit<Task, 'id'>>;

export async function getTasks(organizationId: string, projectId?: string): Promise<Task[]> {
    const supabase = createClient();

    let query = supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('order_index', { ascending: true });

    if (projectId) {
        query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
}

export async function getTaskById(id: string): Promise<Task | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }
    return data;
}

export async function createTask(task: TaskInsert): Promise<Task> {
    const supabase = createClient();

    // Get next order index
    let orderIndex = 0;
    if (task.project_id) {
        const { data: existingTasks } = await supabase
            .from('tasks')
            .select('order_index')
            .eq('project_id', task.project_id)
            .order('order_index', { ascending: false })
            .limit(1);

        if (existingTasks && existingTasks.length > 0) {
            orderIndex = existingTasks[0].order_index + 1;
        }
    }

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            ...task,
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            order_index: orderIndex,
            metadata: task.metadata || {},
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteTask(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(error.message);
}

export async function completeTask(id: string): Promise<Task> {
    return updateTask(id, {
        status: 'done',
        completed_at: new Date().toISOString(),
    });
}

export async function reorderTasks(tasks: { id: string; order_index: number }[]): Promise<void> {
    const supabase = createClient();

    // Use Promise.all for batch updates
    await Promise.all(
        tasks.map(({ id, order_index }) =>
            supabase
                .from('tasks')
                .update({ order_index, updated_at: new Date().toISOString() })
                .eq('id', id)
        )
    );
}

export async function getSubtasks(parentTaskId: string): Promise<Task[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_task_id', parentTaskId)
        .is('deleted_at', null)
        .order('order_index', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

export async function getTasksGroupedByPhase(projectId: string): Promise<Record<string, Task[]>> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('order_index', { ascending: true });

    if (error) throw new Error(error.message);

    const grouped: Record<string, Task[]> = { unassigned: [] };

    (data || []).forEach((task) => {
        const phaseId = task.phase_id || 'unassigned';
        if (!grouped[phaseId]) {
            grouped[phaseId] = [];
        }
        grouped[phaseId].push(task);
    });

    return grouped;
}
