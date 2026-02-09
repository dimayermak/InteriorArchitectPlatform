'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Task } from '@/types/database';
import { Circle, Clock, CheckCircle2, Plus, Trash2, Calendar } from 'lucide-react';
import { createTask, updateTask, deleteTask, completeTask } from '@/lib/api/tasks';
import { getCurrentOrganizationId } from '@/lib/auth/user';

interface ProjectPlanProps {
    projectId: string;
    initialTasks: Task[];
}

const taskStatusIcons: Record<string, React.ReactNode> = {
    todo: <Circle className="w-4 h-4 text-muted-foreground" />,
    in_progress: <Clock className="w-4 h-4 text-blue-500" />,
    review: <Clock className="w-4 h-4 text-yellow-500" />,
    done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
};

// We use a constant for the org id for now to match the page logic, 
// strictly we should fetch it or pass it. 
const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

export function ProjectPlan({ projectId, initialTasks }: ProjectPlanProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [activeView, setActiveView] = useState<'list' | 'timeline'>('list');

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const task = await createTask({
                organization_id: DEV_ORG_ID, // Use context or prop in real app
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

    return (
        <div className="space-y-4">
            <div className="flex gap-2 border-b border-border mb-4">
                <button
                    onClick={() => setActiveView('list')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeView === 'list'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    רשימת משימות
                </button>
                <button
                    onClick={() => setActiveView('timeline')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeView === 'timeline'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    ציר זמן
                </button>
            </div>

            {activeView === 'list' && (
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

            {activeView === 'timeline' && (
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
