'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border/50 py-12 px-6" dir="rtl">
            <div className="container mx-auto flex flex-col items-center justify-between gap-8 md:flex-row max-w-7xl">
                <div className="flex flex-col items-center gap-4 md:items-start text-center md:text-right">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            H
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">Harmonica</span>
                    </Link>
                    <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                        פלטפורמת הניהול המובילה לאדריכלים ומעצבי פנים. מביאים סדר ושקט לסטודיו שלכם.
                    </p>
                </div>

                <div className="flex gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="#" className="hover:text-primary transition-colors">תנאי שימוש</Link>
                    <Link href="#" className="hover:text-primary transition-colors">פרטיות</Link>
                    <Link href="#" className="hover:text-primary transition-colors">צור קשר</Link>
                </div>

                <div className="flex gap-4">
                    {/* Social Icons */}
                    <SocialIcon href="#" Icon={Instagram} />
                    <SocialIcon href="#" Icon={Facebook} />
                    <SocialIcon href="#" Icon={Linkedin} />
                </div>
            </div>

            <div className="border-t border-border/30 mt-12 pt-8 text-center text-sm text-muted-foreground/60">
                © {new Date().getFullYear()} Harmonica. כל הזכויות שמורות. נבנה באהבה בישראל 🇮🇱
            </div>
        </footer>
    );
}

function SocialIcon({ href, Icon }: { href: string; Icon: any }) {
    return (
        <a href={href} className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors">
            <Icon size={18} />
        </a>
    )
}
