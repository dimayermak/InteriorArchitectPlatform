'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        studio_name: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    source: 'landing_page',
                }),
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', studio_name: '', message: '' });
            } else {
                const data = await res.json();
                setErrorMsg(data.error || 'שגיאה בשליחה, נסו שוב');
                setStatus('error');
            }
        } catch {
            setErrorMsg('שגיאת רשת, נסו שוב');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <section id="contact" className="py-24 relative" dir="rtl">
                <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg mx-auto text-center bg-card border border-border/50 rounded-2xl p-12 shadow-lg"
                    >
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold mb-3">תודה שפנית אלינו!</h3>
                        <p className="text-muted-foreground">
                            קיבלנו את הפרטים שלך ונחזור אליך תוך 24 שעות.
                        </p>
                        <Button
                            variant="ghost"
                            className="mt-6"
                            onClick={() => setStatus('idle')}
                        >
                            שלחו עוד פנייה
                        </Button>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="contact" className="py-24 relative" dir="rtl">
            <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            מוכנים להתחיל?
                            <span className="block text-primary">השאירו פרטים</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            מלאו את הטופס ונחזור אליכם עם הדגמה אישית של המערכת — בחינם וללא התחייבות.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-card border border-border/50 rounded-2xl p-8 md:p-10 shadow-lg space-y-5"
                    >
                        {status === 'error' && (
                            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label="שם מלא *"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="שם פרטי ומשפחה"
                            />
                            <Input
                                label="שם הסטודיו"
                                name="studio_name"
                                value={formData.studio_name}
                                onChange={handleChange}
                                placeholder="סטודיו כהן אדריכלות"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label="אימייל"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                            />
                            <Input
                                label="טלפון"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="050-0000000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                ספר/י לנו על הסטודיו
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={3}
                                placeholder="כמה אנשים בסטודיו? מה הפרויקטים הפעילים?"
                                className="w-full px-3.5 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-sm resize-none"
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            disabled={status === 'loading'}
                            className="rounded-xl h-14 text-lg font-bold shadow-lg shadow-primary/20"
                        >
                            {status === 'loading' ? (
                                'שולח...'
                            ) : (
                                <>
                                    קבלו הדגמה בחינם
                                    <Send className="w-5 h-5 mr-2" />
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            ללא התחייבות. לא נשלח ספאם, מבטיחים.
                        </p>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
