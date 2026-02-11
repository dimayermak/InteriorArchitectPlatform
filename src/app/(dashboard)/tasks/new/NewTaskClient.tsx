'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/tasks/TaskForm';
import { getProjects } from '@/lib/api/projects';
import type { Project } from '@/types/database';

interface NewTaskClientProps {
    organizationId: string;
}

export function NewTaskClient({ organizationId }: NewTaskClientProps) {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getProjects(organizationId);
                setProjects(data);
            } catch (error) {
                console.error('Error loading projects:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [organizationId]);

    const handleSuccess = () => {
        router.push('/tasks'); // Assuming /tasks exists now or will exist
        router.refresh();
    };

    const handleCancel = () => {
        router.back();
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">טוען נתונים...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">משימה חדשה</h1>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <TaskForm
                    organizationId={organizationId}
                    projects={projects}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
