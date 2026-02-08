'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

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
                    <span className="text-sm font-semibold tracking-wide">מערכת ההפעלה החדשה שלכם</span>
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
                    className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
                >
                    פלטפורמת All-in-One לאדריכלים ומעצבים.
                    <br className="hidden md:block" />
                    מניהול לידים וחוזים, דרך גאנט פרויקטים ועד למעקב רווחיות מדויק.
                </motion.p>

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
                            איך זה עובד?
                        </Button>
                    </Link>
                </motion.div>

                {/* Hero Image / Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="mt-20 relative mx-auto max-w-6xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
                    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2 md:p-4 rotate-x-12 perspective-1000 transform-gpu">
                        {/* Abstract UI representation */}
                        <div className="w-full aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center border border-border/30 relative">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-4">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <span className="text-4xl">🏗️</span>
                                </div>
                                <div className="text-muted-foreground text-sm font-medium">Dashboard Preview Placeholder</div>
                            </div>

                            {/* Floating UI Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="absolute top-[20%] left-[10%] bg-white p-4 rounded-xl shadow-lg border border-border/50 max-w-[200px]"
                            >
                                <div className="h-2 w-16 bg-green-500 rounded-full mb-2" />
                                <div className="h-3 w-24 bg-gray-200 rounded mb-1" />
                                <div className="h-2 w-12 bg-gray-100 rounded" />
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-[25%] right-[10%] bg-white p-4 rounded-xl shadow-lg border border-border/50 max-w-[200px]"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100" />
                                    <div>
                                        <div className="h-2 w-20 bg-gray-700/10 rounded mb-1" />
                                        <div className="h-2 w-12 bg-gray-500/10 rounded" />
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
