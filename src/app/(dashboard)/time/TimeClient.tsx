'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
    getTimeEntries,
    createTimeEntry,
    deleteTimeEntry,
    getTimeStats,
    type TimeEntryRow,
    type TimeStats,
} from '@/lib/api/time-entries';
import { getProjects } from '@/lib/api/projects';
import { getClients } from '@/lib/api/clients';
import type { Project, Client } from '@/types/database';
import { Play, Square, Plus, Clock, Calendar, Trash2, Timer, Briefcase, User } from 'lucide-react';

const TIMER_KEY = 'time_tracker_active';

interface TimerState {
    startedAt: number; // epoch ms
    description: string;
    projectId: string;
    clientId: string;
}

interface TimeClientProps {
    organizationId: string;
    userId: string;
}

function formatHours(h: number): string {
    if (h === 0) return '0 שעות';
    const wholeH = Math.floor(h);
    const mins = Math.round((h - wholeH) * 60);
    if (wholeH === 0) return `${mins} דקות`;
    if (mins === 0) return `${wholeH} ${wholeH === 1 ? 'שעה' : 'שעות'}`;
    return `${wholeH}:${mins.toString().padStart(2, '0')} שע׳`;
}

function formatElapsed(ms: number): string {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function TimeClient({ organizationId, userId }: TimeClientProps) {
    const [entries, setEntries] = useState<TimeEntryRow[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [stats, setStats] = useState<TimeStats>({ todayHours: 0, weekHours: 0, monthHours: 0 });
    const [loading, setLoading] = useState(true);

    // Live timer
    const [activeTimer, setActiveTimer] = useState<TimerState | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Manual modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        project_id: '',
        client_id: '',
        description: '',
        hours: '',
        minutes: '',
        date: new Date().toISOString().split('T')[0],
        billable: true,
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Quick timer form (shown when no timer is active)
    const [timerDesc, setTimerDesc] = useState('');
    const [timerProject, setTimerProject] = useState('');
    const [timerClient, setTimerClient] = useState('');

    // ── Helpers ───────────────────────────────────────────────
    const refreshStats = useCallback(async () => {
        const s = await getTimeStats(organizationId, userId);
        setStats(s);
    }, [organizationId, userId]);

    // ── Load data ─────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const [entriesData, projectsData, clientsData, statsData] = await Promise.all([
                    getTimeEntries(organizationId, { userId }),
                    getProjects(organizationId),
                    getClients(organizationId),
                    getTimeStats(organizationId, userId),
                ]);
                setEntries(entriesData);
                setProjects(projectsData);
                setClients(clientsData);
                setStats(statsData);
            } catch (err) {
                console.error('Failed to load time data:', err);
            } finally {
                setLoading(false);
            }
        }
        load();

        // Restore timer from localStorage
        try {
            const saved = localStorage.getItem(TIMER_KEY);
            if (saved) {
                const t = JSON.parse(saved) as TimerState;
                setActiveTimer(t);
            }
        } catch { /* ignore */ }
    }, [organizationId, userId]);

    // ── Tick ──────────────────────────────────────────────────
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (activeTimer) {
            const tick = () => setElapsed(Date.now() - activeTimer.startedAt);
            tick();
            intervalRef.current = setInterval(tick, 1000);
        } else {
            setElapsed(0);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [activeTimer]);

    // ── Timer actions ─────────────────────────────────────────
    function handleStartTimer() {
        const desc = timerDesc.trim();
        if (!desc) { return; }
        const state: TimerState = {
            startedAt: Date.now(),
            description: desc,
            projectId: timerProject,
            clientId: timerClient,
        };
        localStorage.setItem(TIMER_KEY, JSON.stringify(state));
        setActiveTimer(state);
    }

    async function handleStopTimer() {
        if (!activeTimer) return;
        const elapsedMs = Date.now() - activeTimer.startedAt;
        const hours = Math.round((elapsedMs / 3600000) * 100) / 100; // 2 decimal places
        if (hours < 0.01) { // less than ~36 seconds – discard
            localStorage.removeItem(TIMER_KEY);
            setActiveTimer(null);
            return;
        }
        try {
            const entry = await createTimeEntry({
                organization_id: organizationId,
                user_id: userId,
                project_id: activeTimer.projectId || null,
                client_id: activeTimer.clientId || null,
                description: activeTimer.description || null,
                hours,
                date: new Date().toISOString().split('T')[0],
                billable: true,
            });
            setEntries(prev => [entry, ...prev]);
            await refreshStats();
        } catch (err) {
            console.error('Failed to save entry:', err);
        } finally {
            localStorage.removeItem(TIMER_KEY);
            setActiveTimer(null);
            setTimerDesc('');
            setTimerProject('');
            setTimerClient('');
        }
    }

    // ── Manual save ───────────────────────────────────────────
    async function handleManualSave(e: React.FormEvent) {
        e.preventDefault();
        setSaveError('');
        const h = parseFloat(form.hours || '0');
        const m = parseInt(form.minutes || '0');
        const totalHours = h + m / 60;
        if (totalHours <= 0) { setSaveError('יש להזין שעות או דקות'); return; }
        if (!form.project_id && !form.client_id) { setSaveError('יש לבחור פרויקט או לקוח'); return; }

        setSaving(true);
        try {
            const entry = await createTimeEntry({
                organization_id: organizationId,
                user_id: userId,
                project_id: form.project_id || null,
                client_id: form.client_id || null,
                description: form.description || null,
                hours: Math.round(totalHours * 100) / 100,
                date: form.date,
                billable: form.billable,
            });
            setEntries(prev => [entry, ...prev]);
            setIsModalOpen(false);
            setForm({ project_id: '', client_id: '', description: '', hours: '', minutes: '', date: new Date().toISOString().split('T')[0], billable: true });
            await refreshStats();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'שגיאה בשמירה');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteTimeEntry(id);
            setEntries(prev => prev.filter(e => e.id !== id));
            await refreshStats();
        } catch (err) { console.error(err); }
    }

    // ── Render ────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">מעקב זמן</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">תיעוד שעות עבודה לפי פרויקט ולקוח</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />הוספה ידנית
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'היום', value: formatHours(stats.todayHours), icon: <Clock className="w-4 h-4" /> },
                    { label: 'השבוע', value: formatHours(stats.weekHours), icon: <Calendar className="w-4 h-4" /> },
                    { label: 'החודש', value: formatHours(stats.monthHours), icon: <Timer className="w-4 h-4" /> },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                {s.icon}
                                <span className="text-sm">{s.label}</span>
                            </div>
                            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Timer Card */}
            <Card className={activeTimer ? 'border-green-500/40 bg-green-500/5' : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'}>
                <CardContent className="p-6">
                    {activeTimer ? (
                        /* Running timer */
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">טיימר פועל</span>
                                </div>
                                <div className="text-4xl font-bold tabular-nums tracking-tight mb-2 dir-ltr" dir="ltr">
                                    {formatElapsed(elapsed)}
                                </div>
                                <p className="text-muted-foreground text-sm truncate">{activeTimer.description}</p>
                                {activeTimer.projectId && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {projects.find(p => p.id === activeTimer.projectId)?.name}
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={handleStopTimer}
                                size="lg"
                                className="gap-2 bg-red-500 hover:bg-red-600 text-white flex-shrink-0"
                            >
                                <Square className="w-5 h-5" />עצור ושמור
                            </Button>
                        </div>
                    ) : (
                        /* Start timer form */
                        <div className="space-y-3">
                            <input
                                className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="מה אתה עובד עליו? (חובה)"
                                value={timerDesc}
                                onChange={e => setTimerDesc(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && timerDesc.trim() && handleStartTimer()}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={timerProject}
                                    onChange={e => { setTimerProject(e.target.value); setTimerClient(''); }}
                                    disabled={!!timerClient}
                                >
                                    <option value="">📁 בחר פרויקט...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <select
                                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={timerClient}
                                    onChange={e => { setTimerClient(e.target.value); setTimerProject(''); }}
                                    disabled={!!timerProject}
                                >
                                    <option value="">👤 בחר לקוח...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <Button
                                onClick={handleStartTimer}
                                size="lg"
                                disabled={!timerDesc.trim()}
                                className="gap-2 w-full"
                            >
                                <Play className="w-5 h-5" />התחל טיימר
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Entries List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />רשומות אחרונות
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {entries.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                            <p className="text-muted-foreground">אין רשומות עדיין</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">התחל טיימר או הוסף רשומה ידנית</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.slice(0, 20).map(entry => {
                                const project = projects.find(p => p.id === entry.project_id);
                                const client = clients.find(c => c.id === entry.client_id);
                                const contextLabel = project?.name || client?.name;
                                const ContextIcon = project ? Briefcase : User;

                                return (
                                    <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 group transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{entry.description || 'ללא תיאור'}</div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <span>{new Date(entry.date).toLocaleDateString('he-IL')}</span>
                                                {contextLabel && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <ContextIcon className="w-3 h-3" />
                                                            {contextLabel}
                                                        </span>
                                                    </>
                                                )}
                                                {!contextLabel && <span>• ללא שיוך</span>}
                                            </div>
                                        </div>
                                        <div className="text-lg font-semibold tabular-nums flex-shrink-0">
                                            {formatHours(entry.hours)}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                                            title="מחק"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Manual Entry Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSaveError(''); }} title="הוספת רשומת זמן" size="md">
                <form onSubmit={handleManualSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" />פרויקט
                            </label>
                            <select
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.project_id}
                                onChange={e => setForm({ ...form, project_id: e.target.value, client_id: '' })}
                                disabled={!!form.client_id}
                            >
                                <option value="">בחר פרויקט...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />או לקוח
                            </label>
                            <select
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.client_id}
                                onChange={e => setForm({ ...form, client_id: e.target.value, project_id: '' })}
                                disabled={!!form.project_id}
                            >
                                <option value="">בחר לקוח...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">תיאור</label>
                        <input
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="מה עשית?"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">שעות</label>
                            <input
                                type="number" min="0" max="24" dir="ltr"
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.hours}
                                onChange={e => setForm({ ...form, hours: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">דקות</label>
                            <input
                                type="number" min="0" max="59" dir="ltr"
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.minutes}
                                onChange={e => setForm({ ...form, minutes: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">תאריך</label>
                            <input
                                type="date" dir="ltr"
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={form.billable}
                            onChange={e => setForm({ ...form, billable: e.target.checked })}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">שעות חיוביות ללקוח</span>
                    </label>
                    {saveError && <p className="text-sm text-red-500">{saveError}</p>}
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" className="flex-1" disabled={saving}>
                            {saving ? 'שומר...' : 'הוסף רשומה'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setSaveError(''); }}>
                            ביטול
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
