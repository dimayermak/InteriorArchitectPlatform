'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
    { name: 'דשבורד', href: '/dashboard', icon: '📊' },
    { name: 'לקוחות', href: '/clients', icon: '👥' },
    { name: 'לידים', href: '/leads', icon: '🎯' },
    { name: 'פרויקטים', href: '/projects', icon: '📋' },
    { name: 'משימות', href: '/tasks', icon: '✅' },
    { name: 'מעקב זמנים', href: '/time-tracking', icon: '⏱️' },
    { name: 'כספים', href: '/financials', icon: '💰' },
    { name: 'ספקים', href: '/suppliers', icon: '🏪' },
    { name: 'צוות', href: '/team', icon: '👷' },
];

const secondaryNavigation = [
    { name: 'הגדרות', href: '/settings', icon: '⚙️' },
    { name: 'עזרה', href: '/help', icon: '❓' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 hidden lg:block">
            {/* Logo */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-xl">📐</span>
                </div>
                <span className="font-display font-bold text-lg text-neutral-900 dark:text-white">
                    הרמוניקה
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col h-[calc(100vh-4rem)] p-4">
                <div className="flex-1 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Secondary Navigation */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
                    {secondaryNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
}
