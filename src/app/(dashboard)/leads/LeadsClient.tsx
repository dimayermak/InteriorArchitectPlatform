'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, EmptyState, LeadStatusBadge } from '@/components/ui';
import type { Lead, LeadStatus } from '@/types/database';
import { createLead, updateLead } from '@/lib/api/leads';

type ViewMode = 'table' | 'kanban';

interface LeadsClientProps {
    initialLeads: Lead[];
    organizationId: string;
}

export function LeadsClient({ initialLeads, organizationId }: LeadsClientProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAddLead = () => {
        setEditingLead(null);
        setIsModalOpen(true);
    };

    const handleEditLead = (lead: Lead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleSaveLead = async (leadData: Partial<Lead>) => {
        setLoading(true);
        try {
            if (editingLead) {
                // Update existing lead
                const updated = await updateLead(editingLead.id, leadData);
                setLeads(leads.map(l => l.id === editingLead.id ? updated : l));
            } else {
                // Create new lead
                const newLead = await createLead({
                    organization_id: organizationId,
                    name: leadData.name || '',
                    email: leadData.email ?? null,
                    phone: leadData.phone ?? null,
                    company: leadData.company ?? null,
                    source: leadData.source ?? null,
                    status: 'new',
                    score: 50,
                    notes: leadData.notes ?? null,
                });
                setLeads([newLead, ...leads]);
            }
            setIsModalOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error saving lead:', error);
            alert('שגיאה בשמירת הליד');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
        try {
            const updated = await updateLead(leadId, { status: newStatus });
            setLeads(leads.map(l => l.id === leadId ? updated : l));
            router.refresh();
        } catch (error) {
            console.error('Error updating lead status:', error);
            alert('שגיאה בעדכון סטטוס הליד');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white">
                        לידים
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                        נהלו את הלידים החדשים והמרו אותם ללקוחות
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'table'
                                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                        >
                            📋 טבלה
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'kanban'
                                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                        >
                            📊 קנבן
                        </button>
                    </div>
                    <Button onClick={handleAddLead}>
                        ➕ ליד חדש
                    </Button>
                </div>
            </div>

            {/* Content */}
            {leads.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-12">
                    <EmptyState
                        icon="🎯"
                        title="אין לידים עדיין"
                        description="התחילו להוסיף לידים חדשים לעקוב אחרי פניות"
                        action={
                            <Button onClick={handleAddLead}>
                                ➕ הוספת ליד ראשון
                            </Button>
                        }
                    />
                </div>
            ) : viewMode === 'table' ? (
                <LeadsTable
                    leads={leads}
                    onEdit={handleEditLead}
                    onStatusChange={handleStatusChange}
                />
            ) : (
                <LeadsKanban
                    leads={leads}
                    onEdit={handleEditLead}
                    onStatusChange={handleStatusChange}
                />
            )}

            {/* Lead Modal */}
            <LeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lead={editingLead}
                onSave={handleSaveLead}
                loading={loading}
            />
        </div>
    );
}

// Table View Component
function LeadsTable({
    leads,
    onEdit,
    onStatusChange
}: {
    leads: Lead[];
    onEdit: (lead: Lead) => void;
    onStatusChange: (leadId: string, status: LeadStatus) => void;
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
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">מקור</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">סטטוס</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">נוצר</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                onClick={() => router.push(`/leads/${lead.id}`)}
                                className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">{lead.name}</p>
                                        {lead.company && (
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{lead.company}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400" dir="ltr">
                                    {lead.email || '-'}
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400" dir="ltr">
                                    {lead.phone || '-'}
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                    {lead.source || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <LeadStatusBadge status={lead.status} />
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                    {formatDate(lead.created_at)}
                                </td>
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(lead)}
                                            className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                            title="עריכה מהירה"
                                        >
                                            ✏️
                                        </button>
                                        {lead.status !== 'won' && lead.status !== 'lost' && (
                                            <button
                                                onClick={() => onStatusChange(lead.id, 'won')}
                                                className="p-2 text-neutral-500 hover:text-success-600 hover:bg-success-50 dark:hover:bg-success-500/10 rounded-lg transition-colors"
                                                title="המרה ללקוח"
                                            >
                                                ✅
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Kanban View Component
function LeadsKanban({
    leads,
    onEdit,
    onStatusChange
}: {
    leads: Lead[];
    onEdit: (lead: Lead) => void;
    onStatusChange: (leadId: string, status: LeadStatus) => void;
}) {
    const router = useRouter();

    const columns: { status: LeadStatus; label: string; color: string }[] = [
        { status: 'new', label: 'חדש', color: 'bg-blue-500' },
        { status: 'contacted', label: 'נוצר קשר', color: 'bg-purple-500' },
        { status: 'qualified', label: 'מתאים', color: 'bg-green-500' },
        { status: 'proposal', label: 'הצעה', color: 'bg-yellow-500' },
        { status: 'won', label: 'הצליח', color: 'bg-emerald-500' },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => {
                const columnLeads = leads.filter(l => l.status === column.status);
                return (
                    <div key={column.status} className="flex-shrink-0 w-72">
                        {/* Column Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`w-3 h-3 rounded-full ${column.color}`} />
                            <h3 className="font-medium text-neutral-900 dark:text-white">
                                {column.label}
                            </h3>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                ({columnLeads.length})
                            </span>
                        </div>

                        {/* Column Content */}
                        <div className="space-y-3">
                            {columnLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    onClick={() => router.push(`/leads/${lead.id}`)}
                                    className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                            {lead.name}
                                        </h4>
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => onEdit(lead)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-primary-600 transition-all"
                                                title="עריכה מהירה"
                                            >
                                                ✏️
                                            </button>
                                            <span className="text-lg">
                                                {(lead.score || 0) >= 80 ? '🔥' : (lead.score || 0) >= 50 ? '⭐' : '💤'}
                                            </span>
                                        </div>
                                    </div>
                                    {lead.company && (
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                            🏢 {lead.company}
                                        </p>
                                    )}
                                    {lead.phone && (
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400" dir="ltr">
                                            📱 {lead.phone}
                                        </p>
                                    )}
                                    {lead.notes && (
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                                            {lead.notes}
                                        </p>
                                    )}

                                    {/* Quick Actions */}
                                    {column.status !== 'won' && (
                                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700" onClick={(e) => e.stopPropagation()}>
                                            {columns.slice(columns.findIndex(c => c.status === column.status) + 1, columns.findIndex(c => c.status === column.status) + 2).map((nextCol) => (
                                                <button
                                                    key={nextCol.status}
                                                    onClick={() => onStatusChange(lead.id, nextCol.status)}
                                                    className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                >
                                                    → {nextCol.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Lead Modal Component
function LeadModal({
    isOpen,
    onClose,
    lead,
    onSave,
    loading,
}: {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    onSave: (data: Partial<Lead>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        name: lead?.name || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        company: lead?.company || '',
        source: lead?.source || '',
        notes: lead?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lead ? 'עריכת ליד' : 'ליד חדש'}
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
                            placeholder="שם הליד"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            חברה
                        </label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="שם החברה"
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
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        מקור
                    </label>
                    <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                        <option value="">בחר מקור</option>
                        <option value="אתר אינטרנט">אתר אינטרנט</option>
                        <option value="המלצה">המלצה</option>
                        <option value="אינסטגרם">אינסטגרם</option>
                        <option value="פייסבוק">פייסבוק</option>
                        <option value="גוגל">גוגל</option>
                        <option value="אחר">אחר</option>
                    </select>
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
                        placeholder="הערות על הליד..."
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        ביטול
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'שומר...' : lead ? 'שמירה' : 'יצירת ליד'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
