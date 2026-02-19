'use client';

import { motion } from 'framer-motion';
import { UserPlus, Briefcase, CreditCard, Share2 } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        title: 'ליד נכנס — מנהלים אותו',
        description: 'כל ליד חדש נרשם בפייפליין הלידים עם פרטי קשר, מקור ושלב. עוקבים אחרי ההתקדמות עד לסגירה והפיכה ללקוח.',
        gradient: 'from-blue-500 to-cyan-400',
    },
    {
        icon: Briefcase,
        title: 'פרויקט — שלבים ומשימות',
        description: 'יוצרים פרויקט, מפרקים לשלבים (Phases) ומשימות, ומקצים לצוות. מעקב התקדמות ברור לכם ולסטודיו.',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        icon: CreditCard,
        title: 'כספים — חשבוניות ורכש',
        description: 'מנהלים חשבוניות ללקוחות, הזמנות רכש לספקים והוצאות — ורואים בדיוק מה הרווחתם בכל פרויקט.',
        gradient: 'from-orange-500 to-amber-500',
    },
    {
        icon: Share2,
        title: 'פורטל לקוח — שקיפות מלאה',
        description: 'שולחים ללקוח קישור ייחודי שמציג לו את התקדמות הפרויקט, תקציב, גאנט ואירועים — בלי שצריך להתחבר.',
        gradient: 'from-green-500 to-emerald-400',
    },
];

export default function Workflow() {
    return (
        <section className="py-24 relative" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
                    >
                        תהליך עבודה אמיתי
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
                    >
                        מליד ועד פורטל לקוח
                    </motion.h2>
                    <p className="text-lg text-muted-foreground">
                        הפלטפורמה מובילה אתכם לאורך כל מחזור החיים של הפרויקט — משלב הגיוס ועד לשקיפות מלאה עם הלקוח.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute top-0 bottom-0 right-8 md:right-1/2 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent hidden md:block" />

                    <div className="space-y-12 md:space-y-24">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                        }`}
                                >
                                    {/* Icon Circle */}
                                    <div className="relative z-10 shrink-0">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg bg-gradient-to-br ${step.gradient}`}>
                                            <Icon size={32} />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Content Box */}
                                    <div className="flex-1 text-center md:text-right pt-4">
                                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Empty Flex Item for alternating layout */}
                                    <div className="flex-1 hidden md:block" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
