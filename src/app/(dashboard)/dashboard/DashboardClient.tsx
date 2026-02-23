'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getDashboardStats, getRecentActivity, getUpcomingTasks, getProjectStats, getClientGrowth, getRevenueStats, type DashboardStats, type RecentActivity } from '@/lib/api/dashboard';
import {
    Users, FolderOpen, TrendingUp, Clock, Plus, Calendar, Target,
    CheckSquare, Wallet, ArrowUpLeft, Sparkles, Sun, Sunset, Moon, FolderKanban
} from 'lucide-react';
import { OverviewCharts } from '@/components/dashboard/OverviewCharts';

interface DashboardClientProps {
    organizationId: string;
}

function getGreeting(): { text: string; icon: React.ReactNode } {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'בוקר טוב', icon: <Sun className="w-6 h-6 text-amber-400" /> };
    if (hour < 17) return { text: 'צהריים טובים', icon: <Sun className="w-6 h-6 text-orange-400" /> };
    if (hour < 21) return { text: 'ערב טוב', icon: <Sunset className="w-6 h-6 text-purple-400" /> };
    return { text: 'לילה טוב', icon: <Moon className="w-6 h-6 text-indigo-400" /> };
}

const quickActions = [
    { label: 'פרויקט חדש', icon: <FolderKanban className="w-5 h-5" />, href: '/projects/new', color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200/50' },
    { label: 'ליד חדש', icon: <Target className="w-5 h-5" />, href: '/leads/new', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200/50' },
    { label: 'משימה חדשה', icon: <CheckSquare className="w-5 h-5" />, href: '/tasks/new', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200/50' },
    { label: 'הוצאה חדשה', icon: <Wallet className="w-5 h-5" />, href: '/finance', color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200/50' },
];

export function DashboardClient({ organizationId }: DashboardClientProps) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<{ id: string; title: string; dueDate: string; project: string; priority: string }[]>([]);
    const [projectStats, setProjectStats] = useState<{ name: string; value: number; color: string }[]>([]);
    const [clientGrowth, setClientGrowth] = useState<{ date: string; count: number }[]>([]);
    const [revenueStats, setRevenueStats] = useState<{ name: string; income: number; expenses: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const greeting = getGreeting();

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
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
                {/* Skeleton loading */}
                <div className="h-20 bg-muted/50 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-muted/50 rounded-2xl animate-pulse" />
                    <div className="h-80 bg-muted/50 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-fade-in">
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                        {greeting.icon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{greeting.text} 👋</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">הנה סקירה של מה שקורה היום בעסק</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map(action => (
                    <Link key={action.href} href={action.href}>
                        <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${action.bg}`}>
                            <span className={action.color}>{action.icon}</span>
                            <span className="text-sm font-medium text-foreground/80">{action.label}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Link href="/projects">
                    <Card className="hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 border-transparent bg-white cursor-pointer h-full group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent" />
                        <CardContent className="p-5 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">פרויקטים פעילים</p>
                                    <h3 className="text-3xl font-bold mt-2 tabular-nums text-foreground">{stats.projects.active}</h3>
                                    <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                                        מתוך {stats.projects.total} סה״כ
                                    </p>
                                </div>
                                <div className="p-2.5 bg-violet-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <FolderOpen className="w-5 h-5 text-violet-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/leads">
                    <Card className="hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 border-transparent bg-white cursor-pointer h-full group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent" />
                        <CardContent className="p-5 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">לידים חדשים</p>
                                    <h3 className="text-3xl font-bold mt-2 tabular-nums text-foreground">{stats.leads.new}</h3>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                        {stats.leads.qualified} בתהליך
                                    </p>
                                </div>
                                <div className="p-2.5 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <Target className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/clients">
                    <Card className="hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 border-transparent bg-white cursor-pointer h-full group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent" />
                        <CardContent className="p-5 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">לקוחות פעילים</p>
                                    <h3 className="text-3xl font-bold mt-2 tabular-nums text-foreground">{stats.clients.active}</h3>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                        מתוך {stats.clients.total} סה״כ
                                    </p>
                                </div>
                                <div className="p-2.5 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance">
                    <Card className="hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 border-transparent bg-white cursor-pointer h-full group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent" />
                        <CardContent className="p-5 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">חשבוניות פתוחות</p>
                                    <h3 className="text-3xl font-bold mt-2 tabular-nums text-foreground">₪{stats.finance.pendingInvoices.toLocaleString()}</h3>
                                    <p className="text-xs text-muted-foreground/70 mt-1">ממתין לתשלום</p>
                                </div>
                                <div className="p-2.5 bg-amber-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Charts Overview */}
            <OverviewCharts
                projectStats={projectStats}
                clientGrowth={clientGrowth}
                revenueStats={revenueStats}
            />

            {/* Recent Activity & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 border-transparent bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            פעילות אחרונה
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                                    <div className="mt-0.5 text-xl">{activity.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.description}</p>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground/60 whitespace-nowrap mt-0.5">
                                        {formatRelativeTime(activity.timestamp)}
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <div className="text-center py-10">
                                    <Sparkles className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">אין פעילות אחרונה</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Tasks */}
                <Card className="border-transparent bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            משימות קרובות
                        </CardTitle>
                        <Link href="/tasks" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                            הכל →
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {upcomingTasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/30 hover:border-border/60 bg-white transition-colors">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'urgent' ? 'bg-red-500' :
                                        task.priority === 'high' ? 'bg-orange-500' :
                                            task.priority === 'medium' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{task.title}</p>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{task.project}</p>
                                    </div>
                                    <div className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${new Date(task.dueDate) < new Date()
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-muted/50 text-muted-foreground'
                                        }`}>
                                        {new Date(task.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                            ))}
                            {upcomingTasks.length === 0 && (
                                <div className="text-center py-10">
                                    <CheckSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">אין משימות קרובות</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
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
    if (diffMins < 60) return `לפני ${diffMins} דק׳`;
    if (diffHours < 24) return `לפני ${diffHours} שע׳`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    return date.toLocaleDateString('he-IL');
}
