'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, LayoutDashboard, Clock, Share2, Bot } from 'lucide-react';

const stats = [
    { value: '10', label: 'מודולים מובנים' },
    { value: '100%', label: 'בעברית RTL' },
    { value: '∞', label: 'פרויקטים ולקוחות' },
];

export default function Hero() {
    return (
        <section
            dir="rtl"
            className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20 lg:pt-32 pb-20"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/10 rounded-full blur-[100px] opacity-60 animate-pulse-slow" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[120px] -z-10" />
            </div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-sm font-semibold tracking-wide">פלטפורמה All-in-One לאדריכלים ומעצבי פנים</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tight leading-[1.1] mb-8 max-w-5xl mx-auto"
                >
                    נהלו סטודיו
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-600 pb-2">
                        בסטנדרט עולמי
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
                >
                    מניהול לידים ולקוחות, דרך פרויקטים ומשימות עם גאנט,
                    <br className="hidden md:block" />
                    ועד למעקב כספי מלא — הכל בפלטפורמה אחת בעברית.
                </motion.p>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="flex justify-center gap-10 mb-12"
                >
                    {stats.map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl font-black text-foreground">{s.value}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link href="/register">
                        <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                            מתחילים בחינם
                            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button variant="ghost" size="lg" className="rounded-full px-8 h-14 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                            גלו את הפיצ&#39;רים
                        </Button>
                    </Link>
                </motion.div>

                {/* Floating Feature Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                    className="mt-20 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
                >
                    {[
                        { icon: LayoutDashboard, label: 'דשבורד' },
                        { icon: null, label: '🏗️ פרויקטים + גאנט' },
                        { icon: null, label: '👥 CRM לקוחות' },
                        { icon: null, label: '📋 ניהול לידים' },
                        { icon: Clock, label: 'מעקב זמן' },
                        { icon: null, label: '💰 כספים ורכש' },
                        { icon: null, label: '📅 לוח שנה' },
                        { icon: Share2, label: 'פורטל לקוח' },
                        { icon: null, label: '🏢 ספקים' },
                        { icon: Bot, label: 'סוכן AI' },
                    ].map((pill, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 + i * 0.06 }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border/60 text-sm font-medium text-foreground shadow-sm"
                        >
                            {pill.icon ? <pill.icon className="w-3.5 h-3.5 text-primary" /> : null}
                            {pill.label}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
