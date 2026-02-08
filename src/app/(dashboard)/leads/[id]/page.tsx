
import { notFound } from 'next/navigation';
import { getLeadById } from '@/lib/api/leads';
import { LeadDetailClient } from './LeadDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
    // Awaiting params is required in Next.js 15
    const { id } = await params;

    // Validate UUID format basic check to avoid DB errors
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        notFound();
    }

    const lead = await getLeadById(id);

    if (!lead) {
        notFound();
    }

    return <LeadDetailClient lead={lead} />;
}
