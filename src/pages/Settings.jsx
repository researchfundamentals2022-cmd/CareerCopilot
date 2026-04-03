import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import SecuritySection from "../components/profile/SecuritySection";
import { 
  IoArrowBack, 
  IoFlashOutline, 
  IoShieldCheckmarkOutline, 
  IoCheckmarkCircleOutline, 
  IoAlertCircleOutline,
  IoEyeOutline,
  IoEyeOffOutline
} from "react-icons/io5";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("api"); // "api" or "security"
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("career_copilot_gemini_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = async (e) => {
    e?.preventDefault();
    setSaving(true);
    localStorage.setItem("career_copilot_gemini_key", apiKey);
    setTimeout(() => {
      setSaving(false);
      setTestResult({ success: true, message: "API key saved locally!" });
    }, 500);
  };

  const handleTestKey = async () => {
    if (!apiKey) return;
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hi" }] }],
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setTestResult({ success: true, message: "Connection successful! Gemini is ready." });
      } else {
        setTestResult({ success: false, message: data.error?.message || "Invalid API key." });
      }
    } catch (err) {
      setTestResult({ success: false, message: "Connection failed. Please check your internet." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-10 md:px-12">
      <div className="relative z-10 mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="mb-10">
          <button 
            onClick={() => navigate("/dashboard")}
            className="group mb-6 flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
          >
            <IoArrowBack size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] md:text-5xl">Account Settings</h1>
          <p className="mt-3 text-lg text-[var(--color-muted)]">Manage your AI connection and account security.</p>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex gap-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-bold transition ${
              activeTab === "api"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <IoFlashOutline size={20} />
            Gemini AI
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
            Security
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-page-entry">
          {activeTab === "api" ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <div className="mb-10 flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-[var(--color-primary)] shadow-sm">
                  <IoFlashOutline size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">AI Connection</h2>
                  <p className="text-sm font-medium text-[var(--color-muted)]">Securely manage your Gemini API key.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-[var(--color-text)]">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API Key"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-5 pr-14 text-sm font-medium outline-none transition focus:border-violet-400 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showKey ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div className={`flex items-start gap-4 rounded-2xl p-5 text-sm font-semibold shadow-sm ${
                    testResult.success ? "bg-emerald-50 text-emerald-700 shadow-emerald-100/20" : "bg-red-50 text-red-700 shadow-red-100/20"
                  }`}>
                    {testResult.success ? <IoCheckmarkCircleOutline className="mt-0.5 shrink-0" size={20} /> : <IoAlertCircleOutline className="mt-0.5 shrink-0" size={20} />}
                    <p className="leading-6">{testResult.message}</p>
                  </div>
                )}

                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
                  <button
                    onClick={handleTestKey}
                    disabled={testing || !apiKey}
                    className="rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:shadow-md disabled:opacity-50"
                  >
                    {testing ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    onClick={handleSaveApiKey}
                    disabled={saving || !apiKey}
                    className="rounded-2xl bg-slate-900 px-10 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
                  >
                    {saving ? "Saving..." : "Save Configuration"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <SecuritySection />
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;
