import { getCurrentOrganizationId } from '@/lib/auth/user';
import { redirect } from 'next/navigation';
import { NewTaskClient } from './NewTaskClient';

export default async function NewTaskPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <NewTaskClient organizationId={organizationId} />;
}
