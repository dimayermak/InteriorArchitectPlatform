import { getCurrentOrganizationId } from '@/lib/auth/user';
import { getClients } from '@/lib/api/clients';
import { ClientsClient } from './ClientsClient';
import { redirect } from 'next/navigation';

export default async function ClientsPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    const clients = await getClients(organizationId);

    return <ClientsClient initialClients={clients} organizationId={organizationId} />;
}
