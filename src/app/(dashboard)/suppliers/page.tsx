import { getCurrentOrganizationId } from '@/lib/auth/user';
import { SuppliersClient } from './SuppliersClient';
import { redirect } from 'next/navigation';

export default async function SuppliersPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <SuppliersClient organizationId={organizationId} />;
}
