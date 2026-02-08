
import { notFound } from 'next/navigation';
import { getClientWithProjects } from '@/lib/api/clients';
import { ClientDetailClient } from './ClientDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
    const { id } = await params;

    // Validate UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        notFound();
    }

    const client = await getClientWithProjects(id);

    if (!client) {
        notFound();
    }

    return <ClientDetailClient client={client} />;
}
