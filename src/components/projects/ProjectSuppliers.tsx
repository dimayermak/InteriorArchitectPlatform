'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Phone, Mail, Building2, User } from 'lucide-react';
import { getSuppliers, getProjectSuppliers, addSupplierToProject, removeSupplierFromProject } from '@/lib/api/suppliers';
import type { Supplier } from '@/types/database';
import { getCurrentOrganizationId } from '@/lib/auth/user';

// Temporary constant until we have proper context
const DEV_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

interface ProjectSuppliersProps {
    projectId: string;
}

type ProjectSupplier = Supplier & { role: string | null; notes: string | null };

export function ProjectSuppliers({ projectId }: ProjectSuppliersProps) {
    const [projectSuppliers, setProjectSuppliers] = useState<ProjectSupplier[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [role, setRole] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
    }, [projectId]);

    async function loadData() {
        try {
            const [pSuppliers, aSuppliers] = await Promise.all([
                getProjectSuppliers(projectId),
                getSuppliers(DEV_ORG_ID)
            ]);
            setProjectSuppliers(pSuppliers);
            setAllSuppliers(aSuppliers);
        } catch (error) {
            console.error('Error loading suppliers:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplierId) return;

        try {
            await addSupplierToProject(projectId, selectedSupplierId, role, notes);
            await loadData(); // Reload to get updated list
            setIsAddModalOpen(false);
            setSelectedSupplierId('');
            setRole('');
            setNotes('');
        } catch (error) {
            console.error('Error adding supplier:', error);
        }
    };

    const handleRemoveSupplier = async (supplierId: string) => {
        if (!confirm('האם אתה בטוח שברצונך להסיר ספק זה מהפרויקט?')) return;
        try {
            await removeSupplierFromProject(projectId, supplierId);
            setProjectSuppliers(prev => prev.filter(s => s.id !== supplierId));
        } catch (error) {
            console.error('Error removing supplier:', error);
        }
    };

    // Filter out suppliers already in the project
    const availableSuppliers = allSuppliers.filter(
        s => !projectSuppliers.some(ps => ps.id === s.id)
    );

    if (loading) {
        return <div className="p-4 text-center">טוען ספקים...</div>;
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>ספקים וקבלנים בפרויקט</CardTitle>
                    <Button onClick={() => setIsAddModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 ml-1" />
                        הוסף ספק
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectSuppliers.map((supplier) => (
                            <div key={supplier.id} className="p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors relative group">
                                <button
                                    onClick={() => handleRemoveSupplier(supplier.id)}
                                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{supplier.name}</h3>
                                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                                        {supplier.role && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium bg-secondary/50 px-2 py-0.5 rounded-full w-fit mt-1">
                                                <User className="w-3 h-3" />
                                                {supplier.role}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    {supplier.contact_name && (
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {supplier.contact_name}
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <a href={`tel:${supplier.phone}`} className="hover:text-primary transition-colors">{supplier.phone}</a>
                                        </div>
                                    )}
                                    {supplier.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <a href={`mailto:${supplier.email}`} className="hover:text-primary transition-colors">{supplier.email}</a>
                                        </div>
                                    )}
                                </div>
                                {supplier.notes && (
                                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                                        {supplier.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                        {projectSuppliers.length === 0 && (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                לא שויכו ספקים לפרויקט זה עדיין.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="שיור ספק לפרויקט">
                <form onSubmit={handleAddSupplier} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">בחר ספק</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={selectedSupplierId}
                            onChange={(e) => setSelectedSupplierId(e.target.value)}
                            required
                        >
                            <option value="">בחר ספק...</option>
                            {availableSuppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                            ))}
                        </select>
                        {availableSuppliers.length === 0 && (
                            <p className="text-xs text-muted-foreground">כל הספקים הקיימים כבר משויכים לפרויקט.</p>
                        )}
                    </div>

                    <Input
                        label="תפקיד בפרויקט"
                        placeholder="למשל: קבלן מבצע, ספק קרמיקה"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">הערות</label>
                        <textarea
                            className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="הערות מיוחדות לפרויקט זה..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>ביטול</Button>
                        <Button type="submit" disabled={!selectedSupplierId}>שייך לפרויקט</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
