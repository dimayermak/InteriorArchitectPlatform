'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const plans = [
    {
        name: 'Starter',
        nameHe: 'התחלה',
        price: '₪149',
        period: '/ חודש',
        description: 'מתאים לעצמאי שמנהל פרויקטים בודדים',
        highlight: false,
        features: [
            'עד 5 פרויקטים פעילים',
            'עד 30 לידים',
            'ניהול לקוחות בסיסי',
            'מעקב זמן',
            'כספים (חשבוניות + הוצאות)',
            'לוח שנה',
            'פורטל לקוח לכל פרויקט',
            'תמיכה במייל',
        ],
        cta: 'התחילו עכשיו',
        ctaLink: '/register',
    },
    {
        name: 'Studio',
        nameHe: 'סטודיו',
        price: '₪349',
        period: '/ חודש',
        description: 'לסטודיו פעיל עם צוות ולקוחות מרובים',
        highlight: true,
        badge: 'הכי פופולרי',
        features: [
            'פרויקטים ולקוחות ללא הגבלה',
            'לידים ללא הגבלה',
            'ניהול צוות מלא',
            'ניהול ספקים והזמנות רכש',
            'תבניות מותאמות אישית',
            'דשבורד ניהולי מרכזי',
            'סוכן AI מובנה',
            'פורטל לקוח מתקדם',
            'אונבורדינג אישי בזום',
            'תמיכה מועדפת',
        ],
        cta: 'התחילו עכשיו',
        ctaLink: '/register',
    },
    {
        name: 'Enterprise',
        nameHe: 'ארגוני',
        price: 'בהתאמה',
        period: '',
        description: 'לרשתות סטודיואים ופרויקטים גדולים',
        highlight: false,
        features: [
            'הכל ב-Studio',
            'ארגון מרובה סניפים',
            'SLA מובטח',
            'הטמעה מלאה על ידי הצוות',
            'API גישה',
            'דוחות מותאמים',
            'מנהל לקוח ייעודי',
        ],
        cta: 'צרו קשר',
        ctaLink: 'mailto:hello@harmonica.app',
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background" dir="rtl">
            <Header />

            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4">

                    {/* Header */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
                        >
                            מחירים פשוטים ושקופים
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-6"
                        >
                            בחרו את התוכנית
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-600">
                                שמתאימה לכם
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-muted-foreground"
                        >
                            כל התוכניות כוללות את כל 10 המודולים של הפלטפורמה. ניתן לשדרג או לבטל בכל עת.
                        </motion.p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + index * 0.1 }}
                                className={`relative rounded-3xl p-8 flex flex-col ${plan.highlight
                                        ? 'bg-gradient-to-b from-primary to-purple-700 text-white shadow-2xl shadow-primary/30 scale-105'
                                        : 'bg-card border border-border/50 shadow-sm'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                        {plan.badge}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <p className={`text-sm font-medium mb-1 ${plan.highlight ? 'text-white/70' : 'text-muted-foreground'}`}>
                                        {plan.name} — {plan.nameHe}
                                    </p>
                                    <div className="flex items-end gap-1 mb-3">
                                        <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-foreground'}`}>
                                            {plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className={`text-sm mb-1 ${plan.highlight ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-muted-foreground'}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-white/20' : 'bg-primary/10'
                                                }`}>
                                                <Check className={`w-3 h-3 ${plan.highlight ? 'text-white' : 'text-primary'}`} />
                                            </span>
                                            <span className={plan.highlight ? 'text-white/90' : 'text-foreground'}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href={plan.ctaLink}>
                                    <Button
                                        size="lg"
                                        className={`w-full rounded-2xl font-bold text-base ${plan.highlight
                                                ? 'bg-white text-primary hover:bg-white/90'
                                                : ''
                                            }`}
                                        variant={plan.highlight ? undefined : 'outline'}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center text-sm text-muted-foreground mt-12"
                    >
                        כל המחירים כוללים מע&quot;מ • ניתן לשדרג בכל עת • תמיכה בעברית
                    </motion.p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
