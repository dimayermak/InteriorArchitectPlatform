'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { getClients } from '@/lib/api/clients';
import type { Client } from '@/types/database';

interface NewProjectClientProps {
    organizationId: string;
}

export function NewProjectClient({ organizationId }: NewProjectClientProps) {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getClients(organizationId);
                setClients(data);
            } catch (error) {
                console.error('Error loading clients:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [organizationId]);

    const handleSuccess = (project: any) => {
        router.push(`/projects/${project.id}`);
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
            <h1 className="text-2xl font-bold mb-6">פרויקט חדש</h1>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <ProjectForm
                    organizationId={organizationId}
                    clients={clients}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
