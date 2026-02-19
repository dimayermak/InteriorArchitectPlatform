'use client';

import { motion } from 'framer-motion';
import { XCircle, CheckCircle, Clock, FolderX, DollarSign, Users, LayoutDashboard, Share2, CreditCard, Bot } from 'lucide-react';

const painPoints = [
    { icon: FolderX, text: 'לידים שהלכו לאיבוד בלי מעקב', color: 'text-red-500' },
    { icon: Clock, text: 'שעות עבודה לא מתועדות', color: 'text-orange-500' },
    { icon: DollarSign, text: 'חשבוניות ורכש בגיליון אקסל', color: 'text-yellow-500' },
    { icon: Users, text: 'הלקוח שואל "מה קורה?" כל שבוע', color: 'text-pink-500' },
];

const solutionPoints = [
    { icon: LayoutDashboard, text: 'דשבורד עם כל המידע בזמן אמת', color: 'text-blue-500' },
    { icon: CreditCard, text: 'כספים, חשבוניות ורכש בפלטפורמה', color: 'text-green-500' },
    { icon: Share2, text: 'פורטל לקוח — שקיפות ללא מאמץ', color: 'text-purple-500' },
    { icon: Bot, text: 'סוכן AI שעוזר לנהל חכם יותר', color: 'text-cyan-500' },
];

export default function ProblemAgitation() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden" dir="rtl">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
                    >
                        מרגישים שהסטודיו מנהל אתכם?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground"
                    >
                        רוב המעצבים מבלים 40% מהזמן שלהם בניהול אדמיניסטרטיבי במקום בעיצוב.
                        <br className="hidden md:block" />
                        הגיע הזמן לעבור מכיבוי שריפות לניהול מבוקר.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                    {/* The Chaos (Before) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, rotate: 2 }}
                        whileInView={{ opacity: 1, x: 0, rotate: -1 }}
                        viewport={{ once: true }}
                        className="bg-red-50/50 border border-red-100 p-8 rounded-3xl relative"
                    >
                        <div className="absolute -top-4 -right-4 bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm font-bold rotate-3 shadow-sm">
                            לפני הרמוניקה 😫
                        </div>
                        <div className="space-y-6">
                            {painPoints.map((point, index) => {
                                const Icon = point.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className="flex items-center gap-4 bg-white/60 p-3 rounded-xl shadow-sm"
                                    >
                                        <div className={`p-2 rounded-lg bg-white shadow-sm ${point.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <span className="font-medium text-slate-700">{point.text}</span>
                                        <XCircle className="mr-auto text-red-400 opacity-50" size={18} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* The Order (After) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50, rotate: -2 }}
                        whileInView={{ opacity: 1, x: 0, rotate: 1 }}
                        viewport={{ once: true }}
                        className="bg-white border border-blue-100 p-8 rounded-3xl relative shadow-xl shadow-blue-500/5 ring-1 ring-blue-100"
                    >
                        <div className="absolute -top-4 -left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold -rotate-3 shadow-lg shadow-blue-500/20">
                            עם הרמוניקה 🤩
                        </div>
                        <div className="space-y-6">
                            {solutionPoints.map((point, index) => {
                                const Icon = point.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className="flex items-center gap-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100"
                                    >
                                        <div className={`p-2 rounded-lg bg-white shadow-sm ${point.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <span className="font-medium text-slate-800">{point.text}</span>
                                        <CheckCircle className="mr-auto text-blue-500" size={18} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
