'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, UserPlus, Mail, Phone, Calendar, Clock, MoreVertical } from 'lucide-react';

// Since we don't have real team data connected yet, this is a placeholder page
const MOCK_TEAM = [
    { id: '1', name: 'משתמש ראשי', email: 'admin@example.com', role: 'מנהל', status: 'active' },
];

export default function TeamPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">צוות</h1>
                    <p className="text-muted-foreground text-sm mt-1">ניהול חברי הצוות ונוכחות</p>
                </div>
                <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    הזמן משתמש
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-foreground">{MOCK_TEAM.length}</div>
                        <div className="text-sm text-muted-foreground">חברי צוות</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{MOCK_TEAM.filter((m) => m.status === 'active').length}</div>
                        <div className="text-sm text-muted-foreground">פעילים</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-foreground">0</div>
                        <div className="text-sm text-muted-foreground">בחופשה</div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        חברי צוות
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {MOCK_TEAM.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">{member.name}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            {member.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="info">{member.role}</Badge>
                                    <Badge variant="success">פעיל</Badge>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Section - Coming Soon */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        נוכחות היום
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>מעקב נוכחות יהיה זמין בקרוב</p>
                    <p className="text-sm">כניסה ויציאה, שעות עבודה ודוחות</p>
                </CardContent>
            </Card>
        </div>
    );
}
