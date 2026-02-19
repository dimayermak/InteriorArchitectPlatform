'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [studioName, setStudioName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) { setError('הסיסמאות אינן תואמות'); return; }
        if (password.length < 8) { setError('הסיסמה חייבת להכיל לפחות 8 תווים'); return; }

        setLoading(true);
        try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, studio_name: studioName } },
            });

            if (signUpError) { setError(signUpError.message); return; }
            if (authData.user) { router.push('/dashboard'); router.refresh(); }
        } catch {
            setError('אירעה שגיאה. אנא נסו שוב.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm";

    return (
        <div className="min-h-screen flex bg-background" dir="rtl">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-primary to-purple-600 items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.07]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]" />
                <div className="relative z-10 text-white text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <span className="text-4xl font-black text-white">H</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4">הרמוניקה</h2>
                    <p className="text-white/70 text-lg leading-relaxed">
                        נהלו סטודיו בסטנדרט עולמי
                    </p>
                    <div className="mt-10 space-y-3 text-right">
                        {[
                            '✓ פרויקטים, שלבים ומשימות',
                            '✓ CRM לידים ולקוחות',
                            '✓ כספים, חשבוניות ורכש',
                            '✓ פורטל לקוח + סוכן AI',
                        ].map((f) => (
                            <div key={f} className="text-sm text-white/80 font-medium">{f}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    {/* Logo (mobile) */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <span className="text-white font-black text-lg">H</span>
                            </div>
                            <span className="font-black text-xl text-foreground">הרמוניקה</span>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-foreground mb-2">יצירת חשבון</h1>
                        <p className="text-muted-foreground">ברוכים הבאים לפלטפורמה</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="fullName" className="text-sm font-semibold text-foreground">שם מלא</label>
                                <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className={inputClass} placeholder="ישראל ישראלי" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="studioName" className="text-sm font-semibold text-foreground">שם הסטודיו</label>
                                <input id="studioName" type="text" value={studioName} onChange={e => setStudioName(e.target.value)} required className={inputClass} placeholder="סטודיו לעיצוב" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-semibold text-foreground">דואר אלקטרוני</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="email@example.com" dir="ltr" />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-semibold text-foreground">סיסמה</label>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className={inputClass} placeholder="לפחות 8 תווים" dir="ltr" />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">אישור סיסמה</label>
                            <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClass} placeholder="הזינו שוב את הסיסמה" dir="ltr" />
                        </div>

                        <div className="flex items-start gap-2 pt-1">
                            <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/20 shrink-0" />
                            <span className="text-sm text-muted-foreground">
                                אני מסכים/ה ל<Link href="/terms" className="text-primary hover:underline font-medium">תנאי השימוש</Link>{' '}ול<Link href="/privacy" className="text-primary hover:underline font-medium">מדיניות הפרטיות</Link>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary/90 disabled:opacity-60 transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    יוצר חשבון...
                                </>
                            ) : (
                                <>יצירת חשבון <ArrowLeft className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        כבר יש לכם חשבון?{' '}
                        <Link href="/login" className="font-bold text-primary hover:underline">
                            התחברות
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
