'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

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
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('אירעה שגיאה. אנא נסו שוב.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">

            {/* Organic Background Blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply animate-float" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-3xl opacity-50 translate-x-1/3 translate-y-1/3 mix-blend-multiply animate-float" style={{ animationDelay: '2s' }} />

            <Card className="w-full max-w-md relative z-10 mx-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl">📐</span>
                    </div>
                    <CardTitle className="text-3xl font-bold font-display text-primary-900">הרמוניקה</CardTitle>
                    <CardDescription className="text-base text-primary-700/60">
                        ברוכים השבים! התחברו לסטודיו שלכם
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-bold text-primary-800 mr-2">
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
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-bold text-primary-800 mr-2">
                                סיסמה
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                dir="ltr"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only "
                                    />
                                    <div className="w-5 h-5 border-2 border-primary/30 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 12 12" fill="none">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-sm text-primary-700/80 group-hover:text-primary-900 transition-colors">
                                    זכור אותי
                                </span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-700 transition-colors hover:underline">
                                שכחתי סיסמה
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            className="text-lg"
                        >
                            התחברות
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center border-t border-border/50 bg-primary/5 p-6">
                    <p className="text-sm text-primary-700/80">
                        אין לכם חשבון?{' '}
                        <Link href="/register" className="font-bold text-primary hover:text-primary-800 transition-colors hover:underline">
                            צרו חשבון חדש
                        </Link>
                    </p>

                    {/* Dev Bypass Button */}
                    {process.env.NODE_ENV === 'development' && (
                        <button
                            type="button"
                            onClick={() => {
                                document.cookie = "dev-bypass=true; path=/";
                                window.location.href = "/dashboard";
                            }}
                            className="text-xs text-primary-400 hover:text-primary-600 transition-colors"
                        >
                            🛠️ כניסת מפתח (עוקף התחברות)
                        </button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
