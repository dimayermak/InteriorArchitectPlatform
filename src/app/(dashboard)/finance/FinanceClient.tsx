'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getInvoices, getExpenses, getFinanceStats, createExpense, deleteExpense, getNextInvoiceNumber, createInvoice, markInvoiceAsPaid } from '@/lib/api/finance';
import { getProjects } from '@/lib/api/projects';
import type { Invoice, Expense, Project } from '@/types/database';
import { Plus, FileText, Receipt, TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, Trash2 } from 'lucide-react';

const EXPENSE_CATEGORIES = ['חומרים', 'נסיעות', 'עמלות', 'תשלומים לספקים', 'הוצאות משרד', 'פרסום', 'ביטוח', 'אחר'];

const invoiceStatusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' }> = {
    draft: { label: 'טיוטה', variant: 'default' },
    sent: { label: 'נשלח', variant: 'info' },
    paid: { label: 'שולם', variant: 'success' },
    overdue: { label: 'באיחור', variant: 'warning' },
    cancelled: { label: 'בוטל', variant: 'default' },
};

interface FinanceClientProps {
    organizationId: string;
}

export function FinanceClient({ organizationId }: FinanceClientProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<{ totalInvoiced: number; totalPaid: number; totalPending: number; totalExpenses: number; approvedExpenses: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses'>('overview');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({ description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], project_id: '' });
    const [invoiceForm, setInvoiceForm] = useState({ project_id: '', client_id: '', subtotal: '', notes: '' });

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

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const expense = await createExpense({
                organization_id: organizationId,
                description: expenseForm.description,
                category: expenseForm.category,
                amount: parseFloat(expenseForm.amount),
                date: expenseForm.date,
                project_id: expenseForm.project_id || null,
            });
            setExpenses([expense, ...expenses]);
            setIsExpenseModalOpen(false);
            setExpenseForm({ description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], project_id: '' });
            const statsData = await getFinanceStats(organizationId);
            setStats(statsData);
        } catch (error) {
            console.error('Error creating expense:', error);
        }
    };

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
            setInvoices([invoice, ...invoices]);
            setIsInvoiceModalOpen(false);
            setInvoiceForm({ project_id: '', client_id: '', subtotal: '', notes: '' });
            const statsData = await getFinanceStats(organizationId);
            setStats(statsData);
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            const updated = await markInvoiceAsPaid(id);
            setInvoices(invoices.map((inv) => (inv.id === id ? updated : inv)));
            const statsData = await getFinanceStats(organizationId);
            setStats(statsData);
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteExpense(id);
            setExpenses(expenses.filter((e) => e.id !== id));
            const statsData = await getFinanceStats(organizationId);
            setStats(statsData);
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

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
                    <Button variant="outline" onClick={() => setIsExpenseModalOpen(true)} className="gap-2">
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
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold tabular-nums">₪{(stats?.totalPaid || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">שולם</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold tabular-nums">₪{(stats?.totalPending || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">ממתין</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold tabular-nums">₪{(stats?.totalInvoiced || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">סה"כ חשבוניות</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold tabular-nums">₪{(stats?.totalExpenses || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">הוצאות</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {(['overview', 'invoices', 'expenses'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab === 'overview' ? 'סקירה' : tab === 'invoices' ? 'חשבוניות' : 'הוצאות'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                חשבוניות אחרונות
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">אין חשבוניות</p>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.slice(0, 5).map((invoice) => {
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
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                הוצאות אחרונות
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {expenses.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">אין הוצאות</p>
                            ) : (
                                <div className="space-y-3">
                                    {expenses.slice(0, 5).map((expense) => (
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

            {activeTab === 'invoices' && (
                <Card>
                    <CardContent className="p-6">
                        {invoices.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground mb-4">אין חשבוניות</p>
                                <Button onClick={() => setIsInvoiceModalOpen(true)}>
                                    <Plus className="w-4 h-4 ml-2" />
                                    חשבונית ראשונה
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invoices.map((invoice) => {
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
                                                        <CheckCircle className="w-4 h-4 ml-1" />
                                                        שולם
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

            {activeTab === 'expenses' && (
                <Card>
                    <CardContent className="p-6">
                        {expenses.length === 0 ? (
                            <div className="text-center py-12">
                                <Receipt className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground mb-4">אין הוצאות</p>
                                <Button onClick={() => setIsExpenseModalOpen(true)}>
                                    <Plus className="w-4 h-4 ml-2" />
                                    הוצאה ראשונה
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {expenses.map((expense) => (
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
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold tabular-nums text-lg text-red-600">-₪{expense.amount.toLocaleString()}</span>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Expense Modal */}
            <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="הוסף הוצאה" size="md">
                <form onSubmit={handleCreateExpense} className="space-y-4">
                    <Input
                        label="תיאור *"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">קטגוריה *</label>
                            <select
                                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground"
                                value={expenseForm.category}
                                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                required
                            >
                                <option value="">בחר קטגוריה</option>
                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            type="number"
                            label="סכום (₪) *"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                            required
                            dir="ltr"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="תאריך"
                            value={expenseForm.date}
                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                            dir="ltr"
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">פרויקט</label>
                            <select
                                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground"
                                value={expenseForm.project_id}
                                onChange={(e) => setExpenseForm({ ...expenseForm, project_id: e.target.value })}
                            >
                                <option value="">ללא פרויקט</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">הוסף הוצאה</Button>
                        <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)}>ביטול</Button>
                    </div>
                </form>
            </Modal>

            {/* Invoice Modal */}
            <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="צור חשבונית" size="md">
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">פרויקט</label>
                        <select
                            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground"
                            value={invoiceForm.project_id}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, project_id: e.target.value })}
                        >
                            <option value="">ללא פרויקט</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input
                        type="number"
                        label="סכום לפני מע״מ (₪) *"
                        value={invoiceForm.subtotal}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })}
                        required
                        dir="ltr"
                    />
                    {invoiceForm.subtotal && (
                        <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>סכום לפני מע״מ</span>
                                <span className="tabular-nums">₪{parseFloat(invoiceForm.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>מע״מ (17%)</span>
                                <span className="tabular-nums">₪{(parseFloat(invoiceForm.subtotal) * 0.17).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-border">
                                <span>סה״כ</span>
                                <span className="tabular-nums">₪{(parseFloat(invoiceForm.subtotal) * 1.17).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">הערות</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground resize-none"
                            rows={2}
                            value={invoiceForm.notes}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                        />
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
