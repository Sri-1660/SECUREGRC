import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("securegrc_user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : {
        name: "GRC Analyst",
        email: "admin@finsecure.com",
        role: "Security & Compliance",
      };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const storedPassword =
      localStorage.getItem("securegrc_password") ||
      "SecureGRC@123";

    if (currentPassword !== storedPassword) {
      setError("Current password is incorrect.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from the current password."
      );
      return;
    }

    localStorage.setItem("securegrc_password", newPassword);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setMessage("Password changed successfully.");
  };

  const handleLogout = () => {
    localStorage.removeItem("securegrc_authenticated");
    localStorage.removeItem("securegrc_user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="p-8">

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <SettingsIcon className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage your SecureGRC account and security preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid max-w-5xl gap-6 lg:grid-cols-3">

        {/* Account Information */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 lg:col-span-1">

          <div className="mb-5 flex items-center gap-3">
            <User className="h-5 w-5 text-cyan-400" />

            <h2 className="font-semibold text-slate-100">
              Account
            </h2>
          </div>

          {/* User Avatar */}
          <div className="mb-6 flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xl font-bold text-cyan-400">
              {user.name.charAt(0)}
            </div>

            <div>
              <p className="font-medium text-slate-100">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                {user.role}
              </p>
            </div>

          </div>

          {/* Account Details */}
          <div className="space-y-4">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Email
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Organization
              </p>

              <p className="mt-1 text-sm text-slate-300">
                FinSecure Technologies
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Environment
              </p>

              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Demo Mode
              </div>
            </div>

          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 lg:col-span-2">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2">
              <Lock className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-100">
                Change Password
              </h2>

              <p className="text-xs text-slate-500">
                Update your SecureGRC account password.
              </p>
            </div>
          </div>

          <form
            onSubmit={handlePasswordChange}
            className="space-y-5"
          >

            {/* Current Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Enter current password"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />

              <p className="mt-2 text-xs text-slate-500">
                Minimum 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <ShieldCheck className="h-4 w-4" />
              Change Password
            </button>

          </form>
        </div>

      </div>

      {/* Security Notice */}
      <div className="mt-6 max-w-5xl rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">

        <div className="flex gap-3">

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

          <div>
            <h3 className="text-sm font-medium text-amber-300">
              Demo Authentication
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              SecureGRC currently uses browser localStorage for
              demonstration authentication. This is suitable for
              portfolio demonstration only and should not be used
              for production credentials.
            </p>
          </div>

        </div>
      </div>

      {/* Logout */}
      <div className="mt-6 max-w-5xl">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          Sign out of SecureGRC
        </button>
      </div>

    </div>
  );
}