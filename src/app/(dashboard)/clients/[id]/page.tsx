
import { notFound } from 'next/navigation';
import { getClientWithProjects } from '@/lib/api/clients';
import { ClientDetailClient } from './ClientDetailClient';
import type { Client, Project } from '@/types/database';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
    const { id } = await params;

    // Validate UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        notFound();
    }

    const clientData = await getClientWithProjects(id);

    if (!clientData) {
        notFound();
    }

    // Cast the client data to include typed projects
    const client = {
        ...clientData,
        projects: (clientData.projects || []) as Project[]
    };

    return <ClientDetailClient client={client} />;
}
