import { getCurrentOrganizationId } from '@/lib/auth/user';
import { getLeads } from '@/lib/api/leads';
import { LeadsClient } from './LeadsClient';
import { redirect } from 'next/navigation';

export default async function LeadsPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    const leads = await getLeads(organizationId);

    return <LeadsClient initialLeads={leads} organizationId={organizationId} />;
}
