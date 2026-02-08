import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Workflow from '@/components/landing/Workflow';
import ProblemAgitation from '@/components/landing/ProblemAgitation';
import Testimonials from '@/components/landing/Testimonials';
import Support from '@/components/landing/Support';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
    return (
        <div className="bg-background min-h-screen relative selection:bg-primary/20 selection:text-primary">
            {/* Background grain texture is handled in layout.tsx via global css class or overlay */}

            <Header />

            <main className="flex flex-col gap-0">
                <Hero />

                {/* Visual spacer / transition */}
                <div className="h-24 bg-gradient-to-b from-background to-muted/30" />

                <ProblemAgitation />

                <Features />

                <div className="bg-muted/30 py-12">
                    <Workflow />
                </div>

                <Support />

                <Testimonials />

                <CTA />
            </main>

            <Footer />
        </div>
    );
}
