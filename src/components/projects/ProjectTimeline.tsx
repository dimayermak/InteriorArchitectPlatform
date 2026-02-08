'use client';

import { useMemo } from 'react';
import type { ProjectPhase, Task } from '@/types/database';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

interface ProjectTimelineProps {
    phases: ProjectPhase[];
    tasks: Task[];
    projectStartDate?: string;
    projectEndDate?: string;
}

export function ProjectTimeline({
    phases,
    tasks,
    projectStartDate,
    projectEndDate,
}: ProjectTimelineProps) {
    const timeline = useMemo(() => {
        // Calculate date range
        const dates: Date[] = [];
        const start = projectStartDate ? new Date(projectStartDate) : new Date();
        const end = projectEndDate ? new Date(projectEndDate) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);

        // Generate week markers
        const current = new Date(start);
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 7);
        }

        return { start, end, weeks: dates, totalDays: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) };
    }, [projectStartDate, projectEndDate]);

    const getPhasePosition = (phase: ProjectPhase) => {
        if (!phase.start_date || !phase.end_date) return null;

        const phaseStart = new Date(phase.start_date);
        const phaseEnd = new Date(phase.end_date);

        const startOffset = Math.max(0, (phaseStart.getTime() - timeline.start.getTime()) / (24 * 60 * 60 * 1000));
        const duration = Math.max(7, (phaseEnd.getTime() - phaseStart.getTime()) / (24 * 60 * 60 * 1000));

        const leftPercent = (startOffset / timeline.totalDays) * 100;
        const widthPercent = (duration / timeline.totalDays) * 100;

        return { left: `${leftPercent}%`, width: `${Math.min(widthPercent, 100 - leftPercent)}%` };
    };

    const getPhaseProgress = (phaseId: string) => {
        const phaseTasks = tasks.filter(t => t.phase_id === phaseId);
        if (phaseTasks.length === 0) return 0;
        const completed = phaseTasks.filter(t => t.status === 'done').length;
        return Math.round((completed / phaseTasks.length) * 100);
    };

    const getPhaseColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in_progress': return 'bg-blue-500';
            default: return 'bg-gray-300';
        }
    };

    const getPhaseIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
            default: return <Circle className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="bg-background rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">ציר זמן פרויקט</h3>
                <p className="text-sm text-muted-foreground">
                    {timeline.start.toLocaleDateString('he-IL')} - {timeline.end.toLocaleDateString('he-IL')}
                </p>
            </div>

            {/* Timeline Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Week Headers */}
                    <div className="flex border-b border-border bg-muted/30">
                        <div className="w-48 flex-shrink-0 p-3 text-sm font-medium text-muted-foreground border-l border-border">
                            שלב
                        </div>
                        <div className="flex-1 relative">
                            <div className="flex">
                                {timeline.weeks.map((week, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 text-center p-2 text-xs text-muted-foreground border-l border-border"
                                        style={{ minWidth: '100px' }}
                                    >
                                        {week.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Phase Rows */}
                    {phases.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            אין שלבים מוגדרים לפרויקט זה
                        </div>
                    ) : (
                        phases.map((phase) => {
                            const position = getPhasePosition(phase);
                            const progress = getPhaseProgress(phase.id);
                            const phaseTasks = tasks.filter(t => t.phase_id === phase.id);

                            return (
                                <div key={phase.id} className="flex border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                    {/* Phase Name */}
                                    <div className="w-48 flex-shrink-0 p-3 border-l border-border">
                                        <div className="flex items-center gap-2">
                                            {getPhaseIcon(phase.status)}
                                            <div>
                                                <div className="text-sm font-medium text-foreground">{phase.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {phaseTasks.length} משימות • {progress}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Bar */}
                                    <div className="flex-1 relative py-4 px-2">
                                        {position ? (
                                            <div
                                                className={`absolute h-6 rounded-lg ${getPhaseColor(phase.status)} opacity-80`}
                                                style={{
                                                    left: position.left,
                                                    width: position.width,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)'
                                                }}
                                            >
                                                {/* Progress indicator */}
                                                <div
                                                    className="h-full rounded-lg bg-white/30"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground text-center py-2">
                                                לא הוגדרו תאריכים
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-border bg-muted/20 flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-300" />
                    <span className="text-muted-foreground">ממתין</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-muted-foreground">בביצוע</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-muted-foreground">הושלם</span>
                </div>
            </div>
        </div>
    );
}
