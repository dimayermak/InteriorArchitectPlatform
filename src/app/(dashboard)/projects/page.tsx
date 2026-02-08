'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getProjects, createProject, deleteProject } from '@/lib/api/projects';
import { getClients } from '@/lib/api/clients';
import type { Project, Client } from '@/types/database';
import { Plus, Search, FolderOpen, MoreVertical, Calendar, User, Trash2, Eye } from 'lucide-react';

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';

const statusLabels: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'info' }> = {
    planning: { label: 'תכנון', variant: 'info' },
    active: { label: 'פעיל', variant: 'success' },
    on_hold: { label: 'מושהה', variant: 'warning' },
    completed: { label: 'הושלם', variant: 'primary' },
    cancelled: { label: 'בוטל', variant: 'default' },
};

const typeLabels: Record<string, string> = {
    interior_design: 'עיצוב פנים',
    architecture: 'אדריכלות',
    renovation: 'שיפוץ',
    consultation: 'ייעוץ',
    mixed: 'משולב',
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', client_id: '', type: 'interior_design', budget: '' });
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const [projectsData, clientsData] = await Promise.all([
                    getProjects(DEV_ORG_ID),
                    getClients(DEV_ORG_ID),
                ]);
                setProjects(projectsData);
                setClients(clientsData);
            } catch (error) {
                console.error('Error loading projects:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newProject = await createProject({
                organization_id: DEV_ORG_ID,
                client_id: formData.client_id,
                name: formData.name,
                type: formData.type as Project['type'],
                budget: formData.budget ? parseFloat(formData.budget) : null,
            });
            setProjects([newProject, ...projects]);
            setIsModalOpen(false);
            setFormData({ name: '', client_id: '', type: 'interior_design', budget: '' });
            router.push(`/projects/${newProject.id}`);
        } catch (error) {
            console.error('Error creating project:', error);
            alert('שגיאה ביצירת פרויקט');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('האם למחוק את הפרויקט?')) return;
        try {
            await deleteProject(id);
            setProjects(projects.filter((p) => p.id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">פרויקטים</h1>
                    <p className="text-muted-foreground text-sm mt-1">{projects.length} פרויקטים במערכת</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    פרויקט חדש
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="חיפוש פרויקטים..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'planning', 'active', 'on_hold', 'completed'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === 'all' ? 'הכל' : statusLabels[status]?.label || status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <Card className="text-center py-16">
                    <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">אין פרויקטים</h3>
                    <p className="text-muted-foreground mb-6">התחילו ביצירת הפרויקט הראשון שלכם</p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 ml-2" />
                        פרויקט חדש
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            client={clients.find((c) => c.id === project.client_id)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="פרויקט חדש" size="md">
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <Input
                        label="שם הפרויקט"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="למשל: שיפוץ דירה - רחוב הרצל"
                    />

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">לקוח</label>
                        <select
                            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
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
                            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            {Object.entries(typeLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        type="number"
                        label="תקציב (₪)"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="50000"
                        dir="ltr"
                    />

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">צור פרויקט</Button>
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

interface ProjectCardProps {
    project: Project;
    client?: Client;
    onDelete: (id: string) => void;
}

function ProjectCard({ project, client, onDelete }: ProjectCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const status = statusLabels[project.status] || { label: project.status, variant: 'default' };

    return (
        <Card className="hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <Link href={`/projects/${project.id}`}>
                            <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
                                {project.name}
                            </CardTitle>
                        </Link>
                        {client && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {client.name}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                        {showMenu && (
                            <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                <Link href={`/projects/${project.id}`}>
                                    <button className="w-full px-4 py-2 text-sm text-right hover:bg-muted flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        צפייה
                                    </button>
                                </Link>
                                <button
                                    onClick={() => onDelete(project.id)}
                                    className="w-full px-4 py-2 text-sm text-right hover:bg-muted text-destructive flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    מחיקה
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-xs text-muted-foreground">{typeLabels[project.type] || project.type}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {project.start_date && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(project.start_date).toLocaleDateString('he-IL')}
                        </div>
                    )}
                    {project.budget && (
                        <div className="tabular-nums">
                            ₪{project.budget.toLocaleString()}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
