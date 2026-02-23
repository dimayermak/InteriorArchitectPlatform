'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
    LayoutDashboard, CalendarDays, Target, Users, FolderKanban, CheckSquare,
    Wallet, Clock, Truck, UserCog, FileText, Settings, ChevronDown, ChevronLeft,
    ChevronRight, Plus, Search, Bell, LogOut, Sparkles
} from 'lucide-react';
import AgentActivityFeed from '@/components/ai/AgentActivityFeed';
import AgentSettingsPanel from '@/components/ai/AgentSettingsPanel';
import { createClient } from '@/lib/supabase/client';

// Navigation Groups
interface NavItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    path: string;
    badge?: number;
}

interface NavGroup {
    id: string;
    label: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        id: 'core',
        label: 'ראשי',
        items: [
            { id: 'dashboard', name: 'דשבורד', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, path: '/dashboard' },
            { id: 'calendar', name: 'לוח שנה', icon: <CalendarDays className="w-[18px] h-[18px]" />, path: '/calendar' },
        ]
    },
    {
        id: 'crm',
        label: 'ניהול לקוחות',
        items: [
            { id: 'leads', name: 'לידים', icon: <Target className="w-[18px] h-[18px]" />, path: '/leads' },
            { id: 'clients', name: 'לקוחות', icon: <Users className="w-[18px] h-[18px]" />, path: '/clients' },
        ]
    },
    {
        id: 'work',
        label: 'פרויקטים ומשימות',
        items: [
            { id: 'projects', name: 'פרויקטים', icon: <FolderKanban className="w-[18px] h-[18px]" />, path: '/projects' },
            { id: 'tasks', name: 'משימות', icon: <CheckSquare className="w-[18px] h-[18px]" />, path: '/tasks' },
        ]
    },
    {
        id: 'finance',
        label: 'כספים',
        items: [
            { id: 'finance', name: 'כספים', icon: <Wallet className="w-[18px] h-[18px]" />, path: '/finance' },
            { id: 'time', name: 'מעקב זמן', icon: <Clock className="w-[18px] h-[18px]" />, path: '/time' },
        ]
    },
    {
        id: 'resources',
        label: 'משאבים',
        items: [
            { id: 'suppliers', name: 'ספקים', icon: <Truck className="w-[18px] h-[18px]" />, path: '/suppliers' },
            { id: 'team', name: 'צוות', icon: <UserCog className="w-[18px] h-[18px]" />, path: '/team' },
            { id: 'templates', name: 'תבניות', icon: <FileText className="w-[18px] h-[18px]" />, path: '/templates' },
        ]
    },
];

const TEMP_ORG_ID = '0df6e562-dc80-48b7-9018-2b4c8aad0d43';

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [agentPanelOpen, setAgentPanelOpen] = useState(false);
    const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [quickCreateOpen, setQuickCreateOpen] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUserId(data.user.id);
                setUserEmail(data.user.email || '');
                setUserName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User');
            }
        });
    }, []);

    const toggleGroup = (groupId: string) => {
        setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === path;
        return pathname.startsWith(path);
    };

    const quickCreateItems = [
        { label: 'פרויקט חדש', icon: <FolderKanban className="w-4 h-4" />, href: '/projects/new', color: 'text-emerald-500' },
        { label: 'ליד חדש', icon: <Target className="w-4 h-4" />, href: '/leads/new', color: 'text-purple-500' },
        { label: 'משימה חדשה', icon: <CheckSquare className="w-4 h-4" />, href: '/tasks/new', color: 'text-blue-500' },
    ];

    return (
        <>
            <aside
                className={cn(
                    "fixed inset-y-0 right-0 z-50 flex h-full font-sans transition-all duration-300 ease-out",
                    collapsed ? "w-[68px]" : "w-[300px]"
                )}
                role="navigation"
                aria-label="תפריט ראשי"
            >
                <div className={cn(
                    "flex flex-col w-full bg-[#1a1b2e] text-white overflow-hidden",
                    "shadow-[-4px_0_24px_rgba(0,0,0,0.12)]"
                )}>
                    {/* Header — Logo & Collapse */}
                    <div className="flex items-center h-16 px-4 border-b border-white/[0.06]">
                        <Link href="/dashboard" className="flex items-center gap-3 group flex-1 min-w-0">
                            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-violet-500/25 transition-transform duration-200 group-hover:scale-105">
                                IA
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold truncate">Interior Architect</span>
                                    <span className="text-[10px] text-white/40 truncate">פלטפורמת ניהול עסק</span>
                                </div>
                            )}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setCollapsed(!collapsed)}
                            className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                            aria-label={collapsed ? "הרחב תפריט" : "כווץ תפריט"}
                        >
                            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Quick Create */}
                    {!collapsed && (
                        <div className="px-3 py-3">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-l from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 text-white/90 hover:border-violet-500/40 hover:bg-violet-600/25 transition-all duration-200 text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4 text-violet-300" />
                                    <span>יצירה מהירה</span>
                                    <ChevronDown className={cn(
                                        "w-3.5 h-3.5 mr-auto text-white/40 transition-transform duration-200",
                                        quickCreateOpen && "rotate-180"
                                    )} />
                                </button>
                                {quickCreateOpen && (
                                    <div className="absolute top-full mt-1 right-0 left-0 bg-[#252640] border border-white/[0.08] rounded-xl shadow-xl shadow-black/20 py-1 z-10 animate-scale-in">
                                        {quickCreateItems.map(item => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setQuickCreateOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                                            >
                                                <span className={item.color}>{item.icon}</span>
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Collapsed Quick Create */}
                    {collapsed && (
                        <div className="flex justify-center py-3">
                            <Link
                                href="/projects/new"
                                className="h-9 w-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-300 hover:bg-violet-600/30 transition-colors"
                                title="יצירה מהירה"
                            >
                                <Plus className="w-4 h-4" />
                            </Link>
                        </div>
                    )}

                    {/* Navigation Groups */}
                    <nav className="flex-1 overflow-y-auto px-2 py-1 theme-scrollbar space-y-1" aria-label="ניווט ראשי">
                        {navGroups.map(group => (
                            <div key={group.id} className="mb-1">
                                {/* Group Header */}
                                {!collapsed && (
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.id)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/30 hover:text-white/50 transition-colors"
                                    >
                                        <ChevronDown className={cn(
                                            "w-3 h-3 transition-transform duration-200",
                                            collapsedGroups[group.id] && "-rotate-90"
                                        )} />
                                        <span>{group.label}</span>
                                    </button>
                                )}

                                {/* Group Items */}
                                {!collapsedGroups[group.id] && (
                                    <ul className="space-y-0.5">
                                        {group.items.map(item => {
                                            const active = isActive(item.path);
                                            return (
                                                <li key={item.id}>
                                                    <Link
                                                        href={item.path}
                                                        className={cn(
                                                            "flex items-center gap-3 rounded-xl transition-all duration-200 relative group",
                                                            collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5",
                                                            active
                                                                ? "bg-white/[0.1] text-white shadow-sm"
                                                                : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                                                        )}
                                                        aria-current={active ? "page" : undefined}
                                                    >
                                                        {/* Active indicator */}
                                                        {active && (
                                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-violet-400 rounded-l-full" />
                                                        )}

                                                        <span className={cn(
                                                            "shrink-0 transition-colors duration-200",
                                                            active ? "text-violet-300" : "text-white/40 group-hover:text-white/70"
                                                        )}>
                                                            {item.icon}
                                                        </span>

                                                        {!collapsed && (
                                                            <span className="text-sm font-medium truncate">{item.name}</span>
                                                        )}

                                                        {item.badge && !collapsed && (
                                                            <span className="mr-auto text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full font-medium">
                                                                {item.badge}
                                                            </span>
                                                        )}

                                                        {/* Tooltip (collapsed mode only) */}
                                                        {collapsed && (
                                                            <div className="absolute left-full mr-3 bg-[#252640] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/[0.08]">
                                                                {item.name}
                                                            </div>
                                                        )}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                {/* Collapsed separator */}
                                {collapsed && (
                                    <div className="mx-3 my-2 border-b border-white/[0.06]" />
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Bottom Section */}
                    <div className="border-t border-white/[0.06] p-2 space-y-1">
                        {/* AI Agent */}
                        <button
                            type="button"
                            onClick={() => setAgentPanelOpen(!agentPanelOpen)}
                            className={cn(
                                "flex items-center gap-3 w-full rounded-xl transition-all duration-200 relative group",
                                collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5",
                                agentPanelOpen
                                    ? "bg-violet-500/15 text-violet-300"
                                    : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                            )}
                            aria-label="סוכן AI"
                        >
                            <span className="relative shrink-0">
                                <Sparkles className="w-[18px] h-[18px]" />
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            </span>
                            {!collapsed && <span className="text-sm font-medium">סוכן AI</span>}
                            {collapsed && (
                                <div className="absolute left-full mr-3 bg-[#252640] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/[0.08]">
                                    סוכן AI
                                </div>
                            )}
                        </button>

                        {/* Settings */}
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-xl transition-all duration-200 relative group",
                                collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5",
                                pathname === '/settings'
                                    ? "bg-white/[0.1] text-white"
                                    : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                            )}
                        >
                            <Settings className="w-[18px] h-[18px] shrink-0" />
                            {!collapsed && <span className="text-sm font-medium">הגדרות</span>}
                            {collapsed && (
                                <div className="absolute left-full mr-3 bg-[#252640] text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/[0.08]">
                                    הגדרות
                                </div>
                            )}
                        </Link>

                        {/* User Profile */}
                        <div className={cn(
                            "flex items-center gap-3 rounded-xl p-2 mt-1 bg-white/[0.03] border border-white/[0.06]",
                            collapsed && "justify-center p-2"
                        )}>
                            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/90 truncate">{userName}</p>
                                    <p className="text-[10px] text-white/30 truncate">{userEmail}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* AI Agent Panels */}
            <AgentActivityFeed
                organizationId={TEMP_ORG_ID}
                userId={userId}
                isOpen={agentPanelOpen}
                onClose={() => setAgentPanelOpen(false)}
            />
            <AgentSettingsPanel
                organizationId={TEMP_ORG_ID}
                isOpen={agentSettingsOpen}
                onClose={() => setAgentSettingsOpen(false)}
            />
        </>
    );
}
