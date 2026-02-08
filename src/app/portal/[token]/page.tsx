import { getProjectByToken } from '@/lib/api/portal';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle, Clock, Calendar, User, Layers, Target } from 'lucide-react';

interface PortalPageProps {
    params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
    const { token } = await params;
    const portalData = await getProjectByToken(token);

    if (!portalData) {
        notFound();
    }

    const { project, phases, tasks, stats } = portalData;

    const statusLabels: Record<string, { label: string; color: string }> = {
        planning: { label: 'תכנון', color: 'bg-blue-100 text-blue-700' },
        active: { label: 'בביצוע', color: 'bg-green-100 text-green-700' },
        on_hold: { label: 'מושהה', color: 'bg-yellow-100 text-yellow-700' },
        completed: { label: 'הושלם', color: 'bg-purple-100 text-purple-700' },
        cancelled: { label: 'בוטל', color: 'bg-gray-100 text-gray-700' },
    };

    const status = statusLabels[project.status] || { label: project.status, color: 'bg-gray-100' };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir="rtl">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">הרמוניקה - פורטל לקוחות</p>
                            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Progress Overview */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background rounded-2xl border border-border p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold tabular-nums">{stats.progressPercent}%</div>
                                <div className="text-sm text-muted-foreground">התקדמות כללית</div>
                            </div>
                        </div>
                        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${stats.progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-background rounded-2xl border border-border p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold tabular-nums">{stats.completedTasks}/{stats.totalTasks}</div>
                                <div className="text-sm text-muted-foreground">משימות הושלמו</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background rounded-2xl border border-border p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold tabular-nums">{phases.length}</div>
                                <div className="text-sm text-muted-foreground">שלבי פרויקט</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Project Details */}
                <section className="bg-background rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">פרטי פרויקט</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {project.client && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>{project.client.name}</span>
                            </div>
                        )}
                        {project.start_date && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>התחלה: {new Date(project.start_date).toLocaleDateString('he-IL')}</span>
                            </div>
                        )}
                        {project.estimated_end_date && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>צפי סיום: {new Date(project.estimated_end_date).toLocaleDateString('he-IL')}</span>
                            </div>
                        )}
                        {project.site_address && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>📍 {project.site_address}, {project.site_city}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Timeline / Phases */}
                <section className="bg-background rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">ציר זמן</h2>
                    <div className="space-y-6">
                        {phases.map((phase, i) => {
                            const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
                            const completedPhaseTasks = phaseTasks.filter(t => t.status === 'done').length;
                            const phaseProgress = phaseTasks.length > 0
                                ? Math.round((completedPhaseTasks / phaseTasks.length) * 100)
                                : 0;
                            const isComplete = phaseProgress === 100;

                            return (
                                <div key={phase.id} className="relative">
                                    {/* Timeline connector */}
                                    {i < phases.length - 1 && (
                                        <div className="absolute right-[15px] top-[40px] bottom-[-24px] w-0.5 bg-border" />
                                    )}

                                    <div className="flex gap-4">
                                        {/* Phase indicator */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete
                                                ? 'bg-green-100 text-green-600'
                                                : phaseProgress > 0
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {isComplete ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : phaseProgress > 0 ? (
                                                <Clock className="w-4 h-4" />
                                            ) : (
                                                <Circle className="w-4 h-4" />
                                            )}
                                        </div>

                                        {/* Phase content */}
                                        <div className="flex-1 pb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-foreground">{phase.name}</h3>
                                                <span className="text-sm text-muted-foreground tabular-nums">
                                                    {completedPhaseTasks}/{phaseTasks.length} משימות
                                                </span>
                                            </div>
                                            {phase.description && (
                                                <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                                            )}
                                            {/* Progress bar */}
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-primary'
                                                        }`}
                                                    style={{ width: `${phaseProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {phases.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>טרם הוגדרו שלבים לפרויקט</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center text-sm text-muted-foreground py-8">
                    <p>פורטל זה נוצר באמצעות הרמוניקה - פלטפורמת ניהול לאדריכלים ומעצבי פנים</p>
                </footer>
            </main>
        </div>
    );
}
