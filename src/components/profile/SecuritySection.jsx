import { useState } from "react";
import { supabase } from "../../services/supabase";
import { IoShieldCheckmarkOutline, IoLockClosedOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

const SecuritySection = () => {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setPasswords((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      <div className="mb-10 flex items-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-[var(--color-accent-2)] shadow-sm">
          <IoShieldCheckmarkOutline size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Security Settings</h2>
          <p className="text-sm font-medium text-[var(--color-muted)]">Update your password to stay secure.</p>
        </div>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label 
              htmlFor="newPassword" 
              className="text-sm font-semibold text-[var(--color-text)]"
            >
              New Password
            </label>
            <div className="relative">
              <IoLockClosedOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-14 pr-5 text-sm font-medium outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label 
              htmlFor="confirmPassword" 
              className="text-sm font-semibold text-[var(--color-text)]"
            >
              Confirm Password
            </label>
            <div className="relative">
              <IoLockClosedOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-14 pr-5 text-sm font-medium outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {message && (
          <div 
            className={`flex items-start gap-4 rounded-2xl p-5 text-sm font-semibold shadow-sm ${
              message.type === "success" 
                ? "bg-emerald-50 text-emerald-700 shadow-emerald-100/20" 
                : "bg-rose-50 text-rose-700 shadow-rose-100/20"
            }`}
          >
            {message.type === "success" ? <IoCheckmarkCircleOutline className="mt-0.5 shrink-0" size={20} /> : <IoAlertCircleOutline className="mt-0.5 shrink-0" size={20} />}
            <p className="leading-6">{message.text}</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-10 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySection;
