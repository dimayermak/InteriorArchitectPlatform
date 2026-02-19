'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
    getInvoices, getExpenses, getFinanceStats,
    createExpense, deleteExpense, updateExpense,
    getNextInvoiceNumber, createInvoice, markInvoiceAsPaid,
} from '@/lib/api/finance';
import { getProjects } from '@/lib/api/projects';
import type { Invoice, Expense, Project } from '@/types/database';
import {
    Plus, FileText, Receipt, TrendingUp, TrendingDown,
    DollarSign, CheckCircle, Clock, Trash2, Pencil, Download,
} from 'lucide-react';
import { exportToExcel } from '@/lib/utils/excel-export';

const EXPENSE_CATEGORIES = ['חומרים', 'נסיעות', 'עמלות', 'תשלומים לספקים', 'הוצאות משרד', 'פרסום', 'ביטוח', 'אחר'];

const invoiceStatusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' }> = {
    draft: { label: 'טיוטה', variant: 'default' },
    sent: { label: 'נשלח', variant: 'info' },
    paid: { label: 'שולם', variant: 'success' },
    overdue: { label: 'באיחור', variant: 'warning' },
    cancelled: { label: 'בוטל', variant: 'default' },
};

interface FinanceClientProps { organizationId: string; }

const BLANK_EXPENSE = { description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], project_id: '' };
const BLANK_INVOICE = { project_id: '', client_id: '', subtotal: '', notes: '' };

export function FinanceClient({ organizationId }: FinanceClientProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<{ totalInvoiced: number; totalPaid: number; totalPending: number; totalExpenses: number; approvedExpenses: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses'>('overview');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [expenseForm, setExpenseForm] = useState(BLANK_EXPENSE);
    const [invoiceForm, setInvoiceForm] = useState(BLANK_INVOICE);

    useEffect(() => {
        async function load() {
            try {
                const [invoicesData, expensesData, projectsData, statsData] = await Promise.all([
                    getInvoices(organizationId),
                    getExpenses(organizationId),
                    getProjects(organizationId),
                    getFinanceStats(organizationId),
                ]);
                setInvoices(invoicesData);
                setExpenses(expensesData);
                setProjects(projectsData);
                setStats(statsData);
            } catch (error) {
                console.error('Error loading finance data:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [organizationId]);

    async function refreshStats() {
        const s = await getFinanceStats(organizationId);
        setStats(s);
    }

    // ── Expenses ──────────────────────────────
    function openNewExpense() {
        setEditingExpense(null);
        setExpenseForm(BLANK_EXPENSE);
        setIsExpenseModalOpen(true);
    }

    function openEditExpense(exp: Expense) {
        setEditingExpense(exp);
        setExpenseForm({
            description: exp.description,
            category: exp.category || '',
            amount: String(exp.amount),
            date: exp.date,
            project_id: exp.project_id || '',
        });
        setIsExpenseModalOpen(true);
    }

    const handleSaveExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                description: expenseForm.description,
                category: expenseForm.category,
                amount: parseFloat(expenseForm.amount),
                date: expenseForm.date,
                project_id: expenseForm.project_id || null,
            };
            if (editingExpense) {
                const updated = await updateExpense(editingExpense.id, payload);
                setExpenses(prev => prev.map(ex => ex.id === updated.id ? updated : ex));
            } else {
                const expense = await createExpense({ organization_id: organizationId, ...payload });
                setExpenses(prev => [expense, ...prev]);
            }
            setIsExpenseModalOpen(false);
            await refreshStats();
        } catch (error) {
            console.error('Error saving expense:', error);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('למחוק הוצאה זו?')) return;
        try {
            await deleteExpense(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
            await refreshStats();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    // ── Invoices ──────────────────────────────
    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const invoiceNumber = await getNextInvoiceNumber(organizationId);
            const subtotal = parseFloat(invoiceForm.subtotal);
            const taxAmount = subtotal * 0.17;
            const total = subtotal + taxAmount;
            const invoice = await createInvoice({
                organization_id: organizationId,
                invoice_number: invoiceNumber,
                type: 'client_invoice',
                project_id: invoiceForm.project_id || null,
                subtotal,
                tax_amount: taxAmount,
                total,
                issue_date: new Date().toISOString().split('T')[0],
                notes: invoiceForm.notes || null,
            });
            setInvoices(prev => [invoice, ...prev]);
            setIsInvoiceModalOpen(false);
            setInvoiceForm(BLANK_INVOICE);
            await refreshStats();
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            const updated = await markInvoiceAsPaid(id);
            setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
            await refreshStats();
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    // ── Excel Exports ─────────────────────────
    function exportInvoices() {
        exportToExcel(invoices, [
            { header: 'מספר חשבונית', key: 'invoice_number' },
            { header: 'תאריך', key: row => new Date(row.issue_date).toLocaleDateString('he-IL') },
            { header: 'סכום לפני מע"מ', key: 'subtotal' },
            { header: 'מע"מ', key: 'tax_amount' },
            { header: 'סה"כ', key: 'total' },
            { header: 'סטטוס', key: row => invoiceStatusLabels[row.status]?.label || row.status },
        ], 'חשבוניות');
    }

    function exportExpenses() {
        exportToExcel(expenses, [
            { header: 'תיאור', key: 'description' },
            { header: 'קטגוריה', key: 'category' },
            { header: 'סכום', key: 'amount' },
            { header: 'תאריך', key: row => new Date(row.date).toLocaleDateString('he-IL') },
            { header: 'סטטוס', key: 'status' },
        ], 'הוצאות');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">כספים</h1>
                    <p className="text-muted-foreground text-sm mt-1">ניהול חשבוניות והוצאות</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={openNewExpense} className="gap-2">
                        <Receipt className="w-4 h-4" />
                        הוצאה
                    </Button>
                    <Button onClick={() => setIsInvoiceModalOpen(true)} className="gap-2">
                        <FileText className="w-4 h-4" />
                        חשבונית
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <TrendingUp className="w-5 h-5 text-green-600" />, bg: 'bg-green-100', value: stats?.totalPaid || 0, label: 'שולם' },
                    { icon: <Clock className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-100', value: stats?.totalPending || 0, label: 'ממתין' },
                    { icon: <DollarSign className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100', value: stats?.totalInvoiced || 0, label: 'סה"כ חשבוניות' },
                    { icon: <TrendingDown className="w-5 h-5 text-red-600" />, bg: 'bg-red-100', value: stats?.totalExpenses || 0, label: 'הוצאות' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                                <div>
                                    <div className="text-xl font-bold tabular-nums">₪{s.value.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">{s.label}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {(['overview', 'invoices', 'expenses'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        {tab === 'overview' ? 'סקירה' : tab === 'invoices' ? 'חשבוניות' : 'הוצאות'}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />חשבוניות אחרונות</CardTitle></CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? <p className="text-center text-muted-foreground py-8">אין חשבוניות</p> : (
                                <div className="space-y-3">
                                    {invoices.slice(0, 5).map(invoice => {
                                        const status = invoiceStatusLabels[invoice.status];
                                        return (
                                            <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                                                <div>
                                                    <div className="font-medium">{invoice.invoice_number}</div>
                                                    <div className="text-sm text-muted-foreground">{new Date(invoice.issue_date).toLocaleDateString('he-IL')}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold tabular-nums">₪{invoice.total.toLocaleString()}</span>
                                                    <Badge variant={status?.variant || 'default'}>{status?.label}</Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5" />הוצאות אחרונות</CardTitle></CardHeader>
                        <CardContent>
                            {expenses.length === 0 ? <p className="text-center text-muted-foreground py-8">אין הוצאות</p> : (
                                <div className="space-y-3">
                                    {expenses.slice(0, 5).map(expense => (
                                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                                            <div>
                                                <div className="font-medium">{expense.description}</div>
                                                <div className="text-sm text-muted-foreground">{expense.category}</div>
                                            </div>
                                            <span className="font-semibold tabular-nums text-red-600">-₪{expense.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Invoices tab */}
            {activeTab === 'invoices' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>חשבוניות</CardTitle>
                        <Button variant="outline" size="sm" onClick={exportInvoices} className="gap-2">
                            <Download className="w-4 h-4" />
                            ייצוא לאקסל
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {invoices.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground mb-4">אין חשבוניות</p>
                                <Button onClick={() => setIsInvoiceModalOpen(true)}><Plus className="w-4 h-4 ml-2" />חשבונית ראשונה</Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invoices.map(invoice => {
                                    const status = invoiceStatusLabels[invoice.status];
                                    return (
                                        <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{invoice.invoice_number}</div>
                                                    <div className="text-sm text-muted-foreground">{new Date(invoice.issue_date).toLocaleDateString('he-IL')}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold tabular-nums text-lg">₪{invoice.total.toLocaleString()}</span>
                                                <Badge variant={status?.variant || 'default'}>{status?.label}</Badge>
                                                {invoice.status !== 'paid' && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(invoice.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CheckCircle className="w-4 h-4 ml-1" />שולם
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Expenses tab */}
            {activeTab === 'expenses' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>הוצאות</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={exportExpenses} className="gap-2">
                                <Download className="w-4 h-4" />
                                ייצוא לאקסל
                            </Button>
                            <Button size="sm" onClick={openNewExpense} className="gap-2">
                                <Plus className="w-4 h-4" />הוסף
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {expenses.length === 0 ? (
                            <div className="text-center py-12">
                                <Receipt className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground mb-4">אין הוצאות</p>
                                <Button onClick={openNewExpense}><Plus className="w-4 h-4 ml-2" />הוצאה ראשונה</Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {expenses.map(expense => (
                                    <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                                <Receipt className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{expense.description}</div>
                                                <div className="text-sm text-muted-foreground">{expense.category} • {new Date(expense.date).toLocaleDateString('he-IL')}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold tabular-nums text-lg text-red-600">-₪{expense.amount.toLocaleString()}</span>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                                <button onClick={() => openEditExpense(expense)} className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors" title="ערוך">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors" title="מחק">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Expense Modal (Add/Edit) */}
            <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={editingExpense ? 'עריכת הוצאה' : 'הוסף הוצאה'} size="md">
                <form onSubmit={handleSaveExpense} className="space-y-4">
                    <Input label="תיאור *" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} required autoFocus />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">קטגוריה *</label>
                            <select className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} required>
                                <option value="">בחר קטגוריה</option>
                                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <Input type="number" label="סכום (₪) *" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required dir="ltr" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="date" label="תאריך" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} dir="ltr" />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">פרויקט</label>
                            <select className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground" value={expenseForm.project_id} onChange={e => setExpenseForm({ ...expenseForm, project_id: e.target.value })}>
                                <option value="">ללא פרויקט</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">{editingExpense ? 'שמור שינויים' : 'הוסף הוצאה'}</Button>
                        <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>

            {/* Invoice Modal */}
            <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="צור חשבונית" size="md">
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">פרויקט</label>
                        <select className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground" value={invoiceForm.project_id} autoFocus onChange={e => setInvoiceForm({ ...invoiceForm, project_id: e.target.value })}>
                            <option value="">ללא פרויקט</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <Input type="number" label='סכום לפני מע״מ (₪) *' value={invoiceForm.subtotal} onChange={e => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })} required dir="ltr" />
                    {invoiceForm.subtotal && (
                        <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between"><span>סכום לפני מע״מ</span><span>₪{parseFloat(invoiceForm.subtotal).toLocaleString()}</span></div>
                            <div className="flex justify-between text-muted-foreground"><span>מע״מ (17%)</span><span>₪{(parseFloat(invoiceForm.subtotal) * 0.17).toLocaleString()}</span></div>
                            <div className="flex justify-between font-bold pt-2 border-t border-border"><span>סה״כ</span><span>₪{(parseFloat(invoiceForm.subtotal) * 1.17).toLocaleString()}</span></div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">הערות</label>
                        <textarea className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground resize-none" rows={2} value={invoiceForm.notes} onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">צור חשבונית</Button>
                        <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
