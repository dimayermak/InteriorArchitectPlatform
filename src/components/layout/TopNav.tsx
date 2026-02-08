'use client';

import { Button } from '@/components/ui';

export function TopNav() {
    return (
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary">
                    <span className="opacity-70">Spaces</span>
                    <span className="opacity-40">/</span>
                    <span>Interior Projects</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Villa Rothschild</span>
                </div>
            </div>

            <div className="flex-1" />

            {/* View Switcher (ClickUp style) */}
            <div className="flex items-center gap-1 rounded-md bg-muted/50 p-1">
                <Button variant="ghost" size="sm" className="h-7 bg-white shadow-sm text-foreground">
                    <span className="mr-2">📋</span>
                    רשימה
                </Button>
                <Button variant="ghost" size="sm" className="h-7 hover:bg-white/50 text-muted-foreground">
                    <span className="mr-2">📅</span>
                    לוח
                </Button>
                <Button variant="ghost" size="sm" className="h-7 hover:bg-white/50 text-muted-foreground">
                    <span className="mr-2">🗓️</span>
                    לוח שנה
                </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-r border-border pr-2 mr-2">
                <Button variant="primary" size="sm" className="h-8">
                    + משימה חדשה
                </Button>
            </div>
        </header>
    );
}
