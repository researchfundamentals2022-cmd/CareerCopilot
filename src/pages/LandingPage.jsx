import HeroSection from "../components/sections/HeroSection";
import WhyUsSection from "../components/sections/WhyUsSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import FutureAddonsSection from "../components/sections/FutureAddonsSection";
import AIToolsSection from "../components/sections/AIToolsSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import StudentLoveSection from "../components/sections/StudentLoveSection";
import CTASection from "../components/sections/CTASection";
import BackToTop from "../components/common/BackToTop";
import SEO from "../components/common/SEO";

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEO 
        title="Career Copilot | AI-Powered Resume Builder for Students"
        description="Build a professional, ATS-optimized resume in minutes with Career Copilot. Designed for students and freshers to kickstart their career with AI-powered guidance."
        path="/"
      />
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
      <BackToTop />
    </div>
  );
}


export default LandingPage;