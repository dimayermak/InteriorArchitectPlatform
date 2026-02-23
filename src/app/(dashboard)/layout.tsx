'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground text-right" dir="rtl">
            {/* Sidebar (Fixed Right) */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col mr-[300px] transition-all duration-300 w-[calc(100vw-300px)]">
                {/* Top Navigation */}
                <TopNav />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8f9fc]">
                    {children}
                </main>
            </div>
        </div>
    );
}
