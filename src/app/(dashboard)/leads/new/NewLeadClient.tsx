'use client';

import { useRouter } from 'next/navigation';
import { LeadForm } from '@/components/leads/LeadForm';

interface NewLeadClientProps {
    organizationId: string;
}

export function NewLeadClient({ organizationId }: NewLeadClientProps) {
    const router = useRouter();

    const handleSuccess = (lead: any) => {
        router.push(`/leads/${lead.id}`);
        router.refresh();
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">ליד חדש</h1>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <LeadForm
                    organizationId={organizationId}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
