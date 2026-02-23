'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, EmptyState, LeadStatusBadge } from '@/components/ui';
import type { Lead, LeadStatus } from '@/types/database';
import { createLead, updateLead, getLeads } from '@/lib/api/leads';
import { LeadForm } from '@/components/leads/LeadForm';
import {
    List, Columns3, Plus, Pencil, CheckCircle2, Building2, Phone,
    Target, Flame, Star, Moon
} from 'lucide-react';

type ViewMode = 'table' | 'kanban';

interface LeadsClientProps {
    initialLeads?: Lead[];
    organizationId: string;
}

export function LeadsClient({ initialLeads = [], organizationId }: LeadsClientProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        async function loadLeads() {
            try {
                const data = await getLeads(organizationId);
                setLeads(data);
            } catch (error) {
                console.error('Error loading leads:', error);
            }
        }
        loadLeads();
    }, [organizationId]);

    const handleAddLead = () => {
        setEditingLead(null);
        setIsModalOpen(true);
    };

    const handleEditLead = (lead: Lead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleSaveLead = (lead: Lead) => {
        if (editingLead) {
            setLeads(leads.map(l => l.id === lead.id ? lead : l));
        } else {
            setLeads([lead, ...leads]);
        }
        setIsModalOpen(false);
        router.refresh();
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
                    <div className="flex items-center bg-muted/50 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'table'
                                ? 'bg-white text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <List className="w-3.5 h-3.5" /> טבלה
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'kanban'
                                ? 'bg-white text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Columns3 className="w-3.5 h-3.5" /> קנבן
                        </button>
                    </div>
                    <Button onClick={handleAddLead} className="gap-2">
                        <Plus className="w-4 h-4" /> ליד חדש
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
                            <Button onClick={handleAddLead} className="gap-2">
                                <Plus className="w-4 h-4" /> הוספת ליד ראשון
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
                organizationId={organizationId}
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
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            title="עריכה מהירה"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        {lead.status !== 'won' && lead.status !== 'lost' && (
                                            <button
                                                onClick={() => onStatusChange(lead.id, 'won')}
                                                className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="המרה ללקוח"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
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
                                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-all"
                                                title="עריכה מהירה"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-lg">
                                                {(lead.score || 0) >= 80 ? <Flame className="w-4 h-4 text-red-500" /> : (lead.score || 0) >= 50 ? <Star className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-400" />}
                                            </span>
                                        </div>
                                    </div>
                                    {lead.company && (
                                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5" /> {lead.company}
                                        </p>
                                    )}
                                    {lead.phone && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5" dir="ltr">
                                            <Phone className="w-3.5 h-3.5" /> {lead.phone}
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
    organizationId,
}: {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    onSave: (lead: Lead) => void;
    loading: boolean;
    organizationId: string;
}) {
    // LeadForm handles internal state, no need for it here

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lead ? 'עריכת ליד' : 'ליד חדש'}
            size="lg"
        >
            <LeadForm
                organizationId={organizationId}
                initialData={lead}
                onSuccess={onSave}
                onCancel={onClose}
            />
        </Modal>
    );
}
