'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getProjectWithDetails, updateProject, getProjectStats } from '@/lib/api/projects';
import { getTasks } from '@/lib/api/tasks';
import type { Project, ProjectPhase, Task } from '@/types/database';
import { ArrowRight, User } from 'lucide-react';
import { ProjectTabs } from '@/components/projects/ProjectTabs';
import { createClient } from '@/lib/supabase/client';

const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

const statusLabels: Record<string, { label: string; color: string }> = {
    planning: { label: 'תכנון', color: 'bg-blue-100 text-blue-700' },
    active: { label: 'פעיל', color: 'bg-green-100 text-green-700' },
    on_hold: { label: 'מושהה', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'הושלם', color: 'bg-purple-100 text-purple-700' },
    cancelled: { label: 'בוטל', color: 'bg-gray-100 text-gray-700' },
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<(Project & { client: { name: string } | null; phases: ProjectPhase[] }) | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<{ tasksTotal: number; tasksCompleted: number; hoursLogged: number; budget: number; spent: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) setUserId(user.id);

                const [projectData, tasksData, statsData] = await Promise.all([
                    getProjectWithDetails(projectId),
                    getTasks(DEV_ORG_ID, projectId),
                    getProjectStats(projectId),
                ]);
                setProject(projectData);
                setTasks(tasksData);
                setStats(statsData);
            } catch (error) {
                console.error('Error loading project:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [projectId]);

    const handleStatusChange = async (newStatus: Project['status']) => {
        if (!project) return;
        try {
            const updated = await updateProject(project.id, { status: newStatus });
            setProject({ ...project, ...updated });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-xl font-bold text-foreground">פרויקט לא נמצא</h1>
                <Link href="/projects">
                    <Button className="mt-4">חזרה לרשימה</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/projects">
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                        {project.client && (
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                <User className="w-4 h-4" />
                                {project.client.name}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="h-10 px-4 rounded-lg border border-border bg-background text-foreground text-sm"
                        value={project.status}
                        onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
                    >
                        {Object.entries(statusLabels).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <ProjectTabs
                project={project}
                stats={stats}
                tasks={tasks}
                statusLabels={statusLabels}
                organizationId={DEV_ORG_ID}
                userId={userId}
            />
        </div>
    );
}
