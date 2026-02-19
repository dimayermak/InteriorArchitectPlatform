'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import {
    Users, UserPlus, Mail, Trash2, Shield, User, Crown,
} from 'lucide-react';

interface TeamMember {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
}

const roleLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' }> = {
    owner: { label: 'בעלים', variant: 'warning' },
    admin: { label: 'מנהל', variant: 'info' },
    member: { label: 'חבר צוות', variant: 'default' },
};

const roleIcons: Record<string, React.ReactNode> = {
    owner: <Crown className="w-3.5 h-3.5" />,
    admin: <Shield className="w-3.5 h-3.5" />,
    member: <User className="w-3.5 h-3.5" />,
};

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [inviteFullName, setInviteFullName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    const supabase = createClient();

    useEffect(() => {
        async function load() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { setLoading(false); return; }
                setCurrentUserId(user.id);

                // Get current user's org
                const { data: myProfile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!myProfile?.organization_id) { setLoading(false); return; }

                // Get all team members in the org
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, role, avatar_url, created_at')
                    .eq('organization_id', myProfile.organization_id)
                    .order('created_at', { ascending: true });

                if (!error && data) setMembers(data as TeamMember[]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: myProfile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!myProfile?.organization_id) throw new Error('No organization found');

            // Use Supabase admin invite. Since we don't have admin SDK here,
            // we create a profile record directly (user signs up themselves with this email).
            // A proper invite flow would use a server-side edge function.
            // For now we create a pending profile or show instructions.
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', inviteEmail)
                .single();

            if (existing) {
                // Link existing profile to this org
                await supabase
                    .from('profiles')
                    .update({ organization_id: myProfile.organization_id, role: inviteRole })
                    .eq('id', existing.id);
                setSuccess(`המשתמש ${inviteEmail} שויך לסטודיו עם תפקיד ${roleLabels[inviteRole]?.label}.`);
            } else {
                // Create a placeholder profile — they need to register with this email
                await supabase.from('profiles').insert({
                    id: crypto.randomUUID(),
                    full_name: inviteFullName || inviteEmail.split('@')[0],
                    email: inviteEmail,
                    role: inviteRole,
                    organization_id: myProfile.organization_id,
                });
                setSuccess(`חבר הצוות ${inviteEmail} נוסף. עליהם להירשם עם אימייל זה.`);
            }

            // Refresh list
            const { data: updated } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, avatar_url, created_at')
                .eq('organization_id', myProfile.organization_id)
                .order('created_at', { ascending: true });
            if (updated) setMembers(updated as TeamMember[]);

            setIsInviteOpen(false);
            setInviteEmail('');
            setInviteFullName('');
            setInviteRole('member');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'שגיאה בהוספת חבר צוות');
        } finally {
            setSaving(false);
        }
    }

    async function handleRemove(memberId: string) {
        if (memberId === currentUserId) { setError('לא ניתן להסיר את עצמך'); return; }
        if (!confirm('להסיר חבר צוות זה מהסטודיו?')) return;
        try {
            await supabase.from('profiles').update({ organization_id: null }).eq('id', memberId);
            setMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'שגיאה בהסרה');
        }
    }

    async function handleRoleChange(memberId: string, newRole: string) {
        if (memberId === currentUserId) return;
        try {
            await supabase.from('profiles').update({ role: newRole }).eq('id', memberId);
            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        } catch (e) {
            console.error(e);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    );

    const activeCount = members.length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">צוות</h1>
                    <p className="text-muted-foreground text-sm mt-1">ניהול חברי הצוות והרשאות</p>
                </div>
                <Button className="gap-2" onClick={() => setIsInviteOpen(true)}>
                    <UserPlus className="w-4 h-4" />
                    הוסף חבר צוות
                </Button>
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold">{activeCount}</div><div className="text-sm text-muted-foreground">חברי צוות</div></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-green-600">{members.filter(m => m.role === 'admin' || m.role === 'owner').length}</div><div className="text-sm text-muted-foreground">מנהלים</div></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-blue-600">{members.filter(m => m.role === 'member').length}</div><div className="text-sm text-muted-foreground">חברי צוות</div></CardContent></Card>
            </div>

            {/* Members list */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />חברי צוות
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {members.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>אין חברי צוות עדיין</p>
                            <p className="text-sm mt-1">לחץ על "הוסף חבר צוות" כדי להתחיל</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {members.map(member => {
                                const roleInfo = roleLabels[member.role] || roleLabels.member;
                                const icon = roleIcons[member.role] || roleIcons.member;
                                const isMe = member.id === currentUserId;
                                return (
                                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                                                {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground flex items-center gap-2">
                                                    {member.full_name}
                                                    {isMe && <span className="text-xs text-muted-foreground">(אתה)</span>}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {member.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Role selector */}
                                            {!isMe ? (
                                                <select
                                                    value={member.role}
                                                    onChange={e => handleRoleChange(member.id, e.target.value)}
                                                    className="h-8 px-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    <option value="owner">בעלים</option>
                                                    <option value="admin">מנהל</option>
                                                    <option value="member">חבר צוות</option>
                                                </select>
                                            ) : (
                                                <Badge variant={roleInfo.variant}>
                                                    <span className="flex items-center gap-1">{icon}{roleInfo.label}</span>
                                                </Badge>
                                            )}
                                            {!isMe && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemove(member.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                                    title="הסר מהצוות"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Invite Modal */}
            <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="הוספת חבר צוות" size="md">
                <form onSubmit={handleInvite} className="space-y-4">
                    <Input
                        label="שם מלא"
                        value={inviteFullName}
                        onChange={e => setInviteFullName(e.target.value)}
                        placeholder="ישראל ישראלי"
                    />
                    <Input
                        label="אימייל *"
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="example@studio.com"
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">תפקיד</label>
                        <select
                            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground"
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value)}
                        >
                            <option value="member">חבר צוות</option>
                            <option value="admin">מנהל</option>
                        </select>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-sm">
                        💡 חבר הצוות יצטרך להירשם באפליקציה עם אותו אימייל כדי לקבל גישה.
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" className="flex-1" disabled={saving}>
                            {saving ? 'מוסיף...' : 'הוסף לצוות'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
