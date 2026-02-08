import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Get the current authenticated user and their profile
 */
export async function getCurrentUser() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    return user;
}

/**
 * Get the current user's profile with organization info
 */
export async function getCurrentProfile() {
    // Check for dev bypass
    const cookieStore = await cookies();
    const devBypass = cookieStore.get('dev-bypass');

    if (devBypass?.value === 'true' && process.env.NODE_ENV === 'development') {
        // Return a mock profile for dev bypass
        return {
            id: '00000000-0000-0000-0000-000000000000',
            organization_id: '00000000-0000-0000-0000-000000000000',
            full_name: 'Dev User',
            email: 'dev@example.com',
            role: 'owner',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization: {
                id: '00000000-0000-0000-0000-000000000000',
                name: 'Demo Studio',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        };
    }

    const supabase = await createClient();

    const user = await getCurrentUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            *,
            organization:organizations(*)
        `)
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return profile;
}

/**
 * Get the current user's organization ID
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
    const profile = await getCurrentProfile();
    return profile?.organization_id || null;
}
