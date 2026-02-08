import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: string;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12 px-4">
            <span className="text-5xl mb-4 block">{icon}</span>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
                {title}
            </h3>
            {description && (
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
