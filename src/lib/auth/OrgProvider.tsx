'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface OrgContextValue {
    orgId: string | null;
    userId: string | null;
    userName: string;
    userEmail: string;
    studioName: string;
    loading: boolean;
}

const OrgContext = createContext<OrgContextValue>({
    orgId: null,
    userId: null,
    userName: '',
    userEmail: '',
    studioName: '',
    loading: true,
});

export function OrgProvider({ children }: { children: ReactNode }) {
    const [orgId, setOrgId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [studioName, setStudioName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(async ({ data }) => {
            if (data.user) {
                setUserId(data.user.id);
                setUserEmail(data.user.email || '');
                setUserName(
                    data.user.user_metadata?.full_name ||
                    data.user.email?.split('@')[0] ||
                    'משתמש'
                );

                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('organization_id')
                        .eq('id', data.user.id)
                        .single();

                    if (profile?.organization_id) {
                        setOrgId(profile.organization_id);

                        const { data: org } = await supabase
                            .from('organizations')
                            .select('name')
                            .eq('id', profile.organization_id)
                            .single();

                        if (org?.name) setStudioName(org.name);
                    }
                } catch (err) {
                    console.error('Failed to fetch org:', err);
                }
            }
            setLoading(false);
        });
    }, []);

    return (
        <OrgContext.Provider value={{ orgId, userId, userName, userEmail, studioName, loading }}>
            {children}
        </OrgContext.Provider>
    );
}

export function useOrg() {
    const ctx = useContext(OrgContext);
    if (!ctx.orgId && !ctx.loading) {
        console.warn('useOrg: no org ID found. User may not be authenticated.');
    }
    return ctx;
}
