import { getCurrentOrganizationId } from '@/lib/auth/user';
import { redirect } from 'next/navigation';
import { NewProjectClient } from './NewProjectClient';

export default async function NewProjectPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <NewProjectClient organizationId={organizationId} />;
}
