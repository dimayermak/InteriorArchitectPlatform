import { getCurrentOrganizationId } from '@/lib/auth/user';
import { FinanceClient } from './FinanceClient';
import { redirect } from 'next/navigation';

export default async function FinancePage() {
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) {
        redirect('/login');
    }

    return <FinanceClient organizationId={organizationId} />;
}
