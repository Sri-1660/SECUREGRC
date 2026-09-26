import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Activity,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Demo credentials
    if (
      email === "admin@finsecure.com" &&
      password === "SecureGRC@123"
    ) {
      localStorage.setItem("securegrc_authenticated", "true");

      localStorage.setItem(
        "securegrc_user",
        JSON.stringify({
          name: "GRC Analyst",
          email: "admin@finsecure.com",
          role: "Security & Compliance",
        })
      );

      navigate("/");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden">

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Background Glow */}
      <div className="absolute -top-50 -left-37.5 w-125 h-125 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="absolute -bottom-50 -right-37.5 w-125 h-125 rounded-full bg-blue-600/10 blur-[120px]" />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md px-6">

        {/* Logo / Branding */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 mb-4">
            <ShieldCheck className="w-9 h-9 text-cyan-400" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Secure<span className="text-cyan-400">GRC</span>
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Automated Compliance & Risk Assessment
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Welcome back
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Sign in to access the GRC dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@finsecure.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />

              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-11 pr-12 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg py-3 transition-all"
            >
              Sign in

              <ArrowRight className="w-5 h-5" />
            </button>

          </form>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/70 p-4">

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">

              <Activity className="w-4 h-4 text-cyan-400" />

              Demo Environment

            </div>

            <div className="text-xs space-y-1">

              <p className="text-slate-500">
                Email:

                <span className="text-slate-300 ml-2">
                  admin@finsecure.com
                </span>
              </p>

              <p className="text-slate-500">
                Password:

                <span className="text-slate-300 ml-2">
                  SecureGRC@123
                </span>
              </p>

            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          SecureGRC • FinSecure Technologies • Demo Mode
        </p>

      </div>
    </div>
  );
}