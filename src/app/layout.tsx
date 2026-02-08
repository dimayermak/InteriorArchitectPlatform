import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Added import for Inter font
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" }); // Added font definition

export const metadata: Metadata = {
    title: "הרמוניקה | פלטפורמת ניהול סטודיו לאדריכלים ומעצבי פנים",
    description: "ניהול פרויקטים, לקוחות, ותזרים מזומנים למעצבי פנים ואדריכלים", // Updated description
    // Removed keywords as per the provided edit
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="he" dir="rtl" className="scroll-smooth">
            <body className={`${inter.variable} font-sans antialiased text-foreground bg-[hsl(var(--background))] overflow-x-hidden selection:bg-primary-200 selection:text-primary-900`}>
                {/* Global Grain Texture Overlay */}
                <div
                    className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.03] mix-blend-multiply"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    }}
                />
                {children}
            </body>
        </html>
    );
}
