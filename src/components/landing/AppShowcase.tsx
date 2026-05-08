'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { LayoutDashboard, FolderKanban, CreditCard, Target } from 'lucide-react';

const screens = [
    {
        id: 'dashboard',
        title: 'דשבורד חכם',
        description: 'סקירה מלאה של הביזנס — KPIs, גרפים ופעילות אחרונה',
        icon: LayoutDashboard,
        image: '/screenshots/dashboard.png',
        gradient: 'from-violet-500 to-purple-600',
        bgGlow: 'bg-violet-500/20',
    },
    {
        id: 'projects',
        title: 'ניהול פרויקטים',
        description: 'תוכנית עבודה, גאנט, ספקים, רכש ופיקוח — הכל בפרויקט אחד',
        icon: FolderKanban,
        image: '/screenshots/projects.png',
        gradient: 'from-emerald-500 to-teal-600',
        bgGlow: 'bg-emerald-500/20',
    },
    {
        id: 'finance',
        title: 'כספים וחשבוניות',
        description: 'מעקב חשבוניות, הוצאות, סטטוסי תשלום ורווחיות פר פרויקט',
        icon: CreditCard,
        image: '/screenshots/finance.png',
        gradient: 'from-amber-500 to-orange-600',
        bgGlow: 'bg-amber-500/20',
    },
    {
        id: 'leads',
        title: 'ניהול לידים',
        description: 'קנבן לידים עם מעקב מקור, סינון ומעבר ללקוח בקליק',
        icon: Target,
        image: '/screenshots/leads.png',
        gradient: 'from-pink-500 to-rose-600',
        bgGlow: 'bg-pink-500/20',
    },
];

export default function AppShowcase() {
    const [activeScreen, setActiveScreen] = useState(0);
    const active = screens[activeScreen];

    return (
        <section className="py-24 bg-gradient-to-b from-muted/30 to-background" id="showcase" dir="rtl">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
                    >
                        הצצה למערכת
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
                    >
                        הכירו את <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Harmonica</span> מבפנים
                    </motion.h2>
                    <p className="text-lg text-muted-foreground">
                        ממשק נקי, חכם ובעברית מלאה — שנבנה בדיוק בשביל סטודיו לעיצוב ואדריכלות.
                    </p>
                </div>

                {/* Screen Selector Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {screens.map((screen, index) => {
                        const Icon = screen.icon;
                        const isActive = index === activeScreen;
                        return (
                            <button
                                key={screen.id}
                                onClick={() => setActiveScreen(index)}
                                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                                    isActive
                                        ? `bg-gradient-to-r ${screen.gradient} text-white border-transparent shadow-lg shadow-primary/20 scale-105`
                                        : 'bg-card text-muted-foreground border-border/60 hover:border-border hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {screen.title}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Screenshot Display */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative max-w-5xl mx-auto"
                >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 ${active.bgGlow} rounded-[2rem] blur-[80px] opacity-40 -z-10 transition-colors duration-500`} />

                    {/* Browser frame */}
                    <div className="bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/40">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-background/50 text-xs text-muted-foreground/60 border border-border/30 min-w-[200px] justify-center">
                                    <span>🔒</span>
                                    <span>app.harmonica.studio/{active.id}</span>
                                </div>
                            </div>
                            <div className="w-16" />
                        </div>

                        {/* Screenshot */}
                        <div className="relative aspect-[16/10] bg-muted/20">
                            {screens.map((screen, index) => (
                                <div
                                    key={screen.id}
                                    className={`absolute inset-0 transition-opacity duration-500 ${
                                        index === activeScreen ? 'opacity-100' : 'opacity-0'
                                    }`}
                                >
                                    <Image
                                        src={screen.image}
                                        alt={screen.title}
                                        fill
                                        className="object-cover object-top"
                                        sizes="(max-width: 768px) 100vw, 1000px"
                                        priority={index === 0}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description card */}
                    <motion.div
                        key={activeScreen}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-8 text-center"
                    >
                        <h3 className="text-xl font-bold text-foreground mb-2">{active.title}</h3>
                        <p className="text-muted-foreground">{active.description}</p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
