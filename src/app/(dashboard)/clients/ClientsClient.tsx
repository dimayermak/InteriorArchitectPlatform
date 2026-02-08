'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, EmptyState } from '@/components/ui';
import type { Client } from '@/types/database';
import { createClient, updateClient } from '@/lib/api/clients';

interface ClientsClientProps {
    initialClients: Client[];
    organizationId: string;
}

export function ClientsClient({ initialClients, organizationId }: ClientsClientProps) {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAddClient = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleSaveClient = async (clientData: Partial<Client>) => {
        setLoading(true);
        try {
            if (editingClient) {
                // Update existing client
                const updated = await updateClient(editingClient.id, clientData);
                setClients(clients.map(c => c.id === editingClient.id ? updated : c));
            } else {
                // Create new client
                const newClient = await createClient({
                    organization_id: organizationId,
                    name: clientData.name || '',
                    email: clientData.email ?? null,
                    phone: clientData.phone ?? null,
                    address: clientData.address ?? null,
                    status: 'active',
                    notes: clientData.notes ?? null,
                    type: 'individual',
                });
                setClients([newClient, ...clients]);
            }
            setIsModalOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error saving client:', error);
            alert('שגיאה בשמירת הלקוח');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white">
                        לקוחות
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                        ניהול מאגר הלקוחות והפרויקטים
                    </p>
                </div>
                <Button onClick={handleAddClient}>
                    ➕ לקוח חדש
                </Button>
            </div>

            {/* Content */}
            {clients.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-12">
                    <EmptyState
                        icon="👥"
                        title="אין לקוחות עדיין"
                        description="הוסיפו את הלקוח הראשון שלכם כדי להתחיל בניהול פרויקטים"
                        action={
                            <Button onClick={handleAddClient}>
                                ➕ הוספת לקוח ראשון
                            </Button>
                        }
                    />
                </div>
            ) : (
                <ClientsTable
                    clients={clients}
                    onEdit={handleEditClient}
                />
            )}

            {/* Client Modal */}
            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                client={editingClient}
                onSave={handleSaveClient}
                loading={loading}
            />
        </div>
    );
}

// Table Component
function ClientsTable({
    clients,
    onEdit
}: {
    clients: Client[];
    onEdit: (client: Client) => void;
}) {
    const router = useRouter(); // Use router for navigation

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('he-IL');
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">שם</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">אימייל</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">טלפון</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">כתובת</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">סטטוס</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">נוצר</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr
                                key={client.id}
                                onClick={() => router.push(`/clients/${client.id}`)}
                                className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                    {client.name}
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400" dir="ltr">
                                    {client.email || '-'}
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400" dir="ltr">
                                    {client.phone || '-'}
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                    {client.address || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400'
                                        }`}>
                                        {client.status === 'active' ? 'פעיל' : 'לא פעיל'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                    {formatDate(client.created_at)}
                                </td>
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => onEdit(client)}
                                        className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        title="עריכה מהירה"
                                    >
                                        ✏️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Modal Component
function ClientModal({
    isOpen,
    onClose,
    client,
    onSave,
    loading,
}: {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onSave: (data: Partial<Client>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        address: client?.address || '',
        notes: client?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={client ? 'עריכת לקוח' : 'לקוח חדש'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            שם מלא *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="שם הלקוח"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            טלפון
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="050-0000000"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            אימייל
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="email@example.com"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            כתובת
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="כתובת מלאה"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        הערות
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                        placeholder="הערות על הלקוח..."
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        ביטול
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'שומר...' : client ? 'שמירה' : 'יצירת לקוח'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
