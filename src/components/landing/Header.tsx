'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, it usually does in shadcn/ui setups. If not I'll use template literals.

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300",
                scrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm py-3"
                    : "bg-transparent py-5"
            )}
            dir="rtl"
        >
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
                    H
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">Harmonica</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                <NavLink href="#features">פיצ'רים</NavLink>
                <NavLink href="#audience">למי זה מתאים?</NavLink>
                <NavLink href="#support">בונוסים</NavLink>
                {/* <NavLink href="#pricing">מחירים</NavLink> */}
            </div>

            <div className="flex items-center gap-4">
                <Link
                    href="/login"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block"
                >
                    התחברות
                </Link>
                <Link href="/register">
                    <Button size="sm" className={cn("rounded-full font-bold transition-all duration-200", scrolled ? "shadow-md" : "shadow-lg shadow-primary/20")}>
                        ניסיון חינם
                    </Button>
                </Link>
            </div>
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="relative text-foreground/80 hover:text-foreground transition-colors group py-2"
        >
            {children}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
        </Link>
    );
}
