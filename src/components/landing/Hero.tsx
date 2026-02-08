'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Hero() {
    return (
        <section
            className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20"
            dir="rtl"
            aria-label="ברוכים הבאים ל-Harmonica"
        >
            {/* Background Gradient Layer */}
            <div
                className="absolute inset-0 z-0 bg-gradient-to-r from-[#C084FC] via-[#E879F9] to-[#FDE047] opacity-70"
                aria-hidden="true"
            />

            {/* Large White Circle Overlay */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] md:w-[120vw] md:h-[120vw] lg:w-[95vw] lg:h-[95vw] bg-background rounded-full shadow-2xl z-10"
                aria-hidden="true"
            />

            {/* Content Layer */}
            <div className="relative z-20 container mx-auto px-4 text-center">
                {/* Pill Label */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 mb-10 animate-fade-in-up">
                    <span className="text-xs font-bold text-primary tracking-wide uppercase">ניהול סטודיו שמרגיש אחרת</span>
                </div>

                {/* Main Headline */}
                <h1 className="mx-auto max-w-5xl text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 animate-fade-in-up leading-tight">
                    נהלו את העסק שלכם
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-600">
                        בהרמוניה ובדיוק
                    </span>
                    {' '}– כמו תוכנית בניה.
                </h1>

                {/* Subheadline */}
                <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 animate-fade-in-up leading-relaxed">
                    פלטפורמה אחת המשלבת ניהול פרויקטים מתקדם, <strong className="font-semibold text-foreground">CRM</strong> עם תובנות חכמות ודאטה.
                    <br className="hidden md:block" />
                    נבנתה במיוחד עבור אדריכלים ומעצבי פנים שדורשים שלמות.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up pb-20">
                    <Link href="/register">
                        <Button
                            size="lg"
                            className="rounded-full text-lg h-14 px-12 shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-200"
                        >
                            התחילו עכשיו
                        </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-4 sm:mt-0 font-medium">
                        * ללא צורך באשראי לנסיון
                    </p>
                </div>
            </div>
        </section>
    );
}
