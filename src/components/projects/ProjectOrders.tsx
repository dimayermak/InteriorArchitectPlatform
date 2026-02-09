'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, ShoppingCart, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { getPurchaseOrders, createPurchaseOrder, deletePurchaseOrder, updatePurchaseOrder } from '@/lib/api/orders';
import { getProjectSuppliers } from '@/lib/api/suppliers';
import type { PurchaseOrder, Supplier, InvoiceItem } from '@/types/database';

// Temporary constant until we have proper context
const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

interface ProjectOrdersProps {
    projectId: string;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    draft: { label: 'טיוטה', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
    ordered: { label: 'הוזמן', icon: <ShoppingCart className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'נשלח', icon: <Truck className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
    delivered: { label: 'סופק', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
    installed: { label: 'הותקן', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'בוטל', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
};

export function ProjectOrders({ projectId }: ProjectOrdersProps) {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]); // Project suppliers to select from
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<PurchaseOrder['status']>('draft');

    useEffect(() => {
        loadData();
    }, [projectId]);

    async function loadData() {
        try {
            const [ordersData, suppliersData] = await Promise.all([
                getPurchaseOrders(projectId),
                getProjectSuppliers(projectId) // Only show project suppliers
            ]);
            setOrders(ordersData);
            setSuppliers(suppliersData);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    }

    const calculateTotal = (currentItems: InvoiceItem[]) => {
        return currentItems.reduce((sum, item) => sum + (item.total || 0), 0);
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'unit_price') {
            item.total = Number(item.quantity) * Number(item.unit_price);
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const totalAmount = calculateTotal(items);
            await createPurchaseOrder({
                project_id: projectId,
                supplier_id: selectedSupplierId || null,
                order_date: orderDate,
                items,
                total_amount: totalAmount,
                status,
                notes
            });

            await loadData();
            setIsAddModalOpen(false);
            // Reset form
            setSelectedSupplierId('');
            setItems([{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
            setNotes('');
            setStatus('draft');
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (!confirm('האם למחוק הזמנה זו?')) return;
        try {
            await deletePurchaseOrder(id);
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    // Helper to get supplier name
    const getSupplierName = (id: string | null) => {
        if (!id) return 'ללא ספק';
        return suppliers.find(s => s.id === id)?.name || 'ספק לא ידוע';
    };

    if (loading) return <div className="p-4 text-center">טוען הזמנות...</div>;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>הזמנות רכש</CardTitle>
                    <Button onClick={() => setIsAddModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 ml-1" />
                        הזמנה חדשה
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const statusInfo = statusConfig[order.status] || statusConfig.draft;
                            return (
                                <div key={order.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-lg">
                                                {getSupplierName(order.supplier_id)}
                                            </span>
                                            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex gap-4">
                                            <span>תאריך: {new Date(order.order_date).toLocaleDateString('he-IL')}</span>
                                            {order.items && <span>{order.items.length} פריטים</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-left">
                                            <div className="font-bold text-lg">₪{order.total_amount.toLocaleString()}</div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order.id)}>
                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {orders.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                אין הזמנות רכש לפרויקט זה.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="הזמנת רכש חדשה" size="lg">
                <form onSubmit={handleCreateOrder} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ספק</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={selectedSupplierId}
                                onChange={(e) => setSelectedSupplierId(e.target.value)}
                            >
                                <option value="">בחר ספק...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            type="date"
                            label="תאריך הזמנה"
                            value={orderDate}
                            onChange={(e) => setOrderDate(e.target.value)}
                            required
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">סטטוס</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as PurchaseOrder['status'])}
                            >
                                {Object.entries(statusConfig).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            <span>פריטים</span>
                            <Button type="button" variant="ghost" size="sm" onClick={addItem}><Plus className="w-4 h-4 ml-1" /> הוסף פריט</Button>
                        </label>
                        <div className="space-y-2 border rounded-lg p-2 max-h-[200px] overflow-y-auto">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="תיאור"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-20">
                                        <Input
                                            type="number"
                                            placeholder="כמות"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            placeholder="מחיר יח'"
                                            value={item.unit_price}
                                            onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-24 pt-2 text-center text-sm font-medium">
                                        ₪{item.total.toLocaleString()}
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="text-left font-bold text-lg pt-2">
                            סה"כ: ₪{calculateTotal(items).toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">הערות</label>
                        <textarea
                            className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>ביטול</Button>
                        <Button type="submit">צור הזמנה</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
