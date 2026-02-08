'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, togglePreferred, getSupplierCategories } from '@/lib/api/suppliers';
import type { Supplier } from '@/types/database';
import { Plus, Search, Star, StarOff, Phone, Mail, Globe, MapPin, MoreVertical, Trash2, Edit2, Store } from 'lucide-react';

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';

const CATEGORY_OPTIONS = [
    'ריהוט',
    'תאורה',
    'אינסטלציה',
    'חשמל',
    'צבעים',
    'טפטים',
    'אריחים',
    'בדים וטקסטיל',
    'נגרות',
    'מטבחים',
    'אמבטיות',
    'זכוכית',
    'ברזים',
    'אחר',
];

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        notes: '',
    });

    useEffect(() => {
        async function load() {
            try {
                const [suppliersData, categoriesData] = await Promise.all([
                    getSuppliers(DEV_ORG_ID),
                    getSupplierCategories(DEV_ORG_ID),
                ]);
                setSuppliers(suppliersData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error loading suppliers:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredSuppliers = suppliers.filter((supplier) => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const resetForm = () => {
        setFormData({ name: '', category: '', contact_name: '', email: '', phone: '', website: '', address: '', city: '', notes: '' });
        setEditingSupplier(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            category: supplier.category || '',
            contact_name: supplier.contact_name || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            website: supplier.website || '',
            address: supplier.address || '',
            city: supplier.city || '',
            notes: supplier.notes || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                const updated = await updateSupplier(editingSupplier.id, formData);
                setSuppliers(suppliers.map((s) => (s.id === updated.id ? updated : s)));
            } else {
                const created = await createSupplier({ organization_id: DEV_ORG_ID, ...formData });
                setSuppliers([created, ...suppliers]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    };

    const handleTogglePreferred = async (supplier: Supplier) => {
        try {
            const updated = await togglePreferred(supplier.id, !supplier.is_preferred);
            setSuppliers(suppliers.map((s) => (s.id === updated.id ? updated : s)));
        } catch (error) {
            console.error('Error toggling preferred:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('האם למחוק את הספק?')) return;
        try {
            await deleteSupplier(id);
            setSuppliers(suppliers.filter((s) => s.id !== id));
        } catch (error) {
            console.error('Error deleting supplier:', error);
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">ספקים</h1>
                    <p className="text-muted-foreground text-sm mt-1">{suppliers.length} ספקים במערכת</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="w-4 h-4" />
                    ספק חדש
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="חיפוש ספקים..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <select
                    className="h-11 px-4 rounded-lg border border-border bg-background text-foreground"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="all">כל הקטגוריות</option>
                    {[...new Set([...categories, ...CATEGORY_OPTIONS])].sort().map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Suppliers Grid */}
            {filteredSuppliers.length === 0 ? (
                <Card className="text-center py-16">
                    <Store className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">אין ספקים</h3>
                    <p className="text-muted-foreground mb-6">התחילו בהוספת הספק הראשון</p>
                    <Button onClick={openCreateModal}>
                        <Plus className="w-4 h-4 ml-2" />
                        ספק חדש
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers.map((supplier) => (
                        <SupplierCard
                            key={supplier.id}
                            supplier={supplier}
                            onEdit={() => openEditModal(supplier)}
                            onDelete={() => handleDelete(supplier.id)}
                            onTogglePreferred={() => handleTogglePreferred(supplier)}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingSupplier ? 'עריכת ספק' : 'ספק חדש'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="שם הספק *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">קטגוריה</label>
                            <select
                                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">בחר קטגוריה</option>
                                {CATEGORY_OPTIONS.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="איש קשר"
                            value={formData.contact_name}
                            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        />
                        <Input
                            label="טלפון"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            dir="ltr"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="אימייל"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            dir="ltr"
                        />
                        <Input
                            label="אתר אינטרנט"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            dir="ltr"
                            placeholder="https://"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="כתובת"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        <Input
                            label="עיר"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">הערות</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground resize-none"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">{editingSupplier ? 'שמור שינויים' : 'צור ספק'}</Button>
                        <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>ביטול</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

interface SupplierCardProps {
    supplier: Supplier;
    onEdit: () => void;
    onDelete: () => void;
    onTogglePreferred: () => void;
}

function SupplierCard({ supplier, onEdit, onDelete, onTogglePreferred }: SupplierCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <Card className="hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{supplier.name}</CardTitle>
                            {supplier.is_preferred && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                        </div>
                        {supplier.category && (
                            <Badge variant="default" className="mt-2">{supplier.category}</Badge>
                        )}
                    </div>
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                        {showMenu && (
                            <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                                <button onClick={onEdit} className="w-full px-4 py-2 text-sm text-right hover:bg-muted flex items-center gap-2">
                                    <Edit2 className="w-4 h-4" />
                                    עריכה
                                </button>
                                <button onClick={onTogglePreferred} className="w-full px-4 py-2 text-sm text-right hover:bg-muted flex items-center gap-2">
                                    {supplier.is_preferred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                    {supplier.is_preferred ? 'הסר מועדף' : 'סמן כמועדף'}
                                </button>
                                <button onClick={onDelete} className="w-full px-4 py-2 text-sm text-right hover:bg-muted text-destructive flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    מחיקה
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                {supplier.contact_name && (
                    <p className="text-sm text-muted-foreground">{supplier.contact_name}</p>
                )}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {supplier.phone && (
                        <a href={`tel:${supplier.phone}`} className="flex items-center gap-1 hover:text-primary">
                            <Phone className="w-3.5 h-3.5" />
                            {supplier.phone}
                        </a>
                    )}
                    {supplier.email && (
                        <a href={`mailto:${supplier.email}`} className="flex items-center gap-1 hover:text-primary">
                            <Mail className="w-3.5 h-3.5" />
                            אימייל
                        </a>
                    )}
                    {supplier.website && (
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                            <Globe className="w-3.5 h-3.5" />
                            אתר
                        </a>
                    )}
                </div>
                {(supplier.address || supplier.city) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[supplier.address, supplier.city].filter(Boolean).join(', ')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
