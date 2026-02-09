'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getMeetingsForMonth, createMeeting, updateMeeting, deleteMeeting } from '@/lib/api/calendar';
import type { Meeting, MeetingType, MeetingStatus } from '@/types/database';
import {
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
    Clock, MapPin, Users, Building2, Trash2, Edit2, X
} from 'lucide-react';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTHS_HE = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const meetingTypeLabels: Record<MeetingType, { label: string; color: string; icon: React.ReactNode }> = {
    office: { label: 'פגישה במשרד', color: 'bg-blue-100 text-blue-700', icon: <Building2 className="w-4 h-4" /> },
    site_supervision: { label: 'פיקוח באתר', color: 'bg-orange-100 text-orange-700', icon: <MapPin className="w-4 h-4" /> },
    shopping: { label: 'שופינג', color: 'bg-pink-100 text-pink-700', icon: <Users className="w-4 h-4" /> },
    consultation: { label: 'ייעוץ', color: 'bg-green-100 text-green-700', icon: <Clock className="w-4 h-4" /> },
};

interface DayCell {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    meetings: Meeting[];
}

interface CalendarClientProps {
    organizationId: string;
}

export function CalendarClient({ organizationId }: CalendarClientProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
    const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [newMeeting, setNewMeeting] = useState({
        title: '',
        type: 'office' as MeetingType,
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        description: '',
        project_id: '',
        client_id: '',
    });

    const loadMeetings = useCallback(async () => {
        try {
            setLoading(true);
            const [meetingsData, projectsData, clientsData] = await Promise.all([
                getMeetingsForMonth(currentDate.getFullYear(), currentDate.getMonth(), organizationId),
                import('@/lib/api/projects').then(m => m.getProjects(organizationId)),
                import('@/lib/api/clients').then(m => m.getClients(organizationId)),
            ]);
            setMeetings(meetingsData);
            setProjects(projectsData);
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate, organizationId]);

    useEffect(() => {
        loadMeetings();
    }, [loadMeetings]);

    const navigateMonth = (delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const generateCalendarDays = (): DayCell[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days: DayCell[] = [];

        // Days from previous month
        const startDayOfWeek = firstDayOfMonth.getDay();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: false,
                meetings: getMeetingsForDate(date),
            });
        }

        // Days of current month
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const date = new Date(year, month, day);
            days.push({
                date,
                isCurrentMonth: true,
                isToday: date.getTime() === today.getTime(),
                meetings: getMeetingsForDate(date),
            });
        }

        // Days from next month
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: false,
                meetings: getMeetingsForDate(date),
            });
        }

        return days;
    };

    const getMeetingsForDate = (date: Date): Meeting[] => {
        return meetings.filter(m => {
            const meetingDate = new Date(m.scheduled_at);
            return meetingDate.toDateString() === date.toDateString();
        });
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const meeting = await createMeeting({
                organization_id: organizationId,
                project_id: newMeeting.project_id || null,
                client_id: newMeeting.client_id || null,
                title: newMeeting.title,
                type: newMeeting.type,
                description: newMeeting.description || null,
                scheduled_at: newMeeting.scheduled_at,
                duration_minutes: newMeeting.duration_minutes,
                location: newMeeting.location || null,
                status: 'scheduled' as MeetingStatus,
                attendees: [],
                summary: null,
                action_items: null,
                google_event_id: null,
                created_by: null,
            });
            setMeetings([...meetings, meeting]);
            setIsCreateModalOpen(false);
            setNewMeeting({
                title: '',
                type: 'office',
                scheduled_at: '',
                duration_minutes: 60,
                location: '',
                description: '',
                project_id: '',
                client_id: '',
            });
        } catch (error) {
            console.error('Error creating meeting:', error);
        }
    };

    const handleDeleteMeeting = async (id: string) => {
        if (!confirm('האם למחוק את הפגישה?')) return;
        try {
            await deleteMeeting(id);
            setMeetings(meetings.filter(m => m.id !== id));
            setSelectedMeeting(null);
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        const dateStr = date.toISOString().slice(0, 16);
        setNewMeeting(prev => ({ ...prev, scheduled_at: dateStr }));
        setIsCreateModalOpen(true);
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">לוח שנה</h1>
                    <p className="text-muted-foreground mt-1">ניהול פגישות ואירועים</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={goToToday}>היום</Button>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 ml-2" />
                        פגישה חדשה
                    </Button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between bg-background rounded-2xl border border-border p-4">
                <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-foreground">
                    {MONTHS_HE[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-background rounded-2xl border border-border overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-border">
                    {DAYS_HE.map(day => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/30">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            onClick={() => handleDayClick(day.date)}
                            className={`min-h-[100px] p-2 border-b border-l border-border cursor-pointer transition-colors hover:bg-muted/50 ${!day.isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                                } ${day.isToday ? 'bg-primary/5' : ''}`}
                        >
                            <div className={`text-sm font-medium mb-1 ${day.isToday
                                ? 'w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center'
                                : ''
                                }`}>
                                {day.date.getDate()}
                            </div>
                            <div className="space-y-1">
                                {day.meetings.slice(0, 3).map(meeting => {
                                    const typeInfo = meetingTypeLabels[meeting.type];
                                    return (
                                        <div
                                            key={meeting.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMeeting(meeting);
                                            }}
                                            className={`text-xs p-1 rounded truncate ${typeInfo.color}`}
                                        >
                                            {meeting.title}
                                        </div>
                                    );
                                })}
                                {day.meetings.length > 3 && (
                                    <div className="text-xs text-muted-foreground">
                                        +{day.meetings.length - 3} עוד
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Meeting Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="פגישה חדשה" size="md">
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                    <Input
                        label="כותרת"
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                        placeholder="נושא הפגישה"
                        required
                        autoFocus
                    />
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">סוג פגישה</label>
                        <select
                            className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                            value={newMeeting.type}
                            onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value as MeetingType })}
                        >
                            {(Object.keys(meetingTypeLabels) as MeetingType[]).map(type => (
                                <option key={type} value={type}>{meetingTypeLabels[type].label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">פרויקט</label>
                            <select
                                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                                value={newMeeting.project_id}
                                onChange={(e) => setNewMeeting({ ...newMeeting, project_id: e.target.value, client_id: '' })}
                                disabled={!!newMeeting.client_id}
                            >
                                <option value="">ללא פרויקט</option>
                                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">או לקוח</label>
                            <select
                                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                                value={newMeeting.client_id}
                                onChange={(e) => setNewMeeting({ ...newMeeting, client_id: e.target.value, project_id: '' })}
                                disabled={!!newMeeting.project_id}
                            >
                                <option value="">ללא לקוח</option>
                                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <Input
                        label="תאריך ושעה"
                        type="datetime-local"
                        value={newMeeting.scheduled_at}
                        onChange={(e) => setNewMeeting({ ...newMeeting, scheduled_at: e.target.value })}
                        required
                    />
                    <Input
                        label="משך (דקות)"
                        type="number"
                        value={newMeeting.duration_minutes}
                        onChange={(e) => setNewMeeting({ ...newMeeting, duration_minutes: parseInt(e.target.value) || 60 })}
                        min={15}
                        step={15}
                    />
                    <Input
                        label="מיקום"
                        value={newMeeting.location}
                        onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                        placeholder="כתובת או קישור"
                    />
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">הערות</label>
                        <textarea
                            className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background text-foreground resize-none"
                            value={newMeeting.description}
                            onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                            placeholder="פרטים נוספים..."
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">צור פגישה</Button>
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>

            {/* Meeting Detail Modal */}
            <Modal
                isOpen={!!selectedMeeting}
                onClose={() => setSelectedMeeting(null)}
                title={selectedMeeting?.title || ''}
                size="md"
            >
                {selectedMeeting && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge variant={selectedMeeting.status === 'completed' ? 'success' : 'default'}>
                                {selectedMeeting.status === 'scheduled' ? 'מתוכנן' :
                                    selectedMeeting.status === 'completed' ? 'הושלם' : 'בוטל'}
                            </Badge>
                            <span className={`px-2 py-1 rounded-full text-xs ${meetingTypeLabels[selectedMeeting.type].color}`}>
                                {meetingTypeLabels[selectedMeeting.type].label}
                            </span>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {new Date(selectedMeeting.scheduled_at).toLocaleString('he-IL')} • {selectedMeeting.duration_minutes} דקות
                                </span>
                            </div>
                            {selectedMeeting.location && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{selectedMeeting.location}</span>
                                </div>
                            )}
                            {selectedMeeting.description && (
                                <p className="text-foreground pt-2">{selectedMeeting.description}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button
                                variant="destructive"
                                onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                מחק
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedMeeting(null)}>סגור</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
