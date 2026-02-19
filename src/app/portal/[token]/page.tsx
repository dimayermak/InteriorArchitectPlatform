import { getProjectByToken } from '@/lib/api/portal';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle, Clock, Calendar, Target, DollarSign, BarChart2, AlertTriangle, Truck, MessageSquare } from 'lucide-react';
import { ClientReportGantt } from '@/components/portal/ClientReportGantt';
import { ClientReportBudget } from '@/components/portal/ClientReportBudget';
import { ClientReportUnexpected } from '@/components/portal/ClientReportUnexpected';
import { ClientReportDelivery } from '@/components/portal/ClientReportDelivery';

interface PortalPageProps {
    params: Promise<{ token: string }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    planning: { label: 'תכנון', color: 'bg-blue-100 text-blue-700' },
    active: { label: 'בביצוע', color: 'bg-green-100 text-green-700' },
    on_hold: { label: 'מושהה', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'הושלם', color: 'bg-purple-100 text-purple-700' },
    cancelled: { label: 'בוטל', color: 'bg-gray-100 text-gray-700' },
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <section className="bg-background rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
            </div>
            {children}
        </section>
    );
}

export default async function PortalPage({ params }: PortalPageProps) {
    const { token } = await params;
    const portalData = await getProjectByToken(token);

    if (!portalData) {
        notFound();
    }

    const { project, phases, tasks, stats, financials, report } = portalData;
    const status = statusLabels[project.status] || { label: project.status, color: 'bg-gray-100' };

    const unexpectedEvents = (report?.unexpected_events ?? []) as Parameters<typeof ClientReportUnexpected>[0]['events'];
    const deliveryEstimates = (report?.delivery_estimates ?? []) as Parameters<typeof ClientReportDelivery>[0]['estimates'];
    const hasUnexpected = unexpectedEvents.length > 0;
    const hasDeliveries = deliveryEstimates.length > 0;
    const hasNotes = !!report?.general_notes?.trim();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir="rtl">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">פורטל לקוחות</p>
                            <h1 className="text-lg font-bold text-foreground">{project.name}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {project.client && (
                                <span className="text-sm text-muted-foreground hidden sm:block">{(project.client as { name: string }).name}</span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                {status.label}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Summary stats row */}
                <section className="grid grid-cols-3 gap-4">
                    <div className="bg-background rounded-2xl border border-border p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold tabular-nums">{stats.progressPercent}%</div>
                        <div className="text-xs text-muted-foreground mt-1">התקדמות כללית</div>
                        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${stats.progressPercent}%` }} />
                        </div>
                    </div>

                    <div className="bg-background rounded-2xl border border-border p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold tabular-nums">{stats.completedTasks}</div>
                        <div className="text-xs text-muted-foreground mt-1">מתוך {stats.totalTasks} משימות</div>
                    </div>

                    <div className="bg-background rounded-2xl border border-border p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        {financials.remainingToPay > 0 ? (
                            <>
                                <div className="text-2xl font-bold tabular-nums text-amber-600">
                                    ₪{financials.remainingToPay.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">נשאר לתשלום</div>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold tabular-nums text-emerald-600">
                                    ₪{financials.savedAmount.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">נחסך / נשאר בתקציב</div>
                            </>
                        )}
                    </div>
                </section>

                {/* Project dates */}
                {(project.start_date || project.estimated_end_date || project.site_address) && (
                    <section className="bg-background rounded-2xl border border-border p-5">
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                            {project.client && (
                                <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-foreground">{(project.client as { name: string }).name}</span>
                                </div>
                            )}
                            {project.start_date && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>התחלה: {new Date(project.start_date).toLocaleDateString('he-IL')}</span>
                                </div>
                            )}
                            {project.estimated_end_date && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>צפי סיום: {new Date(project.estimated_end_date).toLocaleDateString('he-IL')}</span>
                                </div>
                            )}
                            {project.site_address && (
                                <div className="flex items-center gap-1.5">
                                    <span>📍 {project.site_address}{project.site_city ? `, ${project.site_city}` : ''}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Budget */}
                <SectionCard title="תקציב ותשלומים" icon={DollarSign}>
                    <ClientReportBudget financials={financials} />
                </SectionCard>

                {/* Gantt timeline */}
                {phases.length > 0 && (
                    <SectionCard title="גאנט – ציר זמן הפרויקט" icon={BarChart2}>
                        <ClientReportGantt
                            phases={phases}
                            projectStartDate={project.start_date}
                            projectEndDate={project.estimated_end_date}
                        />
                        {/* Phase task count details */}
                        <div className="mt-5 pt-5 border-t border-border/50 space-y-2">
                            {phases.map(phase => {
                                const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
                                const done = phaseTasks.filter(t => t.status === 'done').length;
                                const isComplete = phaseTasks.length > 0 && done === phaseTasks.length;
                                return (
                                    <div key={phase.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            {isComplete
                                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                : phaseTasks.length > 0 && done > 0
                                                    ? <Clock className="w-4 h-4 text-blue-500" />
                                                    : <Circle className="w-4 h-4 text-muted-foreground" />
                                            }
                                            <span className={isComplete ? 'line-through text-muted-foreground' : ''}>{phase.name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{done}/{phaseTasks.length} משימות</span>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                )}

                {/* Unexpected events */}
                {hasUnexpected && (
                    <SectionCard title={`בלת"מים ואירועים בלתי צפויים`} icon={AlertTriangle}>
                        <ClientReportUnexpected events={unexpectedEvents} />
                    </SectionCard>
                )}

                {/* Delivery estimates */}
                {hasDeliveries && (
                    <SectionCard title="זמני אספקה עתידיים" icon={Truck}>
                        <ClientReportDelivery estimates={deliveryEstimates} />
                    </SectionCard>
                )}

                {/* General notes */}
                {hasNotes && (
                    <SectionCard title="הערות כלליות" icon={MessageSquare}>
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{report!.general_notes}</p>
                    </SectionCard>
                )}

                {/* Footer */}
                <footer className="text-center text-xs text-muted-foreground py-6">
                    <p>עדכון אחרון: {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="mt-1">פורטל זה נוצר באמצעות הרמוניקה – פלטפורמת ניהול לאדריכלים ומעצבי פנים</p>
                </footer>
            </main>
        </div>
    );
}
