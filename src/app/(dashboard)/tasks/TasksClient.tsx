'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getTasks, updateTask, deleteTask } from '@/lib/api/tasks';
import type { Task, TaskStatus as TStatus, Priority } from '@/types/database';
import {
    Plus, Search, CheckSquare, Circle, Clock, Eye, ArrowUpCircle,
    AlertCircle, MoreVertical, Trash2, Calendar, Filter
} from 'lucide-react';

interface TasksClientProps {
    organizationId: string;
}

const statusConfig: Record<TStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    todo: { label: 'לביצוע', icon: <Circle className="w-3.5 h-3.5" />, color: 'text-slate-500', bg: 'bg-slate-100' },
    in_progress: { label: 'בתהליך', icon: <Clock className="w-3.5 h-3.5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    review: { label: 'בבדיקה', icon: <Eye className="w-3.5 h-3.5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    done: { label: 'הושלם', icon: <CheckSquare className="w-3.5 h-3.5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
    low: { label: 'נמוך', color: 'text-slate-500', dot: 'bg-slate-400' },
    medium: { label: 'בינוני', color: 'text-blue-600', dot: 'bg-blue-500' },
    high: { label: 'גבוה', color: 'text-orange-600', dot: 'bg-orange-500' },
    urgent: { label: 'דחוף', color: 'text-red-600', dot: 'bg-red-500' },
};

type ViewMode = 'list' | 'kanban';

export function TasksClient({ organizationId }: TasksClientProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const data = await getTasks(organizationId);
                setTasks(data);
            } catch (error) {
                console.error('Error loading tasks:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [organizationId]);

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const handleStatusChange = async (taskId: string, newStatus: TStatus) => {
        try {
            const updated = await updateTask(taskId, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? updated : t));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm('האם למחוק את המשימה?')) return;
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4 animate-fade-in">
                <div className="h-14 bg-muted/50 rounded-2xl animate-pulse" />
                <div className="h-12 bg-muted/50 rounded-xl animate-pulse max-w-sm" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    const statusCounts = {
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">משימות</h1>
                    <p className="text-muted-foreground text-sm mt-1">{tasks.length} משימות במערכת</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-muted/50 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'list'
                                ? 'bg-white text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            רשימה
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'kanban'
                                ? 'bg-white text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            קנבן
                        </button>
                    </div>
                    <Button onClick={() => router.push('/tasks/new')} className="gap-2">
                        <Plus className="w-4 h-4" />
                        משימה חדשה
                    </Button>
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.entries(statusConfig) as [TStatus, typeof statusConfig[TStatus]][]).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${statusFilter === key
                            ? `${config.bg} border-current ${config.color}`
                            : 'bg-white border-border/30 hover:border-border'
                            }`}
                    >
                        <span className={config.color}>{config.icon}</span>
                        <span className="text-sm font-medium">{config.label}</span>
                        <span className="mr-auto text-sm font-bold tabular-nums">{statusCounts[key]}</span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="חיפוש משימות..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'urgent', 'high', 'medium', 'low'].map(p => (
                        <Button
                            key={p}
                            variant={priorityFilter === p ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setPriorityFilter(p)}
                        >
                            {p === 'all' ? 'כל העדיפויות' : priorityConfig[p as Priority]?.label || p}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <TasksList tasks={filteredTasks} onStatusChange={handleStatusChange} onDelete={handleDelete} />
            ) : (
                <TasksKanban tasks={filteredTasks} onStatusChange={handleStatusChange} onDelete={handleDelete} />
            )}
        </div>
    );
}

// List View
function TasksList({
    tasks,
    onStatusChange,
    onDelete
}: {
    tasks: Task[];
    onStatusChange: (id: string, status: TStatus) => void;
    onDelete: (id: string) => void;
}) {
    if (tasks.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-border/30 p-16 text-center">
                <CheckSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">אין משימות</h3>
                <p className="text-muted-foreground text-sm">התחילו ביצירת המשימה הראשונה</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-border/30 overflow-hidden">
            <div className="divide-y divide-border/30">
                {tasks.map(task => {
                    const status = statusConfig[task.status];
                    const priority = priorityConfig[task.priority];
                    return (
                        <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                            {/* Status Toggle */}
                            <button
                                onClick={() => onStatusChange(
                                    task.id,
                                    task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'review' : 'done'
                                )}
                                className={`shrink-0 ${status.color} hover:opacity-70 transition-opacity`}
                                title={`סטטוס: ${status.label}`}
                            >
                                {status.icon}
                            </button>

                            {/* Task Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {task.title}
                                </p>
                                {task.description && (
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                                )}
                            </div>

                            {/* Priority */}
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                <span className={`text-xs ${priority.color}`}>{priority.label}</span>
                            </div>

                            {/* Due Date */}
                            {task.due_date && (
                                <div className={`flex items-center gap-1 text-xs ${new Date(task.due_date) < new Date() && task.status !== 'done'
                                    ? 'text-red-600' : 'text-muted-foreground'
                                    }`}>
                                    <Calendar className="w-3 h-3" />
                                    {new Date(task.due_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                                </div>
                            )}

                            {/* Delete */}
                            <button
                                onClick={() => onDelete(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Kanban View
function TasksKanban({
    tasks,
    onStatusChange,
    onDelete
}: {
    tasks: Task[];
    onStatusChange: (id: string, status: TStatus) => void;
    onDelete: (id: string) => void;
}) {
    const columns: TStatus[] = ['todo', 'in_progress', 'review', 'done'];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(colStatus => {
                const config = statusConfig[colStatus];
                const columnTasks = tasks.filter(t => t.status === colStatus);

                return (
                    <div key={colStatus} className="flex-shrink-0 w-72">
                        {/* Column Header */}
                        <div className={`flex items-center gap-2 mb-3 px-1`}>
                            <span className={config.color}>{config.icon}</span>
                            <h3 className="font-medium text-sm text-foreground">{config.label}</h3>
                            <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                                {columnTasks.length}
                            </span>
                        </div>

                        {/* Column Content */}
                        <div className="space-y-2">
                            {columnTasks.map(task => {
                                const priority = priorityConfig[task.priority];
                                const nextStatus = colStatus === 'todo' ? 'in_progress' : colStatus === 'in_progress' ? 'review' : colStatus === 'review' ? 'done' : null;

                                return (
                                    <div key={task.id} className="bg-white rounded-xl p-3.5 border border-border/30 hover:border-border/60 hover:shadow-sm transition-all group">
                                        <div className="flex items-start justify-between mb-1.5">
                                            <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                                {task.title}
                                            </p>
                                            <button
                                                onClick={() => onDelete(task.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                                <span className={`text-[11px] ${priority.color}`}>{priority.label}</span>
                                            </div>

                                            {task.due_date && (
                                                <span className={`text-[11px] ${new Date(task.due_date) < new Date() && task.status !== 'done'
                                                    ? 'text-red-600' : 'text-muted-foreground'
                                                    }`}>
                                                    {new Date(task.due_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick Status Change */}
                                        {nextStatus && (
                                            <div className="mt-2.5 pt-2.5 border-t border-border/20">
                                                <button
                                                    onClick={() => onStatusChange(task.id, nextStatus)}
                                                    className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                >
                                                    ← {statusConfig[nextStatus].label}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
