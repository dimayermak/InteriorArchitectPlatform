import { getCurrentOrganizationId, getCurrentProfile } from '@/lib/auth/user';
import { TimeClient } from './TimeClient';
import { redirect } from 'next/navigation';

export default async function TimePage() {
    const organizationId = await getCurrentOrganizationId();
    const profile = await getCurrentProfile();

    if (!organizationId || !profile) {
        redirect('/login');
    }

    return <TimeClient organizationId={organizationId} userId={profile.id} />;
}
