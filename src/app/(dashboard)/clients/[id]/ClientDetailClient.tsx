'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Badge, EmptyState } from '@/components/ui';
import type { Client } from '@/types/database';
import { updateClient, deleteClient } from '@/lib/api/clients';

interface ClientDetailClientProps {
    client: Client & { projects?: unknown[] }; // projects might be joined
}

export function ClientDetailClient({ client: initialClient }: ClientDetailClientProps) {
    const [client, setClient] = useState(initialClient);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">
                            {client.name}
                        </h1>
                        <Badge variant={
                            client.status === 'active' ? 'success' :
                                client.status === 'inactive' ? 'default' : 'error'
                        }>
                            {client.status === 'active' ? 'פעיל' :
                                client.status === 'inactive' ? 'לא פעיל' : 'ארכיון'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
                        {client.company && (
                            <div className="flex items-center gap-1">
                                <span>🏢</span>
                                <span>{client.company}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>נוצר ב-{new Date(client.created_at).toLocaleDateString('he-IL')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(true)} disabled={loading}>
                        ✏️ עריכה
                    </Button>
                    <Button variant="outline" onClick={toggleStatus} disabled={loading}>
                        {client.status === 'active' ? '⏸️ השהה' : '▶️ הפעל'}
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete} disabled={loading}>
                        🗑️ מחיקה
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Projects Placeholder */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">פרויקטים</h2>
                            <Button size="sm" variant="outline">➕ פרויקט חדש</Button>
                        </div>

                        {(!client.projects || client.projects.length === 0) ? (
                            <EmptyState
                                title="אין פרויקטים"
                                description="הלקוח הזה עדיין לא משויך לאף פרויקט."
                                icon="🏗️"
                            />
                        ) : (
                            <p>רשימת פרויקטים תופיע כאן...</p>
                        )}
                    </div>

                    {/* Notes Card */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">הערות</h2>
                        <div className="min-h-[100px] text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                            {client.notes || 'אין הערות עדיין.'}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">פרטי קשר</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">אימייל</label>
                                <a href={`mailto:${client.email}`} className="text-primary-600 hover:underline">{client.email || '-'}</a>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">טלפון</label>
                                <a href={`tel:${client.phone}`} className="text-neutral-900 dark:text-white hover:text-primary-600" dir="ltr">{client.phone || '-'}</a>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">כתובת</label>
                                <span className="text-neutral-900 dark:text-white">{client.address || '-'}</span>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">סוג לקוח</label>
                                <span className="text-neutral-900 dark:text-white">
                                    {client.type === 'business' ? 'עסקי' : 'פרטי'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
        type: client.type,
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
                    <label className="block text-sm font-medium mb-1">סוג</label>
                    <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value as Client['type'] })}
                        className="w-full p-2 rounded-lg border dark:bg-neutral-900 dark:border-neutral-700"
                    >
                        <option value="individual">פרטי</option>
                        <option value="business">עסקי</option>
                    </select>
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
