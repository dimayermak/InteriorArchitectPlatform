import type { PortalFinancials } from '@/lib/api/portal';

interface ClientReportBudgetProps {
    financials: PortalFinancials;
}

function StatCard({
    label,
    value,
    sub,
    color = 'bg-gray-100 text-gray-600',
    valueColor = 'text-foreground',
}: {
    label: string;
    value: string;
    sub?: string;
    color?: string;
    valueColor?: string;
}) {
    return (
        <div className="bg-background rounded-2xl border border-border p-5">
            <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${color}`}>{label}</div>
            <div className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
    );
}

export function ClientReportBudget({ financials }: ClientReportBudgetProps) {
    const { budget, totalSpent, remainingBudget, savedAmount, totalInvoiced, totalPaid, remainingToPay } = financials;

    const spentPct = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
    const paidPct = totalInvoiced > 0 ? Math.min(100, Math.round((totalPaid / totalInvoiced) * 100)) : 0;

    const fmt = (n: number) =>
        n.toLocaleString('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });

    return (
        <div className="space-y-6">
            {/* Budget usage section */}
            <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">תקציב ביצוע</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {budget > 0 && (
                        <StatCard
                            label="תקציב פרויקט"
                            value={fmt(budget)}
                            color="bg-blue-100 text-blue-700"
                        />
                    )}
                    <StatCard
                        label="הוצאות עד כה"
                        value={fmt(totalSpent)}
                        sub={budget > 0 ? `${spentPct}% מהתקציב` : undefined}
                        color="bg-orange-100 text-orange-700"
                    />
                    {budget > 0 && (
                        <StatCard
                            label={remainingBudget >= 0 ? 'נחסך / נשאר' : 'חריגה מהתקציב'}
                            value={fmt(Math.abs(remainingBudget))}
                            sub={`${100 - spentPct}% מהתקציב`}
                            color={remainingBudget >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                            valueColor={remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-500'}
                        />
                    )}
                </div>

                {/* Budget bar */}
                {budget > 0 && (
                    <div className="mt-3">
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${spentPct > 95 ? 'bg-red-500' : spentPct > 75 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                style={{ width: `${spentPct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>₪0</span>
                            <span>{fmt(budget)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Payments section */}
            {totalInvoiced > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">תשלומים</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <StatCard
                            label="סה״כ לתשלום"
                            value={fmt(totalInvoiced)}
                            color="bg-purple-100 text-purple-700"
                        />
                        <StatCard
                            label="שולם"
                            value={fmt(totalPaid)}
                            sub={`${paidPct}% שולם`}
                            color="bg-emerald-100 text-emerald-700"
                            valueColor="text-emerald-600"
                        />
                        <StatCard
                            label="נשאר לתשלום"
                            value={fmt(remainingToPay)}
                            color={remainingToPay > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}
                            valueColor={remainingToPay > 0 ? 'text-amber-600' : 'text-emerald-600'}
                        />
                    </div>
                    {/* Payment bar */}
                    <div className="mt-3">
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                                style={{ width: `${paidPct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>₪0</span>
                            <span>{fmt(totalInvoiced)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
