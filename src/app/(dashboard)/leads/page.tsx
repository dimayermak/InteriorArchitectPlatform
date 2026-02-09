import { getCurrentOrganizationId } from '@/lib/auth/user';

import { LeadsClient } from './LeadsClient';
import { redirect } from 'next/navigation';

export default async function LeadsPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <LeadsClient organizationId={organizationId} />;
}
