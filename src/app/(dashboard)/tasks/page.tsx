import { getCurrentOrganizationId } from '@/lib/auth/user';
import { TasksClient } from './TasksClient';
import { redirect } from 'next/navigation';

export default async function TasksPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <TasksClient organizationId={organizationId} />;
}
