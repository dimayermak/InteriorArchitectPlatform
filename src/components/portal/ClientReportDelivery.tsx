import type { DeliveryEstimate } from '@/lib/api/client-reports';
import { Package, Truck, CheckCircle2 } from 'lucide-react';

interface ClientReportDeliveryProps {
    estimates: DeliveryEstimate[];
}

const statusConfig = {
    pending: { label: 'ממתין להזמנה', icon: Package, badge: 'bg-gray-100 text-gray-600' },
    ordered: { label: 'הוזמן / בדרך', icon: Truck, badge: 'bg-blue-100 text-blue-700' },
    delivered: { label: 'נמסר ✓', icon: CheckCircle2, badge: 'bg-emerald-100 text-emerald-700' },
};

export function ClientReportDelivery({ estimates }: ClientReportDeliveryProps) {
    if (estimates.length === 0) return null;

    const upcoming = estimates.filter(e => e.status !== 'delivered');
    const delivered = estimates.filter(e => e.status === 'delivered');

    return (
        <div className="space-y-2">
            {[...upcoming, ...delivered].map((est) => {
                const cfg = statusConfig[est.status as keyof typeof statusConfig] || statusConfig.pending;
                const Icon = cfg.icon;
                const isPast = est.status === 'delivered';

                return (
                    <div
                        key={est.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${isPast ? 'border-border/40 opacity-70' : 'border-border bg-background'
                            }`}
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.badge}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{est.item}</div>
                            {est.notes && (
                                <div className="text-xs text-muted-foreground mt-0.5">{est.notes}</div>
                            )}
                        </div>
                        <div className="text-left flex-shrink-0">
                            <div className="text-xs text-muted-foreground">
                                {isPast ? 'נמסר' : 'צפי'}
                            </div>
                            <div className="text-sm font-semibold tabular-nums">
                                {new Date(est.estimated_date).toLocaleDateString('he-IL', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                                {cfg.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
