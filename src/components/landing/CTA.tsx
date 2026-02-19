'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function CTA() {
    return (
        <section className="py-24 relative overflow-hidden text-center" dir="rtl">
            {/* Background */}
            <div className="absolute inset-0 bg-primary/5 -z-20" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-purple-500/10 to-blue-500/10 -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-card border border-border/50 rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative bg blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full font-medium text-sm mb-8 border border-primary/20">
                        <Sparkles size={16} />
                        <span>הצטרפו למהפכה</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold mb-8 text-foreground tracking-tight">
                        מוכנים לקחת את הסטודיו <br className="hidden md:block" />
                        <span className="text-primary">לרמה הבאה?</span>
                    </h2>

                    <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                        אל תישארו מאחור. הצטרפו למאות אדריכלים ומעצבים שכבר עברו לניהול חכם, יעיל ורווחי יותר.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="rounded-full px-12 h-16 text-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                                התחילו עכשיו
                                <ArrowLeft className="mr-2 h-6 w-6" />
                            </Button>
                        </Link>
                    </div>



                </motion.div>
            </div>
        </section>
    );
}
