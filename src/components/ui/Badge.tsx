import { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'destructive' | 'info';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-muted text-muted-foreground border border-border',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-destructive/10 text-destructive border border-destructive/20',
    destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
};

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
    const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm';

    return (
        <span className={`inline-flex items-center font-bold rounded-full ${variantClasses[variant]} ${sizeClasses} ${className}`}>
            {children}
        </span>
    );
}

// Pre-configured status badges for common use cases
export function LeadStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
        new: { label: 'חדש', variant: 'info' },
        contacted: { label: 'נוצר קשר', variant: 'primary' },
        qualified: { label: 'מתאים', variant: 'success' },
        proposal: { label: 'הצעה', variant: 'warning' },
        won: { label: 'הצליח', variant: 'success' },
        lost: { label: 'אבד', variant: 'error' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' as BadgeVariant };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ClientStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
        active: { label: 'פעיל', variant: 'success' },
        inactive: { label: 'לא פעיל', variant: 'default' },
        archived: { label: 'בארכיון', variant: 'error' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' as BadgeVariant };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
        planning: { label: 'תכנון', variant: 'info' },
        active: { label: 'פעיל', variant: 'success' },
        on_hold: { label: 'מושהה', variant: 'warning' },
        completed: { label: 'הושלם', variant: 'primary' },
        cancelled: { label: 'בוטל', variant: 'error' },
    };

    const config = statusConfig[status] || { label: status, variant: 'default' as BadgeVariant };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}
