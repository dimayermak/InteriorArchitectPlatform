'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }

        if (password.length < 8) {
            setError('הסיסמה חייבת להכיל לפחות 8 תווים');
            return;
        }

        setLoading(true);

        try {
            // Sign up the user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        studio_name: studioName,
                    },
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            if (authData.user) {
                // Create organization and membership will be handled by database triggers
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('אירעה שגיאה. אנא נסו שוב.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">📐</span>
                        </div>
                        <span className="font-display font-bold text-2xl text-neutral-900 dark:text-white">
                            הרמוניקה
                        </span>
                    </Link>
                </div>

                {/* Register Form */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-700">
                    <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">
                        הרשמה
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        צרו חשבון חדש לסטודיו שלכם
                    </p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-500 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                שם מלא
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="ישראל ישראלי"
                            />
                        </div>

                        <div>
                            <label htmlFor="studioName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                שם הסטודיו
                            </label>
                            <input
                                id="studioName"
                                type="text"
                                value={studioName}
                                onChange={(e) => setStudioName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="סטודיו לעיצוב פנים"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                דואר אלקטרוני
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="email@example.com"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                סיסמה
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="לפחות 8 תווים"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                אישור סיסמה
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="הזינו שוב את הסיסמה"
                                dir="ltr"
                            />
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                אני מסכים/ה ל
                                <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                                    תנאי השימוש
                                </Link>
                                {' '}ול
                                <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                                    מדיניות הפרטיות
                                </Link>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary-500/25 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    יוצר חשבון...
                                </span>
                            ) : (
                                'יצירת חשבון'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
                        כבר יש לכם חשבון?{' '}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            התחברות
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
