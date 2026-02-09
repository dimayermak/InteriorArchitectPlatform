'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getDashboardStats, getRecentActivity, getUpcomingTasks, getProjectStats, getClientGrowth, getRevenueStats, type DashboardStats, type RecentActivity } from '@/lib/api/dashboard';
import { Users, FolderOpen, TrendingUp, Clock, Plus, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { OverviewCharts } from '@/components/dashboard/OverviewCharts';

interface DashboardClientProps {
    organizationId: string;
}

export function DashboardClient({ organizationId }: DashboardClientProps) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<{ id: string; title: string; dueDate: string; project: string; priority: string }[]>([]);
    const [projectStats, setProjectStats] = useState<{ name: string; value: number; color: string }[]>([]);
    const [clientGrowth, setClientGrowth] = useState<{ date: string; count: number }[]>([]);
    const [revenueStats, setRevenueStats] = useState<{ name: string; income: number; expenses: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [statsData, activityData, tasksData, projectsData, growthData, revenueData] = await Promise.all([
                    getDashboardStats(organizationId),
                    getRecentActivity(organizationId),
                    getUpcomingTasks(organizationId),
                    getProjectStats(organizationId),
                    getClientGrowth(organizationId),
                    getRevenueStats(organizationId),
                ]);
                setStats(statsData);
                setRecentActivity(activityData);
                setUpcomingTasks(tasksData);
                setProjectStats(projectsData);
                setClientGrowth(growthData);
                setRevenueStats(revenueData);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [organizationId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        סקירה כללית
                    </h1>
                    <p className="text-muted-foreground mt-1">ברוכים הבאים למערכת הניהול</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/projects/new">
                        <Button className="gap-2 shadow-sm">
                            <Plus className="w-4 h-4" />
                            פרויקט חדש
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow duration-200 border-primary/10 bg-gradient-to-br from-background to-primary/5">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">פרויקטים פעילים</p>
                                <h3 className="text-3xl font-bold mt-2 tabular-nums">{stats.projects.active}</h3>
                                <p className="text-xs text-muted-foreground mt-1">מתוך {stats.projects.total} סה״כ</p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <FolderOpen className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200 border-indigo-500/10 bg-gradient-to-br from-background to-indigo-500/5">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">לידים חדשים</p>
                                <h3 className="text-3xl font-bold mt-2 tabular-nums">{stats.leads.new}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{stats.leads.qualified} בתהליך</p>
                            </div>
                            <div className="p-3 bg-indigo-500/10 rounded-xl">
                                <Users className="w-5 h-5 text-indigo-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200 border-emerald-500/10 bg-gradient-to-br from-background to-emerald-500/5">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">לקוחות פעילים</p>
                                <h3 className="text-3xl font-bold mt-2 tabular-nums">{stats.clients.active}</h3>
                                <p className="text-xs text-muted-foreground mt-1">מתוך {stats.clients.total} סה״כ</p>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <Users className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200 border-amber-500/10 bg-gradient-to-br from-background to-amber-500/5">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">חשבוניות פתוחות</p>
                                <h3 className="text-3xl font-bold mt-2 tabular-nums">₪{stats.finance.pendingInvoices.toLocaleString()}</h3>
                                <p className="text-xs text-muted-foreground mt-1">ממתין לתשלום</p>
                            </div>
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Overview */}
            <OverviewCharts
                projectStats={projectStats}
                clientGrowth={clientGrowth}
                revenueStats={revenueStats}
            />

            {/* Recent Activity & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            פעילות אחרונה
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="mt-1 text-2xl">{activity.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{activity.title}</p>
                                        <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(activity.timestamp).toLocaleDateString('he-IL')}
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    אין פעילות אחרונה
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Tasks */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            משימות קרובות
                        </CardTitle>
                        <Link href="/tasks" className="text-sm text-primary hover:underline">
                            לכל המשימות
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingTasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'urgent' ? 'bg-red-500' :
                                            task.priority === 'high' ? 'bg-orange-500' :
                                                task.priority === 'medium' ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{task.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{task.project}</p>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full ${new Date(task.dueDate) < new Date() ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {new Date(task.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                            ))}
                            {upcomingTasks.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    אין משימות קרובות
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
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
