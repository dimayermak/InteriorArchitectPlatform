'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Badge, EmptyState } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/Card';
import type { Client, Project } from '@/types/database';
import { updateClient, deleteClient } from '@/lib/api/clients';
import { getTimeEntries, type TimeEntryRow } from '@/lib/api/time-entries';
import { ClientOverviewCharts } from '@/components/clients/ClientOverviewCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface ClientDetailClientProps {
    client: Client & { projects?: Project[] };
}

export function ClientDetailClient({ client: initialClient }: ClientDetailClientProps) {
    const [client, setClient] = useState(initialClient);
    const [timeEntries, setTimeEntries] = useState<TimeEntryRow[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function loadTimeEntries() {
            try {
                const entries = await getTimeEntries(client.organization_id, { clientId: client.id });
                setTimeEntries(entries);
            } catch (error) {
                console.error('Error loading time entries:', error);
            }
        }
        loadTimeEntries();
    }, [client.id, client.organization_id]);

    const handleDelete = async () => {
        if (!confirm('האם אתם בטוחים שברצונכם למחוק את הלקוח הזה? הפעולה אינה הפיכה.')) return;

        setLoading(true);
        try {
            await deleteClient(client.id);
            router.push('/clients');
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('שגיאה במחיקת הלקוח');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (updates: Partial<Client>) => {
        setLoading(true);
        try {
            const updated = await updateClient(client.id, updates);
            setClient({ ...client, ...updated }); // Merge to keep projects if any
            setIsEditModalOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error updating client:', error);
            alert('שגיאה בעדכון הלקוח');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        const newStatus = client.status === 'active' ? 'inactive' : 'active';
        await handleUpdate({ status: newStatus });
    };

    const projects = client.projects || [];

    return (
        <div className="space-y-8 container mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 card-base p-6 rounded-2xl border-none shadow-sm bg-gradient-to-l from-transparent to-primary/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-display font-bold text-gray-900">
                            {client.name}
                        </h1>
                        <Badge variant={
                            client.status === 'active' ? 'success' :
                                client.status === 'inactive' ? 'default' : 'error'
                        } className="px-3 py-1 text-sm">
                            {client.status === 'active' ? 'פעיל' :
                                client.status === 'inactive' ? 'לא פעיל' : 'ארכיון'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-gray-500 mt-2">
                        {client.company && (
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🏢</span>
                                <span className="font-medium">{client.company}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📅</span>
                            <span>לקוח מאז {new Date(client.created_at).toLocaleDateString('he-IL')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(true)} disabled={loading} className="gap-2">
                        ✏️ עריכה
                    </Button>
                    <Button variant="outline" onClick={toggleStatus} disabled={loading} className="gap-2">
                        {client.status === 'active' ? '⏸️ השהה' : '▶️ הפעל'}
                    </Button>
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 gap-2" onClick={handleDelete} disabled={loading}>
                        🗑️ מחיקה
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start rounded-xl bg-gray-100/50 p-1 mb-6">
                    <TabsTrigger value="overview" className="rounded-lg px-6">סקירה כללית</TabsTrigger>
                    <TabsTrigger value="projects" className="rounded-lg px-6">פרויקטים</TabsTrigger>
                    <TabsTrigger value="details" className="rounded-lg px-6">פרטים והערות</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <ClientOverviewCharts projects={projects} timeEntries={timeEntries} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">סך שעות עבודה</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {timeEntries.reduce((acc, curr) => acc + (curr.hours || 0), 0).toFixed(1)}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    ⏱️
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">פרויקטים פעילים</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {projects.filter(p => p.status === 'active').length}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                    🏗️
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="projects">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">פרויקטים</h2>
                            <Button size="sm" className="gap-2">➕ פרויקט חדש</Button>
                        </div>

                        {projects.length === 0 ? (
                            <EmptyState
                                title="אין פרויקטים"
                                description="הלקוח הזה עדיין לא משויך לאף פרויקט."
                                icon="🏗️"
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map(project => (
                                    <div key={project.id} className="p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold">{project.name}</h3>
                                            <Badge variant={project.status === 'active' ? 'success' : 'default'} className="text-xs">
                                                {project.status === 'active' ? 'פעיל' : project.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{project.description || 'אין תיאור'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">פרטי קשר</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <span className="text-xl">📧</span>
                                    <div>
                                        <p className="text-xs text-gray-500">אימייל</p>
                                        <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email || '-'}</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <span className="text-xl">📱</span>
                                    <div>
                                        <p className="text-xs text-gray-500">טלפון</p>
                                        <a href={`tel:${client.phone}`} className="hover:text-primary dir-ltr block text-right">{client.phone || '-'}</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <span className="text-xl">📍</span>
                                    <div>
                                        <p className="text-xs text-gray-500">כתובת</p>
                                        <span>{client.address || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">הערות</h2>
                            <div className="min-h-[200px] text-gray-700 whitespace-pre-wrap p-4 bg-yellow-50/50 rounded-xl border border-yellow-100/50">
                                {client.notes || 'אין הערות עדיין.'}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <EditClientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                client={client}
                onSave={handleUpdate}
                loading={loading}
            />
        </div>
    );
}

function EditClientModal({
    isOpen,
    onClose,
    client,
    onSave,
    loading
}: {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSave: (data: Partial<Client>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        address: client.address || '',
        notes: client.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="עריכת פרטי לקוח">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">שם מלא</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 rounded-lg border dark:bg-neutral-900 dark:border-neutral-700"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">אימייל</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-2 rounded-lg border dark:bg-neutral-900 dark:border-neutral-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">טלפון</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full p-2 rounded-lg border dark:bg-neutral-900 dark:border-neutral-700"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">כתובת</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full p-2 rounded-lg border dark:bg-neutral-900 dark:border-neutral-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">הערות</label>
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-2 rounded-lg border dark:bg-neutral-900 dark:border-neutral-700"
                        rows={4}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>ביטול</Button>
                    <Button type="submit" disabled={loading}>שמירה</Button>
                </div>
            </form>
        </Modal>
    );
}
