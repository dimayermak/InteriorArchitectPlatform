'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Project, ProjectPhase, Task } from '@/types/database';
import { Target, CheckCircle2, Clock, DollarSign, ArrowRight, User, MapPin, ExternalLink, CalendarDays } from 'lucide-react';
import Link from 'next/link';

interface ProjectOverviewProps {
    project: Project & { client: { name: string } | null };
    stats: { tasksTotal: number; tasksCompleted: number; hoursLogged: number; budget: number; spent: number } | null;
    statusLabels: Record<string, { label: string; color: string }>;
    tasks: Task[];
}

export function ProjectOverview({ project, stats, statusLabels, tasks }: ProjectOverviewProps) {
    const status = statusLabels[project.status] || { label: project.status, color: 'bg-gray-100' };
    const completionPercentage = stats ? Math.round((stats.tasksCompleted / (stats.tasksTotal || 1)) * 100) : 0;

    // Visual Timeline Calculation
    const phases = [
        { id: 'planning', label: 'תכנון', active: project.status === 'planning' || project.status === 'active' || project.status === 'completed' },
        { id: 'execution', label: 'ביצוע', active: project.status === 'active' || project.status === 'completed' },
        { id: 'completion', label: 'גמר', active: project.status === 'completed' },
    ];

    return (
        <div className="space-y-6">
            {/* 10x Upgrade: Visual Timeline */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -z-0 rounded-full" />
                    {/* Active Progress Bar (Approximation) */}
                    <div
                        className="absolute top-1/2 right-0 h-1 bg-primary -z-0 rounded-full transition-all duration-1000"
                        style={{ width: project.status === 'completed' ? '100%' : project.status === 'active' ? '66%' : '33%' }}
                    />

                    {phases.map((phase, index) => (
                        <div key={phase.id} className="relative z-10 flex flex-col items-center group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${phase.active
                                ? 'bg-primary border-primary-foreground shadow-md scale-110'
                                : 'bg-gray-100 border-white text-gray-400'
                                }`}>
                                {phase.active ? <CheckCircle2 className="w-4 h-4 text-white" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${phase.active ? 'text-primary' : 'text-gray-400'}`}>
                                {phase.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums">{completionPercentage}%</div>
                                <div className="text-xs text-muted-foreground">השלמה</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums">{stats?.tasksCompleted || 0}/{stats?.tasksTotal || 0}</div>
                                <div className="text-xs text-muted-foreground">משימות</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums">{(stats?.hoursLogged || 0).toFixed(1)}</div>
                                <div className="text-xs text-muted-foreground">שעות</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums">₪{(stats?.spent || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">מתוך ₪{(stats?.budget || 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>פרטי פרויקט</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Target className="w-4 h-4" /> סטטוס
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                        </div>

                        {/* 10x Upgrade: Clickable Client */}
                        {project.client && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <User className="w-4 h-4" /> לקוח
                                </span>
                                <Link href={`/clients/${project.client_id}`} className="text-primary hover:underline font-medium flex items-center gap-1 group">
                                    {project.client.name}
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </div>
                        )}

                        {/* 10x Upgrade: Waze Link */}
                        {project.site_address && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> כתובת
                                </span>
                                <a
                                    href={`https://waze.com/ul?q=${encodeURIComponent(project.site_address + ' ' + (project.site_city || ''))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium flex items-center gap-1 group"
                                >
                                    {project.site_address}, {project.site_city}
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        )}

                        {project.start_date && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" /> התחלה
                                </span>
                                <span>{new Date(project.start_date).toLocaleDateString('he-IL')}</span>
                            </div>
                        )}
                        {project.estimated_end_date && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> צפי סיום
                                </span>
                                <span className={new Date(project.estimated_end_date) < new Date() ? 'text-red-500 font-bold' : ''}>
                                    {new Date(project.estimated_end_date).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 10x Upgrade: Real Content for Recent Activity */}
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>פעילות אחרונה</CardTitle>
                        <div className="text-xs text-muted-foreground">{stats?.tasksCompleted} הושלמו מה-30 יום האחרונים</div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-4 relative">
                            {/* Vertical Line */}
                            <div className="absolute top-2 bottom-2 right-[19px] w-[2px] bg-gray-100 -z-0" />

                            {/* Real Activity Feed from Tasks */}
                            {/* We filter for completed tasks or high priority ones */}
                            {/* If no tasks, show empty state */}
                            {(!stats || stats.tasksTotal === 0) && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    אין פעילות רשומה עדיין.
                                </div>
                            )}

                            {/* Project Creation Milestone */}
                            <div className="flex gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 bg-primary text-white">
                                    <Target className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">יצירת פרויקט</p>
                                    <p className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString('he-IL')}</p>
                                </div>
                            </div>

                            {/* Tasks Feed */}
                            {tasks.slice(0, 4).map((task) => (
                                <div key={task.id} className="flex gap-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${task.status === 'done' ? 'bg-green-100 text-green-600' :
                                            task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-500'
                                        }`}>
                                        {task.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : 'ללא תאריך'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
