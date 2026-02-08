import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

/**
 * Basic skeleton loader component
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-muted',
                className
            )}
        />
    );
}

/**
 * Card skeleton for loading states
 */
export function CardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('rounded-2xl border border-border bg-background p-6', className)}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        'h-4',
                        i === 0 ? 'w-1/4' : 'flex-1'
                    )}
                />
            ))}
        </div>
    );
}

/**
 * Stats card skeleton
 */
export function StatsSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        </div>
    );
}

/**
 * List item skeleton
 */
export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-border last:border-0">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-20 h-6 rounded-full" />
        </div>
    );
}

/**
 * Page header skeleton
 */
export function PageHeaderSkeleton() {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
    );
}
