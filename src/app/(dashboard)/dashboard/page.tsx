import { getCurrentOrganizationId } from '@/lib/auth/user';
import { DashboardClient } from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <DashboardClient organizationId={organizationId} />;
}
