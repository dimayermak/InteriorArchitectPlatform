'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) { setError(error.message); return; }
            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('אירעה שגיאה. אנא נסו שוב.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background" dir="rtl">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-primary to-purple-600 items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.07]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]" />
                <div className="relative z-10 text-white text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <span className="text-4xl font-black text-white">H</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4">הרמוניקה</h2>
                    <p className="text-white/70 text-lg max-w-sm mx-auto leading-relaxed">
                        פלטפורמת ניהול All-in-One לאדריכלים ומעצבי פנים
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-4 text-right">
                        {['ניהול פרויקטים', 'CRM לקוחות', 'כספים ורכש', 'סוכן AI'].map((f) => (
                            <div key={f} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-medium border border-white/10">
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Logo (mobile only) */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <span className="text-white font-black text-lg">H</span>
                            </div>
                            <span className="font-black text-xl text-foreground">הרמוניקה</span>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-foreground mb-2">ברוכים השבים</h1>
                        <p className="text-muted-foreground">התחברו לסטודיו שלכם</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-semibold text-foreground">
                                דואר אלקטרוני
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="email@example.com"
                                dir="ltr"
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                                    סיסמה
                                </label>
                                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                    שכחתי סיסמה
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                dir="ltr"
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={loading}
                            className="h-12 rounded-xl text-base font-bold mt-2"
                        >
                            כניסה לחשבון
                            <ArrowLeft className="mr-2 w-4 h-4" />
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        אין לכם חשבון?{' '}
                        <Link href="/register" className="font-bold text-primary hover:underline">
                            הירשמו עכשיו
                        </Link>
                    </p>

                    {/* Dev Bypass */}
                    {process.env.NODE_ENV === 'development' && (
                        <button
                            type="button"
                            onClick={() => { document.cookie = "dev-bypass=true; path=/"; window.location.href = "/dashboard"; }}
                            className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            🛠️ כניסת מפתח (עוקף התחברות)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
