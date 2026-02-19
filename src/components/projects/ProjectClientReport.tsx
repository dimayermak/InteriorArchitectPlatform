'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { getClientReport, upsertClientReport } from '@/lib/api/client-reports';
import type { UnexpectedEvent, DeliveryEstimate } from '@/lib/api/client-reports';

const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

interface ProjectClientReportProps {
    projectId: string;
    organizationId?: string;
}

function newEvent(): UnexpectedEvent {
    return {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        resolution: '',
        status: 'in_progress',
        date: new Date().toISOString().split('T')[0],
    };
}

function newDelivery(): DeliveryEstimate {
    return {
        id: crypto.randomUUID(),
        item: '',
        estimated_date: '',
        status: 'pending',
        notes: '',
    };
}

export function ProjectClientReport({ projectId, organizationId = DEV_ORG_ID }: ProjectClientReportProps) {
    const [events, setEvents] = useState<UnexpectedEvent[]>([]);
    const [deliveries, setDeliveries] = useState<DeliveryEstimate[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const loadReport = useCallback(async () => {
        try {
            const report = await getClientReport(projectId);
            if (report) {
                setEvents(report.unexpected_events || []);
                setDeliveries(report.delivery_estimates || []);
                setNotes(report.general_notes || '');
            }
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { loadReport(); }, [loadReport]);

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        try {
            await upsertClientReport(projectId, organizationId, {
                unexpected_events: events,
                delivery_estimates: deliveries,
                general_notes: notes || null,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }

    function updateEvent(id: string, field: keyof UnexpectedEvent, value: string) {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    }

    function updateDelivery(id: string, field: keyof DeliveryEstimate, value: string) {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    }

    if (loading) return (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin ml-2" />
            <span>טוען דוח לקוח...</span>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Save button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">דוח לקוח</h2>
                    <p className="text-sm text-muted-foreground">המידע שמוצג ללקוח בפורטל האישי שלו</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                    {saving
                        ? <><Loader2 className="w-4 h-4 animate-spin" />שומר...</>
                        : saved
                            ? <><CheckCircle2 className="w-4 h-4 text-green-300" />נשמר!</>
                            : <><Save className="w-4 h-4" />שמור דוח</>
                    }
                </button>
            </div>

            {/* Unexpected Events */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base">בלת&quot;מים ואירועים בלתי צפויים</h3>
                    <button
                        onClick={() => setEvents(prev => [...prev, newEvent()])}
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                        <Plus className="w-4 h-4" />הוסף אירוע
                    </button>
                </div>
                <div className="space-y-4">
                    {events.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">
                            אין בלת&quot;מים להצגה ללקוח
                        </p>
                    )}
                    {events.map(ev => (
                        <div key={ev.id} className="border border-border rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">כותרת</label>
                                            <input
                                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                value={ev.title}
                                                onChange={e => updateEvent(ev.id, 'title', e.target.value)}
                                                placeholder="למשל: עיכוב באספקת חומרים"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-muted-foreground">תאריך</label>
                                                <input
                                                    type="date"
                                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                    value={ev.date}
                                                    onChange={e => updateEvent(ev.id, 'date', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-muted-foreground">סטטוס</label>
                                                <select
                                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                    value={ev.status}
                                                    onChange={e => updateEvent(ev.id, 'status', e.target.value as 'handled' | 'in_progress')}
                                                >
                                                    <option value="in_progress">בטיפול</option>
                                                    <option value="handled">טופל</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">תיאור</label>
                                        <textarea
                                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                            rows={2}
                                            value={ev.description}
                                            onChange={e => updateEvent(ev.id, 'description', e.target.value)}
                                            placeholder="מה קרה?"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">טיפול ופתרון</label>
                                        <textarea
                                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                            rows={2}
                                            value={ev.resolution}
                                            onChange={e => updateEvent(ev.id, 'resolution', e.target.value)}
                                            placeholder="איך זה מטופל?"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))}
                                    className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Delivery Estimates */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base">זמני אספקה עתידיים</h3>
                    <button
                        onClick={() => setDeliveries(prev => [...prev, newDelivery()])}
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                        <Plus className="w-4 h-4" />הוסף פריט
                    </button>
                </div>
                <div className="space-y-3">
                    {deliveries.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">
                            אין פריטי אספקה עתידיים
                        </p>
                    )}
                    {deliveries.map(d => (
                        <div key={d.id} className="border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">פריט / מוצר</label>
                                <input
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={d.item}
                                    onChange={e => updateDelivery(d.id, 'item', e.target.value)}
                                    placeholder="למשל: ספה מודולרית"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">תאריך צפוי</label>
                                <input
                                    type="date"
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={d.estimated_date}
                                    onChange={e => updateDelivery(d.id, 'estimated_date', e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">סטטוס</label>
                                    <select
                                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={d.status}
                                        onChange={e => updateDelivery(d.id, 'status', e.target.value as DeliveryEstimate['status'])}
                                    >
                                        <option value="pending">ממתין</option>
                                        <option value="ordered">הוזמן</option>
                                        <option value="delivered">נמסר</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setDeliveries(prev => prev.filter(x => x.id !== d.id))}
                                    className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors rounded-md border border-border flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="md:col-span-4 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">הערה (אופציונלי)</label>
                                <input
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={d.notes}
                                    onChange={e => updateDelivery(d.id, 'notes', e.target.value)}
                                    placeholder="פרטים נוספים..."
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* General Notes */}
            <section>
                <h3 className="font-semibold text-base mb-3">הערות כלליות</h3>
                <textarea
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={6}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="הוסף הערות חופשיות ללקוח – עדכונים כלליים, תזכורות, מסרים..."
                />
            </section>

            {/* Bottom save */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                    {saving
                        ? <><Loader2 className="w-4 h-4 animate-spin" />שומר...</>
                        : saved
                            ? <><CheckCircle2 className="w-4 h-4" />נשמר!</>
                            : <><Save className="w-4 h-4" />שמור דוח</>
                    }
                </button>
            </div>
        </div>
    );
}
