'use client';

import { motion } from 'framer-motion';
import { Video, UserCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const supports = [
    {
        icon: Video,
        title: 'קורס אונליין מלא',
        description: 'גישה לפורטל הדרכות וידאו מקיף ללמידה בקצב שלכם, ללא הגבלת זמן.',
        gradient: 'from-purple-500 to-indigo-500',
    },
    {
        icon: UserCheck,
        title: 'אונבורדינג בזום',
        description: 'שיחת הטמעה אישית עם הצוות שלנו — נגדיר יחד את הסטודיו, נייבא נתונים ונוודא שהכל עובד מיום אחד.',
        gradient: 'from-pink-500 to-rose-500',
    },
    {
        icon: Mail,
        title: 'תמיכה טכנית מלאה',
        description: 'זמינים לכל שאלה במייל ובווטסאפ למשך 120 יום מרגע הרכישה.',
        gradient: 'from-amber-500 to-orange-500',
    },
];

export default function Support() {
    return (
        <section className="py-24 bg-muted/50" id="support" dir="rtl">
            <div className="container mx-auto px-4">

                <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[2.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-sm font-medium mb-8 border border-white/10"
                        >
                            🎁 חבילת בונוסים בלעדית
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold mb-8"
                        >
                            אנחנו איתכם, יד ביד.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-indigo-100 mb-16 leading-relaxed opacity-90"
                        >
                            לא זורקים אתכם למים. מעבר לטמפלט, אתם מקבלים את כל הידע והתמיכה להצלחה בטוחה.
                        </motion.p>

                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {supports.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors duration-300"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 bg-gradient-to-br ${item.gradient} shadow-lg mx-auto md:mx-0`}>
                                            <Icon size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-right">{item.title}</h3>
                                        <p className="text-indigo-200 text-sm leading-relaxed text-right opacity-80">
                                            {item.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                        >
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="rounded-full px-12 h-14 text-lg bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    אני רוצה להתחיל עכשיו
                                </Button>
                            </Link>
                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    );
}
