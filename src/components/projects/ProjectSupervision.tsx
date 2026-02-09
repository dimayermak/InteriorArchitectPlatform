'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Calendar, Users, FileText, CheckCircle2, ClipboardList } from 'lucide-react';
import { getSupervisionReports, createSupervisionReport, deleteSupervisionReport } from '@/lib/api/supervision';
import type { SupervisionReport } from '@/types/database';

interface ProjectSupervisionProps {
    projectId: string;
}

export function ProjectSupervision({ projectId }: ProjectSupervisionProps) {
    const [reports, setReports] = useState<SupervisionReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendees, setAttendees] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<SupervisionReport['status']>('draft');
    const [nextVisit, setNextVisit] = useState('');

    useEffect(() => {
        loadData();
    }, [projectId]);

    async function loadData() {
        try {
            const data = await getSupervisionReports(projectId);
            setReports(data);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreateReport = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createSupervisionReport({
                project_id: projectId,
                date: date,
                attendees: attendees.split(',').map(s => s.trim()).filter(Boolean),
                notes: notes,
                status: status,
                next_visit_date: nextVisit || null,
                images: [] // Placeholder for now
            });

            await loadData();
            setIsAddModalOpen(false);
            // Reset form
            setDate(new Date().toISOString().split('T')[0]);
            setAttendees('');
            setNotes('');
            setStatus('draft');
            setNextVisit('');
        } catch (error) {
            console.error('Error creating report:', error);
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (!confirm('האם למחוק דוח פיקוח זה?')) return;
        try {
            await deleteSupervisionReport(id);
            setReports(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    if (loading) return <div className="p-4 text-center">טוען דוחות פיקוח...</div>;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>דוחות פיקוח</CardTitle>
                    <Button onClick={() => setIsAddModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 ml-1" />
                        דוח חדש
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report.id} className="p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors relative group">
                                <button
                                    onClick={() => handleDeleteReport(report.id)}
                                    className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                {new Date(report.date).toLocaleDateString('he-IL')}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${report.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {report.status === 'sent' ? 'נשלח' : 'טיוטה'}
                                            </span>
                                        </div>

                                        {report.attendees && report.attendees.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span>נוכחים: {report.attendees.join(', ')}</span>
                                            </div>
                                        )}

                                        {report.notes && (
                                            <div className="bg-muted/30 p-3 rounded-lg text-sm mt-2 whitespace-pre-wrap">
                                                {report.notes}
                                            </div>
                                        )}
                                    </div>

                                    {report.next_visit_date && (
                                        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg shrink-0">
                                            <ClipboardList className="w-4 h-4" />
                                            <span>ביקור הבא: {new Date(report.next_visit_date).toLocaleDateString('he-IL')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {reports.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                אין דוחות פיקוח לפרויקט זה.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="דוח פיקוח חדש">
                <form onSubmit={handleCreateReport} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="תאריך ביקור"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">סטטוס</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as SupervisionReport['status'])}
                            >
                                <option value="draft">טיוטה</option>
                                <option value="sent">נשלח</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="משתתפים (מופרד בפסיקים)"
                        placeholder="למשל: יוסף הקבלן, משה האינסטלטור"
                        value={attendees}
                        onChange={(e) => setAttendees(e.target.value)}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">הערות וסיכום ביקור</label>
                        <textarea
                            className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="פירוט הליקויים, הנחיות לקבלן, וכו'..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <Input
                        type="date"
                        label="תאריך ביקור הבא (אופציונלי)"
                        value={nextVisit}
                        onChange={(e) => setNextVisit(e.target.value)}
                    />

                    <div className="flex gap-3 justify-end mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>ביטול</Button>
                        <Button type="submit">צור דוח</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
