import type { ProjectPhase } from '@/types/database';

interface ClientReportGanttProps {
    phases: ProjectPhase[];
    projectStartDate: string | null;
    projectEndDate: string | null;
}

const phaseStatusConfig = {
    completed: { label: 'הושלם', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    in_progress: { label: 'בביצוע', bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
    pending: { label: 'טרם החל', bar: 'bg-gray-300', badge: 'bg-gray-100 text-gray-500' },
};

function dateToMs(dateStr: string) {
    return new Date(dateStr).getTime();
}

export function ClientReportGantt({ phases, projectStartDate, projectEndDate }: ClientReportGanttProps) {
    const phasesWithDates = phases.filter(p => p.start_date && p.end_date);
    const hasDates = phasesWithDates.length > 0;

    // Determine project span
    const allStarts = phasesWithDates.map(p => dateToMs(p.start_date!));
    const allEnds = phasesWithDates.map(p => dateToMs(p.end_date!));

    const spanStart = projectStartDate
        ? dateToMs(projectStartDate)
        : allStarts.length
            ? Math.min(...allStarts)
            : Date.now();
    const spanEnd = projectEndDate
        ? dateToMs(projectEndDate)
        : allEnds.length
            ? Math.max(...allEnds)
            : Date.now() + 86400000 * 30;
    const totalMs = spanEnd - spanStart || 1;

    if (!hasDates) {
        // Fallback: simple list without bars if no dates set
        return (
            <div className="space-y-3">
                {phases.map((phase) => {
                    const cfg = phaseStatusConfig[phase.status as keyof typeof phaseStatusConfig] || phaseStatusConfig.pending;
                    return (
                        <div key={phase.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                            <div>
                                <div className="font-medium text-sm">{phase.name}</div>
                                {phase.description && <div className="text-xs text-muted-foreground mt-0.5">{phase.description}</div>}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cfg.badge}`}>{cfg.label}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {phases.map((phase) => {
                const cfg = phaseStatusConfig[phase.status as keyof typeof phaseStatusConfig] || phaseStatusConfig.pending;
                const left = phase.start_date
                    ? Math.max(0, (dateToMs(phase.start_date) - spanStart) / totalMs) * 100
                    : 0;
                const width = phase.start_date && phase.end_date
                    ? Math.max(2, (dateToMs(phase.end_date) - dateToMs(phase.start_date)) / totalMs) * 100
                    : 30;

                return (
                    <div key={phase.id}>
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                            <span className="font-medium">{phase.name}</span>
                            <div className="flex items-center gap-2">
                                {phase.start_date && phase.end_date && (
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(phase.start_date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
                                        {' – '}
                                        {new Date(phase.end_date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>{cfg.label}</span>
                            </div>
                        </div>
                        {/* Gantt bar */}
                        <div className="h-7 bg-muted/40 rounded-lg relative overflow-hidden border border-border/50">
                            <div
                                className={`absolute top-1 bottom-1 rounded-md ${cfg.bar} opacity-80 transition-all duration-500`}
                                style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                            />
                        </div>
                    </div>
                );
            })}

            {/* Timeline axis */}
            {hasDates && (
                <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <span>{new Date(spanStart).toLocaleDateString('he-IL', { year: 'numeric', month: 'short' })}</span>
                    <span>{new Date(spanEnd).toLocaleDateString('he-IL', { year: 'numeric', month: 'short' })}</span>
                </div>
            )}
        </div>
    );
}
