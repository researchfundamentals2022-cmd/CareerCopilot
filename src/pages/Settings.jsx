import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SecuritySection from "../components/profile/SecuritySection";
import ProfileSection from "../components/profile/ProfileSection";
import { 
  IoPersonOutline, 
  IoShieldCheckmarkOutline 
} from "react-icons/io5";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "security"

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-10 md:px-12">
      <div className="relative z-10 mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="mb-10">

          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] md:text-5xl">Account Settings</h1>
          <p className="mt-3 text-lg text-[var(--color-muted)]">Manage your identity and security preferences.</p>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex gap-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-bold transition ${
              activeTab === "profile"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <IoPersonOutline size={20} />
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-bold transition ${
              activeTab === "security"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <IoShieldCheckmarkOutline size={20} />
            Security & Password
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-page-entry">
          {activeTab === "profile" ? (
            <ProfileSection />
          ) : (
            <SecuritySection />
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;
