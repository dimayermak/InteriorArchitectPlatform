'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Building2, Phone, Mail, Globe, MapPin, FileText, Camera, Save, Loader2 } from 'lucide-react';

const STUDIO_TYPES = [
    { value: 'interior_design', label: 'עיצוב פנים' },
    { value: 'architecture', label: 'אדריכלות' },
    { value: 'both', label: 'עיצוב פנים ואדריכלות' },
];

interface StudioProfile {
    id: string;
    name: string;
    studio_type: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    city: string;
    logo_url: string;
    bio: string;
    license_number: string;
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<Partial<StudioProfile>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [orgId, setOrgId] = useState('');

    const supabase = createClient();

    useEffect(() => {
        async function load() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!userProfile?.organization_id) return;
                setOrgId(userProfile.organization_id);

                const { data: org } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', userProfile.organization_id)
                    .single();

                if (org) {
                    setProfile({
                        id: org.id,
                        name: org.name || '',
                        studio_type: org.studio_type || 'interior_design',
                        phone: org.phone || '',
                        email: org.email || '',
                        website: org.website || '',
                        address: org.address || '',
                        city: org.city || '',
                        logo_url: org.logo_url || '',
                        bio: org.bio || '',
                        license_number: org.license_number || '',
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!orgId) return;
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const { error: updateError } = await supabase
                .from('organizations')
                .update({
                    name: profile.name,
                    studio_type: profile.studio_type,
                    phone: profile.phone || null,
                    email: profile.email || null,
                    website: profile.website || null,
                    address: profile.address || null,
                    city: profile.city || null,
                    logo_url: profile.logo_url || null,
                    bio: profile.bio || null,
                    license_number: profile.license_number || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', orgId);

            if (updateError) throw new Error(updateError.message);
            setSuccess('הפרופיל נשמר בהצלחה ✓');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'שגיאה בשמירה');
        } finally {
            setSaving(false);
        }
    }

    function set(field: keyof StudioProfile, value: string) {
        setProfile(prev => ({ ...prev, [field]: value }));
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">פרופיל הסטודיו</h1>
                <p className="text-muted-foreground text-sm mt-1">פרטי הסטודיו, מידע ליצירת קשר ופרטים מקצועיים</p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 text-sm">
                    <span className="flex-1">{success}</span>
                    <button onClick={() => setSuccess('')}>✕</button>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* Studio Identity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Building2 className="w-4 h-4" />
                            זהות הסטודיו
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="שם הסטודיו *"
                                value={profile.name || ''}
                                onChange={e => set('name', e.target.value)}
                                placeholder="סטודיו לעיצוב פנים"
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">סוג הסטודיו</label>
                                <select
                                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={profile.studio_type || 'interior_design'}
                                    onChange={e => set('studio_type', e.target.value)}
                                >
                                    {STUDIO_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <Input
                            label="מספר רישיון / ת.ז. מקצועית"
                            value={profile.license_number || ''}
                            onChange={e => set('license_number', e.target.value)}
                            placeholder="רישיון אדריכל / תעודת מעצב פנים"
                        />

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">אודות הסטודיו</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                rows={3}
                                value={profile.bio || ''}
                                onChange={e => set('bio', e.target.value)}
                                placeholder="תיאור קצר על הסטודיו, מתחומי העיצוב, הסגנון המועדף..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Phone className="w-4 h-4" />
                            פרטי יצירת קשר
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Phone className="absolute right-3 top-9 w-4 h-4 text-muted-foreground" />
                                <Input
                                    label="טלפון"
                                    value={profile.phone || ''}
                                    onChange={e => set('phone', e.target.value)}
                                    placeholder="050-0000000"
                                    dir="ltr"
                                    className="pr-9"
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute right-3 top-9 w-4 h-4 text-muted-foreground" />
                                <Input
                                    label="אימייל עסקי"
                                    type="email"
                                    value={profile.email || ''}
                                    onChange={e => set('email', e.target.value)}
                                    placeholder="studio@example.com"
                                    dir="ltr"
                                    className="pr-9"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <Globe className="absolute right-3 top-9 w-4 h-4 text-muted-foreground" />
                            <Input
                                label="אתר אינטרנט"
                                value={profile.website || ''}
                                onChange={e => set('website', e.target.value)}
                                placeholder="https://www.studio.com"
                                dir="ltr"
                                className="pr-9"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <MapPin className="absolute right-3 top-9 w-4 h-4 text-muted-foreground" />
                                <Input
                                    label="כתובת"
                                    value={profile.address || ''}
                                    onChange={e => set('address', e.target.value)}
                                    placeholder="רחוב דיזנגוף 50"
                                    className="pr-9"
                                />
                            </div>
                            <Input
                                label="עיר"
                                value={profile.city || ''}
                                onChange={e => set('city', e.target.value)}
                                placeholder="תל אביב"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Logo URL */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Camera className="w-4 h-4" />
                            לוגו הסטודיו
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            {profile.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.logo_url} alt="לוגו" className="w-20 h-20 rounded-2xl object-cover border border-border" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center border border-border">
                                    <Building2 className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}
                            <div className="flex-1">
                                <Input
                                    label="URL לוגו"
                                    value={profile.logo_url || ''}
                                    onChange={e => set('logo_url', e.target.value)}
                                    placeholder="https://..."
                                    dir="ltr"
                                />
                                <p className="text-xs text-muted-foreground mt-1">הכנס קישור לתמונת הלוגו (JPEG, PNG, SVG)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save */}
                <div className="flex justify-end gap-3">
                    <Button type="submit" disabled={saving} className="gap-2 px-8">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'שומר...' : 'שמור שינויים'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
