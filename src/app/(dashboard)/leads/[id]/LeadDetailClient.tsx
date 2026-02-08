'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Badge } from '@/components/ui';
import type { Lead } from '@/types/database';
import { updateLead, deleteLead, convertLeadToClient } from '@/lib/api/leads';

interface LeadDetailClientProps {
    lead: Lead;
}

export function LeadDetailClient({ lead: initialLead }: LeadDetailClientProps) {
    const [lead, setLead] = useState<Lead>(initialLead);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('האם אתם בטוחים שברצונכם למחוק את הליד הזה? הפעולה אינה הפיכה.')) return;

        setLoading(true);
        try {
            await deleteLead(lead.id);
            router.push('/leads');
        } catch (error) {
            console.error('Error deleting lead:', error);
            alert('שגיאה במחיקת הליד');
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async () => {
        if (!confirm('האם להפוך את הליד ללקוח פעיל? הסטטוס ישתנה ל-"Won" ויווצר כרטיס לקוח חדש.')) return;

        setLoading(true);
        try {
            const clientId = await convertLeadToClient(lead.id);
            alert('הליד הפך ללקוח בהצלחה! מעבר לכרטיס הלקוח...');
            router.push(`/clients/${clientId}`);
        } catch (error) {
            console.error('Error converting lead:', error);
            alert('שגיאה בהמרת הליד');
            setLoading(false);
        }
    };

    const handleUpdate = async (updates: Partial<Lead>) => {
        setLoading(true);
        try {
            const updated = await updateLead(lead.id, updates);
            setLead(updated);
            setIsEditModalOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error updating lead:', error);
            alert('שגיאה בעדכון הליד');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-white">
                            {lead.name}
                        </h1>
                        <Badge variant={
                            lead.status === 'new' ? 'default' :
                                lead.status === 'won' ? 'success' :
                                    lead.status === 'lost' ? 'destructive' : 'secondary'
                        }>
                            {lead.status === 'new' ? 'חדש' :
                                lead.status === 'contacted' ? 'נוצר קשר' :
                                    lead.status === 'qualified' ? 'מתאים' :
                                        lead.status === 'proposal' ? 'הצעת מחיר' :
                                            lead.status === 'won' ? 'זכייה' :
                                                lead.status === 'lost' ? 'הפסד' : lead.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
                        {lead.company && (
                            <div className="flex items-center gap-1">
                                <span>🏢</span>
                                <span>{lead.company}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>נוצר ב-{new Date(lead.created_at).toLocaleDateString('he-IL')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(true)} disabled={loading}>
                        ✏️ עריכה
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete} disabled={loading}>
                        🗑️ מחיקה
                    </Button>
                    {lead.status !== 'won' && (
                        <Button onClick={handleConvert} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 border-none">
                            ✨ הפוך ללקוח
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Notes Card */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">הערות</h2>
                        <div className="min-h-[100px] text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                            {lead.notes || 'אין הערות עדיין.'}
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
                                <a href={`mailto:${lead.email}`} className="text-primary-600 hover:underline">{lead.email || '-'}</a>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">טלפון</label>
                                <a href={`tel:${lead.phone}`} className="text-neutral-900 dark:text-white hover:text-primary-600" dir="ltr">{lead.phone || '-'}</a>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">כתובת / מקור</label>
                                <span className="text-neutral-900 dark:text-white">{lead.source || '-'}</span>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">ציון ליד</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{lead.score}</span>
                                    <span className="text-neutral-400">/ 100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditLeadModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                lead={lead}
                onSave={handleUpdate}
                loading={loading}
            />
        </div>
    );
}

function EditLeadModal({
    isOpen,
    onClose,
    lead,
    onSave,
    loading
}: {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead;
    onSave: (data: Partial<Lead>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        status: lead.status,
        score: lead.score || 0,
        notes: lead.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="עריכת פרטי ליד">
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
                    <label className="block text-sm font-medium mb-1">סטטוס</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                        className="w-full p-2 rounded-lg border dark:bg-neutral-900 dark:border-neutral-700"
                    >
                        <option value="new">חדש</option>
                        <option value="contacted">נוצר קשר</option>
                        <option value="qualified">מתאים</option>
                        <option value="proposal">הצעת מחיר</option>
                        <option value="negotiation">משא ומתן</option>
                        <option value="won">זכייה</option>
                        <option value="lost">הפסד</option>
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
