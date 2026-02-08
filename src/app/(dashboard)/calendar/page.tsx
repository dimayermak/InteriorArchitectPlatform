import { getCurrentOrganizationId } from '@/lib/auth/user';
import { CalendarClient } from './CalendarClient';
import { redirect } from 'next/navigation';

export default async function CalendarPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <CalendarClient organizationId={organizationId} />;
}
