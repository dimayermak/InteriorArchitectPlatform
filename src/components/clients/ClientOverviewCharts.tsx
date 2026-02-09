'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import type { Project, TimeEntry } from '@/types/database';

interface ClientOverviewChartsProps {
    projects: Project[];
    timeEntries: TimeEntry[];
}

export function ClientOverviewCharts({ projects, timeEntries }: ClientOverviewChartsProps) {
    // Process Project Status
    const projectStats = projects.reduce((acc, curr) => {
        const s = (curr.status || 'planning') as string;
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
        'planning': { label: 'תכנון', color: '#6366f1' },
        'active': { label: 'בביצוע', color: '#22c55e' },
        'on_hold': { label: 'הושהה', color: '#f59e0b' },
        'completed': { label: 'הושלם', color: '#3b82f6' },
        'cancelled': { label: 'בוטל', color: '#ef4444' },
    };

    const projectData = Object.entries(projectStats).map(([status, count]) => {
        const config = STATUS_CONFIG[status] || { label: status, color: '#94a3b8' };
        return {
            name: config.label,
            value: count,
            color: config.color,
        };
    });

    // Process Time by Project
    const timeByProjectRaw = timeEntries.reduce((acc, entry) => {
        const projectId = entry.project_id || 'unassigned';
        // If unassigned project, use 'No Project' label, otherwise find project name
        let name = 'כללי';
        if (projectId !== 'unassigned') {
            const p = projects.find(prj => prj.id === projectId);
            if (p) name = p.name;
        }

        const hours = (entry.duration_minutes || 0) / 60;
        acc[name] = (acc[name] || 0) + hours;
        return acc;
    }, {} as Record<string, number>);

    const timeData = Object.entries(timeByProjectRaw)
        .map(([name, hours]) => ({ name, hours: Number(hours.toFixed(1)) }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5); // Top 5 projects by time

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Project Status Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">סטטוס פרויקטים</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full dir-ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {projectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | undefined) => [value || 0, 'פרויקטים']} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Time Distribution Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">שעות לפי פרויקט</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full dir-ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={timeData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} tick={{ fill: '#6b7280' }} />
                                <Tooltip formatter={(value: number | undefined) => [`${value || 0} שעות`, 'זמן']} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="hours" name="hours" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
