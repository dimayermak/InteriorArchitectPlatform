import { getCurrentOrganizationId } from '@/lib/auth/user';
import { redirect } from 'next/navigation';
import { NewLeadClient } from './NewLeadClient';

export default async function NewLeadPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <NewLeadClient organizationId={organizationId} />;
}
