'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Project, Client } from '@/types/database';
import { createProject } from '@/lib/api/projects';

interface ProjectFormProps {
    organizationId: string;
    clients: Client[];
    onSuccess: (project: Project) => void;
    onCancel: () => void;
    loading?: boolean;
}

const typeLabels: Record<string, string> = {
    interior_design: 'עיצוב פנים',
    architecture: 'אדריכלות',
    renovation: 'שיפוץ',
    consultation: 'ייעוץ',
    mixed: 'משולב',
};

export function ProjectForm({ organizationId, clients, onSuccess, onCancel }: ProjectFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        client_id: '',
        type: 'interior_design',
        budget: '',
        description: '',
        priority: 'medium',
        start_date: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newProject = await createProject({
                organization_id: organizationId,
                client_id: formData.client_id,
                name: formData.name,
                type: formData.type as Project['type'],
                budget: formData.budget ? parseFloat(formData.budget) : null,
                description: formData.description || null,
                priority: formData.priority as Project['priority'],
                start_date: formData.start_date || null,
            });
            onSuccess(newProject);
        } catch (error: any) {
            console.error('Error creating project:', error);
            alert(`שגיאה ביצירת פרויקט: ${error.message || 'אנא נסו שוב'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input
                        label="שם הפרויקט"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="למשל: שיפוץ דירה - רחוב הרצל"
                        className="h-12"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">לקוח</label>
                    <select
                        className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        required
                    >
                        <option value="">בחרו לקוח</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">סוג פרויקט</label>
                    <select
                        className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        {Object.entries(typeLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
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
                    type="number"
                    label="תקציב (₪)"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="50000"
                    dir="ltr"
                    className="h-12"
                />

                <Input
                    type="date"
                    label="תאריך התחלה"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="h-12"
                />

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">תיאור הפרויקט</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="תיאור קצר של הפרויקט..."
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
                <Button type="submit" className="flex-1 h-12 text-base font-medium" disabled={loading}>
                    {loading ? 'יוצר פרויקט...' : 'צור פרויקט'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="md:w-32 h-12" disabled={loading}>
                    ביטול
                </Button>
            </div>
        </form>
    );
}
