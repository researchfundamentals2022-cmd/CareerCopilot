import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { runGeminiBasicTest } from "../services/gemini";
import { IoCheckmarkCircleOutline, IoAlertCircleOutline } from "react-icons/io5";

function ConnectGemini() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const savedKey = localStorage.getItem("career_copilot_gemini_key");

      if (savedKey) {
        setApiKey(savedKey);
      }

      setCheckingUser(false);
    };

    checkUser();
  }, [navigate]);

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setError("Please enter a key to test.");
      return;
    }

    setTesting(true);
    setCheckResult(null);
    setError("");

    try {
      localStorage.setItem("career_copilot_gemini_key", apiKey.trim());

      const result = await runGeminiBasicTest();

      setCheckResult({
        success: true,
        message: `Connection successful! Gemini replied: ${result}`,
      });

      console.log("Gemini basic test result:", result);
    } catch (err) {
      console.error("Test connection error:", err);
      setCheckResult({
        success: false,
        message: err.message || "Failed to connect. Please check your key and try again.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!apiKey.trim()) {
      setError("Please enter your Gemini API key.");
      return;
    }

    if (apiKey.trim().length < 20) {
      setError("This does not look like a valid API key.");
      return;
    }

    setLoading(true);

    try {
      localStorage.setItem("career_copilot_gemini_key", apiKey.trim());
      navigate("/onboarding");
    } catch (err) {
      setError("Failed to save API key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Checking your session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-medium text-[var(--color-primary)] shadow-sm">
              Step 1 of 3
            </span>

            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Connect your Gemini API key
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Career Copilot uses Gemini to power resume writing and future career
              support tools. Add your API key once and continue with your setup.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-[var(--color-bg-alt)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">How to get your API key</h2>
              <ol className="mt-4 list-decimal space-y-3 pl-4 text-sm leading-6 text-slate-600">
                <li>
                  Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] hover:underline">Google AI Studio</a>.
                </li>
                <li>Click <strong>"Get API key"</strong> in the left sidebar.</li>
                <li>Click the blue <strong>"Create API key"</strong> button.</li>
                <li>Search for and select your Google Cloud project (or create a new one).</li>
                <li>If it asks, name your key and click <strong>"Create API key in existing project"</strong>.</li>
                <li>Copy the generated key (starts with <code>AIza...</code>) and paste it below.</li>
              </ol>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Why we ask for this</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>• It helps power AI-assisted writing and suggestions.</li>
                <li>• Your key is stored locally in your browser for now.</li>
                <li>• Later, we can make this more secure with backend encryption.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            <h2 className="text-2xl font-semibold text-slate-900">Add Gemini API key</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Paste your Gemini API key below to continue.
            </p>

            <form onSubmit={handleSave} className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gemini API Key
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your Gemini API key"
                    className="w-full border-none bg-transparent text-sm text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((prev) => !prev)}
                    className="text-sm font-medium text-[var(--color-primary)]"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Saving..." : "Continue"}
              </button>

              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing || !apiKey}
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {testing ? "Testing Connection..." : "Test Connection"}
              </button>
            </form>

            {checkResult && (
              <div
                className={`mt-6 flex items-start gap-3 rounded-2xl p-4 ${
                  checkResult.success
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {checkResult.success ? (
                  <IoCheckmarkCircleOutline className="mt-0.5 shrink-0" size={18} />
                ) : (
                  <IoAlertCircleOutline className="mt-0.5 shrink-0" size={18} />
                )}
                <p className="text-sm font-medium leading-6">{checkResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectGemini;