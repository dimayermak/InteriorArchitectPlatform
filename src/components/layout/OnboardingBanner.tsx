'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Building2, ArrowLeft, X, Sparkles } from 'lucide-react';

interface ProfileCompleteness {
    name: boolean;
    phone: boolean;
    email: boolean;
    city: boolean;
    studio_type: boolean;
}

export function OnboardingBanner() {
    const [show, setShow] = useState(false);
    const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if dismissed in this session
        const dismissedUntil = localStorage.getItem('onboarding_dismissed_until');
        if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
            return;
        }

        async function checkProfile() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) return;

            const { data: org } = await supabase
                .from('organizations')
                .select('name, phone, email, city, studio_type')
                .eq('id', profile.organization_id)
                .single();

            if (!org) return;

            const check: ProfileCompleteness = {
                name: !!org.name && org.name.length > 0,
                phone: !!org.phone && org.phone.length > 0,
                email: !!org.email && org.email.length > 0,
                city: !!org.city && org.city.length > 0,
                studio_type: !!org.studio_type && org.studio_type.length > 0,
            };

            const filledCount = Object.values(check).filter(Boolean).length;
            // Show banner if less than 3 fields are filled
            if (filledCount < 3) {
                setCompleteness(check);
                setShow(true);
            }
        }

        checkProfile();
    }, []);

    function handleDismiss() {
        setDismissed(true);
        setShow(false);
        // Don't show again for 3 days
        const dismissUntil = new Date();
        dismissUntil.setDate(dismissUntil.getDate() + 3);
        localStorage.setItem('onboarding_dismissed_until', dismissUntil.toISOString());
    }

    if (!show || dismissed || !completeness) return null;

    const filledCount = Object.values(completeness).filter(Boolean).length;
    const percentage = Math.round((filledCount / 5) * 100);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-violet-600 via-purple-600 to-fuchsia-600 p-[1px]">
            <div className="relative bg-gradient-to-l from-violet-600/95 via-purple-600/95 to-fuchsia-600/95 rounded-2xl p-5 text-white">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />

                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="סגור"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="relative flex items-center gap-5">
                    {/* Icon */}
                    <div className="hidden sm:flex h-14 w-14 shrink-0 rounded-2xl bg-white/10 items-center justify-center backdrop-blur-sm border border-white/10">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold mb-1">
                            🎯 השלימו את פרופיל הסטודיו שלכם
                        </h3>
                        <p className="text-sm text-white/70 mb-3">
                            השלימו את הפרטים כדי שהמערכת תוכל ליצור חשבוניות, מיילים ודוחות עם המיתוג שלכם. זה לוקח 2 דקות!
                        </p>

                        {/* Progress bar */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs text-white/60 font-medium">{percentage}%</span>
                        </div>

                        {/* Missing fields */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {!completeness.name && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">שם סטודיו</span>
                            )}
                            {!completeness.phone && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">טלפון</span>
                            )}
                            {!completeness.email && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">אימייל</span>
                            )}
                            {!completeness.city && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">עיר</span>
                            )}
                            {!completeness.studio_type && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">סוג סטודיו</span>
                            )}
                        </div>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/settings"
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-700 text-sm font-bold hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
                    >
                        <Building2 className="w-4 h-4" />
                        להגדרות
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
