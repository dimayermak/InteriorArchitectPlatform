'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Plus, ChevronLeft, FolderKanban, Target, CheckSquare, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// Route name mapping
const routeNames: Record<string, string> = {
    dashboard: 'דשבורד',
    projects: 'פרויקטים',
    calendar: 'לוח שנה',
    leads: 'לידים',
    clients: 'לקוחות',
    time: 'מעקב זמן',
    finance: 'כספים',
    suppliers: 'ספקים',
    team: 'צוות',
    templates: 'תבניות',
    settings: 'הגדרות',
    tasks: 'משימות',
    new: 'חדש',
};

// Detect UUID segments
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Determine entity type from the parent route segment
function getEntityType(parentSegment: string): string | null {
    const map: Record<string, string> = {
        projects: 'projects',
        leads: 'leads',
        clients: 'clients',
    };
    return map[parentSegment] || null;
}

const quickCreateItems = [
    { label: 'פרויקט חדש', icon: <FolderKanban className="w-4 h-4" />, href: '/projects/new', color: 'text-emerald-600' },
    { label: 'ליד חדש', icon: <Target className="w-4 h-4" />, href: '/leads/new', color: 'text-purple-600' },
    { label: 'לקוח חדש', icon: <Users className="w-4 h-4" />, href: '/clients', color: 'text-blue-600' },
    { label: 'משימה חדשה', icon: <CheckSquare className="w-4 h-4" />, href: '/tasks/new', color: 'text-orange-600' },
];

export function TopNav() {
    const pathname = usePathname();
    const [quickCreateOpen, setQuickCreateOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [entityNames, setEntityNames] = useState<Record<string, string>>({});

    // Build breadcrumbs from path
    const segments = pathname.split('/').filter(Boolean);

    // Fetch entity names for UUID segments
    useEffect(() => {
        async function fetchNames() {
            const uuidSegments = segments.filter(s => UUID_REGEX.test(s));
            if (uuidSegments.length === 0) return;

            const supabase = createClient();
            const newNames: Record<string, string> = {};

            for (const uuid of uuidSegments) {
                // Find parent segment to know which table to query
                const uuidIndex = segments.indexOf(uuid);
                const parentSegment = uuidIndex > 0 ? segments[uuidIndex - 1] : null;
                if (!parentSegment) continue;

                const entityType = getEntityType(parentSegment);
                if (!entityType) continue;

                try {
                    const { data } = await supabase
                        .from(entityType)
                        .select('name')
                        .eq('id', uuid)
                        .single();
                    if (data?.name) {
                        newNames[uuid] = data.name;
                    }
                } catch {
                    // Silently fail — will show shortened UUID
                }
            }

            if (Object.keys(newNames).length > 0) {
                setEntityNames(prev => ({ ...prev, ...newNames }));
            }
        }

        fetchNames();
    }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    const breadcrumbs = segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        let name: string;

        if (UUID_REGEX.test(segment)) {
            // Use fetched name, or shortened UUID as fallback
            name = entityNames[segment] || segment.slice(0, 8) + '...';
        } else {
            name = routeNames[segment] || segment;
        }

        const isLast = index === segments.length - 1;
        return { name, path, isLast };
    });

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/60 bg-white/80 backdrop-blur-xl px-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-sm" aria-label="breadcrumbs">
                {breadcrumbs.map((crumb, i) => (
                    <div key={crumb.path} className="flex items-center gap-1.5">
                        {i > 0 && (
                            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/40" />
                        )}
                        {crumb.isLast ? (
                            <span className="font-semibold text-foreground">{crumb.name}</span>
                        ) : (
                            <Link
                                href={crumb.path}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {crumb.name}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            <div className="flex-1" />

            {/* Search Bar */}
            <div className={cn(
                "relative flex items-center transition-all duration-200",
                searchFocused ? "w-72" : "w-56"
            )}>
                <Search className="absolute right-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                    type="text"
                    placeholder="חיפוש..."
                    className="w-full h-9 pr-9 pl-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary/30 focus:bg-white text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                />
                <kbd className="absolute left-3 hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/50 font-mono">
                    ⌘K
                </kbd>
            </div>

            {/* Quick Create */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                    className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                    aria-label="יצירה מהירה"
                >
                    <Plus className="w-4 h-4" />
                </button>
                {quickCreateOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setQuickCreateOpen(false)} />
                        <div className="absolute left-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-scale-in">
                            {quickCreateItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setQuickCreateOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
                                >
                                    <span className={item.color}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Notifications */}
            <button
                type="button"
                className="relative h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="התראות"
            >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
        </header>
    );
}
