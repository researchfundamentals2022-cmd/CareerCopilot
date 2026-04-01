import HeroSection from "../components/sections/HeroSection";
import WhyUsSection from "../components/sections/WhyUsSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import FutureAddonsSection from "../components/sections/FutureAddonsSection";
import AIToolsSection from "../components/sections/AIToolsSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import StudentLoveSection from "../components/sections/StudentLoveSection";
import CTASection from "../components/sections/CTASection";

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main>
        <HeroSection />
        <WhyUsSection />
        <FeaturesSection />
        <FutureAddonsSection />
        <AIToolsSection />
        <HowItWorksSection />
        <StudentLoveSection />
        <CTASection />
      </main>
    </div>
  );
}

export default LandingPage;