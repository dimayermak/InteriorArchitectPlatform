import Link from 'next/link';
import Hero from '@/components/landing/Hero';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';

export default function Home() {
    return (
        <div className="min-h-screen bg-background" dir="rtl">
            {/* Skip Link for Accessibility */}
            <a href="#main-content" className="skip-link">
                דלג לתוכן הראשי
            </a>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
                        H
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">Harmonica</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="#features" className="hover:text-primary transition-colors">
                        מה במערכת?
                    </Link>
                    <Link href="#audience" className="hover:text-primary transition-colors">
                        למי זה מתאים?
                    </Link>
                    <Link href="#support" className="hover:text-primary transition-colors">
                        תמיכה ובונוסים
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                        התחברות
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-200">
                            התחילו חינם
                        </Button>
                    </Link>
                </div>
            </nav>

            <main id="main-content">
                <Hero />

                {/* 1. What's in the System? (Features) */}
                <section className="py-24 relative overflow-hidden" id="features" aria-labelledby="features-heading">
                    {/* Subtle ambient background */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] -z-10" aria-hidden="true" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <h2 id="features-heading" className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
                                מערכת הפעלה <span className="text-primary">הוליסטית</span> לסטודיו
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                עזבו את האקסלים והמחברות. ריכזנו עבורכם את כל כלי הניהול החיוניים תחת קורת גג אחת, בממשק שכיף לעבוד איתו.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* CRM Card */}
                            <Card className="md:col-span-2 overflow-hidden border-0 shadow-xl bg-card">
                                <div className="h-2 w-full bg-gradient-to-r from-blue-400 to-indigo-500" aria-hidden="true" />
                                <CardContent className="p-8 md:p-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl" aria-hidden="true">🤝</div>
                                        <h3 className="text-2xl font-bold text-foreground">הלקוחות שלכם במרכז</h3>
                                    </div>
                                    <p className="text-muted-foreground mb-8 text-lg">
                                        מהרגע שהליד נכנס ועד שהפרויקט מסתיים – הכל מתועד, מסודר ונגיש. אל תפספסו אף הזדמנות מכירה ואף פרט בפרויקט.
                                    </p>
                                    <ul className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                                        <FeatureItem text="משפך לידים חכם ואוטומטי" />
                                        <FeatureItem text="ניהול חוזים והצעות מחיר דיגיטליות" />
                                        <FeatureItem text="סנכרון מלא ל-Google Calendar" />
                                        <FeatureItem text="תיק לקוח דיגיטלי ושקוף" />
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Team Card */}
                            <Card className="md:row-span-2 overflow-hidden border-0 shadow-xl bg-card">
                                <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-orange-500" aria-hidden="true" />
                                <CardContent className="p-8 h-full flex flex-col">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-6" aria-hidden="true">👔</div>
                                    <h3 className="text-2xl font-bold mb-4 text-foreground">הצוות שלכם, בשיא היעילות</h3>
                                    <p className="text-muted-foreground mb-8">
                                        תנו לעובדים את הכלים להצליח, וקבלו שליטה מלאה על משאבי הסטודיו.
                                    </p>
                                    <div className="space-y-4 flex-1">
                                        <div className="bg-muted p-4 rounded-2xl flex items-center gap-4">
                                            <span className="text-2xl" aria-hidden="true">⏱️</span>
                                            <div>
                                                <div className="font-bold text-foreground">שעון נוכחות</div>
                                                <div className="text-xs text-muted-foreground">מעקב שעות מדוייק לכל פרויקט</div>
                                            </div>
                                        </div>
                                        <div className="bg-muted p-4 rounded-2xl flex items-center gap-4">
                                            <span className="text-2xl" aria-hidden="true">📊</span>
                                            <div>
                                                <div className="font-bold text-foreground">ניהול עומסים</div>
                                                <div className="text-xs text-muted-foreground">חלוקת משימות חכמה</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Projects Card */}
                            <Card className="md:col-span-2 overflow-hidden border-0 shadow-xl bg-card">
                                <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-pink-500" aria-hidden="true" />
                                <CardContent className="p-8 md:p-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl" aria-hidden="true">🏗️</div>
                                        <h3 className="text-2xl font-bold text-foreground">ניהול פרויקטים (בדיוק כמו שאתם עובדים)</h3>
                                    </div>
                                    <p className="text-muted-foreground mb-8 text-lg">
                                        הטמפלט שלנו מגיע מוכן עם תהליכי עבודה מובנים לאדריכלות ועיצוב פנים. חסכו מאות שעות של אפיון והקמה.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <PillBadge text="טמפלט אדריכלות" emoji="📐" />
                                        <PillBadge text="טמפלט עיצוב פנים" emoji="🎨" />
                                        <PillBadge text="יומן פיקוח בניה" emoji="👷" />
                                        <PillBadge text="רשימות רכש וספקים" emoji="🛒" />
                                        <PillBadge text="גאנט פרויקט חכם" emoji="📅" />
                                        <PillBadge text="דוחות רווחיות" emoji="💰" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* 2. Target Audience (Dark Section) */}
                <section className="py-24 bg-[#0F172A] text-white relative overflow-hidden" id="audience" aria-labelledby="audience-heading">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-16">
                            <h2 id="audience-heading" className="text-4xl font-bold mb-6">למי המערכת מתאימה?</h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                בנינו את הפלטפורמה במיוחד עבור עסקים שרוצים לעלות שלב.
                            </p>
                        </div>

                        <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" role="list">
                            <AudienceCard icon="🚀" title="לסטודיו בצמיחה" text="לעסקים חדשים או ותיקים שרוצים תשתית חזקה מהיום הראשון." />
                            <AudienceCard icon="👥" title="לצוותים (עד 7)" text="מותאם לצוות של עד 5 עובדים + 2 בעלים. ניתן לשדרג לפי הצורך." />
                            <AudienceCard icon="💎" title="שקיפות ומקצועיות" text="למי שרוצה להקרין מקצועיות מול הלקוח ולהיות בשליטה מלאה." />
                            <AudienceCard icon="📈" title="שליטה פיננסית" text="למי שחייב לדעת בדיוק כמה כל פרויקט מרוויח (או מפסיד)." />
                            <AudienceCard icon="⚡" title="יעילות מקסימלית" text="למי שלא רוצה להמציא את הגלגל מחדש - תהליכים מוכנים מראש." />
                            <AudienceCard icon="♾️" title="ללא הגבלת פרויקטים" text="ניהול פרויקט אחד או מאה במקביל, באותה קלות." />
                            <AudienceCard icon="🎯" title="ניהול ספקים" text="סדר בבלאגן של אנשי הקשר, הצעות המחיר וההזמנות." />
                            <AudienceCard icon="🛑" title="אפס פספוסים" text="לא מאבדים יותר לידים, משימות או כסף בין הכיסאות." />
                        </ul>
                    </div>
                </section>

                {/* 3. Support & Bonuses */}
                <section className="py-24 bg-muted/50" id="support" aria-labelledby="support-heading">
                    <div className="container mx-auto px-4">
                        <div className="bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-12 md:p-20 text-white text-center relative overflow-hidden shadow-2xl shadow-primary/30">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" aria-hidden="true" />

                            <div className="relative z-10 max-w-4xl mx-auto">
                                <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-white/20">
                                    🎁 חבילת בונוסים מפנקת
                                </div>
                                <h2 id="support-heading" className="text-4xl md:text-5xl font-bold mb-8">אנחנו איתכם, יד ביד.</h2>
                                <p className="text-xl md:text-2xl text-purple-100 mb-12 leading-relaxed">
                                    מעבר לטמפלט המושלם, אתם מקבלים מעטפת תמיכה מלאה להצלחה בטוחה.
                                </p>

                                <div className="grid md:grid-cols-3 gap-8 mb-12">
                                    <BonusCard emoji="🎓" title="קורס אונליין מלא" text="גישה לפורטל הדרכות ללא הגבלת זמן." />
                                    <BonusCard emoji="👨‍💻" title="הדרכה אישית" text="3 שעות הדרכה והטמעה אישית בזום." />
                                    <BonusCard emoji="💌" title="תמיכה טכנית" text="תמיכה במייל למשך 120 יום." />
                                </div>

                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        className="h-14 px-10 text-lg bg-white text-primary hover:bg-gray-100 shadow-xl rounded-full font-bold transition-transform duration-200 hover:scale-105"
                                    >
                                        אני רוצה להתחיל עכשיו
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 text-center text-muted-foreground bg-background border-t border-border">
                <p>© {new Date().getFullYear()} Harmonica. כל הזכויות שמורות.</p>
            </footer>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs shrink-0" aria-hidden="true">✓</div>
            <span className="text-muted-foreground text-sm font-medium">{text}</span>
        </li>
    )
}

function PillBadge({ text, emoji }: { text: string; emoji: string }) {
    return (
        <div className="px-4 py-2 rounded-full border border-border bg-muted text-foreground text-sm font-semibold flex items-center gap-2">
            <span aria-hidden="true">{emoji}</span>
            {text}
        </div>
    )
}

function AudienceCard({ icon, title, text }: { icon: string; title: string; text: string }) {
    return (
        <li className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
            <div className="text-3xl mb-4" aria-hidden="true">{icon}</div>
            <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{text}</p>
        </li>
    )
}

function BonusCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
    return (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <div className="text-4xl mb-4" aria-hidden="true">{emoji}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-purple-100 opacity-80">{text}</p>
        </div>
    )
}
