'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Task, Project } from '@/types/database';

interface TaskFormProps {
    organizationId: string;
    projects: Project[];
    onSuccess: (task: Task) => void;
    onCancel: () => void;
}

export function TaskForm({ organizationId, projects, onSuccess, onCancel }: TaskFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        project_id: '',
        priority: 'medium',
        due_date: '',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Dynamically import the client creator to avoid build-time issues if any
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();

            const { data: userResponse } = await supabase.auth.getUser();
            const user = userResponse.user;

            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    organization_id: organizationId,
                    title: formData.title,
                    project_id: formData.project_id || null,
                    priority: formData.priority,
                    due_date: formData.due_date || null,
                    description: formData.description || null,
                    status: 'todo',
                    order_index: 0,
                    assigned_to: user.id, // Assign to creator by default
                    created_by: user.id
                })
                .select()
                .single();

            if (error) throw error;
            onSuccess(data as Task);
        } catch (error: any) {
            console.error('Error creating task:', error);
            // alert(`שגיאה ביצירת משימה: ${error.message || 'אנא נסו שוב'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input
                        label="שם המשימה"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="למשל: לבדוק מידות בשטח"
                        className="h-12"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">פרויקט</label>
                    <select
                        className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                        value={formData.project_id}
                        onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    >
                        <option value="">ללא פרויקט (כללי)</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">עדיפות</label>
                    <select
                        className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                        <option value="low">נמוכה</option>
                        <option value="medium">בינונית</option>
                        <option value="high">גבוהה</option>
                        <option value="urgent">דחופה</option>
                    </select>
                </div>

                <Input
                    type="date"
                    label="תאריך יעד"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="h-12"
                />

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">תיאור</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="פירוט המשימה..."
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
                <Button type="submit" className="flex-1 h-12 text-base font-medium" disabled={loading}>
                    {loading ? 'יוצר משימה...' : 'צור משימה'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="md:w-32 h-12" disabled={loading}>
                    ביטול
                </Button>
            </div>
        </form>
    );
}
