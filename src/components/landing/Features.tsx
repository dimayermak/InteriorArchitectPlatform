'use client';

import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    CreditCard,
    LayoutDashboard,
    Clock,
    Briefcase,
    Building2,
    UserSearch,
    Share2,
    Bot,
} from 'lucide-react';

const features = [
    {
        icon: LayoutDashboard,
        title: 'דשבורד מנהלים',
        description: 'מבט על על העסק שלכם. גרפים עדכניים על לידים, פרויקטים פעילים, הכנסות, הוצאות ומשימות פתוחות — הכל במסך אחד.',
        color: 'bg-pink-500/10 text-pink-600',
        bullets: ['סטטיסטיקות פרויקטים בזמן אמת', 'גרפי המרת לידים', 'התראות על משימות'],
    },
    {
        icon: Briefcase,
        title: 'ניהול פרויקטים מלא',
        description: 'שלבי פרויקט, משימות, מעקב התקדמות ופורטל לקוח ייחודי שמאפשר ללקוח לראות את הדוח שלו בזמן אמת.',
        color: 'bg-emerald-500/10 text-emerald-600',
        bullets: ['שלבים (Phases) ומשימות', 'גאנט לפורטל הלקוח', 'קישור שיתוף לפרויקט'],
    },
    {
        icon: UserSearch,
        title: 'ניהול לידים',
        description: 'פייפליין מסודר לכל הלידים הנכנסים. מעקב אחרי כל שלב עד לסגירת עסקה והפיכת ליד ללקוח.',
        color: 'bg-purple-500/10 text-purple-600',
        bullets: ['שלבי פייפליין מותאמים', 'מידע מלא על כל ליד', 'המרה ללקוח בקליק'],
    },
    {
        icon: Users,
        title: 'CRM לניהול לקוחות',
        description: 'כל המידע על הלקוח במקום אחד — פרטי קשר, פרויקטים, שעות עבודה שהושקעו ועוד.',
        color: 'bg-blue-500/10 text-blue-600',
        bullets: ['פרופיל לקוח מלא', 'היסטוריית פרויקטים ושעות', 'גרפים ונתוני לקוח'],
    },
    {
        icon: CreditCard,
        title: 'כספים ורכש',
        description: 'חשבוניות, הזמנות רכש והוצאות כולן מנוהלות במקום אחד. ראו בדיוק מה הרווחתם בכל פרויקט.',
        color: 'bg-green-500/10 text-green-600',
        bullets: ['חשבוניות ולקוחות', 'הזמנות רכש לספקים', 'מעקב תקציב לפרויקט'],
    },
    {
        icon: Clock,
        title: 'מעקב זמן',
        description: 'תיעוד שעות עבודה לכל פרויקט ולקוח. דעו בדיוק כמה זמן הושקע וכמה כדאי לחייב.',
        color: 'bg-orange-500/10 text-orange-600',
        bullets: ['רישום שעות לפי פרויקט', 'מסנני תצוגה גמישים', 'סטטיסטיקות שבועיות ויומיות'],
    },
    {
        icon: Calendar,
        title: 'לוח שנה',
        description: 'ניהול אירועים ופגישות עם כל הצוות. תצוגת יומן מסודרת לכל הפעילות העסקית שלכם.',
        color: 'bg-red-500/10 text-red-600',
        bullets: ['יומן אירועים ופגישות', 'תצוגה שבועית וחודשית', 'שיוך לפרויקטים ולקוחות'],
    },
    {
        icon: Building2,
        title: 'ניהול ספקים',
        description: 'רשימת ספקים מסודרת עם פרטי קשר, מוצרים וקטגוריות. הזמנות רכש ישירות ממסך הספק.',
        color: 'bg-cyan-500/10 text-cyan-600',
        bullets: ['פרופיל ספק מלא', 'קישור להזמנות רכש', 'חיפוש וסינון מהיר'],
    },
    {
        icon: Share2,
        title: 'פורטל לקוח',
        description: 'שתפו ללקוח קישור ייחודי שמציג לו את התקדמות הפרויקט, תקציב, גאנט, אירועים ואומדני אספקה.',
        color: 'bg-indigo-500/10 text-indigo-600',
        bullets: ['ללא צורך בלוגין ללקוח', 'תצוגה ציבורית בטוחה', 'קישור שניתן לשתף מיד'],
    },
    {
        icon: Bot,
        title: 'סוכן AI',
        description: 'עוזר AI מובנה שעוקב אחרי פעילות המערכת, מציע תובנות ומסייע לכם לנהל את הסטודיו בחוכמה.',
        color: 'bg-amber-500/10 text-amber-600',
        bullets: ['פיד פעילות בזמן אמת', 'הגדרות והתאמה אישית', 'רחש AI בתוך הפלטפורמה'],
    },
];

export default function Features() {

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
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
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
                    >
                        10 מודולים מובנים
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
                    >
                        ארגז הכלים המלא לסטודיו
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground"
                    >
                        כל מה שצריך כדי לנהל סטודיו לאדריכלות ועיצוב פנים, בלי להתפזר בין עשרות תוכנות.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={item}
                                className="group p-7 rounded-3xl border border-border/50 bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />

                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feature.color}`}>
                                    <Icon size={24} />
                                </div>

                                <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                                    {feature.description}
                                </p>

                                <ul className="space-y-1">
                                    {feature.bullets.map((b, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
