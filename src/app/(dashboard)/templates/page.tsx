import { getCurrentOrganizationId } from '@/lib/auth/user';
import { TemplatesClient } from './TemplatesClient';
import { redirect } from 'next/navigation';

export default async function TemplatesPage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <TemplatesClient organizationId={organizationId} />;
}
