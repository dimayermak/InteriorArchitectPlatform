import { ReactNode } from 'react';
import { Button } from './Button';
import { Plus, FileText, Users, FolderOpen, Search } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    } | ReactNode;
}

/**
 * Generic empty state component with illustration
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    const isActionObject = action && typeof action === 'object' && 'label' in action && 'onClick' in action;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                {icon || <FileText className="w-8 h-8 text-muted-foreground/50" />}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
            {description && (
                <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
            )}
            {action && (
                isActionObject ? (
                    <Button onClick={(action as { onClick: () => void }).onClick}>
                        <Plus className="w-4 h-4 ml-2" />
                        {(action as { label: string }).label}
                    </Button>
                ) : (
                    action as ReactNode
                )
            )}
        </div>
    );
}

// Pre-configured empty states for common use cases

export function NoProjectsEmpty({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <EmptyState
            icon={<FolderOpen className="w-8 h-8 text-muted-foreground/50" />}
            title="אין פרויקטים"
            description="צרו את הפרויקט הראשון שלכם להתחיל לנהל עבודות"
            action={{ label: 'פרויקט חדש', onClick: onCreateClick }}
        />
    );
}

export function NoClientsEmpty({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <EmptyState
            icon={<Users className="w-8 h-8 text-muted-foreground/50" />}
            title="אין לקוחות"
            description="הוסיפו לקוחות חדשים או המירו לידים קיימים"
            action={{ label: 'לקוח חדש', onClick: onCreateClick }}
        />
    );
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
    return (
        <EmptyState
            icon={<Search className="w-8 h-8 text-muted-foreground/50" />}
            title="לא נמצאו תוצאות"
            description={`לא נמצאו תוצאות עבור "${query}". נסו לחפש מונח אחר.`}
        />
    );
}
