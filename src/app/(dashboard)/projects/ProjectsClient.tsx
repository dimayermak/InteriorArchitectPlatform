'use client';

import { useEffect, useState, useCallback } from 'react';
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

import { ProjectForm } from '@/components/projects/ProjectForm';
interface ProjectsClientProps {
    organizationId: string;
}

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

const priorityColors: Record<string, string> = {
    low: 'bg-slate-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
};

export function ProjectsClient({ organizationId }: ProjectsClientProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        client_id: '',
        type: 'interior_design',
        budget: '',
        description: '',
        priority: 'medium',
        start_date: ''
    });
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const [projectsData, clientsData] = await Promise.all([
                    getProjects(organizationId),
                    getClients(organizationId),
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
    }, [organizationId]);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateSuccess = (newProject: Project) => {
        setProjects([newProject, ...projects]);
        setIsModalOpen(false);
        router.push(`/projects/${newProject.id}`);
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

    const closeModal = useCallback(() => setIsModalOpen(false), []);

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
            <Modal isOpen={isModalOpen} onClose={closeModal} title="פרויקט חדש" size="lg">
                <ProjectForm
                    organizationId={organizationId}
                    clients={clients}
                    onSuccess={handleCreateSuccess}
                    onCancel={closeModal}
                />
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
        <Link href={`/projects/${project.id}`} className="block h-full">
            <Card className="hover:shadow-lg transition-all duration-200 h-full border-border/50 hover:border-primary/20 group cursor-pointer relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${priorityColors[project.priority]}`} />
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {project.name}
                            </CardTitle>
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
        </Link>
    );
}
