'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getTimeEntries, getActiveTimer, startTimer, stopTimer, createManualEntry, deleteTimeEntry, getTimeStats } from '@/lib/api/time-entries';
import { getProjects } from '@/lib/api/projects';
import type { TimeEntry, Project } from '@/types/database';
import { Play, Pause, Plus, Clock, Calendar, Trash2, Timer } from 'lucide-react';

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function TimePage() {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
    const [stats, setStats] = useState<{ todayMinutes: number; weekMinutes: number; monthMinutes: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [timerElapsed, setTimerElapsed] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ project_id: '', description: '', hours: '', minutes: '', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        async function load() {
            try {
                const [entriesData, projectsData, activeData, statsData] = await Promise.all([
                    getTimeEntries(DEV_ORG_ID, { userId: DEV_USER_ID }),
                    getProjects(DEV_ORG_ID),
                    getActiveTimer(DEV_ORG_ID, DEV_USER_ID),
                    getTimeStats(DEV_ORG_ID, DEV_USER_ID),
                ]);
                setEntries(entriesData);
                setProjects(projectsData);
                setActiveTimer(activeData);
                setStats(statsData);
            } catch (error) {
                console.error('Error loading time data:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Timer tick
    useEffect(() => {
        if (!activeTimer?.started_at) return;

        const updateElapsed = () => {
            const start = new Date(activeTimer.started_at!).getTime();
            const now = Date.now();
            setTimerElapsed(Math.floor((now - start) / 1000));
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);
        return () => clearInterval(interval);
    }, [activeTimer]);

    const handleStartTimer = async (projectId?: string) => {
        try {
            const timer = await startTimer({
                organization_id: DEV_ORG_ID,
                user_id: DEV_USER_ID,
                project_id: projectId || null,
                duration_minutes: 0,
                date: new Date().toISOString().split('T')[0],
            });
            setActiveTimer(timer);
        } catch (error) {
            console.error('Error starting timer:', error);
        }
    };

    const handleStopTimer = async () => {
        if (!activeTimer) return;
        try {
            const entry = await stopTimer(activeTimer.id);
            setActiveTimer(null);
            setTimerElapsed(0);
            setEntries([entry, ...entries.filter((e) => e.id !== entry.id)]);
            // Refresh stats
            const statsData = await getTimeStats(DEV_ORG_ID, DEV_USER_ID);
            setStats(statsData);
        } catch (error) {
            console.error('Error stopping timer:', error);
        }
    };

    const handleManualEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        const totalMinutes = (parseInt(formData.hours || '0') * 60) + parseInt(formData.minutes || '0');
        if (totalMinutes <= 0) return;

        try {
            const entry = await createManualEntry({
                organization_id: DEV_ORG_ID,
                user_id: DEV_USER_ID,
                project_id: formData.project_id || null,
                description: formData.description || null,
                duration_minutes: totalMinutes,
                date: formData.date,
            });
            setEntries([entry, ...entries]);
            setIsModalOpen(false);
            setFormData({ project_id: '', description: '', hours: '', minutes: '', date: new Date().toISOString().split('T')[0] });
            const statsData = await getTimeStats(DEV_ORG_ID, DEV_USER_ID);
            setStats(statsData);
        } catch (error) {
            console.error('Error creating entry:', error);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        try {
            await deleteTimeEntry(id);
            setEntries(entries.filter((e) => e.id !== id));
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatMinutes = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m} דקות`;
        return `${h} שעות ${m > 0 ? `${m} דקות` : ''}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">מעקב זמן</h1>
                    <p className="text-muted-foreground text-sm mt-1">ניהול שעות עבודה ופרויקטים</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    הוספה ידנית
                </Button>
            </div>

            {/* Timer Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
                                {activeTimer ? formatDuration(timerElapsed) : '00:00:00'}
                            </div>
                            {activeTimer && (
                                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                                    <Timer className="w-4 h-4 animate-pulse text-green-500" />
                                    טיימר פועל
                                    {activeTimer.project_id && (
                                        <span>• {projects.find((p) => p.id === activeTimer.project_id)?.name}</span>
                                    )}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {activeTimer ? (
                                <Button onClick={handleStopTimer} size="lg" className="gap-2 bg-red-500 hover:bg-red-600">
                                    <Pause className="w-5 h-5" />
                                    עצור
                                </Button>
                            ) : (
                                <Button onClick={() => handleStartTimer()} size="lg" className="gap-2">
                                    <Play className="w-5 h-5" />
                                    התחל
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold tabular-nums">{formatMinutes(stats?.todayMinutes || 0)}</div>
                        <div className="text-sm text-muted-foreground">היום</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold tabular-nums">{formatMinutes(stats?.weekMinutes || 0)}</div>
                        <div className="text-sm text-muted-foreground">השבוע</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold tabular-nums">{formatMinutes(stats?.monthMinutes || 0)}</div>
                        <div className="text-sm text-muted-foreground">החודש</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Entries */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        רשומות אחרונות
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {entries.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">אין רשומות עדיין</p>
                            <p className="text-sm text-muted-foreground">התחילו את הטיימר או הוסיפו רשומה ידנית</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.slice(0, 10).map((entry) => {
                                const project = projects.find((p) => p.id === entry.project_id);
                                return (
                                    <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors group">
                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{entry.description || (project?.name || 'ללא פרויקט')}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                {project && <span>{project.name}</span>}
                                                <span>{new Date(entry.date).toLocaleDateString('he-IL')}</span>
                                            </div>
                                        </div>
                                        <div className="text-lg font-semibold tabular-nums">{formatMinutes(entry.duration_minutes)}</div>
                                        <button
                                            onClick={() => handleDeleteEntry(entry.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-opacity"
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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="הוספת רשומת זמן" size="md">
                <form onSubmit={handleManualEntry} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">פרויקט</label>
                        <select
                            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground"
                            value={formData.project_id}
                            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                        >
                            <option value="">ללא פרויקט</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="תיאור"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="מה עשית?"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            label="שעות"
                            value={formData.hours}
                            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                            placeholder="0"
                            min="0"
                            dir="ltr"
                        />
                        <Input
                            type="number"
                            label="דקות"
                            value={formData.minutes}
                            onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                            placeholder="0"
                            min="0"
                            max="59"
                            dir="ltr"
                        />
                    </div>

                    <Input
                        type="date"
                        label="תאריך"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        dir="ltr"
                    />

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">הוסף רשומה</Button>
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
