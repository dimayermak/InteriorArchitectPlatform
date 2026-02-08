'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Home, Bell, Inbox, ChevronRight, ChevronLeft, Plus } from 'lucide-react';

// Navigation Items
const boards = [
    { id: 'b-1', name: 'דשבורד', type: 'board', color: 'bg-green-500', path: '/dashboard' },
    { id: 'b-2', name: 'פרויקטים', type: 'board', color: 'bg-emerald-500', path: '/projects' },
    { id: 'b-3', name: 'לידים', type: 'board', color: 'bg-purple-500', path: '/leads' },
    { id: 'b-4', name: 'לקוחות', type: 'board', color: 'bg-blue-500', path: '/clients' },
    { id: 'b-5', name: 'מעקב זמן', type: 'board', color: 'bg-orange-500', path: '/time' },
    { id: 'b-6', name: 'כספים', type: 'board', color: 'bg-yellow-500', path: '/finance' },
    { id: 'b-7', name: 'ספקים', type: 'board', color: 'bg-cyan-500', path: '/suppliers' },
    { id: 'b-8', name: 'צוות', type: 'board', color: 'bg-pink-500', path: '/team' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className="fixed inset-y-0 right-0 z-50 flex h-full font-sans border-l border-border shadow-xl shadow-black/5"
            role="navigation"
            aria-label="תפריט ראשי"
        >
            {/* 1. Global Rail (Dark Theme) - Rightmost */}
            <div className="flex w-16 flex-col items-center bg-[#2B2C43] py-4 text-white z-20">
                <Link href="/dashboard" className="mb-6 group" aria-label="דף הבית">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-transform duration-200 group-hover:scale-105">
                        H
                    </div>
                </Link>

                <nav className="flex flex-1 flex-col gap-2 w-full px-2" aria-label="ניווט מהיר">
                    <RailItem
                        icon={<Home className="w-5 h-5" />}
                        active={pathname === '/dashboard'}
                        tooltip="דף הבית"
                        href="/dashboard"
                    />
                    <RailItem
                        icon={<Bell className="w-5 h-5" />}
                        tooltip="התראות"
                    />
                    <RailItem
                        icon={<Inbox className="w-5 h-5" />}
                        tooltip="תיבת דואר"
                    />
                </nav>

                <div className="mt-auto flex flex-col gap-4 w-full px-2 mb-4">
                    <button
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-500 mx-auto border-2 border-white/20 hover:scale-105 transition-transform duration-200"
                        aria-label="פרופיל משתמש"
                    />
                </div>
            </div>

            {/* 2. Workspace Panel (White, Collapsible) */}
            <div className={cn(
                "flex flex-col bg-card transition-all duration-200 relative z-10",
                collapsed ? "w-0 opacity-0 overflow-hidden" : "w-64 opacity-100"
            )}>
                {/* Workspace Header */}
                <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-muted/30">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                        <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">M</span>
                        <span className="truncate">החלל שלי</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setCollapsed(true)}
                        aria-label="כווץ תפריט"
                    >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>

                {/* Quick Create Button */}
                <div className="p-3">
                    <Button className="w-full justify-start gap-3 rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5" aria-hidden="true" />
                        יצירת חדש
                    </Button>
                </div>

                {/* Navigation Tree */}
                <nav className="flex-1 overflow-y-auto px-2 py-2 theme-scrollbar" aria-label="לוחות ומסמכים">
                    {/* Favorites Section */}
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                        <span className="text-[10px]" aria-hidden="true">▼</span>
                        <span>מועדפים</span>
                    </div>

                    {/* Boards Section */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors group">
                            <span className="text-[10px]" aria-hidden="true">▼</span>
                            <span>לוחות ומסמכים</span>
                            <span className="mr-auto opacity-0 group-hover:opacity-100 text-xs text-muted-foreground" aria-hidden="true">+</span>
                        </div>

                        <ul className="mr-4 mt-1 border-r-2 border-border pr-2 space-y-1">
                            {boards.map(board => (
                                <li key={board.id}>
                                    <Link
                                        href={board.path}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                                            pathname === board.path
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                        aria-current={pathname === board.path ? "page" : undefined}
                                    >
                                        <span className={cn("w-2 h-2 rounded-full shrink-0", board.color)} aria-hidden="true" />
                                        {board.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* Trial Progress Bar */}
                <div className="p-4 bg-muted/20 border-t border-border">
                    <div className="text-xs font-medium mb-2 flex justify-between">
                        <span>תוכנית PRO</span>
                        <span className="text-primary tabular-nums">נותרו 14 יום</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-l from-primary to-secondary w-1/2 rounded-full"
                            role="progressbar"
                            aria-valuenow={50}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="זמן נותר בתקופת הניסיון"
                        />
                    </div>
                </div>
            </div>

            {/* Expand Button (When Collapsed) */}
            {collapsed && (
                <button
                    type="button"
                    onClick={() => setCollapsed(false)}
                    className="absolute top-4 right-20 z-30 bg-card shadow-md border border-border rounded-lg p-2 text-primary hover:bg-muted transition-colors"
                    aria-label="הרחב תפריט"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}
        </aside>
    );
}

interface RailItemProps {
    icon: React.ReactNode;
    active?: boolean;
    tooltip?: string;
    href?: string;
}

function RailItem({ icon, active, tooltip, href }: RailItemProps) {
    const content = (
        <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200 relative group",
            active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
        )}>
            {icon}

            {/* Active Indicator */}
            {active && (
                <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-l-full"
                    aria-hidden="true"
                />
            )}

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="absolute left-full mr-2 bg-[#2B2C43] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10"
                    role="tooltip"
                >
                    {tooltip}
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} aria-label={tooltip} aria-current={active ? "page" : undefined}>
                {content}
            </Link>
        );
    }

    return <button type="button" aria-label={tooltip}>{content}</button>;
}
