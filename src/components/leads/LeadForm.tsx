'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Lead } from '@/types/database';
import { createLead, updateLead } from '@/lib/api/leads';

interface LeadFormProps {
    organizationId: string;
    initialData?: Lead | null;
    onSuccess: (lead: Lead) => void;
    onCancel: () => void;
}

export function LeadForm({ organizationId, initialData, onSuccess, onCancel }: LeadFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        company: initialData?.company || '',
        source: initialData?.source || '',
        notes: initialData?.notes || '',
        value: initialData?.value?.toString() || '',
        expected_close_date: initialData?.expected_close_date || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                ...formData,
                value: formData.value ? parseFloat(formData.value) : undefined,
                expected_close_date: formData.expected_close_date || undefined,
            };

            let result: Lead;
            if (initialData) {
                result = await updateLead(initialData.id, data);
            } else {
                result = await createLead({
                    organization_id: organizationId,
                    name: formData.name,
                    email: formData.email || null,
                    phone: formData.phone || null,
                    company: formData.company || null,
                    source: formData.source || null,
                    status: 'new',
                    score: 50,
                    notes: formData.notes || null,
                    value: data.value || null,
                    expected_close_date: data.expected_close_date || null,
                });
            }
            onSuccess(result);
        } catch (error) {
            console.error('Error saving lead:', error);
            alert('שגיאה בשמירת הליד');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        שם מלא *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary h-12"
                        placeholder="שם הליד"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        חברה
                    </label>
                    <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary h-12"
                        placeholder="שם החברה"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        אימייל
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary h-12"
                        placeholder="email@example.com"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        טלפון
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary h-12"
                        placeholder="050-0000000"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        שווי עסקה משוער (₪)
                    </label>
                    <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary h-12"
                        placeholder="0"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        תאריך סגירה משוער
                    </label>
                    <input
                        type="date"
                        value={formData.expected_close_date}
                        onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary h-12"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                    מקור
                </label>
                <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary h-12"
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
                <label className="block text-sm font-medium text-foreground mb-1.5">
                    הערות
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
                    placeholder="הערות על הליד..."
                />
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
                <Button type="submit" className="flex-1 h-12 text-base font-medium" disabled={loading}>
                    {loading ? 'שומר...' : initialData ? 'שמור שינויים' : 'צור ליד'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="md:w-32 h-12" disabled={loading}>
                    ביטול
                </Button>
            </div>
        </form>
    );
}
