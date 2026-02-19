import type { UnexpectedEvent } from '@/lib/api/client-reports';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ClientReportUnexpectedProps {
    events: UnexpectedEvent[];
}

export function ClientReportUnexpected({ events }: ClientReportUnexpectedProps) {
    if (events.length === 0) return null;

    return (
        <div className="space-y-3">
            {events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-border overflow-hidden">
                    <div className="flex items-start gap-3 p-4">
                        <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${event.status === 'handled' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {event.status === 'handled'
                                ? <CheckCircle2 className="w-4 h-4" />
                                : <Clock className="w-4 h-4" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-foreground">{event.title}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.status === 'handled'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {event.status === 'handled' ? 'טופל ✓' : 'בטיפול'}
                                </span>
                                {event.date && (
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(event.date).toLocaleDateString('he-IL')}
                                    </span>
                                )}
                            </div>
                            {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                        </div>
                    </div>
                    {event.resolution && (
                        <div className="border-t border-border/50 bg-muted/30 px-4 py-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground">{event.resolution}</p>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
