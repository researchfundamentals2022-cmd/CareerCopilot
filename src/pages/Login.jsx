import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";


function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);

  const getInitialRoute = async (user) => {
    if (!user) return "/how-it-works";
    
    try {
      const { data: onboardingData } = await supabase
        .from("onboarding")
        .select("id")
        .eq("user_id", user.id)
        .single();
        
      if (onboardingData) return "/dashboard";
    } catch (err) {
      // Not onboarded
    }
    return "/how-it-works";
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // We no longer auto-navigate away. 
        // This allows users to actually see and click the "Back to Home" link 
        // even if they are currently logged in.
        setCheckingUser(false);
      } else {
        setCheckingUser(false);
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const { email, password } = formData;

    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (authData?.user) {
      setMessage("Checking status...");
      const route = await getInitialRoute(authData.user);
      navigate(route);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/how-it-works",
      },
    });

    if (error) setMessage(error.message);
  };

  const handleGithubLogin = async () => {
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/how-it-works",
      },
    });

    if (error) setMessage(error.message);
  };

  if (checkingUser) {
    return <div className="min-h-screen bg-[var(--color-bg-alt)]"></div>;
  }

  return (
    <section className="min-h-screen bg-[var(--color-bg-alt)] px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
          <div className="mb-6 text-center">
            <p className="text-sm font-medium text-[var(--color-primary)]">
              Career Copilot
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Login to continue building your resume.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <FaGithub size={20} className="text-[#24292e]" />
              Continue with GitHub
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Or
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)]"
              />
            </div>

            {message && (
              <p className="text-center text-sm text-[var(--color-primary)]">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(53,0,139,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              Sign Up
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-slate-600 transition hover:text-[var(--color-primary)]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;