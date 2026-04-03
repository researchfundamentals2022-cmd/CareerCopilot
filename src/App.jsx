import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ConnectGemini from "./pages/ConnectGemini";
import HowItWorks from "./pages/HowItWorks";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import SavedJobs from "./pages/SavedJobs";
import Settings from "./pages/Settings";

import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 animate-page-entry">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/connect-gemini" element={<ConnectGemini />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;