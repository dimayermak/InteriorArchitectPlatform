'use client';

import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    CreditCard,
    FileText,
    LayoutDashboard,
    ShieldCheck
} from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'CRM חכם לניהול לקוחות',
        description: 'כל המידע על הלקוחות במקום אחד. היסטוריית שיחות, העדפות עיצוביות, ומעקב אחרי הליד עד לסגירת חוזה.',
        color: 'bg-blue-500/10 text-blue-600',
    },
    {
        icon: Calendar,
        title: 'גאנט פרויקטים מתקדם',
        description: 'תכנון לו"ז פרויקט בקלות. סנכרון עם יומן Google, הקצאת משימות לצוות ומעקב אחר אבני דרך קריטיות.',
        color: 'bg-orange-500/10 text-orange-600',
    },
    {
        icon: CreditCard,
        title: 'ניהול תקציב ורכש',
        description: 'מעקב הוצאות מדויק. הפקת דוחות רווחיות לכל פרויקט וניהול ספקים ללא כאב ראש מיותר.',
        color: 'bg-green-500/10 text-green-600',
    },
    {
        icon: FileText,
        title: 'חוזים והצעות מחיר',
        description: 'מחולל מסמכים אוטומטי. יצירת הצעות מחיר מעוצבות ושליחתן לחתימה דיגיטלית ישירות מהמערכת.',
        color: 'bg-purple-500/10 text-purple-600',
    },
    {
        icon: LayoutDashboard,
        title: 'דשבורד מנהלים',
        description: 'מבט על העסק שלך. גרפים ונתונים על ביצועים, המרות לידים, ומשימות פתוחות לטיפול מיידי.',
        color: 'bg-pink-500/10 text-pink-600',
    },
    {
        icon: ShieldCheck,
        title: 'אבטחה ופרטיות',
        description: 'המידע שלכם ושל הלקוחות שלכם מאובטח ברמה הגבוהה ביותר. גיבויים אוטומטיים ושליטה מלאה בהרשאות.',
        color: 'bg-cyan-500/10 text-cyan-600',
    },
];

export default function Features() {

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="py-24 bg-background" id="features" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
                    >
                        ארגז הכלים המלא לעסק
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground"
                    >
                        כל מה שצריך כדי לנהל סטודיו לאדריכלות ועיצוב, בלי להתפזר בין עשרות תוכנות.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={item}
                                className="group p-8 rounded-3xl border border-border/50 bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                                    <Icon size={28} />
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
