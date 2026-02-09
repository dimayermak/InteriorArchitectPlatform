'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { getInvoices, getExpenses, createExpense, deleteExpense } from '@/lib/api/finance';
import { getPurchaseOrders } from '@/lib/api/orders';
import type { Invoice, Expense, PurchaseOrder } from '@/types/database';

// Temporary constant until we have proper context
const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

interface ProjectFinanceProps {
    projectId: string;
    budget: number;
}

export function ProjectFinance({ projectId, budget }: ProjectFinanceProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

    // Expense Form State
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenseCategory, setExpenseCategory] = useState('');

    useEffect(() => {
        loadData();
    }, [projectId]);

    async function loadData() {
        try {
            const [invoicesData, expensesData, ordersData] = await Promise.all([
                getInvoices(DEV_ORG_ID, { projectId, type: 'client_invoice' }),
                getExpenses(DEV_ORG_ID, { projectId }),
                getPurchaseOrders(projectId)
            ]);
            setInvoices(invoicesData);
            setExpenses(expensesData);
            setPurchaseOrders(ordersData);
        } catch (error) {
            console.error('Error loading finance data:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createExpense({
                organization_id: DEV_ORG_ID,
                project_id: projectId,
                description: expenseDescription,
                amount: Number(expenseAmount),
                date: expenseDate,
                category: expenseCategory || 'general',
                status: 'pending'
            });

            await loadData();
            setIsAddExpenseModalOpen(false);
            // Reset form
            setExpenseDescription('');
            setExpenseAmount('');
            setExpenseCategory('');
            setExpenseDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error('Error creating expense:', error);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('האם למחוק הוצאה זו?')) return;
        try {
            await deleteExpense(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    // Calculations
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalMiscExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalPOExpenses = purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0);
    const totalExpenses = totalMiscExpenses + totalPOExpenses;
    const balance = totalInvoiced - totalExpenses; // Or Budget - Expenses? Usually Budget - Expenses.
    const remainingBudget = budget - totalExpenses;

    if (loading) return <div className="p-4 text-center">טוען נתונים פיננסיים...</div>;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">תקציב פרויקט</span>
                            <Wallet className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">₪{budget.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">יעד תקציבי</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">סך הוצאות</span>
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="text-2xl font-bold">₪{totalExpenses.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            רכש: ₪{totalPOExpenses.toLocaleString()} | שונות: ₪{totalMiscExpenses.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">הכנסות (חשבוניות)</span>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold">₪{totalInvoiced.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">{invoices.length} חשבוניות ללקוח</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">נשאר בתקציב</span>
                            <DollarSign className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            ₪{remainingBudget.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{Math.round((remainingBudget / budget) * 100)}% מהתקציב</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Misc Expenses List */}
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>הוצאות שונות</CardTitle>
                        <Button onClick={() => setIsAddExpenseModalOpen(true)} size="sm">
                            <Plus className="w-4 h-4 ml-1" />
                            הוסף הוצאה
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="flex iems-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors group">
                                    <div>
                                        <div className="font-medium">{expense.description}</div>
                                        <div className="text-xs text-muted-foreground flex gap-2">
                                            <span>{new Date(expense.date).toLocaleDateString('he-IL')}</span>
                                            <span>•</span>
                                            <span>{expense.category}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold">₪{expense.amount.toLocaleString()}</span>
                                        <button onClick={() => handleDeleteExpense(expense.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {expenses.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground">אין הוצאות שונות.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices List */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>חשבוניות ללקוח</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                                    <div>
                                        <div className="font-medium">הוצאה {invoice.invoice_number}</div>
                                        <div className="text-xs text-muted-foreground flex gap-2">
                                            <span>{new Date(invoice.issue_date).toLocaleDateString('he-IL')}</span>
                                            <span className={`px-1.5 rounded-full text-[10px] ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    invoice.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {invoice.status === 'paid' ? 'שולם' :
                                                    invoice.status === 'sent' ? 'נשלח' :
                                                        invoice.status === 'approved' ? 'אושר' :
                                                            invoice.status === 'cancelled' ? 'בוטל' : 'טיוטה'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="font-bold">₪{invoice.total.toLocaleString()}</div>
                                </div>
                            ))}
                            {invoices.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground">אין חשבוניות ללקוח בפרויקט זה.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Modal isOpen={isAddExpenseModalOpen} onClose={() => setIsAddExpenseModalOpen(false)} title="הוספת הוצאה שונה">
                <form onSubmit={handleCreateExpense} className="space-y-4">
                    <Input
                        label="תיאור ההוצאה"
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        placeholder="למשל: נסיעות, אגרות..."
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            label="סכום (₪)"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            required
                        />
                        <Input
                            type="date"
                            label="תאריך"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">קטגוריה</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={expenseCategory}
                            onChange={(e) => setExpenseCategory(e.target.value)}
                        >
                            <option value="">כללי</option>
                            <option value="travel">נסיעות</option>
                            <option value="fees">אגרות</option>
                            <option value="materials">חומרים שונים</option>
                            <option value="other">אחר</option>
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddExpenseModalOpen(false)}>ביטול</Button>
                        <Button type="submit">הוסף הוצאה</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
