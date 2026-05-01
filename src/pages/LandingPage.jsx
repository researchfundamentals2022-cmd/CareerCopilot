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

      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Career Copilot?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Career Copilot is an AI-powered resume builder and career assistant developed by Cognisys AI. It helps students and freshers create ATS-optimized resumes in minutes."
                }
              },
              {
                "@type": "Question",
                "name": "How does Career Copilot use AI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Using advanced AI models like Gemini, Career Copilot analyzes your background to suggest better wording, highlight key skills, and optimize your resume for applicant tracking systems (ATS)."
                }
              },
              {
                "@type": "Question",
                "name": "Is Career Copilot developed by Cognisys AI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Career Copilot is the flagship product of Cognisys AI, designed to bridge the gap between education and employment for students worldwide."
                }
              }
            ]
          })
        }}
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