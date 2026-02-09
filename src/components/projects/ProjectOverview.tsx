'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Project, ProjectPhase, Task } from '@/types/database';
import { Target, CheckCircle2, Clock, DollarSign, ArrowRight, User } from 'lucide-react';

interface ProjectOverviewProps {
    project: Project & { client: { name: string } | null };
    stats: { tasksTotal: number; tasksCompleted: number; hoursLogged: number; budget: number; spent: number } | null;
    statusLabels: Record<string, { label: string; color: string }>;
}

export function ProjectOverview({ project, stats, statusLabels }: ProjectOverviewProps) {
    const status = statusLabels[project.status] || { label: project.status, color: 'bg-gray-100' };
    const completionPercentage = stats ? Math.round((stats.tasksCompleted / (stats.tasksTotal || 1)) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
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
                <Card>
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
                <Card>
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
                <Card>
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
                <Card>
                    <CardHeader>
                        <CardTitle>פרטי פרויקט</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">סטטוס</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                        </div>
                        {project.start_date && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">תאריך התחלה</span>
                                <span>{new Date(project.start_date).toLocaleDateString('he-IL')}</span>
                            </div>
                        )}
                        {project.estimated_end_date && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">צפי סיום</span>
                                <span>{new Date(project.estimated_end_date).toLocaleDateString('he-IL')}</span>
                            </div>
                        )}
                        {project.site_address && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">כתובת</span>
                                <span>{project.site_address}, {project.site_city}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Placeholder for Recent Activity or other overview widgets */}
            </div>
        </div>
    );
}
