import { getCurrentOrganizationId } from '@/lib/auth/user';
import { ProjectsClient } from './ProjectsClient';
import { redirect } from 'next/navigation';

export default async function ProjectsPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <ProjectsClient organizationId={organizationId} />;
}
