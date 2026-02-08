'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getTemplates, createTemplate, deleteTemplate, duplicateTemplate } from '@/lib/api/templates';
import type { ProjectTemplate, ProjectType } from '@/types/database';
import { Plus, Copy, Trash2, FileText, Layers, Building2, MoreVertical } from 'lucide-react';

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';

const typeLabels: Record<ProjectType, { label: string; icon: React.ReactNode; color: string }> = {
    interior_design: { label: 'עיצוב פנים', icon: <Layers className="w-5 h-5" />, color: 'bg-purple-100 text-purple-700' },
    architecture: { label: 'אדריכלות', icon: <Building2 className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700' },
    combined: { label: 'משולב', icon: <FileText className="w-5 h-5" />, color: 'bg-green-100 text-green-700' },
};

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        description: '',
        type: 'interior_design' as ProjectType,
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        try {
            const data = await getTemplates(DEV_ORG_ID);
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateTemplate(e: React.FormEvent) {
        e.preventDefault();
        try {
            const template = await createTemplate({
                organization_id: DEV_ORG_ID,
                name: newTemplate.name,
                description: newTemplate.description || null,
                type: newTemplate.type,
                is_system: false,
                is_active: true,
                default_phases: [],
                default_tasks: [],
                default_meetings: {},
                created_by: null,
            });
            setTemplates([...templates, template]);
            setNewTemplate({ name: '', description: '', type: 'interior_design' });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating template:', error);
        }
    }

    async function handleDuplicate(template: ProjectTemplate) {
        try {
            const newT = await duplicateTemplate(template.id, `${template.name} (העתק)`, DEV_ORG_ID);
            setTemplates([...templates, newT]);
        } catch (error) {
            console.error('Error duplicating template:', error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('האם למחוק את התבנית?')) return;
        try {
            await deleteTemplate(id);
            setTemplates(templates.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    }

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const systemTemplates = filteredTemplates.filter(t => t.is_system);
    const customTemplates = filteredTemplates.filter(t => !t.is_system);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">תבניות פרויקט</h1>
                    <p className="text-muted-foreground mt-1">צרו תבניות לשימוש חוזר עם שלבים ומשימות מוגדרים מראש</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    תבנית חדשה
                </Button>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <Input
                    placeholder="חיפוש תבניות..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* System Templates */}
            {systemTemplates.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        תבניות מערכת
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {systemTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Custom Templates */}
            <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    התבניות שלי
                </h2>
                {customTemplates.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-medium text-foreground mb-2">אין תבניות מותאמות אישית</h3>
                            <p className="text-muted-foreground mb-4">צרו תבנית חדשה להתחלה מהירה של פרויקטים</p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="w-4 h-4 ml-2" />
                                צור תבנית ראשונה
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Create Template Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="תבנית חדשה" size="md">
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                    <Input
                        label="שם התבנית"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="למשל: פרויקט דירה סטנדרטי"
                        required
                        autoFocus
                    />
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">תיאור</label>
                        <textarea
                            className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background text-foreground resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={newTemplate.description}
                            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                            placeholder="תיאור קצר של התבנית..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">סוג פרויקט</label>
                        <select
                            className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                            value={newTemplate.type}
                            onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as ProjectType })}
                        >
                            <option value="interior_design">עיצוב פנים</option>
                            <option value="architecture">אדריכלות</option>
                            <option value="combined">משולב</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">צור תבנית</Button>
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

// Template Card Component
function TemplateCard({
    template,
    onDuplicate,
    onDelete,
}: {
    template: ProjectTemplate;
    onDuplicate: (t: ProjectTemplate) => void;
    onDelete: (id: string) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const typeInfo = typeLabels[template.type];
    const phasesCount = Array.isArray(template.default_phases) ? template.default_phases.length : 0;
    const tasksCount = Array.isArray(template.default_tasks) ? template.default_tasks.length : 0;

    return (
        <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${typeInfo.color} flex items-center justify-center`}>
                            {typeInfo.icon}
                        </div>
                        <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                                {typeInfo.label}
                            </span>
                        </div>
                    </div>
                    {!template.is_system && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-1 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {menuOpen && (
                                <div className="absolute left-0 top-8 bg-background border border-border rounded-xl shadow-lg py-1 z-10 min-w-[120px]">
                                    <button
                                        onClick={() => { onDuplicate(template); setMenuOpen(false); }}
                                        className="w-full px-4 py-2 text-sm text-right hover:bg-muted flex items-center gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        שכפל
                                    </button>
                                    <button
                                        onClick={() => { onDelete(template.id); setMenuOpen(false); }}
                                        className="w-full px-4 py-2 text-sm text-right hover:bg-muted text-destructive flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        מחק
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {template.is_system && (
                        <Badge variant="secondary">מערכת</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {template.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
                )}
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        {phasesCount} שלבים
                    </span>
                    <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {tasksCount} משימות
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
