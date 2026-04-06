import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { getInitialRoute } from "../utils/auth";


function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const route = await getInitialRoute(session.user);
        navigate(route, { replace: true });
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

     // if email confirmation is required and session is not created yet
  if (!data?.session) {
    setMessage("Account created. Please check your email to verify your account.");
    return;
  }

    navigate("/how-it-works");

  };
  const handleGoogleSignup = async () => {
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/how-it-works",
      },
    });

    if (error) setMessage(error.message);
  };

  const handleGithubSignup = async () => {
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
              Create account
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Start building your resume with a simple setup.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleGithubSignup}
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

          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)]"
              />
            </div>

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
                placeholder="Create a password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
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
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              Login
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

export default Signup;