import { getCurrentOrganizationId } from '@/lib/auth/user';
import { ClientsClient } from './ClientsClient';
import { redirect } from 'next/navigation';

export default async function ClientsPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <ClientsClient organizationId={organizationId} />;
}
