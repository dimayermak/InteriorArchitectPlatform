import { Sidebar } from "@/components/layout/Sidebar";

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
            {/* Sidebar width = 16 (64px) global + 64 (256px) workspace = 320px total */}
            {/* Margin Right instead of Left for RTL */}
            <div className="flex flex-1 flex-col mr-[320px] transition-all duration-300 w-[calc(100vw-320px)]">
                {/* Apps allow scrolling of the main area independently */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white/50">
                    {children}
                </main>
            </div>
        </div>
    );
}
