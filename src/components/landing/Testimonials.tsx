'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'דנה כהן',
        role: 'מעצבת פנים, שרונה',
        content: 'מאז שהתחלתי להשתמש בהרמוניקה, זמן הניהול שלי ירד בחצי. אני סוף סוף יכולה לחזור לעצב.',
        avatar: '👩‍🎨',
    },
    {
        name: 'רון לוי',
        role: 'אדריכל, תל אביב',
        content: 'הלקוחות שלי המומים מהמקצועיות של הצעות המחיר והליווי הצמוד שמתאפשר בזכות המערכת.',
        avatar: '👷‍♂️',
    },
    {
        name: 'מיכל אברהם',
        role: 'סטודיו M עיצוב',
        content: 'היה לי בלאגן שלם עם הספקים והתשלומים. הרמוניקה עשתה לי סדר בראש ובכיס.',
        avatar: '📐',
    },
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-primary/5 text-center" dir="rtl">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold mb-12 text-foreground"
                >
                    מה אומרים עלינו בקהילה?
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-background p-8 rounded-3xl shadow-lg border border-border/50 relative"
                        >
                            <div className="absolute -top-4 right-8 bg-primary/10 text-primary p-2 rounded-full">
                                <Quote size={20} className="fill-current" />
                            </div>
                            <p className="text-muted-foreground mb-6 text-lg italic leading-relaxed">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-4 justify-center">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl shadow-sm">
                                    {t.avatar}
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-foreground">{t.name}</div>
                                    <div className="text-xs text-muted-foreground">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
