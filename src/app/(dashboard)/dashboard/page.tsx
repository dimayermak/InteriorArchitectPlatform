'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getDashboardStats, getRecentActivity, getUpcomingTasks, type DashboardStats, type RecentActivity } from '@/lib/api/dashboard';
import { Users, FolderOpen, TrendingUp, Clock, Plus, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';

// Dev mode organization ID
const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [tasks, setTasks] = useState<{ id: string; title: string; dueDate: string; project: string; priority: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [statsData, activityData, tasksData] = await Promise.all([
                    getDashboardStats(DEV_ORG_ID),
                    getRecentActivity(DEV_ORG_ID, 8),
                    getUpcomingTasks(DEV_ORG_ID, 5),
                ]);
                setStats(statsData);
                setActivities(activityData);
                setTasks(tasksData);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        }
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">שלום! 👋</h1>
                    <p className="text-muted-foreground mt-1">הנה סיכום הסטודיו שלך להיום</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/leads">
                        <Button variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" />
                            ליד חדש
                        </Button>
                    </Link>
                    <Link href="/projects">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            פרויקט חדש
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="לידים"
                    value={stats?.leads.total || 0}
                    subtitle={`${stats?.leads.new || 0} חדשים`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="blue"
                    href="/leads"
                />
                <StatCard
                    title="לקוחות"
                    value={stats?.clients.total || 0}
                    subtitle={`${stats?.clients.active || 0} פעילים`}
                    icon={<Users className="w-5 h-5" />}
                    color="purple"
                    href="/clients"
                />
                <StatCard
                    title="פרויקטים"
                    value={stats?.projects.total || 0}
                    subtitle={`${stats?.projects.active || 0} בביצוע`}
                    icon={<FolderOpen className="w-5 h-5" />}
                    color="green"
                    href="/projects"
                />
                <StatCard
                    title="חשבוניות ממתינות"
                    value={`₪${(stats?.finance.pendingInvoices || 0).toLocaleString()}`}
                    subtitle="לתשלום"
                    icon={<Clock className="w-5 h-5" />}
                    color="amber"
                    href="/finance"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">פעילות אחרונה</CardTitle>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            הכל
                            <ArrowLeft className="w-4 h-4 mr-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {activities.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>אין פעילות עדיין</p>
                                <p className="text-sm">התחילו בהוספת לידים ופרויקטים</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                                            {activity.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{activity.title}</p>
                                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                                        </div>
                                        <time className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                                            {formatRelativeTime(activity.timestamp)}
                                        </time>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Tasks */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">משימות קרובות</CardTitle>
                        <Link href="/projects">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                הכל
                                <ArrowLeft className="w-4 h-4 mr-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {tasks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>אין משימות קרובות</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <div key={task.id} className="p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                                        <p className="font-medium text-foreground text-sm">{task.title}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{task.project}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                                {formatDate(task.dueDate)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">פעולות מהירות</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickAction href="/leads" icon="📋" label="הוספת ליד" />
                        <QuickAction href="/clients" icon="👤" label="לקוח חדש" />
                        <QuickAction href="/projects" icon="🏗️" label="פרויקט חדש" />
                        <QuickAction href="/time" icon="⏱️" label="התחל טיימר" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'green' | 'amber';
    href: string;
}

function StatCard({ title, value, subtitle, icon, color, href }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    };

    return (
        <Link href={href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
                            {icon}
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground tabular-nums">{value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{title}</div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</div>
                </CardContent>
            </Card>
        </Link>
    );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <Link href={href}>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-colors cursor-pointer">
                <span className="text-2xl">{icon}</span>
                <span className="font-medium text-sm text-foreground">{label}</span>
            </div>
        </Link>
    );
}

function formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'עכשיו';
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    return date.toLocaleDateString('he-IL');
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / 86400000);

    if (diffDays < 0) return 'באיחור';
    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'מחר';
    if (diffDays < 7) return `בעוד ${diffDays} ימים`;
    return date.toLocaleDateString('he-IL');
}

function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'urgent': return 'bg-red-100 text-red-700';
        case 'high': return 'bg-orange-100 text-orange-700';
        case 'medium': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}
