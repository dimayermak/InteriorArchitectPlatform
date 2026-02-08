'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getProjectWithDetails, updateProject, getProjectStats } from '@/lib/api/projects';
import { getTasks, createTask, updateTask, deleteTask, completeTask } from '@/lib/api/tasks';
import type { Project, ProjectPhase, Task } from '@/types/database';
import { ArrowRight, Calendar, User, Clock, CheckCircle2, Circle, Plus, MoreVertical, Trash2, Edit2, DollarSign, Target } from 'lucide-react';

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';

const statusLabels: Record<string, { label: string; color: string }> = {
    planning: { label: 'תכנון', color: 'bg-blue-100 text-blue-700' },
    active: { label: 'פעיל', color: 'bg-green-100 text-green-700' },
    on_hold: { label: 'מושהה', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'הושלם', color: 'bg-purple-100 text-purple-700' },
    cancelled: { label: 'בוטל', color: 'bg-gray-100 text-gray-700' },
};

const taskStatusIcons: Record<string, React.ReactNode> = {
    todo: <Circle className="w-4 h-4 text-muted-foreground" />,
    in_progress: <Clock className="w-4 h-4 text-blue-500" />,
    review: <Clock className="w-4 h-4 text-yellow-500" />,
    done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<(Project & { client: { name: string } | null; phases: ProjectPhase[] }) | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<{ tasksTotal: number; tasksCompleted: number; hoursLogged: number; budget: number; spent: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'timeline'>('overview');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [projectData, tasksData, statsData] = await Promise.all([
                    getProjectWithDetails(projectId),
                    getTasks(DEV_ORG_ID, projectId),
                    getProjectStats(projectId),
                ]);
                setProject(projectData);
                setTasks(tasksData);
                setStats(statsData);
            } catch (error) {
                console.error('Error loading project:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [projectId]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const task = await createTask({
                organization_id: DEV_ORG_ID,
                project_id: projectId,
                title: newTaskTitle,
            });
            setTasks([...tasks, task]);
            setNewTaskTitle('');
            setIsTaskModalOpen(false);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleToggleTask = async (task: Task) => {
        try {
            if (task.status === 'done') {
                const updated = await updateTask(task.id, { status: 'todo', completed_at: null });
                setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
            } else {
                const updated = await completeTask(task.id);
                setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter((t) => t.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleStatusChange = async (newStatus: Project['status']) => {
        if (!project) return;
        try {
            const updated = await updateProject(project.id, { status: newStatus });
            setProject({ ...project, ...updated });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-xl font-bold text-foreground">פרויקט לא נמצא</h1>
                <Link href="/projects">
                    <Button className="mt-4">חזרה לרשימה</Button>
                </Link>
            </div>
        );
    }

    const status = statusLabels[project.status] || { label: project.status, color: 'bg-gray-100' };
    const completionPercentage = stats ? Math.round((stats.tasksCompleted / (stats.tasksTotal || 1)) * 100) : 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/projects">
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                        {project.client && (
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                <User className="w-4 h-4" />
                                {project.client.name}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="h-10 px-4 rounded-lg border border-border bg-background text-foreground text-sm"
                        value={project.status}
                        onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
                    >
                        {Object.entries(statusLabels).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums">{completionPercentage}%</div>
                                <div className="text-xs text-muted-foreground">השלמה</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums">{stats?.tasksCompleted || 0}/{stats?.tasksTotal || 0}</div>
                                <div className="text-xs text-muted-foreground">משימות</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums">{(stats?.hoursLogged || 0).toFixed(1)}</div>
                                <div className="text-xs text-muted-foreground">שעות</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tabular-nums">₪{(stats?.spent || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">מתוך ₪{(stats?.budget || 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {(['overview', 'tasks', 'timeline'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab === 'overview' ? 'סקירה' : tab === 'tasks' ? 'משימות' : 'ציר זמן'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>פרטי פרויקט</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">סטטוס</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                            </div>
                            {project.start_date && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">תאריך התחלה</span>
                                    <span>{new Date(project.start_date).toLocaleDateString('he-IL')}</span>
                                </div>
                            )}
                            {project.estimated_end_date && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">צפי סיום</span>
                                    <span>{new Date(project.estimated_end_date).toLocaleDateString('he-IL')}</span>
                                </div>
                            )}
                            {project.site_address && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">כתובת</span>
                                    <span>{project.site_address}, {project.site_city}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>משימות אחרונות</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('tasks')}>הכל</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {tasks.slice(0, 5).map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => handleToggleTask(task)}
                                    >
                                        {taskStatusIcons[task.status]}
                                        <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">אין משימות</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'tasks' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>משימות</CardTitle>
                        <Button onClick={() => setIsTaskModalOpen(true)} size="sm">
                            <Plus className="w-4 h-4 ml-1" />
                            הוסף משימה
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors group"
                                >
                                    <button onClick={() => handleToggleTask(task)}>
                                        {taskStatusIcons[task.status]}
                                    </button>
                                    <span className={`flex-1 ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                        {task.title}
                                    </span>
                                    {task.due_date && (
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {new Date(task.due_date).toLocaleDateString('he-IL')}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">אין משימות לפרויקט זה</p>
                                    <Button onClick={() => setIsTaskModalOpen(true)}>
                                        <Plus className="w-4 h-4 ml-1" />
                                        הוסף משימה ראשונה
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'timeline' && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>ציר הזמן יוצג כאן</p>
                        <p className="text-sm">שלבי הפרויקט, אבני דרך ולוחות זמנים</p>
                    </CardContent>
                </Card>
            )}

            {/* Add Task Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="הוסף משימה" size="sm">
                <form onSubmit={handleAddTask} className="space-y-4">
                    <Input
                        label="כותרת המשימה"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="למשל: להכין הצעת מחיר"
                        required
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <Button type="submit" className="flex-1">הוסף</Button>
                        <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
